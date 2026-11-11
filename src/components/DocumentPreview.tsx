import React from 'react';
import { QuoteDocument } from '../types/quote';
import {
  calcLineNet,
  calculateQuoteTotals,
  formatCurrency,
  formatDateIt
} from '../utils/calculations';

interface DocumentPreviewProps {
  doc: QuoteDocument;
}

const formatLocation = (zip?: string, city?: string, province?: string) => {
  const parts: string[] = [];
  if (zip?.trim()) parts.push(zip.trim());
  if (city?.trim()) parts.push(city.trim());
  if (province?.trim()) parts.push(`(${province.trim().toUpperCase()})`);
  return parts.join(' ');
};

const formatFullAddress = (address?: string, zip?: string, city?: string, province?: string) => {
  const loc = formatLocation(zip, city, province);
  const parts: string[] = [];
  if (address?.trim()) parts.push(address.trim());
  if (loc) parts.push(loc);
  return parts.join(' - ');
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc }) => {
  const totals = calculateQuoteTotals(doc);
  const isExempt = doc.fiscal.regime === 'forfettario' || doc.fiscal.regime === 'esente';
  const accent = doc.accentColor || '#0ea5e9';
  const template = doc.template || 'l2_executive';

  // --- RENDERING SPECIALIZZATO PER IL LAYOUT MODERN SIDEBAR (2 COLONNE) ---
  if (template === 'modern_sidebar') {
    return (
      <div className="w-full flex justify-center py-6 overflow-x-auto">
        <div
          id="pdf-document-sheet"
          className="a4-sheet p-10 flex flex-row text-slate-800 text-[13px] leading-relaxed select-text"
          style={{ minHeight: '297mm', width: '210mm' }}
        >
          {/* SIDEBAR SINISTRA */}
          <aside
            className="-my-10 -ml-10 w-[65mm] min-w-[65mm] p-6 bg-slate-950 text-slate-200 flex flex-col justify-between border-r-4 shrink-0"
            style={{ borderColor: accent }}
          >
            <div className="space-y-6">
              {/* Logo & Brand Emittente */}
              <div>
                {doc.sender.logoDataUrl ? (
                  <img
                    src={doc.sender.logoDataUrl}
                    alt="Logo"
                    className="w-14 h-14 object-contain rounded-xl bg-slate-900 border border-slate-800 p-1 mb-3"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white font-display border mb-3"
                    style={{ backgroundColor: '#1e293b', borderColor: accent }}
                  >
                    {doc.sender.companyName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <h1 className="font-display font-bold text-base text-white tracking-tight leading-snug">
                  {doc.sender.companyName}
                </h1>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{doc.sender.tagline}</p>
              </div>

              {/* Riquadro Dati Preventivo */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                <span
                  className="inline-block px-2 py-0.5 rounded text-[9px] font-mono-code font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${accent}25`, color: accent }}
                >
                  PREVENTIVO
                </span>
                <div className="font-mono-code font-bold text-base text-white pt-0.5">{doc.number}</div>
                <div className="text-[11px] text-slate-400">
                  Data: <span className="text-slate-200 font-medium">{formatDateIt(doc.issueDate)}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Scadenza: <span className="text-slate-200 font-medium">{formatDateIt(doc.validUntilDate)}</span>
                </div>
              </div>

              {/* Dati Emittente */}
              <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-4">
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono-code block mb-1 text-slate-500">
                  DATI FORNITORE
                </span>
                <div className="text-slate-300 font-medium">{doc.sender.address}</div>
                <div>
                  {doc.sender.zip} {doc.sender.city} ({doc.sender.province})
                </div>
                <div className="pt-1">P.IVA: {doc.sender.vatNumber}</div>
                {doc.sender.taxCode && <div>C.F.: {doc.sender.taxCode}</div>}
                <div className="pt-1 text-slate-300">{doc.sender.email}</div>
                <div>{doc.sender.phone}</div>
                {doc.sender.sdiOrPec && <div className="text-[10px] text-slate-400">{doc.sender.sdiOrPec}</div>}
                {doc.sender.website && <div>{doc.sender.website}</div>}
              </div>

              {/* Coordinate Bancarie */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono-code block mb-1" style={{ color: accent }}>
                  PAGAMENTO: {doc.paymentMethodLabel}
                </span>
                <div className="font-mono-code text-[10px] text-slate-200 select-all break-all">{doc.sender.iban}</div>
                <div className="text-[10px] text-slate-400 mt-1">Banca: {doc.sender.bankName}</div>
              </div>
            </div>

            {/* Firma Emittente */}
            {doc.requireSignature && (
              <div className="border-t border-slate-800/80 pt-3 text-[11px]">
                <span className="text-[9px] font-mono-code uppercase text-slate-500 block mb-1">
                  {doc.sender.signatureLabel || 'Firma Emittente'}
                </span>
                <div className="font-serif italic text-sm text-slate-200 min-h-[28px] flex items-end">
                  {doc.sender.signatureText || doc.sender.companyName}
                </div>
              </div>
            )}
          </aside>

          {/* CORPO PRINCIPALE DESTRA */}
          <main className="flex-1 pl-8 flex flex-col justify-between">
            <div>
              {/* Box Destinatario */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <span className="text-[10px] font-bold tracking-wider uppercase font-mono-code block mb-1" style={{ color: accent }}>
                  SPETT.LE COMMITTENTE / CLIENTE
                </span>
                <div className="font-bold text-sm text-slate-900">{doc.client.companyName || 'Spett.le Cliente'}</div>
                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                  {doc.client.contactPerson && <div className="font-medium text-slate-700">C.a.: {doc.client.contactPerson}</div>}
                  <div>{formatFullAddress(doc.client.address, doc.client.zip, doc.client.city, doc.client.province) || 'Indirizzo da definire'}</div>
                  {(doc.client.vatNumber || doc.client.taxCode) && (
                    <div>
                      {doc.client.vatNumber && `P.IVA: ${doc.client.vatNumber}`}
                      {doc.client.taxCode && ` · C.F.: ${doc.client.taxCode}`}
                    </div>
                  )}
                  <div>{doc.client.email} {doc.client.phone && `· Tel: ${doc.client.phone}`}</div>
                </div>
              </div>

              {/* Oggetto Fornitura */}
              <div className="mb-6 pl-3 border-l-4" style={{ borderColor: accent }}>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">OGGETTO DELLA FORNITURA</span>
                <h2 className="text-base font-bold text-slate-900 font-display mt-0.5">{doc.projectTitle}</h2>
                {doc.projectSubtitle && <p className="text-xs text-slate-600 mt-0.5 italic">{doc.projectSubtitle}</p>}
              </div>

              {doc.introText && (
                <div className="mb-6 text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                  {doc.introText}
                </div>
              )}

              {/* Tabella Voci */}
              <div className="mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] font-mono-code uppercase tracking-wider">
                      <th className="py-2 px-2.5 rounded-l">Cod.</th>
                      <th className="py-2 px-2.5">Descrizione Prestazione</th>
                      <th className="py-2 px-2.5 text-right">Q.tà</th>
                      <th className="py-2 px-2.5 text-right">Prezzo</th>
                      <th className="py-2 px-2.5 text-right rounded-r">Netto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {doc.items
                      .filter((item) => !item.isOptional)
                      .map((item, idx) => (
                        <tr key={item.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="py-2.5 px-2.5 font-mono-code font-bold text-slate-500 text-[10px] align-top">
                            {item.code || `#0${idx + 1}`}
                          </td>
                          <td className="py-2.5 px-2.5 align-top">
                            <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                            {item.description && (
                              <div className="text-[11px] text-slate-600 mt-0.5 whitespace-pre-line leading-relaxed">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2.5 text-right whitespace-nowrap font-mono-code align-top text-[11px]">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2.5 px-2.5 text-right whitespace-nowrap font-mono-code align-top text-[11px]">
                            {formatCurrency(item.unitPrice)}
                            {item.discountPercent > 0 && <span className="text-amber-600 font-bold block text-[10px]">-{item.discountPercent}%</span>}
                          </td>
                          <td className="py-2.5 px-2.5 text-right whitespace-nowrap font-mono-code font-bold text-slate-900 align-top text-xs">
                            {formatCurrency(calcLineNet(item))}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Opzioni facoltative */}
                {doc.items.some((i) => i.isOptional) && (
                  <div className="mt-3 p-2.5 bg-amber-50/70 rounded-lg border border-amber-200 text-xs">
                    <span className="text-[9px] font-bold tracking-wider uppercase text-amber-800 font-mono-code block mb-1">
                      OPZIONI EXTRA FACOLTATIVE
                    </span>
                    <div className="space-y-1">
                      {doc.items
                        .filter((i) => i.isOptional)
                        .map((opt) => (
                          <div key={opt.id} className="flex justify-between items-center text-[11px] text-slate-700">
                            <span>{opt.title} ({opt.quantity} {opt.unit})</span>
                            <span className="font-mono-code font-bold">{formatCurrency(calcLineNet(opt))}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Totali e Riepilogo */}
              <div className="grid grid-cols-12 gap-4 mb-6">
                <div className="col-span-6 space-y-2 text-xs">
                  {doc.showRecurringSummary && totals.recurringItems.length > 0 && (
                    <div className="p-2.5 rounded-lg border border-sky-200 bg-sky-50/70 text-[11px]">
                      <span className="text-[9px] font-bold uppercase tracking-wider font-mono-code block text-sky-800 mb-0.5">
                        CANONI PERIODICI
                      </span>
                      {totals.recurringItems.map((rec) => (
                        <div key={rec.unit} className="flex justify-between font-medium text-slate-700">
                          <span>Canone {rec.unit}:</span>
                          <span className="font-mono-code font-bold text-sky-900">{formatCurrency(rec.totalNet)} {rec.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {doc.milestones.length > 0 && (
                    <div className="space-y-1 text-[11px]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono-code block">
                        PIANO PAGAMENTI
                      </span>
                      {doc.milestones.map((m) => (
                        <div key={m.id} className="p-1.5 rounded bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700 font-medium">{m.label} ({m.percentage}%)</span>
                            <span className="font-mono-code font-bold text-slate-900">
                              {formatCurrency((totals.netToPay * m.percentage) / 100)}
                            </span>
                          </div>
                          {m.timing && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Scadenza: {m.timing}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-6 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Imponibile Lordo:</span>
                    <span className="font-mono-code">{formatCurrency(totals.rawSubtotal)}</span>
                  </div>
                  {totals.lineDiscountsTotal > 0 && (
                    <div className="flex justify-between text-amber-700 text-[11px]">
                      <span>Sconti di riga:</span>
                      <span className="font-mono-code">-{formatCurrency(totals.lineDiscountsTotal)}</span>
                    </div>
                  )}
                  {totals.globalDiscountAmount > 0 && (
                    <div className="flex justify-between text-amber-700 text-[11px]">
                      <span>Sconto globale:</span>
                      <span className="font-mono-code">-{formatCurrency(totals.globalDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 pt-0.5 border-t border-slate-200 text-[11px]">
                    <span>Subtotale Netto:</span>
                    <span className="font-mono-code">{formatCurrency(totals.taxableSubtotal)}</span>
                  </div>
                  {totals.cassaAmount > 0 && (
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Rivalsa/Cassa ({doc.fiscal.cassaRate}%):</span>
                      <span className="font-mono-code">{formatCurrency(totals.cassaAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-bold text-white p-2.5 rounded-lg mt-2" style={{ backgroundColor: '#0f172a' }}>
                    <span className="text-xs text-white">TOTALE:</span>
                    <span className="font-mono-code text-sm text-white font-bold">{formatCurrency(totals.grossTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Note Legali Forfettario */}
              {doc.fiscal.regime === 'forfettario' && doc.fiscal.forfettarioNote && (
                <div className="mb-4 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 leading-relaxed italic">
                  {doc.fiscal.forfettarioNote}
                </div>
              )}

              {/* Tempi & Condizioni */}
              <div className="space-y-1.5 mb-6 text-[11px] text-slate-600">
                <div>
                  <strong className="text-slate-800">Consegna: </strong>
                  <span>{doc.deliveryTimeframe} {doc.warrantyAndSupport}</span>
                </div>
                {doc.termsAndConditions && (
                  <div>
                    <strong className="text-slate-800 block mb-0.5">Condizioni contrattuali:</strong>
                    <p className="whitespace-pre-line text-[10px] leading-relaxed text-slate-500">{doc.termsAndConditions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Firma Cliente Destra */}
            {doc.requireSignature && (
              <div className="pt-4 border-t border-slate-200 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1 font-mono-code">
                    PER ACCETTAZIONE DEL CLIENTE (TIMBRO E FIRMA)
                  </span>
                  <div className="border-b border-dashed border-slate-400 min-h-[30px] mt-1"></div>
                  <div className="text-[10px] text-slate-400 mt-1">Data: ____ / ____ / ________</div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // --- RENDERING PER GLI ALTRI 3 TEMPLATE (L2 EXECUTIVE, CORPORATE PRESTIGE, SWISS MINIMAL) ---
  return (
    <div className="w-full flex justify-center py-6 overflow-x-auto">
      <div
        id="pdf-document-sheet"
        className={`a4-sheet p-10 flex flex-col justify-between text-slate-800 text-[13px] leading-relaxed select-text ${template === 'swiss_minimal' ? 'bg-white' : ''
          }`}
        style={{ minHeight: '297mm', width: '210mm' }}
      >
        <div>
            {/* 1. HEADER SECTION A SECONDA DEL TEMPLATE */ }

          {/* TEMPLATE A: L2 EXECUTIVE (DARK TECH STUDIO) */}
          {template === 'l2_executive' && (
            <div className="-mx-10 -mt-10 mb-8 p-8 bg-slate-950 text-white relative border-b-2" style={{ borderColor: accent }}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  {doc.sender.logoDataUrl ? (
                    <img src={doc.sender.logoDataUrl} alt="Logo" className="w-14 h-14 object-contain rounded-xl bg-slate-900 border border-slate-700 p-1" />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl text-white font-display border"
                      style={{ backgroundColor: '#1e293b', borderColor: accent }}
                    >
                      {doc.sender.companyName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h1 className="font-display font-bold text-xl tracking-tight text-white">{doc.sender.companyName}</h1>
                    <p className="text-xs text-slate-400 font-medium">{doc.sender.tagline}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {doc.sender.address} · {doc.sender.zip} {doc.sender.city} ({doc.sender.province}) · P.IVA: {doc.sender.vatNumber}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded text-[10px] font-mono-code font-semibold tracking-wider uppercase mb-1" style={{ backgroundColor: `${accent}25`, color: accent }}>
                    PREVENTIVO COMMERCIALE
                  </span>
                  <div className="font-mono-code font-bold text-lg text-white">{doc.number}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Data: <span className="font-semibold text-white">{formatDateIt(doc.issueDate)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Scadenza: <span>{formatDateIt(doc.validUntilDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

              {/* TEMPLATE B: CORPORATE PRESTIGE (ROYAL NAVY, DOPPIA LINEA & BADGE ISTITUZIONALE) */}
              {template === 'corporate_prestige' && (
                <div
                  className="-mx-10 -mt-10 mb-8 p-8 bg-[#0a192f] text-white relative shadow-md"
                  style={{
                    borderBottom: `4px double ${accent}`
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                      {doc.sender.logoDataUrl ? (
                        <img src={doc.sender.logoDataUrl} alt="Logo" className="w-16 h-16 object-contain rounded-lg bg-white p-1 shadow-sm" />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-lg flex items-center justify-center font-serif font-bold text-2xl text-white border-2"
                          style={{ backgroundColor: '#112240', borderColor: accent }}
                        >
                          {doc.sender.companyName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-serif uppercase tracking-[0.25em] text-amber-300/90 font-semibold block mb-0.5">
                          OFFERTA COMMERCIALE ISTITUZIONALE
                        </span>
                        <h1 className="font-serif font-bold text-2xl tracking-tight text-white">{doc.sender.companyName}</h1>
                        <p className="text-xs text-slate-300 font-sans">{doc.sender.tagline}</p>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono-code">
                          {doc.sender.address} · {doc.sender.zip} {doc.sender.city} · P.IVA: {doc.sender.vatNumber}
                        </p>
                      </div>
                    </div>

                    <div className="text-right border-l border-slate-700/60 pl-6">
                      <div className="inline-block px-3 py-1 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-serif uppercase tracking-widest font-semibold mb-1">
                        DOCUMENTO UFFICIALE
                      </div>
                      <div className="font-mono-code font-bold text-xl text-white tracking-wider">{doc.number}</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Data: <span className="font-semibold text-white">{formatDateIt(doc.issueDate)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Validità: <span>{formatDateIt(doc.validUntilDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE C: SWISS MINIMAL (100% CHIARO, TIPOGRAFIA ESSENZIALE, ZERO FASCE SCURE) */}
              {template === 'swiss_minimal' && (
                <div className="border-b-2 border-slate-900 pb-6 mb-8">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-mono-code uppercase tracking-[0.25em] font-bold text-slate-500 block mb-1">
                        PREVENTIVO / QUOTATION
                      </span>
                      <div className="font-sans font-black text-3xl tracking-tight text-slate-950">{doc.number}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>Data: <strong className="text-slate-800">{formatDateIt(doc.issueDate)}</strong></span>
                        <span>·</span>
                        <span>Scadenza: <strong className="text-slate-800">{formatDateIt(doc.validUntilDate)}</strong></span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      {doc.sender.logoDataUrl && (
                        <img src={doc.sender.logoDataUrl} alt="Logo" className="w-12 h-12 object-contain" />
                      )}
                      <div>
                        <h1 className="font-sans font-extrabold text-xl text-slate-900">{doc.sender.companyName}</h1>
                        <p className="text-xs text-slate-500">{doc.sender.tagline}</p>
                        <p className="text-[10px] font-mono-code text-slate-400 mt-0.5">P.IVA: {doc.sender.vatNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                    {/* 2. SENDER & CLIENT DUAL CARD */}
                    {template === 'swiss_minimal' ? (
                      /* Layout Svizzero: colonne tipografiche pure senza card grigie */
                      <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.15em] uppercase font-mono-code block mb-1.5 text-slate-400">
                            DA: FORNITORE
                          </span>
                          <div className="font-bold text-sm text-slate-900">{doc.sender.companyName}</div>
                          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                            <div>{formatFullAddress(doc.sender.address, doc.sender.zip, doc.sender.city, doc.sender.province)}</div>
                            <div>P.IVA: <span className="font-mono-code">{doc.sender.vatNumber}</span> {doc.sender.taxCode && `· C.F.: ${doc.sender.taxCode}`}</div>
                            <div>Email: {doc.sender.email} {doc.sender.phone && `· Tel: ${doc.sender.phone}`}</div>
                            {doc.sender.sdiOrPec && <div className="text-[11px] text-slate-500">{doc.sender.sdiOrPec}</div>}
                          </div>
                        </div>

                        <div className="border-l border-slate-200 pl-8">
                          <span className="text-[10px] font-bold tracking-[0.15em] uppercase font-mono-code block mb-1.5" style={{ color: accent }}>
                            A: COMMITTENTE
                          </span>
                          <div className="font-bold text-sm text-slate-900">{doc.client.companyName || 'Spett.le Cliente'}</div>
                          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                            {doc.client.contactPerson && <div className="font-medium text-slate-700">C.a.: {doc.client.contactPerson}</div>}
                            <div>{formatFullAddress(doc.client.address, doc.client.zip, doc.client.city, doc.client.province) || 'Indirizzo da definire'}</div>
                            {(doc.client.vatNumber || doc.client.taxCode) && (
                              <div>
                                {doc.client.vatNumber && `P.IVA: ${doc.client.vatNumber}`}
                                {doc.client.taxCode && ` · C.F.: ${doc.client.taxCode}`}
                              </div>
                            )}
                            <div>{doc.client.email} {doc.client.phone && `· Tel: ${doc.client.phone}`}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Layout Standard (L2 Executive e Corporate Prestige): box eleganti */
                      <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                          <span className="text-[10px] font-bold tracking-wider uppercase font-mono-code block mb-1.5" style={{ color: accent }}>
                            EMITTENTE / FORNITORE
                          </span>
                          <div className="font-bold text-sm text-slate-900">{doc.sender.companyName}</div>
                          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                            <div>{formatFullAddress(doc.sender.address, doc.sender.zip, doc.sender.city, doc.sender.province)}</div>
                            <div>P.IVA: <span className="font-mono-code">{doc.sender.vatNumber}</span> {doc.sender.taxCode && `· C.F.: ${doc.sender.taxCode}`}</div>
                            <div>Email: {doc.sender.email} {doc.sender.phone && `· Tel: ${doc.sender.phone}`}</div>
                            {doc.sender.sdiOrPec && <div className="text-[11px] text-slate-500">{doc.sender.sdiOrPec}</div>}
                          </div>
                        </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                              <span className="text-[10px] font-bold tracking-wider uppercase font-mono-code block mb-1.5" style={{ color: accent }}>
                                DESTINATARIO / COMMITTENTE
                              </span>
                              <div className="font-bold text-sm text-slate-900">{doc.client.companyName || 'Spett.le Cliente'}</div>
                              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                                {doc.client.contactPerson && <div className="font-medium text-slate-700">C.a.: {doc.client.contactPerson}</div>}
                                <div>{formatFullAddress(doc.client.address, doc.client.zip, doc.client.city, doc.client.province) || 'Indirizzo da definire'}</div>
                                {(doc.client.vatNumber || doc.client.taxCode) && (
                                  <div>
                                    {doc.client.vatNumber && `P.IVA: ${doc.client.vatNumber}`}
                                    {doc.client.taxCode && ` · C.F.: ${doc.client.taxCode}`}
                                  </div>
                                )}
                                <div>{doc.client.email} {doc.client.phone && `· Tel: ${doc.client.phone}`}</div>
                                {doc.client.sdiOrPec && <div className="text-[11px] text-slate-500">{doc.client.sdiOrPec}</div>}
                              </div>
                            </div>
                          </div>
          )}

                        {/* 3. OGGETTO DELLA FORNITURA */}
                        <div className="mb-6 pl-4 border-l-4" style={{ borderColor: accent }}>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block font-mono-code">OGGETTO DELLA FORNITURA</span>
                          <h2 className="text-lg font-bold text-slate-900 font-display mt-0.5">{doc.projectTitle}</h2>
                          {doc.projectSubtitle && <p className="text-xs text-slate-600 mt-0.5 italic">{doc.projectSubtitle}</p>}
                        </div>

                        {doc.introText && (
                            <div className="mb-6 text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm">
                              {doc.introText}
                            </div>
          )}

                            {/* 4. TABELLA VOCI PRESTAZIONE */}
                            <div className="mb-8">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr
                                      className={`text-[11px] font-mono-code uppercase tracking-wider ${template === 'swiss_minimal'
                                          ? 'border-t-2 border-b-2 border-slate-950 text-slate-950 bg-transparent'
                                          : template === 'corporate_prestige'
                                            ? 'bg-[#0a192f] text-amber-200'
                                            : 'bg-slate-900 text-white'
                                        }`}
                                    >
                                      <th className="py-2.5 px-3 rounded-l">Cod.</th>
                                      <th className="py-2.5 px-3">Descrizione Attività & Prestazione</th>
                                      <th className="py-2.5 px-3 text-right">Q.tà</th>
                                      <th className="py-2.5 px-3 text-right">Prezzo Unit.</th>
                                      <th className="py-2.5 px-3 text-right">{isExempt ? 'Sc.%' : 'Sc./IVA'}</th>
                                      <th className="py-2.5 px-3 text-right rounded-r">Netto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-xs">
                                  {doc.items
                                    .filter((item) => !item.isOptional)
                                    .map((item, idx) => (
                                        <tr
                                          key={item.id || idx}
                                          className={
                                            template === 'swiss_minimal'
                                              ? 'bg-white hover:bg-slate-50/50'
                                              : idx % 2 === 1
                                                ? 'bg-slate-50/70'
                                                : 'bg-white'
                                          }
                                        >
                                          <td className="py-3 px-3 font-mono-code font-bold text-slate-500 text-[11px] align-top">
                                            {item.code || `#0${idx + 1}`}
                                          </td>
                                          <td className="py-3 px-3 align-top">
                                            <div className="font-bold text-slate-900 text-[13px]">{item.title}</div>
                                            {item.description && (
                                              <div className="text-[11px] text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                                                {item.description}
                                              </div>
                                            )}
                                          </td>
                                          <td className="py-3 px-3 text-right whitespace-nowrap font-mono-code align-top">
                                            {item.quantity} <span className="text-[10px] text-slate-500">{item.unit}</span>
                                          </td>
                                          <td className="py-3 px-3 text-right whitespace-nowrap font-mono-code align-top">
                                            {formatCurrency(item.unitPrice)}
                                          </td>
                                          <td className="py-3 px-3 text-right whitespace-nowrap font-mono-code text-[11px] text-slate-500 align-top">
                                            {item.discountPercent > 0 && <span className="text-amber-600 font-bold block">-{item.discountPercent}%</span>}
                                            {!isExempt && <span>IVA {item.vatRate}%</span>}
                                          </td>
                                          <td className="py-3 px-3 text-right whitespace-nowrap font-mono-code font-bold text-slate-900 text-[13px] align-top">
                                            {formatCurrency(calcLineNet(item))}
                                          </td>
                                        </tr>
                  ))}
                                      </tbody>
            </table>

                              {/* OPZIONI EXTRA FACOLTATIVE */}
                              {doc.items.some((i) => i.isOptional) && (
                                  <div className="mt-4 p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 font-mono-code block mb-1">
                                      OPZIONI EXTRA FACOLTATIVE (NON INCLUSE NEL TOTALE PRINCIPALE)
                                    </span>
                                    <div className="space-y-1.5">
                                      {doc.items
                                        .filter((i) => i.isOptional)
                                        .map((opt) => (
                                          <div key={opt.id} className="flex justify-between items-center text-xs text-slate-700">
                                            <span>
                                              <strong className="text-slate-900">{opt.title}</strong> ({opt.quantity} {opt.unit})
                                            </span>
                                            <span className="font-mono-code font-bold text-slate-800">{formatCurrency(calcLineNet(opt))}</span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
            )}
                                </div>

                              {/* 5. TOTALI & RIEPILOGO */}
                              <div className="grid grid-cols-12 gap-8 mb-8">
                                <div className="col-span-7 space-y-4">
                                  {doc.showRecurringSummary && totals.recurringItems.length > 0 && (
                                      <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/70">
                                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono-code block text-sky-800 mb-1">
                                          RIEPILOGO CANONI PERIODICI RICORRENTI
                                        </span>
                                        <div className="text-xs text-slate-700 space-y-1">
                                          {totals.recurringItems.map((rec) => (
                                            <div key={rec.unit} className="flex justify-between font-medium">
                                              <span>Servizi ricorsivi con canone {rec.unit}:</span>
                                              <span className="font-mono-code font-bold text-sky-900">{formatCurrency(rec.totalNet)} {rec.unit}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
              )}

                                      {/* PIANO PAGAMENTI */}
                                      {doc.milestones.length > 0 && (
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono-code block mb-2">
                                            PIANO DEI PAGAMENTI
                                          </span>
                                          <div className="space-y-1.5">
                                            {doc.milestones.map((m) => (
                                                <div key={m.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
                                                  <div>
                                                    <strong className="text-slate-800">{m.label} ({m.percentage}%)</strong>
                                                    {m.timing && <div className="text-[11px] text-slate-500">Scadenza: {m.timing}</div>}
                                                  </div>
                                                  <div className="font-mono-code font-bold text-slate-900">
                                                    {formatCurrency((totals.netToPay * m.percentage) / 100)}
                                                  </div>
                                                </div>
                    ))}
                                              </div>
                </div>
              )}

                                            {/* COORDINATE BANCARIE */}
                                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                              <span className="text-[10px] font-bold uppercase tracking-wider block font-mono-code" style={{ color: accent }}>
                                                MODALITÀ DI PAGAMENTO: {doc.paymentMethodLabel}
                                              </span>
                                              <div className="mt-1 font-mono-code text-[11px] text-slate-800">
                                                IBAN: <strong className="select-all">{doc.sender.iban}</strong>
                                              </div>
                                              <div className="text-[11px] text-slate-600 mt-0.5">
                                                Banca: {doc.sender.bankName} · Intestato a: {doc.sender.accountHolder}
                                              </div>
                                            </div>
                                          </div>

                                            {/* BOX TOTALI */}
                                            <div
                                              className={`col-span-5 p-4 rounded-xl border space-y-2 text-xs ${template === 'corporate_prestige'
                                                  ? 'bg-slate-50/80 border-slate-300 shadow-sm'
                                                  : 'bg-slate-50 border-slate-200'
                                                }`}
                                            >
                                              <div className="flex justify-between text-slate-600">
                                                <span>Imponibile Lordo:</span>
                                                <span className="font-mono-code">{formatCurrency(totals.rawSubtotal)}</span>
                                              </div>
                                              {totals.lineDiscountsTotal > 0 && (
                                                <div className="flex justify-between text-amber-700">
                                                  <span>Sconti di riga:</span>
                                                  <span className="font-mono-code">-{formatCurrency(totals.lineDiscountsTotal)}</span>
                                                </div>
                                              )}
                                              {totals.globalDiscountAmount > 0 && (
                                                <div className="flex justify-between text-amber-700">
                                                  <span>Sconto globale:</span>
                                                  <span className="font-mono-code">-{formatCurrency(totals.globalDiscountAmount)}</span>
                                                </div>
                                              )}
                                              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                                                <span>Subtotale Netto:</span>
                                                <span className="font-mono-code">{formatCurrency(totals.taxableSubtotal)}</span>
                                              </div>

                                              {totals.cassaAmount > 0 && (
                                                <div className="flex justify-between text-slate-600">
                                                  <span>Rivalsa/Cassa ({doc.fiscal.cassaRate}%):</span>
                                                  <span className="font-mono-code">{formatCurrency(totals.cassaAmount)}</span>
                                                </div>
                                              )}

                                              {isExempt ? (
                                                <div className="flex justify-between text-emerald-700 font-medium">
                                                  <span>IVA (Esente / Forfettario):</span>
                                                  <span className="font-mono-code">0,00 €</span>
                                                </div>
                                              ) : (
                                                totals.vatBreakdown.map((vb) => (
                                                  <div key={vb.rate} className="flex justify-between text-slate-600">
                                                    <span>IVA {vb.rate}%:</span>
                                                    <span className="font-mono-code">{formatCurrency(vb.vatAmount)}</span>
                                                  </div>
                                                ))
                                              )}

                                              {totals.stampDutyAmount > 0 && (
                                                <div className="flex justify-between text-slate-600">
                                                  <span>Bollo virtuale:</span>
                                                  <span className="font-mono-code">{formatCurrency(totals.stampDutyAmount)}</span>
                                                </div>
                                              )}

                                              {template === 'corporate_prestige' ? (
                                                <div
                                                  className="flex justify-between items-center text-sm font-bold p-3 rounded-lg mt-3 bg-[#0a192f] text-white"
                                                  style={{ borderBottom: `3px double ${accent}` }}
                                                >
                                                  <span className="font-serif">TOTALE DOCUMENTO:</span>
                                                  <span className="font-mono-code text-base text-white font-bold">{formatCurrency(totals.grossTotal)}</span>
                                                </div>
                                              ) : template === 'swiss_minimal' ? (
                                                <div className="flex justify-between items-center text-sm font-black p-3 rounded-lg mt-3 bg-slate-900 text-white">
                                                  <span className="font-mono-code tracking-wider uppercase">TOTALE:</span>
                                                  <span className="font-mono-code text-base text-white font-bold">{formatCurrency(totals.grossTotal)}</span>
                                                </div>
                                              ) : (
                                                <div className="flex justify-between items-center text-sm font-bold text-white p-3 rounded-lg mt-3" style={{ backgroundColor: '#0f172a' }}>
                                                  <span>TOTALE:</span>
                                                  <span className="font-mono-code text-base text-white font-bold">{formatCurrency(totals.grossTotal)}</span>
                                                </div>
                                              )}

                                              {totals.withholdingTaxAmount > 0 && (
                                                <>
                                                  <div className="flex justify-between text-red-600 text-[11px] pt-1">
                                                    <span>Ritenuta d'acconto ({doc.fiscal.withholdingTaxRate}%):</span>
                                                    <span className="font-mono-code">-{formatCurrency(totals.withholdingTaxAmount)}</span>
                                                  </div>
                                                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-300">
                                                    <span>Netto a pagare:</span>
                                                    <span className="font-mono-code">{formatCurrency(totals.netToPay)}</span>
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          </div>

                                          {/* 6. NOTE LEGALI FORFETTARIO */}
                                          {doc.fiscal.regime === 'forfettario' && doc.fiscal.forfettarioNote && (
                                              <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed italic">
                                                {doc.fiscal.forfettarioNote}
                                              </div>
          )}

                                              {/* 7. CONSEGNA & TERMINI */}
                                              <div className="space-y-3 mb-8 text-xs text-slate-600">
                                                <div>
                                                  <strong className="text-slate-800">Tempi di consegna & Garanzia: </strong>
                                                  <span>{doc.deliveryTimeframe} {doc.warrantyAndSupport}</span>
                                                </div>
                                                {doc.termsAndConditions && (
                                                  <div>
                                                    <strong className="text-slate-800 block mb-0.5">Condizioni contrattuali:</strong>
                                                    <p className="whitespace-pre-line text-[11px] leading-relaxed text-slate-500">{doc.termsAndConditions}</p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                          {/* 8. BLOCCO FIRME */}
                                          {doc.requireSignature && (
                                            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
                                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono-code">
                                                    {doc.sender.signatureLabel || 'TIMBRO E FIRMA EMITTENTE'}
                                                  </span>
                                                  <div className="font-serif italic text-base text-slate-800 min-h-[36px] flex items-end">
                                                    {doc.sender.signatureText || doc.sender.companyName}
                                                  </div>
                                                </div>

                                                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono-code">
                                                      PER ACCETTAZIONE DEL CLIENTE (TIMBRO E FIRMA)
                                                    </span>
                                                    <div className="border-b border-dashed border-slate-400 min-h-[36px] mt-2"></div>
                                                    <div className="text-[10px] text-slate-400 mt-1">Data: ____ / ____ / ________</div>
                                                  </div>
                                                </div>
        )}
                                              </div>
                                            </div>
                                          );
};
