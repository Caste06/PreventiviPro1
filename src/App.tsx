import React, { useState, useEffect } from 'react';
import { QuoteDocument } from './types/quote';
import { createDefaultQuoteDocument } from './data/presets';
import { EditorForm } from './components/EditorForm';
import { DocumentPreview } from './components/DocumentPreview';
import { CatalogModal } from './components/CatalogModal';
import { ArchiveModal } from './components/ArchiveModal';
import { generateVectorQuotePdf } from './utils/pdfVectorGenerator';
import { calculateQuoteTotals, formatCurrency } from './utils/calculations';
import {
  Download,
  Printer,
  Archive,
  BookOpen,
  Eye,
  Edit3,
  CheckCircle2,
  Sparkles,
  FileText
} from 'lucide-react';

const STORAGE_KEY = 'preventivi_pro_saved_quotes_v1';
const ACTIVE_ID_KEY = 'preventivi_pro_active_id_v1';

export const App: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved quotes:', e);
    }
    return [createDefaultQuoteDocument()];
  });

  const [activeQuoteId, setActiveQuoteId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_ID_KEY) || quotes[0].id;
  });

  const [currentTab, setCurrentTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeQuote = quotes.find((q) => q.id === activeQuoteId) || quotes[0];

  // Save to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
      localStorage.setItem(ACTIVE_ID_KEY, activeQuoteId);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [quotes, activeQuoteId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateQuote = (updated: QuoteDocument) => {
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  };

  const handleCreateNewQuote = () => {
    const newDoc = createDefaultQuoteDocument();
    newDoc.id = 'quote-' + Date.now();
    newDoc.number = `PREV-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`;
    setQuotes((prev) => [newDoc, ...prev]);
    setActiveQuoteId(newDoc.id);
    showToast(`Nuovo preventivo ${newDoc.number} creato!`);
  };

  const handleDuplicateQuote = (id: string) => {
    const target = quotes.find((q) => q.id === id);
    if (!target) return;
    const duplicated: QuoteDocument = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'quote-' + Date.now(),
      number: target.number + '-COPIA',
      status: 'bozza',
      issueDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };
    setQuotes((prev) => [duplicated, ...prev]);
    setActiveQuoteId(duplicated.id);
    showToast(`Preventivo duplicato: ${duplicated.number}`);
  };

  const handleDeleteQuote = (id: string) => {
    if (quotes.length === 1) {
      const fresh = createDefaultQuoteDocument();
      setQuotes([fresh]);
      setActiveQuoteId(fresh.id);
      showToast('Archivio ripristinato con un preventivo base.');
      return;
    }
    const filtered = quotes.filter((q) => q.id !== id);
    setQuotes(filtered);
    if (activeQuoteId === id) {
      setActiveQuoteId(filtered[0].id);
    }
    showToast('Preventivo eliminato.');
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      showToast('Generazione PDF vettoriale A4 in corso...');
      await generateVectorQuotePdf(activeQuote);
      showToast('PDF scaricato con successo!');
    } catch (e) {
      console.error(e);
      alert("Errore durante la generazione del PDF. Controlla la console.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totals = calculateQuoteTotals(activeQuote);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* TOPBAR / NAVBAR */}
      <header className="no-print sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-emerald-400 p-[1.5px] shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-sm text-white font-display">
              L2
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-sm sm:text-base text-white tracking-tight">
                PreventiviPro <span className="text-sky-400">Studio</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono-code font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PDF Vettoriale A4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono-code hidden sm:block">
              {activeQuote.number} · {activeQuote.client.companyName || 'Nuovo Cliente'}
            </p>
          </div>
        </div>

        {/* VIEW MODE SELECTOR (DESKTOP) */}
        <div className="hidden md:flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setCurrentTab('editor')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              currentTab === 'editor' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setCurrentTab('split')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              currentTab === 'split' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diviso (Split)</span>
          </button>
          <button
            onClick={() => setCurrentTab('preview')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              currentTab === 'preview' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Anteprima A4</span>
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCatalogOpen(true)}
            title="Listino Servizi"
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Listino Prezzi</span>
          </button>

          <button
            onClick={() => setIsArchiveOpen(true)}
            title="Archivio Preventivi"
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Archive className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Archivio ({quotes.length})</span>
          </button>

          <button
            onClick={handlePrint}
            title="Stampa Anteprima"
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-lg shadow-sky-500/25 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generazione...' : 'Scarica PDF'}</span>
          </button>
        </div>
      </header>

      {/* MOBILE TAB BAR */}
      <div className="md:hidden no-print bg-slate-950 border-b border-slate-800 p-2 flex justify-around text-xs">
        <button
          onClick={() => setCurrentTab('editor')}
          className={`flex-1 py-1.5 rounded text-center font-medium ${
            currentTab === 'editor' ? 'bg-sky-500 text-white' : 'text-slate-400'
          }`}
        >
          Editor Dati
        </button>
        <button
          onClick={() => setCurrentTab('preview')}
          className={`flex-1 py-1.5 rounded text-center font-medium ${
            currentTab === 'preview' ? 'bg-sky-500 text-white' : 'text-slate-400'
          }`}
        >
          Foglio PDF A4
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: EDITOR FORM */}
        {(currentTab === 'editor' || currentTab === 'split') && (
          <div
            className={`overflow-y-auto p-4 sm:p-6 no-print ${
              currentTab === 'split' ? 'w-full lg:w-[50%] border-r border-slate-800' : 'w-full max-w-4xl mx-auto'
            }`}
          >
            <EditorForm
              doc={activeQuote}
              onChange={handleUpdateQuote}
              onOpenCatalog={() => setIsCatalogOpen(true)}
            />
          </div>
        )}

        {/* RIGHT PANE: LIVE A4 SHEET PREVIEW */}
        {(currentTab === 'preview' || currentTab === 'split') && (
          <div
            className={`overflow-y-auto bg-slate-950/60 p-4 sm:p-8 flex-1 print-container ${
              currentTab === 'preview' ? 'w-full' : 'hidden lg:flex'
            }`}
          >
            <div className="w-full flex flex-col items-center">
              {/* STATUS & QUICK STATS BAR OVER PREVIEW */}
              <div className="no-print w-full max-w-[210mm] mb-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="font-mono-code font-bold text-sky-400">Anteprima Reale A4</span>
                  <span className="text-slate-500">·</span>
                  <span>{activeQuote.items.length} voci</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Totale:</span>
                  <span className="font-mono-code font-bold text-emerald-400 text-sm">
                    {formatCurrency(totals.grossTotal)}
                  </span>
                </div>
              </div>

              <DocumentPreview doc={activeQuote} />
            </div>
          </div>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODALS */}
      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onAddItems={(newItems) => {
          handleUpdateQuote({
            ...activeQuote,
            items: [...activeQuote.items, ...newItems],
            updatedAt: new Date().toISOString()
          });
          showToast(`${newItems.length} voci aggiunte dal catalogo!`);
        }}
      />

      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        quotes={quotes}
        activeId={activeQuoteId}
        onSelectQuote={(id) => {
          setActiveQuoteId(id);
          showToast('Preventivo caricato.');
        }}
        onDuplicateQuote={handleDuplicateQuote}
        onDeleteQuote={handleDeleteQuote}
        onNewQuote={handleCreateNewQuote}
      />
    </div>
  );
};

export default App;

