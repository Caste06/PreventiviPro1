import { QuoteDocument, QuoteLineItem } from '../types/quote';

export interface VatBreakdownRow {
  rate: number;
  taxableBase: number;
  vatAmount: number;
}

export interface QuoteCalculationResult {
  // One-time / main items
  rawSubtotal: number;
  lineDiscountsTotal: number;
  netSubtotalAfterLineDiscounts: number;
  globalDiscountAmount: number;
  taxableSubtotal: number;
  cassaAmount: number;
  taxablePlusCassa: number;
  vatBreakdown: VatBreakdownRow[];
  totalVat: number;
  stampDutyAmount: number;
  grossTotal: number;
  withholdingTaxAmount: number;
  netToPay: number;
  // Recurring items summary (e.g., / semestre, / mese, / anno)
  recurringItems: {
    unit: string;
    totalNet: number;
    itemsCount: number;
  }[];
  optionalItemsTotal: number;
}

export function isRecurringUnit(unit: string): boolean {
  return unit === '/ semestre' || unit === '/ mese' || unit === '/ anno';
}

export function calcLineNet(item: QuoteLineItem): number {
  const gross = item.quantity * item.unitPrice;
  const discount = gross * (Math.min(100, Math.max(0, item.discountPercent)) / 100);
  return Math.max(0, gross - discount);
}

export function calcLineGrossNoDiscount(item: QuoteLineItem): number {
  return Math.max(0, item.quantity * item.unitPrice);
}

export function calculateQuoteTotals(doc: QuoteDocument): QuoteCalculationResult {
  const { items, fiscal } = doc;
  const isExempt = fiscal.regime === 'forfettario' || fiscal.regime === 'esente';

  const activeItems = items.filter((i) => !i.isOptional);
  const optionalItems = items.filter((i) => i.isOptional);

  const optionalItemsTotal = optionalItems.reduce((acc, item) => acc + calcLineNet(item), 0);

  let rawSubtotal = 0;
  let netSubtotalAfterLineDiscounts = 0;

  for (const item of activeItems) {
    rawSubtotal += calcLineGrossNoDiscount(item);
    netSubtotalAfterLineDiscounts += calcLineNet(item);
  }

  const lineDiscountsTotal = Math.max(0, rawSubtotal - netSubtotalAfterLineDiscounts);

  // Global discount
  let globalDiscountAmount = 0;
  if (fiscal.globalDiscountValue > 0) {
    if (fiscal.globalDiscountType === 'percent') {
      globalDiscountAmount =
        netSubtotalAfterLineDiscounts * (Math.min(100, fiscal.globalDiscountValue) / 100);
    } else {
      globalDiscountAmount = Math.min(netSubtotalAfterLineDiscounts, fiscal.globalDiscountValue);
    }
  }

  const taxableSubtotal = Math.max(0, netSubtotalAfterLineDiscounts - globalDiscountAmount);

  // Discount ratio to distribute global discount proportionally across VAT rates
  const globalDiscountFactor =
    netSubtotalAfterLineDiscounts > 0 ? taxableSubtotal / netSubtotalAfterLineDiscounts : 1;

  // Cassa Previdenziale / Rivalsa INPS
  const effectiveCassaRate =
    fiscal.cassaType === 'none'
      ? 0
      : fiscal.cassaType === 'inps_4' || fiscal.cassaType === 'cassa_4'
        ? 4
        : Math.max(0, fiscal.cassaRate);

  const cassaAmount = taxableSubtotal * (effectiveCassaRate / 100);
  const taxablePlusCassa = taxableSubtotal + cassaAmount;

  // VAT Breakdown
  const vatMap = new Map<number, number>();
  for (const item of activeItems) {
    const rate = isExempt ? 0 : item.vatRate;
    const lineAdjusted = calcLineNet(item) * globalDiscountFactor * (1 + effectiveCassaRate / 100);
    vatMap.set(rate, (vatMap.get(rate) || 0) + lineAdjusted);
  }

  const vatBreakdown: VatBreakdownRow[] = Array.from(vatMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([rate, base]) => ({
      rate,
      taxableBase: base,
      vatAmount: base * (rate / 100)
    }));

  const totalVat = vatBreakdown.reduce((sum, row) => sum + row.vatAmount, 0);

  // Stamp duty (Imposta di bollo 2,00 €)
  const stampDutyAmount =
    fiscal.stampDutyEnabled && fiscal.stampDutyChargeClient ? 2.0 : 0;

  const grossTotal = taxablePlusCassa + totalVat + stampDutyAmount;

  // Withholding tax (Ritenuta d'acconto - not applicable in Regime Forfettario)
  let withholdingTaxAmount = 0;
  if (fiscal.withholdingTaxEnabled && fiscal.regime !== 'forfettario') {
    const baseForWithholding =
      taxableSubtotal * (Math.min(100, Math.max(0, fiscal.withholdingTaxBasePercent)) / 100);
    withholdingTaxAmount = baseForWithholding * (Math.max(0, fiscal.withholdingTaxRate) / 100);
  }

  const netToPay = Math.max(0, grossTotal - withholdingTaxAmount);

  // Group recurring fees by period (/ semestre, / mese, / anno)
  const recurringMap = new Map<string, { totalNet: number; itemsCount: number }>();
  for (const item of activeItems) {
    if (isRecurringUnit(item.unit)) {
      const current = recurringMap.get(item.unit) || { totalNet: 0, itemsCount: 0 };
      current.totalNet += calcLineNet(item);
      current.itemsCount += 1;
      recurringMap.set(item.unit, current);
    }
  }

  const recurringItems = Array.from(recurringMap.entries()).map(([unit, data]) => ({
    unit,
    totalNet: data.totalNet,
    itemsCount: data.itemsCount
  }));

  return {
    rawSubtotal,
    lineDiscountsTotal,
    netSubtotalAfterLineDiscounts,
    globalDiscountAmount,
    taxableSubtotal,
    cassaAmount,
    taxablePlusCassa,
    vatBreakdown,
    totalVat,
    stampDutyAmount,
    grossTotal,
    withholdingTaxAmount,
    netToPay,
    recurringItems,
    optionalItemsTotal
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatNumberIt(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDateIt(isoDate: string): string {
  if (!isoDate) return '';
  try {
    const [y, m, d] = isoDate.split('-');
    if (y && m && d) return `${d}/${m}/${y}`;
    return isoDate;
  } catch {
    return isoDate;
  }
}

