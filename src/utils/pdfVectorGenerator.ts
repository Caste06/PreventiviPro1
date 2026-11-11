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
    if (y + neededMm > pageH - 18) {
      pdf.addPage();
      y = 16;
      if (doc.template === 'modern_sidebar') {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, 8, pageH, 'F');
        pdf.setFillColor(accR, accG, accB);
        pdf.rect(8, 0, 2, pageH, 'F');
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

    // Company Title & Tagline (con wrapping se lungo)
    pdf.setFont('times', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(255, 255, 255);
    const headerCompanyLines = pdf.splitTextToSize(doc.sender.companyName, 90);
    pdf.text(headerCompanyLines, marginX + 19, 15);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(203, 213, 225);
    const headerTaglineLines = pdf.splitTextToSize(doc.sender.tagline || '', 90);
    pdf.text(headerTaglineLines.slice(0, 2), marginX + 19, 16 + headerCompanyLines.length * 4.5);

    // Contatti emittente in testata (su 2 righe con larghezza protetta)
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    const subL1 = [
      doc.sender.address ? `${doc.sender.address}, ${doc.sender.zip} ${doc.sender.city}` : '',
      doc.sender.vatNumber ? `P.IVA: ${doc.sender.vatNumber}` : ''
    ].filter(Boolean).join('  ·  ');
    const subL2 = [doc.sender.email, doc.sender.website].filter(Boolean).join('  ·  ');
    if (subL1) pdf.text(pdf.splitTextToSize(subL1, 100), marginX, 35);
    if (subL2) pdf.text(pdf.splitTextToSize(subL2, 100), marginX, 39);

    // Right side: Official Document Badge & Number
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(218, 165, 32);
    pdf.text('DOCUMENTO COMMERCIALE UFFICIALE', pageW - marginX, 14, { align: 'right' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
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
    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42);
    const swissCompany = pdf.splitTextToSize(doc.sender.companyName, 80);
    pdf.text(swissCompany, pageW - marginX, y + 7, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    const swissTagline = pdf.splitTextToSize(doc.sender.tagline || '', 80);
    pdf.text(swissTagline.slice(0, 2), pageW - marginX, y + 8 + swissCompany.length * 4.5, { align: 'right' });

    pdf.setFontSize(7.5);
    pdf.text(`P.IVA: ${doc.sender.vatNumber}  ·  ${doc.sender.email}`, pageW - marginX, y + 21, { align: 'right' });

    // Clean horizontal divider
    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(0.6);
    pdf.line(marginX, y + 25, pageW - marginX, y + 25);

    y += 32;
  } else if (doc.template === 'modern_sidebar') {
    // Modern Sidebar: Left vertical strip
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, 8, pageH, 'F');
    pdf.setFillColor(accR, accG, accB);
    pdf.rect(8, 0, 2, pageH, 'F');

    // Header with left accent
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(15, 23, 42);
    const sidebarCompLines = pdf.splitTextToSize(doc.sender.companyName, 95);
    pdf.text(sidebarCompLines, marginX, y + 5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    const sidebarTagline = pdf.splitTextToSize(doc.sender.tagline || '', 95);
    pdf.text(sidebarTagline.slice(0, 2), marginX, y + 6 + sidebarCompLines.length * 4.5);

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
    pdf.line(marginX, y + 22, pageW - marginX, y + 22);
    y += 28;
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
    const execCompLines = pdf.splitTextToSize(doc.sender.companyName, 90);
    pdf.text(execCompLines, marginX + 18, 15);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(180, 195, 215);
    const execTagLines = pdf.splitTextToSize(doc.sender.tagline || '', 90);
    pdf.text(execTagLines.slice(0, 2), marginX + 18, 16 + execCompLines.length * 4.5);

    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    const senderSub1 = [
      doc.sender.address ? `${doc.sender.address}, ${doc.sender.zip} ${doc.sender.city} (${doc.sender.province})` : '',
      doc.sender.vatNumber ? `P.IVA: ${doc.sender.vatNumber}` : ''
    ].filter(Boolean).join('  ·  ');
    const senderSub2 = [doc.sender.email, doc.sender.website].filter(Boolean).join('  ·  ');
    if (senderSub1) pdf.text(pdf.splitTextToSize(senderSub1, 100), marginX, 34);
    if (senderSub2) pdf.text(pdf.splitTextToSize(senderSub2, 100), marginX, 38);

    // Right side: PREVENTIVO badge & Number
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(accR, accG, accB);
    pdf.text('OFFERTA TECNICO-ECONOMICA / PREVENTIVO', pageW - marginX, 14, { align: 'right' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
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

  // --- 2. SENDER & CLIENT DUAL CARDS (CON ALTEZZA DINAMICA E TEXT WRAP COMPLETO) ---
  const boxSpacing = 6;
  const boxW = (contentW - boxSpacing) / 2;
  const innerPad = 4;
  const textW = boxW - innerPad * 2; // ~80mm di larghezza utile per il testo

  // Helper formattazione località (CAP, Città, Provincia)
  const formatLoc = (zip?: string, city?: string, prov?: string) => {
    const parts: string[] = [];
    if (zip?.trim()) parts.push(zip.trim());
    if (city?.trim()) parts.push(city.trim());
    if (prov?.trim()) parts.push(`(${prov.trim().toUpperCase()})`);
    return parts.join(' ');
  };

  // Pre-calcolo linee Mittente
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  const senderCompLines: string[] = pdf.splitTextToSize(doc.sender.companyName, textW);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.6);
  const senderBodyLines: string[] = [];
  const senderLoc = formatLoc(doc.sender.zip, doc.sender.city, doc.sender.province);
  const senderFullAddr = [doc.sender.address, senderLoc].filter(Boolean).join(' - ');
  if (senderFullAddr) {
    senderBodyLines.push(...pdf.splitTextToSize(senderFullAddr, textW));
  }
  const senderFiscal = [
    doc.sender.vatNumber ? `P.IVA: ${doc.sender.vatNumber}` : '',
    doc.sender.taxCode ? `C.F.: ${doc.sender.taxCode}` : ''
  ].filter(Boolean).join(' · ');
  if (senderFiscal) {
    senderBodyLines.push(...pdf.splitTextToSize(senderFiscal, textW));
  }
  const senderContacts = [doc.sender.email, doc.sender.phone].filter(Boolean).join(' · ');
  if (senderContacts) {
    senderBodyLines.push(...pdf.splitTextToSize(senderContacts, textW));
  }
  if (doc.sender.sdiOrPec) {
    senderBodyLines.push(...pdf.splitTextToSize(doc.sender.sdiOrPec, textW));
  }

  // Pre-calcolo linee Destinatario / Committente
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  const clientCompLines: string[] = pdf.splitTextToSize(doc.client.companyName || 'Spett.le Cliente', textW);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.6);
  const clientBodyLines: string[] = [];
  if (doc.client.contactPerson) {
    clientBodyLines.push(...pdf.splitTextToSize(`Alla c.a.: ${doc.client.contactPerson}`, textW));
  }
  const clientLoc = formatLoc(doc.client.zip, doc.client.city, doc.client.province);
  const clientFullAddr = [doc.client.address, clientLoc].filter(Boolean).join(' - ');
  if (clientFullAddr) {
    clientBodyLines.push(...pdf.splitTextToSize(clientFullAddr, textW));
  }
  const clientFiscal = [
    doc.client.vatNumber ? `P.IVA: ${doc.client.vatNumber}` : '',
    doc.client.taxCode ? `C.F.: ${doc.client.taxCode}` : ''
  ].filter(Boolean).join(' · ');
  if (clientFiscal) {
    clientBodyLines.push(...pdf.splitTextToSize(clientFiscal, textW));
  }
  if (doc.client.email || doc.client.phone) {
    const cCont = [doc.client.email, doc.client.phone].filter(Boolean).join(' · ');
    clientBodyLines.push(...pdf.splitTextToSize(cCont, textW));
  }
  if (doc.client.sdiOrPec) {
    clientBodyLines.push(...pdf.splitTextToSize(doc.client.sdiOrPec, textW));
  }

  // Calcolo dell'altezza reale necessaria per entrambi i box
  const senderHeightNeeded = 8 + senderCompLines.length * 4.5 + senderBodyLines.length * 3.8 + 4;
  const clientHeightNeeded = 8 + clientCompLines.length * 4.5 + clientBodyLines.length * 3.8 + 4;
  const boxH = Math.max(34, Math.max(senderHeightNeeded, clientHeightNeeded));

  ensureSpace(boxH + 8);

  // Render Box Mittente
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(marginX, y, boxW, boxH, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.2);
  pdf.setTextColor(accR, accG, accB);
  pdf.text('FORNITORE / EMITTENTE', marginX + innerPad, y + 5.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text(senderCompLines, marginX + innerPad, y + 10.5);

  let currentSenderY = y + 10.5 + senderCompLines.length * 4.2;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.6);
  pdf.setTextColor(71, 85, 105);
  senderBodyLines.forEach((line) => {
    pdf.text(line, marginX + innerPad, currentSenderY);
    currentSenderY += 3.8;
  });

  // Render Box Cliente
  const clientX = marginX + boxW + boxSpacing;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(clientX, y, boxW, boxH, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.2);
  pdf.setTextColor(accR, accG, accB);
  pdf.text('SPETT.LE CLIENTE / COMMITTENTE', clientX + innerPad, y + 5.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text(clientCompLines, clientX + innerPad, y + 10.5);

  let currentClientY = y + 10.5 + clientCompLines.length * 4.2;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.6);
  pdf.setTextColor(71, 85, 105);
  clientBodyLines.forEach((line) => {
    pdf.text(line, clientX + innerPad, currentClientY);
    currentClientY += 3.8;
  });

  y += boxH + 7;

  // --- 3. OGGETTO DELLA PROPOSTA & INTRO (CON TEXT WRAP DINAMICO) ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  const projTitleLines: string[] = pdf.splitTextToSize(doc.projectTitle || 'Preventivo Professionale', contentW - 8);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8.2);
  const projSubtitleLines: string[] = doc.projectSubtitle
    ? pdf.splitTextToSize(doc.projectSubtitle, contentW - 8)
    : [];

  const subjectH = 6 + projTitleLines.length * 4.8 + (projSubtitleLines.length > 0 ? projSubtitleLines.length * 4 + 2 : 0);
  ensureSpace(subjectH + 4);

  // Barra di accento sinistra a tutta altezza dell'oggetto
  pdf.setFillColor(accR, accG, accB);
  pdf.rect(marginX, y, 1.5, subjectH, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.2);
  pdf.setTextColor(100, 116, 139);
  pdf.text('OGGETTO DELLA FORNITURA', marginX + 4.5, y + 4.2);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(projTitleLines, marginX + 4.5, y + 9.2);

  if (projSubtitleLines.length > 0) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8.2);
    pdf.setTextColor(71, 85, 105);
    pdf.text(projSubtitleLines, marginX + 4.5, y + 9.5 + projTitleLines.length * 4.8);
  }

  y += subjectH + 5;

  // Testo Introduttivo (se presente)
  if (doc.introText && doc.introText.trim()) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.2);
    pdf.setTextColor(51, 65, 85);
    const introLines = pdf.splitTextToSize(doc.introText.trim(), contentW);
    ensureSpace(introLines.length * 4 + 4);
    pdf.text(introLines, marginX, y);
    y += introLines.length * 4 + 5;
  }

  // --- 4. LINE ITEMS TABLE (TABELLA DELLE PRESTAZIONI) ---
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
    pdf.setFontSize(7.6);
    const descLines: string[] = item.description
      ? pdf.splitTextToSize(item.description.trim(), colDescW)
      : [];

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.8);
    const titleLines: string[] = pdf.splitTextToSize(item.title || 'Servizio', colDescW);

    const rowH = Math.max(11, 4.5 + titleLines.length * 4.2 + (descLines.length > 0 ? descLines.length * 3.6 + 2 : 0) + 3);
    ensureSpace(rowH + 2, true);

    // Alternating Zebra Row Background
    if (index % 2 === 1 && doc.template !== 'swiss_minimal') {
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
      pdf.text(descLines, colDescX, y + 5.5 + titleLines.length * 4.2);
    }

    // Qty + Unit
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${item.quantity} ${item.unit}`, colQtyX, y + 5.5, { align: 'right' });

    // Unit Price
    pdf.text(formatCurrency(item.unitPrice), colPriceX, y + 5.5, { align: 'right' });

    // Discount / VAT
    const discLabel = item.discountPercent > 0 ? `-${item.discountPercent}%` : '-';
    const vatLabel = isExempt ? discLabel : `${discLabel !== '-' ? discLabel + ' ' : ''}${item.vatRate}%`;
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

  // Moduli Opzionali (se presenti) con text wrap
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
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.2);
      const optTitleW = contentW - 40;
      const optText = `${opt.code ? opt.code + ' - ' : ''}${opt.title} (${opt.unit})`;
      const optLines = pdf.splitTextToSize(optText, optTitleW);
      const optH = Math.max(7, optLines.length * 4.2 + 3);

      ensureSpace(optH + 2, false);
      pdf.setTextColor(51, 65, 85);
      pdf.text(optLines, marginX + 3, y + 4.5);
      pdf.text(formatCurrency(calcLineNet(opt)), colTotalX, y + 4.5, { align: 'right' });

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.25);
      pdf.line(marginX, y + optH, pageW - marginX, y + optH);
      y += optH;
    });
  }

  y += 6;

  // --- 5. TOTALS & PAYMENT SUMMARY BLOCK ---
  ensureSpace(64, false);

  const summaryStartY = y;
  const leftColW = 98;
  const rightColW = 78;
  const rightColX = pageW - marginX - rightColW;

  // Colonna Sinistra: Canoni Ricorrenti + Piano Pagamenti + Coordinate Bancarie
  let leftY = summaryStartY;

  // Riquadro Canoni Periodici (con altezza dinamica e wrapping)
  if (doc.showRecurringSummary && totals.recurringItems.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    const recText = totals.recurringItems
      .map((r) => `${formatCurrency(r.totalNet)} ${r.unit}`)
      .join('   +   ');
    const recLines = pdf.splitTextToSize(recText, leftColW - 8);
    const recBoxH = Math.max(14, 8 + recLines.length * 4.2 + 2);

    pdf.setFillColor(240, 249, 255);
    pdf.setDrawColor(186, 230, 253);
    pdf.roundedRect(marginX, leftY, leftColW, recBoxH, 1.5, 1.5, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.2);
    pdf.setTextColor(accR, accG, accB);
    pdf.text('RIEPILOGO CANONI PERIODICI / RICORRENTI INCLUSI', marginX + 4, leftY + 5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.2);
    pdf.setTextColor(15, 23, 42);
    pdf.text(recLines, marginX + 4, leftY + 10);

    leftY += recBoxH + 4;
  }

  // Piano Pagamenti (con wrapping timing lungo)
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
      const timingLines = pdf.splitTextToSize(`  Scadenza: ${ms.timing}`, leftColW - 6);
      pdf.text(timingLines, marginX + 2.5, leftY + 7.2);
      leftY += 8 + timingLines.length * 3.5;
    });
  }

  // Coordinate Bancarie Box (Altezza dinamica con wrapping su Banca, Intestatario, IBAN e Metodo)
  leftY += 2;
  const bankInnerW = leftColW - 8;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  const payMethodLines = pdf.splitTextToSize(`MODALITÀ DI PAGAMENTO: ${doc.paymentMethodLabel.toUpperCase()}`, bankInnerW);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.6);
  const bankLines = pdf.splitTextToSize(`Banca: ${doc.sender.bankName}  ·  Intestato a: ${doc.sender.accountHolder}`, bankInnerW);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.6);
  const ibanLines = pdf.splitTextToSize(`IBAN: ${doc.sender.iban}`, bankInnerW);

  const bankBoxH = 6 + payMethodLines.length * 3.8 + bankLines.length * 3.8 + ibanLines.length * 4 + 4;

  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(marginX, leftY, leftColW, bankBoxH, 1.5, 1.5, 'FD');

  let curBankY = leftY + 4.8;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(accR, accG, accB);
  pdf.text(payMethodLines, marginX + 4, curBankY);
  curBankY += payMethodLines.length * 3.8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.6);
  pdf.setTextColor(51, 65, 85);
  pdf.text(bankLines, marginX + 4, curBankY);
  curBankY += bankLines.length * 3.8;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(ibanLines, marginX + 4, curBankY);

  leftY += bankBoxH + 4;

  // Colonna Destra: Riquadro Totali Fiscali
  let rightY = summaryStartY;
  const drawTotalRow = (label: string, val: string, bold = false, highlight = false) => {
    if (highlight) {
      pdf.setFillColor(15, 23, 42);
      pdf.roundedRect(rightColX, rightY, rightColW, 10, 1.5, 1.5, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.2);
      pdf.setTextColor(255, 255, 255);
      pdf.text(label, rightColX + 4, rightY + 6.5);
      pdf.setTextColor(accR, accG, accB);
      pdf.text(val, rightColX + rightColW - 4, rightY + 6.5, { align: 'right' });
      rightY += 11.5;
    } else {
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(bold ? 15 : 71, bold ? 23 : 85, bold ? 42 : 105);

      // Troncamento protetto se label è molto lunga per non toccare il valore a destra
      const maxLabelW = rightColW - 32;
      const labelText = pdf.splitTextToSize(label, maxLabelW)[0];
      pdf.text(labelText, rightColX + 2, rightY + 4.5);
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
        : `Cassa Prev. (${doc.fiscal.cassaRate}%)`;
    drawTotalRow(cassaLabel, formatCurrency(totals.cassaAmount));
  }

  if (isExempt) {
    drawTotalRow('IVA (Esente / Forfettario)', formatCurrency(0));
  } else {
    totals.vatBreakdown.forEach((v) => {
      drawTotalRow(
        `IVA ${v.rate}% (su ${formatNumberIt(v.taxableBase)} €)`,
        formatCurrency(v.vatAmount)
      );
    });
  }

  if (totals.stampDutyAmount > 0) {
    drawTotalRow('Bollo virtuale', formatCurrency(totals.stampDutyAmount));
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

  // --- 6. NOTA LEGALE REGIME FORFETTARIO (ALTEZZA DINAMICA ESATTA) ---
  if (doc.fiscal.regime === 'forfettario' && doc.fiscal.forfettarioNote) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.2);
    const fLines = pdf.splitTextToSize(doc.fiscal.forfettarioNote, contentW - 8);
    const forfBoxH = 6 + fLines.length * 3.8 + 2;

    ensureSpace(forfBoxH + 4, false);
    pdf.setFillColor(254, 252, 232);
    pdf.setDrawColor(253, 224, 71);
    pdf.roundedRect(marginX, y, contentW, forfBoxH, 1.5, 1.5, 'FD');

    pdf.setTextColor(113, 63, 18);
    pdf.text(fLines, marginX + 4, y + 4.8);
    y += forfBoxH + 5;
  }

  // --- 7. CONSEGNA, TERMINI CONTRATTUALI & FIRME ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.4);
  pdf.setTextColor(15, 23, 42);
  const delivHeader = 'TEMPI DI REALIZZAZIONE & GARANZIA:';
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.4);
  const delivLines = pdf.splitTextToSize(
    `${doc.deliveryTimeframe} ${doc.warrantyAndSupport}`,
    contentW
  );
  ensureSpace(10 + delivLines.length * 3.6, false);

  pdf.setFont('helvetica', 'bold');
  pdf.text(delivHeader, marginX, y + 3.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(delivLines, marginX, y + 7.5);
  y += 8 + delivLines.length * 3.6;

  if (doc.termsAndConditions) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    const termLines = pdf.splitTextToSize(doc.termsAndConditions, contentW);
    ensureSpace(12 + Math.min(termLines.length, 12) * 3.4, false);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.2);
    pdf.setTextColor(15, 23, 42);
    pdf.text('CONDIZIONI GENERALI DI FORNITURA:', marginX, y + 3.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);

    // Stampa riga per riga controllando eventuale salto pagina
    let termY = y + 7.5;
    for (let i = 0; i < termLines.length; i++) {
      if (termY > pageH - 35) {
        pdf.addPage();
        termY = 16;
      }
      pdf.text(termLines[i], marginX, termY);
      termY += 3.4;
    }
    y = termY + 3;
  }

  // Blocco Firme (con wrapping e dimensioni adeguate)
  if (doc.requireSignature) {
    const sigBoxW = (contentW - 8) / 2;
    const sigBoxH = 22;
    ensureSpace(sigBoxH + 6, false);

    // Left: Emittente Signature
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(marginX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    const sigLabel = (doc.sender.signatureLabel || 'TIMBRO E FIRMA EMITTENTE').toUpperCase();
    pdf.text(sigLabel, marginX + 4, y + 5);

    pdf.setFont('times', 'italic');
    pdf.setFontSize(10.5);
    pdf.setTextColor(15, 23, 42);
    const sigTextLines = pdf.splitTextToSize(doc.sender.signatureText || doc.sender.companyName, sigBoxW - 8);
    pdf.text(sigTextLines.slice(0, 2), marginX + 4, y + 13);

    // Right: Client Acceptance Signature
    const clientSigX = marginX + sigBoxW + 8;
    pdf.roundedRect(clientSigX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text('PER ACCETTAZIONE DEL CLIENTE (TIMBRO E FIRMA)', clientSigX + 4, y + 5);

    pdf.setDrawColor(148, 163, 184);
    pdf.setLineWidth(0.3);
    pdf.line(clientSigX + 4, y + 15, clientSigX + sigBoxW - 4, y + 15);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Data: ____ / ____ / ________', clientSigX + 4, y + 19);

    y += sigBoxH + 4;
  }

  // --- 8. FOOTER FISSO SU TUTTE LE PAGINE ---
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.25);
    pdf.line(marginX, pageH - 12, pageW - marginX, pageH - 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.8);
    pdf.setTextColor(148, 163, 184);
    const footText = `${doc.sender.companyName} · P.IVA ${doc.sender.vatNumber} · ${doc.sender.website || doc.sender.email}`;
    pdf.text(pdf.splitTextToSize(footText, 120)[0], marginX, pageH - 7.5);

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
