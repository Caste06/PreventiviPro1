import React from 'react';
import { QuoteDocument, QuoteLineItem, BillingUnit, TaxRegime, CassaType, TemplateLayout } from '../types/quote';
import { Plus, Trash2, Tag, Percent, DollarSign, Building, UserCheck, ShieldCheck, CreditCard, Palette } from 'lucide-react';

interface EditorFormProps {
  doc: QuoteDocument;
  onChange: (updated: QuoteDocument) => void;
  onOpenCatalog: () => void;
}

export const EditorForm: React.FC<EditorFormProps> = ({ doc, onChange, onOpenCatalog }) => {
  // Helpers to update sub-objects
  const updateSender = (field: string, val: any) => {
    onChange({
      ...doc,
      sender: { ...doc.sender, [field]: val },
      updatedAt: new Date().toISOString()
    });
  };

  const updateClient = (field: string, val: any) => {
    onChange({
      ...doc,
      client: { ...doc.client, [field]: val },
      updatedAt: new Date().toISOString()
    });
  };

  const updateFiscal = (field: string, val: any) => {
    onChange({
      ...doc,
      fiscal: { ...doc.fiscal, [field]: val },
      updatedAt: new Date().toISOString()
    });
  };

  const updateItem = (id: string, field: keyof QuoteLineItem, val: any) => {
    const updatedItems = doc.items.map((it) => (it.id === id ? { ...it, [field]: val } : it));
    onChange({ ...doc, items: updatedItems, updatedAt: new Date().toISOString() });
  };

  const removeItem = (id: string) => {
    onChange({
      ...doc,
      items: doc.items.filter((it) => it.id !== id),
      updatedAt: new Date().toISOString()
    });
  };

  const addNewItem = () => {
    const newItem: QuoteLineItem = {
      id: 'item-' + Date.now(),
      code: `SRV-00${doc.items.length + 1}`,
      title: 'Nuova voce di servizio',
      description: 'Descrizione dettagliata dell’intervento o fornitura...',
      quantity: 1,
      unit: 'una tantum',
      unitPrice: 100,
      discountPercent: 0,
      vatRate: 22,
      isOptional: false
    };
    onChange({ ...doc, items: [...doc.items, newItem], updatedAt: new Date().toISOString() });
  };

  const updateMilestone = (id: string, field: string, val: any) => {
    const updated = doc.milestones.map((m) => (m.id === id ? { ...m, [field]: val } : m));
    onChange({ ...doc, milestones: updated, updatedAt: new Date().toISOString() });
  };

  const addMilestone = () => {
    const newM = {
      id: 'ms-' + Date.now(),
      label: 'Fase successiva',
      percentage: 20,
      timing: 'A completamento'
    };
    onChange({ ...doc, milestones: [...doc.milestones, newM], updatedAt: new Date().toISOString() });
  };

  const removeMilestone = (id: string) => {
    onChange({
      ...doc,
      milestones: doc.milestones.filter((m) => m.id !== id),
      updatedAt: new Date().toISOString()
    });
  };

  const billingUnits: BillingUnit[] = ['una tantum', '/ semestre', '/ mese', '/ anno', 'corpo', 'ore', 'gg'];

  return (
    <div className="space-y-6 text-slate-200">
      {/* 1. DOCUMENT GENERAL INFO */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-sky-400">
            Dati Identificativi Documento
          </span>
          <select
            value={doc.status}
            onChange={(e) => onChange({ ...doc, status: e.target.value as any })}
            className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono-code uppercase font-semibold text-slate-300"
          >
            <option value="bozza">Bozza</option>
            <option value="inviato">Inviato</option>
            <option value="accettato">Accettato</option>
            <option value="rifiutato">Rifiutato</option>
            <option value="scaduto">Scaduto</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Numero Preventivo</label>
            <input
              type="text"
              value={doc.number}
              onChange={(e) => onChange({ ...doc, number: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono-code"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Data Emissione</label>
            <input
              type="date"
              value={doc.issueDate}
              onChange={(e) => onChange({ ...doc, issueDate: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono-code"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Data Scadenza / Validità</label>
            <input
              type="date"
              value={doc.validUntilDate}
              onChange={(e) => onChange({ ...doc, validUntilDate: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono-code"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1 font-medium">Titolo del Progetto / Fornitura</label>
          <input
            type="text"
            value={doc.projectTitle}
            onChange={(e) => onChange({ ...doc, projectTitle: e.target.value })}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-semibold"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1 font-medium">Sottotitolo / Sintesi</label>
          <input
            type="text"
            value={doc.projectSubtitle}
            onChange={(e) => onChange({ ...doc, projectSubtitle: e.target.value })}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1 font-medium">Lettera Introduttiva / Premessa</label>
          <textarea
            rows={2}
            value={doc.introText}
            onChange={(e) => onChange({ ...doc, introText: e.target.value })}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* 2. SENDER & CLIENT DUAL TABS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SENDER FORM */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-mono-code text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Dati Tua Azienda / Emittente</span>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block">Ragione Sociale / Professionista</label>
            <input
              type="text"
              value={doc.sender.companyName}
              onChange={(e) => updateSender('companyName', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block">Partita IVA</label>
              <input
                type="text"
                value={doc.sender.vatNumber}
                onChange={(e) => updateSender('vatNumber', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono-code"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Codice Fiscale</label>
              <input
                type="text"
                value={doc.sender.taxCode}
                onChange={(e) => updateSender('taxCode', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono-code"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block">Indirizzo</label>
              <input
                type="text"
                value={doc.sender.address}
                onChange={(e) => updateSender('address', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Città (Prov)</label>
              <input
                type="text"
                value={`${doc.sender.city} (${doc.sender.province})`}
                onChange={(e) => {
                  const parts = e.target.value.split('(');
                  updateSender('city', parts[0].trim());
                  if (parts[1]) updateSender('province', parts[1].replace(')', '').trim());
                }}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block">Email</label>
              <input
                type="text"
                value={doc.sender.email}
                onChange={(e) => updateSender('email', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Telefono</label>
              <input
                type="text"
                value={doc.sender.phone}
                onChange={(e) => updateSender('phone', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block">IBAN Pagamenti</label>
              <input
                type="text"
                value={doc.sender.iban}
                onChange={(e) => updateSender('iban', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono-code"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Banca & Intestatario</label>
              <input
                type="text"
                value={doc.sender.bankName}
                onChange={(e) => updateSender('bankName', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
          </div>
        </div>

        {/* CLIENT FORM */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-mono-code text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Dati Committente / Cliente</span>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block">Ragione Sociale Cliente</label>
            <input
              type="text"
              value={doc.client.companyName}
              onChange={(e) => updateClient('companyName', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block">Persona di Riferimento</label>
              <input
                type="text"
                value={doc.client.contactPerson}
                onChange={(e) => updateClient('contactPerson', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Partita IVA / C.F.</label>
              <input
                type="text"
                value={doc.client.vatNumber}
                onChange={(e) => updateClient('vatNumber', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono-code"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block">Indirizzo Sede</label>
              <input
                type="text"
                value={doc.client.address}
                onChange={(e) => updateClient('address', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Città (Prov)</label>
              <input
                type="text"
                value={`${doc.client.city} (${doc.client.province})`}
                onChange={(e) => {
                  const parts = e.target.value.split('(');
                  updateClient('city', parts[0].trim());
                  if (parts[1]) updateClient('province', parts[1].replace(')', '').trim());
                }}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block">Email</label>
              <input
                type="text"
                value={doc.client.email}
                onChange={(e) => updateClient('email', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Telefono</label>
              <input
                type="text"
                value={doc.client.phone}
                onChange={(e) => updateClient('phone', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block">Codice SDI / PEC Fatturazione</label>
            <input
              type="text"
              value={doc.client.sdiOrPec}
              onChange={(e) => updateClient('sdiOrPec', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. ITEMS / SERVICES TABLE */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-sky-400">
              Voci, Servizi & Moduli ({doc.items.length})
            </span>
            <p className="text-xs text-slate-400">Aggiungi servizi manuali o selezionali dal listino predefinito</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onOpenCatalog}
              className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Sfoglia Listino L2</span>
            </button>
            <button
              onClick={addNewItem}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Voce</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {doc.items.map((item, index) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition ${item.isOptional ? 'bg-amber-950/20 border-amber-800/40' : 'bg-slate-950/70 border-slate-800'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={item.code}
                    onChange={(e) => updateItem(item.id, 'code', e.target.value)}
                    placeholder="Cod."
                    className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono-code text-sky-400"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                    placeholder="Titolo servizio..."
                    className="flex-1 min-w-[200px] px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isOptional || false}
                      onChange={(e) => updateItem(item.id, 'isOptional', e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Opzionale</span>
                  </label>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-6 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-500 block">Q.tà & Unità</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min={0.1}
                      step={0.5}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono-code"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value as any)}
                      className="flex-1 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-[11px]"
                    >
                      {billingUnits.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block">Prezzo Unit. (€)</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono-code"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block">Sconto %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={item.discountPercent}
                    onChange={(e) => updateItem(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono-code"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block">IVA %</label>
                  <select
                    value={item.vatRate}
                    onChange={(e) => updateItem(item.id, 'vatRate', parseInt(e.target.value, 10))}
                    className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono-code"
                  >
                    <option value={22}>22%</option>
                    <option value={10}>10%</option>
                    <option value={4}>4%</option>
                    <option value={0}>0%</option>
                  </select>
                </div>

                <div className="text-right flex flex-col justify-end">
                  <span className="text-[10px] text-slate-500">Subtotale netto</span>
                  <span className="font-mono-code font-bold text-emerald-400 text-xs">
                    {((item.quantity * item.unitPrice * (100 - item.discountPercent)) / 100).toFixed(2)} €
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Descrizione estesa / specifiche della riga..."
                  className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FISCAL & TAX CONFIGURATION */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sky-400 font-mono-code text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Configurazione Fiscale Italiana</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Regime Fiscale</label>
            <select
              value={doc.fiscal.regime}
              onChange={(e) => updateFiscal('regime', e.target.value as TaxRegime)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono-code"
            >
              <option value="forfettario">Regime Forfettario (Franchigia IVA 0%)</option>
              <option value="ordinario">Regime Ordinario (IVA Ordinaria)</option>
              <option value="esente">Esente IVA</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Cassa / Rivalsa Previdenziale</label>
            <select
              value={doc.fiscal.cassaType}
              onChange={(e) => updateFiscal('cassaType', e.target.value as CassaType)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono-code"
            >
              <option value="none">Nessuna Cassa / Rivalsa</option>
              <option value="inps_4">Rivalsa INPS 4% (Gestione Separata)</option>
              <option value="cassa_4">Cassa Professionale 4%</option>
              <option value="custom">Aliquota Personalizzata</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sconto Globale Extra</label>
            <div className="flex gap-1">
              <input
                type="number"
                min={0}
                value={doc.fiscal.globalDiscountValue}
                onChange={(e) => updateFiscal('globalDiscountValue', parseFloat(e.target.value) || 0)}
                className="w-20 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono-code"
              />
              <select
                value={doc.fiscal.globalDiscountType}
                onChange={(e) => updateFiscal('globalDiscountType', e.target.value as any)}
                className="flex-1 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono-code"
              >
                <option value="percent">% Percentuale</option>
                <option value="fixed">€ Fisso</option>
              </select>
            </div>
          </div>
        </div>

        {/* CHECKBOXES FOR STAMP AND WITHHOLDING */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={doc.fiscal.stampDutyEnabled}
              onChange={(e) => updateFiscal('stampDutyEnabled', e.target.checked)}
              className="rounded accent-sky-500"
            />
            <div className="text-xs">
              <strong className="text-slate-200">Marca da Bollo (2,00 €)</strong>
              <div className="text-[11px] text-slate-500">Addebita al cliente per importi forfettari &gt; 77,47 €</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={doc.fiscal.withholdingTaxEnabled}
              onChange={(e) => updateFiscal('withholdingTaxEnabled', e.target.checked)}
              className="rounded accent-sky-500"
            />
            <div className="text-xs">
              <strong className="text-slate-200">Ritenuta d'Acconto 20%</strong>
              <div className="text-[11px] text-slate-500">Per regime ordinario e ritenute professionali</div>
            </div>
          </label>
        </div>

        {doc.fiscal.regime === 'forfettario' && (
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Dicitura di Legge Regime Forfettario</label>
            <textarea
              rows={2}
              value={doc.fiscal.forfettarioNote}
              onChange={(e) => updateFiscal('forfettarioNote', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-[11px] text-slate-300 italic"
            />
          </div>
        )}
      </div>

      {/* 5. PAYMENT MILESTONES & TERMS */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400 font-mono-code text-xs uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Condizioni Contrattuali & Ripartizione Pagamenti</span>
          </div>
          <button
            onClick={addMilestone}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            + Aggiungi Rata
          </button>
        </div>

        <div className="space-y-2">
          {doc.milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <input
                type="text"
                value={m.label}
                onChange={(e) => updateMilestone(m.id, 'label', e.target.value)}
                placeholder="Fase o descrizione rata..."
                className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs"
              />
              <div className="flex items-center gap-1 w-20">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={m.percentage}
                  onChange={(e) => updateMilestone(m.id, 'percentage', parseInt(e.target.value, 10) || 0)}
                  className="w-12 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono-code text-right"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
              <input
                type="text"
                value={m.timing}
                onChange={(e) => updateMilestone(m.id, 'timing', e.target.value)}
                placeholder="Tempistica scadenza..."
                className="w-48 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400"
              />
              <button
                onClick={() => removeMilestone(m.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Tempi di Consegna & Evasione</label>
            <input
              type="text"
              value={doc.deliveryTimeframe}
              onChange={(e) => onChange({ ...doc, deliveryTimeframe: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Garanzia & Supporto Incluso</label>
            <input
              type="text"
              value={doc.warrantyAndSupport}
              onChange={(e) => onChange({ ...doc, warrantyAndSupport: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Condizioni Generali di Fornitura</label>
          <textarea
            rows={3}
            value={doc.termsAndConditions}
            onChange={(e) => onChange({ ...doc, termsAndConditions: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* 6. TEMPLATE & ACCENT PALETTE */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-mono-code text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
            <Palette className="w-4 h-4" />
            <span>Stile Grafico & Colore Accento PDF</span>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
            {
                  id: 'l2_executive',
                  name: 'L2 Executive',
                  badge: 'Consigliato',
                  desc: 'Header scuro tech studio, contrasto elevato e accenti moderni'
                },
                {
                  id: 'corporate_prestige',
                  name: 'Corporate Prestige',
                  badge: 'Istituzionale',
                  desc: 'Navy profondo, finiture formali e stile contabile B2B'
                },
                {
                  id: 'swiss_minimal',
                  name: 'Swiss Minimal',
                  badge: 'Minimalista',
                  desc: 'Design svizzero chiaro, tipografia pulita ed essenziale'
                },
                {
                  id: 'modern_sidebar',
                  name: 'Modern Sidebar',
                  badge: 'Sidebar Laterale',
                  desc: 'Colonna laterale scura con dati e corpo principale chiaro'
                }
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
              onClick={() => onChange({ ...doc, template: tmpl.id as TemplateLayout, updatedAt: new Date().toISOString() })}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition flex flex-col justify-between ${doc.template === tmpl.id
                        ? 'bg-sky-950/80 border-sky-400 text-white ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-100">{tmpl.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono-code uppercase font-semibold ${doc.template === tmpl.id
                            ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                      >
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{tmpl.desc}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px]">
                    <span className={`w-2 h-2 rounded-full ${doc.template === tmpl.id ? 'bg-sky-400 animate-pulse' : 'bg-slate-700'}`} />
                    <span className={doc.template === tmpl.id ? 'text-sky-300 font-semibold' : 'text-slate-500'}>
                      {doc.template === tmpl.id ? 'Attivo' : 'Seleziona'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <span className="text-xs text-slate-400">Colore Primario Dettagli:</span>
                <div className="flex items-center gap-2.5">
                  {[
                    { color: '#0ea5e9', name: 'Sky Cyan' },
                    { color: '#6366f1', name: 'Indigo' },
                    { color: '#10b981', name: 'Emerald' },
                    { color: '#f59e0b', name: 'Amber Gold' },
                    { color: '#0f172a', name: 'Slate Dark' },
                    { color: '#e11d48', name: 'Rose Red' },
                    { color: '#8b5cf6', name: 'Violet' }
                  ].map(({ color, name }) => (
                    <button
                      key={color}
                      type="button"
                      title={name}
                      onClick={() => onChange({ ...doc, accentColor: color, updatedAt: new Date().toISOString() })}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full border-2 transition ${doc.accentColor === color
                          ? 'border-white scale-125 shadow-lg shadow-sky-500/20 ring-2 ring-sky-400/50'
                          : 'border-transparent opacity-75 hover:opacity-100 hover:scale-110'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          );
};

