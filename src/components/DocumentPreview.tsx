import React from 'react';
import { QuoteDocument } from '../types/quote';
import {
  calcLineNet,
  calculateQuoteTotals,
  formatCurrency,
  formatDateIt,
  formatNumberIt
} from '../utils/calculations';

interface DocumentPreviewProps {
  doc: QuoteDocument;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc }) => {
  const totals = calculateQuoteTotals(doc);
  const isExempt = doc.fiscal.regime === 'forfettario' || doc.fiscal.regime === 'esente';

  const accent = doc.accentColor || '#0ea5e9';

  return (
    <div className="w-full flex justify-center py-6 overflow-x-auto">
      <div
        id="pdf-document-sheet"
        className="a4-sheet p-10 flex flex-col justify-between text-slate-800 text-[13px] leading-relaxed select-text"
        style={{ minHeight: '297mm', width: '210mm' }}
      >
        <div>
          {/* HEADER SECTION */}
          {doc.template === 'l2_executive' || doc.template === 'corporate_prestige' ? (
            <div className="-mx-10 -mt-10 mb-8 p-8 bg-slate-950 text-white relative border-b-2" style={{ borderColor: accent }}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  {doc.sender.logoDataUrl ? (
                    <img src={doc.sender.logoDataUrl} alt="Logo" className="w-14 h-14 object-contain rounded-lg bg-slate-900 border border-slate-700 p-1" />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl text-white font-display border"
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
          ) : (
            <div className="border-b pb-6 mb-8 flex justify-between items-start" style={{ borderColor: `${accent}40` }}>
              <div className="flex items-center gap-4">
                {doc.sender.logoDataUrl && (
                  <img src={doc.sender.logoDataUrl} alt="Logo" className="w-12 h-12 object-contain" />
                )}
                <div>
                  <h1 className="font-display font-bold text-2xl text-slate-900">{doc.sender.companyName}</h1>
                  <p className="text-xs text-slate-500">{doc.sender.tagline}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono-code uppercase tracking-widest font-semibold" style={{ color: accent }}>
                  PREVENTIVO
                </span>
                <div className="font-mono-code text-xl font-bold text-slate-900">{doc.number}</div>
                <div className="text-xs text-slate-500">Data: {formatDateIt(doc.issueDate)}</div>
              </div>
            </div>
          )}

          {/* SENDER & CLIENT DUAL CARD */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold tracking-wider uppercase font-mono-code block mb-1.5" style={{ color: accent }}>
                EMITTENTE / FORNITORE
              </span>
              <div className="font-bold text-sm text-slate-900">{doc.sender.companyName}</div>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <div>{doc.sender.address} — {doc.sender.zip} {doc.sender.city} ({doc.sender.province})</div>
                <div>P.IVA: <span className="font-mono-code">{doc.sender.vatNumber}</span> {doc.sender.taxCode && `· C.F.: ${doc.sender.taxCode}`}</div>
                <div>Email: {doc.sender.email} {doc.sender.phone && `· Tel: ${doc.sender.phone}`}</div>
                {doc.sender.sdiOrPec && <div className="text-[11px] text-slate-500">{doc.sender.sdiOrPec}</div>}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold tracking-wider uppercase font-mono-code block mb-1.5" style={{ color: accent }}>
                DESTINATARIO / COMMITTENTE
              </span>
              <div className="font-bold text-sm text-slate-900">{doc.client.companyName || 'Spett.le Cliente'}</div>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                {doc.client.contactPerson && <div className="font-medium text-slate-700">C.a.: {doc.client.contactPerson}</div>}
                <div>{doc.client.address || 'Indirizzo da definire'} {doc.client.city && `— ${doc.client.zip} ${doc.client.city} (${doc.client.province})`}</div>
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

          {/* PROJECT TITLE & INTRO */}
          <div className="mb-6 pl-4 border-l-4" style={{ borderColor: accent }}>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">OGGETTO DELLA FORNITURA</span>
            <h2 className="text-lg font-bold text-slate-900 font-display mt-0.5">{doc.projectTitle}</h2>
            {doc.projectSubtitle && <p className="text-xs text-slate-600 mt-0.5 italic">{doc.projectSubtitle}</p>}
          </div>

          {doc.introText && (
            <div className="mb-6 text-xs text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-100">
              {doc.introText}
            </div>
          )}

          {/* TABLE OF ITEMS */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-mono-code uppercase tracking-wider">
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
                    <tr key={item.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
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

            {/* OPTIONAL ITEMS SECTION */}
            {doc.items.some((i) => i.isOptional) && (
              <div className="mt-4 p-3 bg-amber-50/60 rounded border border-amber-200">
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

          {/* TOTALS & RECURRING SUMMARY */}
          <div className="grid grid-cols-12 gap-8 mb-8">
            <div className="col-span-7 space-y-4">
              {doc.showRecurringSummary && totals.recurringItems.length > 0 && (
                <div className="p-3.5 rounded-lg border border-sky-200 bg-sky-50/70">
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

              {/* PAYMENT MILESTONES */}
              {doc.milestones.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono-code block mb-2">
                    PIANO DEI PAGAMENTI
                  </span>
                  <div className="space-y-1.5">
                    {doc.milestones.map((m) => (
                      <div key={m.id} className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 border border-slate-200">
                        <div>
                          <strong className="text-slate-800">{m.label} ({m.percentage}%)</strong>
                          <div className="text-[11px] text-slate-500">{m.timing}</div>
                        </div>
                        <div className="font-mono-code font-bold text-slate-900">
                          {formatCurrency((totals.netToPay * m.percentage) / 100)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BANK COORDINATES */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
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

            {/* TOTALS BOX */}
            <div className="col-span-5 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
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

              <div className="flex justify-between items-center text-sm font-bold text-white p-2.5 rounded mt-3" style={{ backgroundColor: '#0f172a' }}>
                <span>TOTALE:</span>
                <span className="font-mono-code text-base" style={{ color: accent }}>{formatCurrency(totals.grossTotal)}</span>
              </div>

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

          {/* FORFETTARIO LEGAL NOTE */}
          {doc.fiscal.regime === 'forfettario' && doc.fiscal.forfettarioNote && (
            <div className="mb-6 p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 leading-relaxed italic">
              {doc.fiscal.forfettarioNote}
            </div>
          )}

          {/* DELIVERY & TERMS */}
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

        {/* SIGNATURE BLOCK */}
        {doc.requireSignature && (
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div className="p-4 rounded border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono-code">
                TIMBRO E FIRMA EMITTENTE
              </span>
              <div className="font-serif italic text-base text-slate-800 min-h-[36px] flex items-end">
                {doc.sender.signatureText || doc.sender.companyName}
              </div>
            </div>

            <div className="p-4 rounded border border-slate-200 bg-slate-50/50">
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

