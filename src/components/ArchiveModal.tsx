import React, { useState } from 'react';
import { QuoteDocument, QuoteStatus } from '../types/quote';
import { formatDateIt, formatCurrency, calculateQuoteTotals } from '../utils/calculations';
import { FileText, Copy, Trash2, Plus, Download, Calendar, ArrowRight } from 'lucide-react';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: QuoteDocument[];
  activeId: string;
  onSelectQuote: (id: string) => void;
  onDuplicateQuote: (id: string) => void;
  onDeleteQuote: (id: string) => void;
  onNewQuote: () => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  quotes,
  activeId,
  onSelectQuote,
  onDuplicateQuote,
  onDeleteQuote,
  onNewQuote
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredQuotes = quotes.filter((q) => {
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    const matchesSearch =
      q.number.toLowerCase().includes(search.toLowerCase()) ||
      q.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      q.client.companyName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'accettato':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ACCETTATO</span>;
      case 'inviato':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">INVIATO</span>;
      case 'rifiutato':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">RIFIUTATO</span>;
      case 'scaduto':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">SCADUTO</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">BOZZA</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[88vh] text-slate-100 overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-mono-code text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Archivio Locale Salvato</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white mt-1">Gestione e Storico Preventivi</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition">
            ✕
          </button>
        </div>

        {/* TOP CONTROLS */}
        <div className="p-4 bg-slate-900/30 border-b border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
          <input
            type="text"
            placeholder="Cerca per numero, cliente o progetto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono-code text-xs"
            >
              <option value="all">Tutti gli stati</option>
              <option value="bozza">Bozza</option>
              <option value="inviato">Inviato</option>
              <option value="accettato">Accettato</option>
              <option value="rifiutato">Rifiutato</option>
              <option value="scaduto">Scaduto</option>
            </select>
            <button
              onClick={() => {
                onNewQuote();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuovo Preventivo</span>
            </button>
          </div>
        </div>

        {/* QUOTES LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Nessun preventivo trovato per i filtri selezionati.
            </div>
          ) : (
            filteredQuotes.map((q) => {
              const totals = calculateQuoteTotals(q);
              const isCurrent = q.id === activeId;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    isCurrent
                      ? 'bg-sky-950/30 border-sky-500/70'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-code font-bold text-white text-base">{q.number}</span>
                      {getStatusBadge(q.status)}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateIt(q.issueDate)}
                      </span>
                    </div>
                    <div className="font-bold text-slate-200 text-sm mt-1">{q.projectTitle}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Cliente: <strong className="text-slate-300">{q.client.companyName || 'Non specificato'}</strong> · {q.items.length} voci
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                    <div className="text-right">
                      <div className="font-mono-code font-bold text-emerald-400 text-base">
                        {formatCurrency(totals.grossTotal)}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono-code">Totale preventivo</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onSelectQuote(q.id);
                          onClose();
                        }}
                        title="Apri e Modifica"
                        className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition flex items-center gap-1 text-xs font-semibold px-3"
                      >
                        <span>Carica</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDuplicateQuote(q.id)}
                        title="Duplica preventivo"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Sei sicuro di voler eliminare il preventivo ${q.number}?`)) {
                            onDeleteQuote(q.id);
                          }
                        }}
                        title="Elimina"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>{quotes.length} preventivi archiviati nel browser (LocalStorage)</span>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

