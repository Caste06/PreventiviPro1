import { jsPDF } from 'jspdf';
import { QuoteDocument } from '../types/quote';
import {
  calcLineNet,
  calculateQuoteTotals,
  formatCurrency,
  formatDateIt,
  formatNumberIt
} from './calculations';

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length !== 6) return [14, 165, 233];
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [14, 165, 233];
  }
  return [r, g, b];
}

export async function generateVectorQuotePdf(doc: QuoteDocument): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const totals = calculateQuoteTotals(doc);
  const [accR, accG, accB] = hexToRgb(doc.accentColor || '#0ea5e9');
  const isExempt = doc.fiscal.regime === 'forfettario' || doc.fiscal.regime === 'esente';

  const pageW = 210;
  const pageH = 297;
  const marginX = 14;
  const contentW = pageW - marginX * 2; // 182mm

  let y = 14;

  const ensureSpace = (neededMm: number, redrawTableHeader = false) => {
    if (y + neededMm > pageH - 20) {
      pdf.addPage();
      y = 16;
      if (doc.template === 'modern_sidebar') {
        pdf.setFillColor(accR, accG, accB);
        pdf.rect(0, 0, 5, pageH, 'F');
      }
      if (redrawTableHeader) {
        drawTableHeader();
      }
    }
  };

  // --- 1. HEADER BY TEMPLATE ---
    if (doc.template === 'corporate_prestige') {
      // Royal Navy Header
      pdf.setFillColor(10, 25, 47);
      pdf.rect(0, 0, pageW, 46, 'F');

      // Double Accent Lines: Primary Accent + Gold Line
      pdf.setFillColor(accR, accG, accB);
      pdf.rect(0, 46, pageW, 1.5, 'F');
      pdf.setFillColor(218, 165, 32);
      pdf.rect(0, 48, pageW, 0.4, 'F');

      // Prestige Crest / Monogram Badge
      pdf.setFillColor(17, 34, 64);
      pdf.setDrawColor(218, 165, 32);
      pdf.setLineWidth(0.6);
      pdf.roundedRect(marginX, 9, 15, 15, 2.5, 2.5, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(255, 255, 255);
      const badgeText = doc.sender.companyName.toLowerCase().includes('l2')
        ? 'L2'
        : doc.sender.companyName.substring(0, 2).toUpperCase();
      pdf.text(badgeText, marginX + 7.5, 19, { align: 'center' });

      // Company Title & Tagline
      pdf.setFont('times', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text(doc.sender.companyName, marginX + 19, 16);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(203, 213, 225);
      pdf.text(doc.sender.tagline || '', marginX + 19, 21.5);

      pdf.setFontSize(7.8);
      pdf.setTextColor(148, 163, 184);
      const senderSub = [
        doc.sender.address ? `${doc.sender.address}, ${doc.sender.zip} ${doc.sender.city} (${doc.sender.province})` : '',
        doc.sender.vatNumber ? `P.IVA: ${doc.sender.vatNumber}` : '',
        doc.sender.email || '',
        doc.sender.website || ''
      ]
        .filter(Boolean)
        .join('  ·  ');
      pdf.text(senderSub, marginX, 35);

      // Right side: Official Document Badge & Number
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(218, 165, 32);
      pdf.text('DOCUMENTO COMMERCIALE UFFICIALE', pageW - marginX, 14, { align: 'right' });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(17);
      pdf.setTextColor(255, 255, 255);
      pdf.text(doc.number, pageW - marginX, 22, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(203, 213, 225);
      pdf.text(
        `Data: ${formatDateIt(doc.issueDate)}   ·   Validità: ${formatDateIt(doc.validUntilDate)}`,
        pageW - marginX,
        35,
        { align: 'right' }
      );

      y = 55;
    } else if (doc.template === 'swiss_minimal') {
      // Pure Swiss Minimal Typography: No filled dark background!
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('PREVENTIVO / QUOTATION', marginX, y + 4);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(15, 23, 42);
      pdf.text(doc.number, marginX, y + 13);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `Data emissione: ${formatDateIt(doc.issueDate)}   ·   Scadenza: ${formatDateIt(doc.validUntilDate)}`,
        marginX,
        y + 19
      );

      // Right side: Company Name & details
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor(15, 23, 42);
      pdf.text(doc.sender.companyName, pageW - marginX, y + 7, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(doc.sender.tagline || '', pageW - marginX, y + 12.5, { align: 'right' });

      pdf.setFontSize(7.5);
      pdf.text(`P.IVA: ${doc.sender.vatNumber}  ·  ${doc.sender.email}`, pageW - marginX, y + 17.5, { align: 'right' });

      // Clean horizontal divider
      pdf.setDrawColor(15, 23, 42);
      pdf.setLineWidth(0.6);
      pdf.line(marginX, y + 23, pageW - marginX, y + 23);

      y += 30;
    } else if (doc.template === 'modern_sidebar') {
      // Modern Sidebar: Left vertical strip
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 8, pageH, 'F');
      pdf.setFillColor(accR, accG, accB);
      pdf.rect(8, 0, 2, pageH, 'F');

      // Header with left accent
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(17);
      pdf.setTextColor(15, 23, 42);
      pdf.text(doc.sender.companyName, marginX, y + 5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(doc.sender.tagline || '', marginX, y + 10.5);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(accR, accG, accB);
      pdf.text('PREVENTIVO', pageW - marginX, y + 3, { align: 'right' });

      pdf.setFontSize(16);
      pdf.setTextColor(15, 23, 42);
      pdf.text(doc.number, pageW - marginX, y + 10, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `Data: ${formatDateIt(doc.issueDate)} · Scadenza: ${formatDateIt(doc.validUntilDate)}`,
        pageW - marginX,
        y + 15.5,
        { align: 'right' }
      );

      pdf.setDrawColor(accR, accG, accB);
      pdf.setLineWidth(0.8);
      pdf.line(marginX, y + 20, pageW - marginX, y + 20);
      y += 27;
    } else {
      // L2 Executive: Dark Tech Studio (Default)
      pdf.setFillColor(9, 13, 22);
      pdf.rect(0, 0, pageW, 44, 'F');

      // Bottom Accent Line
      pdf.setFillColor(accR, accG, accB);
      pdf.rect(0, 44, pageW, 1.4, 'F');

      // Vector Monogram Badge (L2 or Company Initial)
      pdf.setFillColor(20, 27, 45);
      pdf.setDrawColor(accR, accG, accB);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(marginX, 10, 14, 14, 3, 3, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(255, 255, 255);
      const badgeText = doc.sender.companyName.toLowerCase().includes('l2')
        ? 'L2'
        : doc.sender.companyName.substring(0, 2).toUpperCase();
      pdf.text(badgeText, marginX + 7, 19, { align: 'center' });

      // Sender Company Name & Tagline
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor(255, 255, 255);
      pdf.text(doc.sender.companyName, marginX + 18, 16);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(180, 195, 215);
      pdf.text(doc.sender.tagline || '', marginX + 18, 21.5);

      pdf.setFontSize(7.8);
      pdf.setTextColor(148, 163, 184);
      const senderSub = [
        doc.sender.address ? `${doc.sender.address}, ${doc.sender.zip} ${doc.sender.city} (${doc.sender.province})` : '',
        doc.sender.vatNumber ? `P.IVA: ${doc.sender.vatNumber}` : '',
        doc.sender.email || '',
        doc.sender.website || ''
      ]
        .filter(Boolean)
        .join('  ·  ');
      pdf.text(senderSub, marginX, 34);

      // Right side: PREVENTIVO badge & Number
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(accR, accG, accB);
      pdf.text('OFFERTA TECNICO-ECONOMICA / PREVENTIVO', pageW - marginX, 14, { align: 'right' });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(17);
      pdf.setTextColor(255, 255, 255);
      pdf.text(doc.number, pageW - marginX, 22, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(203, 213, 225);
      pdf.text(
        `Data emissione: ${formatDateIt(doc.issueDate)}   ·   Valido fino al: ${formatDateIt(doc.validUntilDate)}`,
        pageW - marginX,
        34,
        { align: 'right' }
      );

      y = 53;
    }

    // --- 2. SENDER & CLIENT 2-COLUMN CARDS ---
    const boxW = (contentW - 6) / 2;
    const boxH = 32;

    // Sender Box
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, y, boxW, boxH, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.2);
    pdf.setTextColor(accR, accG, accB);
    pdf.text('FORNITORE / EMITTENTE', marginX + 4, y + 5.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(doc.sender.companyName, marginX + 4, y + 11);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.8);
    pdf.setTextColor(71, 85, 105);
    const senderLines = [
      `${doc.sender.address} — ${doc.sender.zip} ${doc.sender.city} (${doc.sender.province})`,
      `P.IVA: ${doc.sender.vatNumber}   ·   C.F.: ${doc.sender.taxCode}`,
      `${doc.sender.email}   ·   ${doc.sender.phone}`,
      doc.sender.sdiOrPec ? `${doc.sender.sdiOrPec}` : ''
    ].filter(Boolean);
    senderLines.slice(0, 4).forEach((line, idx) => {
      pdf.text(line, marginX + 4, y + 15.8 + idx * 4.2);
    });

    // Client Box
    const clientX = marginX + boxW + 6;
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(clientX, y, boxW, boxH, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.2);
    pdf.setTextColor(accR, accG, accB);
    pdf.text('SPETT.LE CLIENTE / COMMITTENTE', clientX + 4, y + 5.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(doc.client.companyName || 'Cliente', clientX + 4, y + 11);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.8);
    pdf.setTextColor(71, 85, 105);
    const clientLines = [
      doc.client.contactPerson ? `Alla c.a.: ${doc.client.contactPerson}` : '',
      doc.client.address ? `${doc.client.address} — ${doc.client.zip} ${doc.client.city} (${doc.client.province})` : '',
      [
        doc.client.vatNumber ? `P.IVA: ${doc.client.vatNumber}` : '',
        doc.client.taxCode ? `C.F.: ${doc.client.taxCode}` : ''
      ]
        .filter(Boolean)
        .join('  ·  '),
      [doc.client.email, doc.client.phone, doc.client.sdiOrPec].filter(Boolean).join(' · ')
    ].filter(Boolean);
    clientLines.slice(0, 4).forEach((line, idx) => {
      pdf.text(line, clientX + 4, y + 15.8 + idx * 4.2);
    });

    y += boxH + 7;

    // --- 3. PROJECT SUBJECT & INTRO ---
    pdf.setFillColor(accR, accG, accB);
    pdf.rect(marginX, y, 1.5, 12, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('OGGETTO DELLA PROPOSTA', marginX + 4.5, y + 4);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(doc.projectTitle || 'Preventivo Professionale', marginX + 4.5, y + 9.8);
    y += 15;

    if (doc.introText && doc.introText.trim()) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.4);
      pdf.setTextColor(51, 65, 85);
      const introLines = pdf.splitTextToSize(doc.introText.trim(), contentW);
      pdf.text(introLines, marginX, y);
      y += introLines.length * 4 + 4;
    }

    // --- 4. LINE ITEMS TABLE ---
    const colCodeX = marginX + 2;
    const colDescX = marginX + 20;
    const colDescW = 84;
    const colQtyX = marginX + 122;
    const colPriceX = marginX + 144;
    const colDiscX = marginX + 157;
    const colTotalX = pageW - marginX - 2;

    const drawTableHeader = () => {
      if (doc.template === 'corporate_prestige') {
        pdf.setFillColor(10, 25, 47);
        pdf.rect(marginX, y, contentW, 8, 'F');
        pdf.setFillColor(accR, accG, accB);
        pdf.rect(marginX, y + 8, contentW, 0.8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.2);
        pdf.setTextColor(255, 235, 175);
      } else if (doc.template === 'swiss_minimal') {
        pdf.setDrawColor(15, 23, 42);
        pdf.setLineWidth(0.6);
        pdf.line(marginX, y, pageW - marginX, y);
        pdf.line(marginX, y + 8, pageW - marginX, y + 8);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.2);
        pdf.setTextColor(15, 23, 42);
      } else {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(marginX, y, contentW, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.2);
        pdf.setTextColor(255, 255, 255);
      }

      pdf.text('COD.', colCodeX, y + 5.2);
      pdf.text('DESCRIZIONE INTERVENTO / SERVIZIO', colDescX, y + 5.2);
      pdf.text('Q.TÀ / UN.', colQtyX, y + 5.2, { align: 'right' });
      pdf.text('PREZZO UN.', colPriceX, y + 5.2, { align: 'right' });
      pdf.text(isExempt ? 'SC.%' : 'SC./IVA', colDiscX, y + 5.2, { align: 'right' });
      pdf.text('IMPORTO NETTO', colTotalX, y + 5.2, { align: 'right' });
      y += doc.template === 'corporate_prestige' ? 8.8 : 8;
    };

    drawTableHeader();

    const mainItems = doc.items.filter((i) => !i.isOptional);
    const optionalItems = doc.items.filter((i) => i.isOptional);

    mainItems.forEach((item, index) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.8);
      const descLines: string[] = item.description
        ? pdf.splitTextToSize(item.description.trim(), colDescW)
        : [];
      const titleLines: string[] = pdf.splitTextToSize(item.title || 'Servizio', colDescW);

      const rowH = Math.max(11, 5.5 + titleLines.length * 4 + descLines.length * 3.6 + 3);
      ensureSpace(rowH + 2, true);

      // Alternating Zebra Row Background
      if (index % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(marginX, y, contentW, rowH, 'F');
      }

      // Bottom Row Border
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.25);
      pdf.line(marginX, y + rowH, pageW - marginX, y + rowH);

      // Code
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(accR, accG, accB);
      pdf.text(item.code || `#0${index + 1}`, colCodeX, y + 5.5);

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.8);
      pdf.setTextColor(15, 23, 42);
      pdf.text(titleLines, colDescX, y + 5.5);

      // Description
      if (descLines.length > 0) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.6);
        pdf.setTextColor(71, 85, 105);
        pdf.text(descLines, colDescX, y + 5.5 + titleLines.length * 4);
      }

      // Qty + Unit
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(30, 41, 59);
      pdf.text(`${item.quantity} ${item.unit}`, colQtyX, y + 5.5, { align: 'right' });

      // Unit Price
      pdf.text(formatCurrency(item.unitPrice), colPriceX, y + 5.5, { align: 'right' });

      // Discount / VAT
      const discLabel = item.discountPercent > 0 ? `-${item.discountPercent}%` : '—';
      const vatLabel = isExempt ? discLabel : `${discLabel !== '—' ? discLabel + ' ' : ''}${item.vatRate}%`;
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(vatLabel, colDiscX, y + 5.5, { align: 'right' });

      // Line Total Net
      const lineNet = calcLineNet(item);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.8);
      pdf.setTextColor(15, 23, 42);
      pdf.text(formatCurrency(lineNet), colTotalX, y + 5.5, { align: 'right' });

      y += rowH;
    });

    // Optional Items Block (if any)
    if (optionalItems.length > 0) {
      ensureSpace(22, false);
      y += 5;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(marginX, y, contentW, 6.5, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.2);
      pdf.setTextColor(71, 85, 105);
      pdf.text('MODULI OPZIONALI SU RICHIESTA (NON INCLUSI NEL TOTALE PRINCIPALE)', marginX + 3, y + 4.5);
      y += 6.5;

      optionalItems.forEach((opt) => {
        ensureSpace(10, false);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.2);
        pdf.setTextColor(51, 65, 85);
        pdf.text(`${opt.code ? opt.code + ' — ' : ''}${opt.title} (${opt.unit})`, marginX + 3, y + 5);
        pdf.text(formatCurrency(calcLineNet(opt)), colTotalX, y + 5, { align: 'right' });
        pdf.setDrawColor(226, 232, 240);
        pdf.line(marginX, y + 7.5, pageW - marginX, y + 7.5);
        y += 8;
      });
    }

    y += 6;

    // --- 5. TOTALS & PAYMENT SUMMARY BLOCK ---
    ensureSpace(64, false);

    const summaryStartY = y;
    const leftColW = 98;
    const rightColW = 78;
    const rightColX = pageW - marginX - rightColW;

    // Left Side: Payment Milestones + Bank Details + Recurring Canoni
    let leftY = summaryStartY;

    if (doc.showRecurringSummary && totals.recurringItems.length > 0) {
      pdf.setFillColor(240, 249, 255);
      pdf.setDrawColor(186, 230, 253);
      pdf.roundedRect(marginX, leftY, leftColW, 16, 1.5, 1.5, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.2);
      pdf.setTextColor(accR, accG, accB);
      pdf.text('RIEPILOGO CANONI PERIODICI / RICORRENTI INCL. NELL’OFFERTA', marginX + 3, leftY + 5);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.2);
      pdf.setTextColor(15, 23, 42);
      const recText = totals.recurringItems
        .map((r) => `${formatCurrency(r.totalNet)} ${r.unit}`)
        .join('   +   ');
      pdf.text(recText, marginX + 3, leftY + 11.5);
      leftY += 19;
    }

    if (doc.milestones.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('PIANO DI PAGAMENTO CONCORDATO', marginX, leftY + 4);
      leftY += 6;

      doc.milestones.forEach((ms) => {
        const amount = (totals.netToPay * ms.percentage) / 100;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.8);
        pdf.setTextColor(30, 41, 59);
        pdf.text(`• ${ms.label} (${ms.percentage}%): ${formatCurrency(amount)}`, marginX + 1, leftY + 3.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.2);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`  Scadenza: ${ms.timing}`, marginX + 2.5, leftY + 7.2);
        leftY += 9;
      });
    }

    // Bank Coordinates Box
    leftY += 2;
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(marginX, leftY, leftColW, 18, 1.5, 1.5, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(accR, accG, accB);
    pdf.text(`MODALITÀ DI PAGAMENTO: ${doc.paymentMethodLabel.toUpperCase()}`, marginX + 3, leftY + 4.8);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.6);
    pdf.setTextColor(51, 65, 85);
    pdf.text(`Banca: ${doc.sender.bankName}  ·  Intestatario: ${doc.sender.accountHolder}`, marginX + 3, leftY + 9.8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`IBAN: ${doc.sender.iban}`, marginX + 3, leftY + 14.8);
    leftY += 22;

    // Right Side: Fiscal Totals Box
    let rightY = summaryStartY;
    const drawTotalRow = (label: string, val: string, bold = false, highlight = false) => {
      if (highlight) {
        pdf.setFillColor(15, 23, 42);
        pdf.roundedRect(rightColX, rightY, rightColW, 10, 1.5, 1.5, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(255, 255, 255);
        pdf.text(label, rightColX + 4, rightY + 6.5);
        pdf.setTextColor(accR, accG, accB);
        pdf.text(val, rightColX + rightColW - 4, rightY + 6.5, { align: 'right' });
        rightY += 11.5;
      } else {
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(8.2);
        pdf.setTextColor(bold ? 15 : 71, bold ? 23 : 85, bold ? 42 : 105);
        pdf.text(label, rightColX + 2, rightY + 4.5);
        pdf.text(val, rightColX + rightColW - 2, rightY + 4.5, { align: 'right' });
        pdf.setDrawColor(235, 240, 245);
        pdf.line(rightColX, rightY + 6.5, rightColX + rightColW, rightY + 6.5);
        rightY += 7;
      }
    };

    drawTotalRow('Imponibile Lordo', formatCurrency(totals.rawSubtotal));
    if (totals.lineDiscountsTotal > 0) {
      drawTotalRow('Sconti su righe', `- ${formatCurrency(totals.lineDiscountsTotal)}`);
    }
    if (totals.globalDiscountAmount > 0) {
      drawTotalRow('Sconto globale extra', `- ${formatCurrency(totals.globalDiscountAmount)}`);
    }
    drawTotalRow('Subtotale Imponibile', formatCurrency(totals.taxableSubtotal), true);

    if (totals.cassaAmount > 0) {
      const cassaLabel =
        doc.fiscal.cassaType === 'inps_4'
          ? 'Rivalsa INPS (4%)'
          : `Cassa Previdenziale (${doc.fiscal.cassaRate}%)`;
      drawTotalRow(cassaLabel, formatCurrency(totals.cassaAmount));
    }

    if (isExempt) {
      drawTotalRow('IVA (Esente / Forfettario 0%)', formatCurrency(0));
    } else {
      totals.vatBreakdown.forEach((v) => {
        drawTotalRow(
          `IVA ${v.rate}% (su ${formatNumberIt(v.taxableBase)} €)`,
          formatCurrency(v.vatAmount)
        );
      });
    }

    if (totals.stampDutyAmount > 0) {
      drawTotalRow('Imposta di Bollo virtuale', formatCurrency(totals.stampDutyAmount));
    }

    drawTotalRow('TOTALE DOCUMENTO', formatCurrency(totals.grossTotal), true, true);

    if (totals.withholdingTaxAmount > 0) {
      drawTotalRow(
        `Ritenuta d'Acconto (${doc.fiscal.withholdingTaxRate}%)`,
        `- ${formatCurrency(totals.withholdingTaxAmount)}`
      );
      drawTotalRow('NETTO A PAGARE', formatCurrency(totals.netToPay), true, true);
    }

    y = Math.max(leftY, rightY) + 5;

    // --- 6. FISCAL / FORFETTARIO LEGAL NOTE ---
    if (doc.fiscal.regime === 'forfettario' && doc.fiscal.forfettarioNote) {
      ensureSpace(14, false);
      pdf.setFillColor(254, 252, 232);
      pdf.setDrawColor(253, 224, 71);
      pdf.roundedRect(marginX, y, contentW, 10, 1.5, 1.5, 'FD');
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7.1);
      pdf.setTextColor(113, 63, 18);
      const fLines = pdf.splitTextToSize(doc.fiscal.forfettarioNote, contentW - 6);
      pdf.text(fLines, marginX + 3, y + 4.2);
      y += 13;
    }

    // --- 7. DELIVERY, TERMS & SIGNATURE BLOCK ---
    ensureSpace(48, false);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.4);
    pdf.setTextColor(15, 23, 42);
    pdf.text('TEMPI DI REALIZZAZIONE & GARANZIA:', marginX, y + 3.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.4);
    pdf.setTextColor(71, 85, 105);
    const delivLines = pdf.splitTextToSize(
      `${doc.deliveryTimeframe} ${doc.warrantyAndSupport}`,
      contentW
    );
    pdf.text(delivLines, marginX, y + 7.5);
    y += 8 + delivLines.length * 3.5;

    if (doc.termsAndConditions) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.2);
      pdf.setTextColor(15, 23, 42);
      pdf.text('CONDIZIONI GENERALI DI FORNITURA:', marginX, y + 3.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.9);
      pdf.setTextColor(100, 116, 139);
      const termLines = pdf.splitTextToSize(doc.termsAndConditions, contentW);
      pdf.text(termLines, marginX, y + 7);
      y += 8 + termLines.length * 3.2;
    }

    if (doc.requireSignature) {
      ensureSpace(26, false);
      y += 3;
      const sigBoxW = (contentW - 8) / 2;

      // Left: Emittente Signature
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(marginX, y, sigBoxW, 20, 1.5, 1.5, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text('TIMBRO E FIRMA DEL FORNITORE', marginX + 4, y + 5);
      pdf.setFont('times', 'italic');
      pdf.setFontSize(11);
      pdf.setTextColor(15, 23, 42);
      pdf.text(doc.sender.signatureText || doc.sender.companyName, marginX + 4, y + 14);

      // Right: Client Acceptance Signature
      const clientSigX = marginX + sigBoxW + 8;
      pdf.roundedRect(clientSigX, y, sigBoxW, 20, 1.5, 1.5, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text('PER INTEGRALE ACCETTAZIONE (DATA, TIMBRO E FIRMA CLIENTE)', clientSigX + 4, y + 5);
      pdf.setDrawColor(148, 163, 184);
      pdf.line(clientSigX + 4, y + 16, clientSigX + sigBoxW - 4, y + 16);
    }

    // --- 8. FOOTER ON EVERY PAGE ---
    const totalPages = pdf.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.25);
      pdf.line(marginX, pageH - 12, pageW - marginX, pageH - 12);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `${doc.sender.companyName} · P.IVA ${doc.sender.vatNumber} · ${doc.sender.website} · ${doc.sender.email}`,
        marginX,
        pageH - 7.5
      );
      pdf.text(
        `Preventivo ${doc.number} · Pagina ${p} di ${totalPages}`,
        pageW - marginX,
        pageH - 7.5,
        { align: 'right' }
      );
    }

    const safeClient = (doc.client.companyName || 'Cliente')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const filename = `${doc.number}_${safeClient || 'Preventivo'}.pdf`;
    pdf.save(filename);
  }

