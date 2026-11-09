import React, { useState } from 'react';
import { CatalogPresetItem, QuoteLineItem } from '../types/quote';
import { CATALOG_PRESETS } from '../data/presets';
import { formatCurrency } from '../utils/calculations';
import { Plus, Search, Check, Tag } from 'lucide-react';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: QuoteLineItem[]) => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose, onAddItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const categories = ['Tutti', 'Web & Bundle', 'Social & Manutenzione', 'Moduli Custom & ERP', 'Design & SEO'];

  const filteredPresets = CATALOG_PRESETS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tutti' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedPresetIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPresetIds(next);
  };

  const handleConfirm = () => {
    const itemsToAdd: QuoteLineItem[] = CATALOG_PRESETS.filter((p) => selectedPresetIds.has(p.id)).map((p) => ({
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      code: p.code,
      title: p.title,
      description: p.description,
      quantity: 1,
      unit: p.unit,
      unitPrice: p.unitPrice,
      discountPercent: 0,
      vatRate: p.vatRate,
      isOptional: false
    }));

    onAddItems(itemsToAdd);
    setSelectedPresetIds(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[88vh] text-slate-100 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-mono-code text-xs uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>Listino Servizi L2Creative</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white mt-1">Catalogo Servizi e Moduli Preimpostati</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="p-4 bg-slate-900/30 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca per nome, codice o descrizione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredPresets.map((preset) => {
            const isSelected = selectedPresetIds.has(preset.id);
            return (
              <div
                key={preset.id}
                onClick={() => toggleSelect(preset.id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition ${
                      isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-400">
                        {preset.code}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">{preset.category}</span>
                    </div>
                    <h3 className="font-bold text-white text-base mt-1">{preset.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 whitespace-pre-line leading-relaxed max-w-2xl">
                      {preset.description}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:pl-4 sm:border-l border-slate-800 flex sm:flex-col justify-between items-center sm:items-end">
                  <span className="text-lg font-bold font-mono-code text-emerald-400">
                    {formatCurrency(preset.unitPrice)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-code">{preset.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center">
          <div className="text-xs text-slate-400 font-mono-code">
            {selectedPresetIds.size} servizio/i selezionato/i
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedPresetIds.size === 0}
              className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi al Preventivo ({selectedPresetIds.size})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

