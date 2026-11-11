import React, { useState, useEffect } from 'react';
import { CatalogPresetItem, QuoteLineItem } from '../types/quote';
import { CATALOG_PRESETS } from '../data/presets';
import { formatCurrency } from '../utils/calculations';
import { Plus, Search, Check, Tag, Pencil, Trash2, RotateCcw, X } from 'lucide-react';

const STORAGE_KEY = 'preventivi_pro_catalog_presets_v2';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: QuoteLineItem[]) => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose, onAddItems }) => {
  const [presets, setPresets] = useState<CatalogPresetItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignora errori di parsing e usa i predefiniti
    }
    return CATALOG_PRESETS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<string>>(new Set());

  // Stato per la finestra di Modifica / Aggiunta
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<CatalogPresetItem>({
    id: '',
    code: '',
    category: 'Web & Bundle',
    title: '',
    description: '',
    unit: 'corpo',
    unitPrice: 0,
    vatRate: 22
  });

  // Sincronizza su localStorage ogni volta che i preset cambiano
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.error('Errore nel salvataggio dei preset:', e);
    }
  }, [presets]);

  if (!isOpen) return null;

  // Categorie dinamiche estratte da tutti i preset attuali
  const categories = ['Tutti', ...Array.from(new Set(presets.map((p) => p.category).filter(Boolean)))];

  const filteredPresets = presets.filter((item) => {
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

  const handleOpenAdd = () => {
    const nextCode = `SRV-${String(presets.length + 1).padStart(2, '0')}`;
    setEditFormData({
      id: '',
      code: nextCode,
      category: categories[1] || 'Generale',
      title: '',
      description: '',
      unit: 'corpo',
      unitPrice: 100,
      vatRate: 22
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (preset: CatalogPresetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditFormData({ ...preset });
    setIsEditing(true);
  };

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Sei sicuro di voler eliminare il servizio "${title}" dal listino?`)) {
      setPresets((prev) => prev.filter((p) => p.id !== id));
      setSelectedPresetIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Vuoi davvero ripristinare il listino ai valori predefiniti? Eventuali personalizzazioni andranno perse.'
      )
    ) {
      setPresets(CATALOG_PRESETS);
      setSelectedPresetIds(new Set());
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.title.trim()) {
      alert('Inserisci il titolo del servizio');
      return;
    }

    if (editFormData.id) {
      // Modifica di un elemento esistente
      setPresets((prev) =>
        prev.map((item) => (item.id === editFormData.id ? { ...editFormData } : item))
      );
    } else {
      // Creazione di un nuovo elemento
      const newItem: CatalogPresetItem = {
        ...editFormData,
        id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      };
      setPresets((prev) => [newItem, ...prev]);
    }
    setIsEditing(false);
  };

  const handleConfirm = () => {
    const itemsToAdd: QuoteLineItem[] = presets
      .filter((p) => selectedPresetIds.has(p.id))
      .map((p) => ({
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
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[88vh] text-slate-100 overflow-hidden relative">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-mono-code text-xs uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>Listino Servizi PreventiviPro</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white mt-1">Catalogo Servizi e Moduli Preimpostati</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
              title="Aggiungi un nuovo servizio al catalogo"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nuovo Servizio</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
              title="Chiudi catalogo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
          {filteredPresets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Nessun servizio trovato con i criteri di ricerca selezionati.
            </div>
          ) : (
            filteredPresets.map((preset) => {
              const isSelected = selectedPresetIds.has(preset.id);
              return (
                <div
                  key={preset.id}
                  onClick={() => toggleSelect(preset.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div
                      className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition flex-shrink-0 ${
                        isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
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

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:pl-4 sm:border-l border-slate-800 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono-code text-emerald-400">
                        {formatCurrency(preset.unitPrice)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-code">
                        {preset.unit} {preset.vatRate ? `(IVA ${preset.vatRate}%)` : ''}
                      </div>
                    </div>

                    {/* AZIONI MODIFICA / ELIMINA */}
                    <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEdit(preset, e)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                        title="Modifica servizio"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(preset.id, preset.title, e)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                        title="Elimina servizio dal listino"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono-code">
            <span>{selectedPresetIds.size} servizio/i selezionato/i</span>
            <button
              onClick={handleResetDefaults}
              className="text-slate-400 hover:text-amber-400 transition flex items-center gap-1 text-[11px]"
              title="Ripristina il listino predefinito di fabbrica"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Ripristina Predefiniti</span>
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
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

        {/* MODAL DI AGGIUNTA / MODIFICA SERVIZIO */}
        {isEditing && (
          <div className="absolute inset-0 z-10 bg-slate-950/90 backdrop-blur-sm p-6 flex flex-col justify-center items-center">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white font-display">
                  {editFormData.id ? 'Modifica Servizio Listino' : 'Nuovo Servizio Listino'}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Codice Identificativo</label>
                    <input
                      type="text"
                      value={editFormData.code}
                      onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                      placeholder="es. WEB-01"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono-code"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Categoria</label>
                    <input
                      type="text"
                      list="categories-list"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      placeholder="es. Web & Bundle"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                      required
                    />
                    <datalist id="categories-list">
                      {categories.filter((c) => c !== 'Tutti').map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Titolo Servizio</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="es. Sviluppo Sito Web E-commerce"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Descrizione Dettagliata</label>
                  <textarea
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="Descrivi cosa include questo modulo o servizio..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Prezzo (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.unitPrice}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, unitPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono-code font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Unità</label>
                    <input
                      type="text"
                      value={editFormData.unit}
                      onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                      placeholder="es. a corpo, mese, ora"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">IVA (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editFormData.vatRate}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, vatRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono-code"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold transition"
                  >
                    Salva nel Listino
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


