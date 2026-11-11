export type TaxRegime = 'forfettario' | 'ordinario' | 'esente';
export type CassaType = 'none' | 'inps_4' | 'cassa_4' | 'custom';
export type QuoteStatus = 'bozza' | 'inviato' | 'accettato' | 'rifiutato' | 'scaduto';
export type TemplateLayout = 'l2_executive' | 'swiss_minimal' | 'corporate_prestige' | 'modern_sidebar';
export type BillingUnit = 'una tantum' | '/ semestre' | '/ mese' | '/ anno' | 'corpo' | 'ore' | 'gg' | string;

export interface SenderProfile {
  companyName: string;
  tagline: string;
  vatNumber: string;
  taxCode: string;
  sdiOrPec: string;
  address: string;
  zip: string;
  city: string;
  province: string;
  email: string;
  phone: string;
  website: string;
  bankName: string;
  iban: string;
  accountHolder: string;
  logoDataUrl: string;
  signatureText: string;
  signatureDataUrl: string;
  signatureLabel?: string;
}

export interface ClientInfo {
  companyName: string;
  contactPerson: string;
  vatNumber: string;
  taxCode: string;
  sdiOrPec: string;
  address: string;
  zip: string;
  city: string;
  province: string;
  email: string;
  phone: string;
}

export interface QuoteLineItem {
  id: string;
  code: string;
  title: string;
  description: string;
  quantity: number;
  unit: BillingUnit;
  unitPrice: number;
  discountPercent: number;
  vatRate: number;
  isOptional?: boolean;
}

export interface PaymentMilestone {
  id: string;
  label: string;
  percentage: number;
  timing: string;
}

export interface FiscalConfig {
  regime: TaxRegime;
  cassaType: CassaType;
  cassaRate: number;
  withholdingTaxEnabled: boolean;
  withholdingTaxRate: number;
  withholdingTaxBasePercent: number;
  stampDutyEnabled: boolean;
  stampDutyChargeClient: boolean;
  globalDiscountType: 'percent' | 'fixed';
  globalDiscountValue: number;
  forfettarioNote: string;
}

export interface QuoteDocument {
  id: string;
  number: string;
  issueDate: string;
  validUntilDate: string;
  status: QuoteStatus;
  projectTitle: string;
  projectSubtitle: string;
  introText: string;
  deliveryTimeframe: string;
  warrantyAndSupport: string;
  paymentMethodLabel: string;
  termsAndConditions: string;
  privacyNote: string;
  requireSignature: boolean;
  showRecurringSummary: boolean;
  template: TemplateLayout;
  accentColor: string;
  sender: SenderProfile;
  client: ClientInfo;
  items: QuoteLineItem[];
  milestones: PaymentMilestone[];
  fiscal: FiscalConfig;
  updatedAt: string;
}

export interface CatalogPresetItem {
  id: string;
  code: string;
  category: string;
  title: string;
  description: string;
  unit: BillingUnit;
  unitPrice: number;
  vatRate: number;
}

