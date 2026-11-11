import { CatalogPresetItem, QuoteDocument, SenderProfile } from '../types/quote';

export const L2_LOGO_SVG_DATA_URI =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='96' height='96' fill='none'%3E%3Crect x='1.5' y='1.5' width='45' height='45' rx='12' fill='%230f172a' stroke='%230ea5e9' stroke-width='2'/%3E%3Cpath d='M14 13C14 12.45 14.45 12 15 12H19.5C20.05 12 20.5 12.45 20.5 13V29.5H29C29.55 29.5 30 29.95 30 30.5V34C30 34.55 29.55 35 29 35H15C14.45 35 14 34.55 14 34V13Z' fill='%23FFFFFF'/%3E%3Cpath d='M26.5 16C26.5 13.5 28.5 11.5 31.5 11.5C34.5 11.5 36.5 13.5 36.5 15.8C36.5 18 34.8 20 32.5 22.2L28.8 25.5H36.2C36.6 25.5 37 25.9 37 26.3V28.2C37 28.6 36.6 29 36.2 29H26.8C26.3 29 26 28.6 26 28.1V26.5C26 26.1 26.2 25.7 26.5 25.4L31.5 20.8C33 19.4 34 18.2 34 16.2C34 14.8 32.9 13.8 31.5 13.8C30.1 13.8 29.1 14.7 29 16C29 16.3 28.7 16.6 28.4 16.6H27.1C26.7 16.6 26.5 16.3 26.5 16Z' fill='%2338BDF8'/%3E%3Ccircle cx='34.5' cy='33.5' r='2.3' fill='%2300D9A3'/%3E%3C/svg%3E";

export const DEFAULT_SENDER_PROFILE: SenderProfile = {
  companyName: 'L2Creative Digital Studio',
  tagline: 'Sviluppo Web Sartoriale, Software Gestionali & Digital Strategy',
  vatNumber: 'IT01234567890',
  taxCode: 'CSTLRD00A01A662X',
  sdiOrPec: 'l2creative@pec.it · SDI: M5UXCR1',
  address: 'Via dell’Innovazione Digitale, 12',
  zip: '62012',
  city: 'Civitanova Marche',
  province: 'MC',
  email: 'info@l2creative.it',
  phone: '+39 333 123 4567',
  website: 'www.l2creative.it',
  bankName: 'Intesa Sanpaolo / Revolut Business',
  iban: 'IT60 X030 6909 6061 0000 0123 456',
  accountHolder: 'L2Creative Digital Studio',
  logoDataUrl: L2_LOGO_SVG_DATA_URI,
  signatureText: 'Leonardo Castellani - L2Creative',
  signatureDataUrl: '',
  signatureLabel: 'TIMBRO E FIRMA EMITTENTE'
};

export const CATALOG_PRESETS: CatalogPresetItem[] = [
  {
    id: 'cat-sito-vetrina',
    code: 'WEB-001',
    category: 'Web & Bundle',
    title: 'Sviluppo Sito Vetrina Multipagina su Misura',
    description:
      '• Struttura multipagina (Home, Chi Siamo, Servizi, Portfolio/Progetti, Contatti)\n• Design responsive sartoriale su misura per mobile, tablet e desktop\n• Codice nativo ad altissime prestazioni (Google Core Web Vitals 99+)\n• Modulo contatti avanzato, chiamata rapida e integrazione mappa\n• Ottimizzazione SEO tecnica di base, sitemap.xml, Schema.org e indicizzazione Google',
    unit: 'una tantum',
    unitPrice: 350,
    vatRate: 22
  },
  {
    id: 'cat-bundle-premium-setup',
    code: 'BND-001',
    category: 'Web & Bundle',
    title: 'Bundle Premium - Sviluppo Sito Vetrina Multipagina (Tariffa Agevolata Bundle)',
    description:
      '• Progettazione e sviluppo completo Sito Vetrina Multipagina su misura (tariffa scontata da 350€ a 300€ in abbinamento al piano integrato Social + Manutenzione)\n• Design coordinato con l’identità visiva dei canali social aziendali\n• Ottimizzazione SEO, sicurezza SSL e performance Core Vitals 99+',
    unit: 'una tantum',
    unitPrice: 300,
    vatRate: 22
  },
  {
    id: 'cat-bundle-premium-canone',
    code: 'BND-002',
    category: 'Social & Manutenzione',
    title: 'Canone Integrato Bundle Premium (Gestione Social Media + Manutenzione Sito)',
    description:
      '• Gestione continuativa canali ufficiali Instagram e Facebook con materiale fornito dall’azienda\n• Piano editoriale, copywriting professionale, pubblicazione post/stories e grafiche coordinate\n• Manutenzione ordinaria completa del sito web, backup periodici, aggiornamenti e assistenza tecnica inclusa',
    unit: '/ semestre',
    unitPrice: 400,
    vatRate: 22
  },
  {
    id: 'cat-social-only',
    code: 'SOC-001',
    category: 'Social & Manutenzione',
    title: 'Gestione Continuativa Social Media (Instagram & Facebook)',
    description:
      '• Gestione profili ufficiali Instagram e Facebook (nessun costo di attivazione)\n• Pubblicazione post e stories con contenuti/materiali forniti dall’azienda\n• Copywriting professionale, ricerca hashtag strategici e ottimizzazione bio\n• Reportistica semestrale di andamento, copertura e crescita organica',
    unit: '/ semestre',
    unitPrice: 300,
    vatRate: 22
  },
  {
    id: 'cat-manutenzione-sito',
    code: 'MNT-001',
    category: 'Social & Manutenzione',
    title: 'Manutenzione Ordinaria, Backup & Supporto Sito Vetrina',
    description:
      '• Monitoraggio uptime e sicurezza SSL, backup completi periodici del codice e database\n• Aggiornamenti tecnici, compatibilità browser e micro-modifiche testuali/fotografiche\n• Assistenza prioritaria dedicata',
    unit: '/ semestre',
    unitPrice: 200,
    vatRate: 22
  },
  {
    id: 'cat-addon-cv',
    code: 'MOD-HR1',
    category: 'Moduli Custom & ERP',
    title: 'Modulo Interattivo "Lavora con Noi" & Gestione Candidature CV',
    description:
      '• Form interattivo per ricezione candidature spontanee o per posizioni aperte\n• Upload sicuro allegato Curriculum Vitae (PDF/DOCX) con validazione anti-spam\n• Inoltro automatico formattato all’email HR aziendale e archivio candidature',
    unit: 'una tantum',
    unitPrice: 180,
    vatRate: 22
  },
  {
    id: 'cat-addon-booking',
    code: 'MOD-BKG',
    category: 'Moduli Custom & ERP',
    title: 'Booking Engine - Sistema di Prenotazione Interattivo in Tempo Reale',
    description:
      '• Motore di prenotazione con calendario dinamico, fasce orarie e verifica disponibilità in tempo reale\n• Pannello amministrativo per gestione prenotazioni, blocchi orari, tavoli/coperti o campi sportivi\n• Notifiche email automatiche di conferma al cliente e al gestore',
    unit: 'una tantum',
    unitPrice: 450,
    vatRate: 22
  },
  {
    id: 'cat-addon-gestionale',
    code: 'ERP-001',
    category: 'Moduli Custom & ERP',
    title: 'Piattaforma Gestionale Web Aziendale, Magazzino & Barcode',
    description:
      '• Software web centralizzato su misura per controllo inventario, carico/scarico merci e lotti\n• Scansione e generazione codici a barre / QR Code da smartphone o lettore ottico\n• Avvisi automatici per soglie di sottoscorta, anagrafica fornitori/clienti ed export documenti',
    unit: 'una tantum',
    unitPrice: 950,
    vatRate: 22
  },
  {
    id: 'cat-ecommerce',
    code: 'ECM-001',
    category: 'Moduli Custom & ERP',
    title: 'Sviluppo Piattaforma E-Commerce Completa & Pagamenti Online',
    description:
      '• Catalogo prodotti illimitato con varianti, filtri dinamici, carrello e checkout rapido\n• Integrazione gateway di pagamento sicuri (Stripe, PayPal, Apple Pay, Google Pay, Bonifico)\n• Pannello gestione ordini, codici sconto, regole di spedizione e fatturazione',
    unit: 'una tantum',
    unitPrice: 850,
    vatRate: 22
  },
  {
    id: 'cat-brand-ui',
    code: 'DSN-001',
    category: 'Design & SEO',
    title: 'Brand Identity, Logo Design Vettoriale & UI/UX Kit',
    description:
      '• Progettazione logo vettoriale originale con declinazioni chiaro/scuro e icone social\n• Definizione palette cromatica, tipografia istituzionale e Brand Guidelines in PDF',
    unit: 'una tantum',
    unitPrice: 250,
    vatRate: 22
  }
];

export function createDefaultQuoteDocument(): QuoteDocument {
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const toIso = (d: Date) => d.toISOString().split('T')[0];

  return {
    id: 'quote-default-001',
    number: `PREV-${today.getFullYear()}-001`,
    issueDate: toIso(today),
    validUntilDate: toIso(in30Days),
    status: 'bozza',
    projectTitle: 'Progettazione Sito Web Aziendale Multipagina & Piano Digital',
    projectSubtitle: 'Proposta tecnico-economica su misura per lo sviluppo digitale e posizionamento online',
    introText:
      'Gentile Cliente, in seguito al nostro colloquio presentiamo la nostra migliore offerta tecnico-economica per la progettazione e lo sviluppo della Vostra nuova piattaforma web aziendale, progettata per garantire massima autorevolezza visiva, velocità di caricamento ai vertici di categoria e piena scalabilità.',
    deliveryTimeframe: '15–20 giorni lavorativi dalla ricezione del materiale e dell’acconto di avvio lavori.',
    warrantyAndSupport:
      'Garanzia "Soddisfatti o Rimborsati" sulla prima proposta di layout grafico. Codice sorgente ottimizzato e assistenza tecnica dedicata.',
    paymentMethodLabel: 'Bonifico Bancario su IBAN indicato nel documento',
    termsAndConditions:
      '1. Validità dell’offerta: il presente preventivo ha validità fino alla data di scadenza indicata.\n2. Materiali e contenuti: eventuali testi specifici, loghi o fotografie aziendali saranno forniti dal Committente o concordati in fase di briefing.\n3. Proprietà intellettuale: al saldo integrale del corrispettivo, il Cliente acquisisce piena titolarità del sito web realizzato.\n4. Servizi ricorrenti: i canoni semestrali di manutenzione o gestione social decorrono dalla messa online del progetto.',
    privacyNote:
      'Trattamento dei dati personali effettuato in conformità al Regolamento UE 2016/679 (GDPR) esclusivamente per l’esecuzione del rapporto precontrattuale e contrattuale.',
    requireSignature: true,
    showRecurringSummary: true,
    template: 'l2_executive',
    accentColor: '#0ea5e9',
    sender: { ...DEFAULT_SENDER_PROFILE },
    client: {
      companyName: 'Rossi Costruzioni & Design S.r.l.',
      contactPerson: 'Dott. Marco Rossi',
      vatNumber: 'IT09876543210',
      taxCode: '09876543210',
      sdiOrPec: 'rossisrl@pec.it · SDI: SUBM70N',
      address: 'Viale della Repubblica, 45',
      zip: '20124',
      city: 'Milano',
      province: 'MI',
      email: 'direzione@rossicostruzioni.it',
      phone: '+39 02 9876543'
    },
    items: [
      {
        id: 'item-1',
        code: 'BND-001',
        title: 'Bundle Premium - Sviluppo Sito Vetrina Multipagina su Misura',
        description:
          '• Struttura multipagina (Home, Chi Siamo, Servizi, Progetti, Contatti)\n• Design responsive sartoriale su misura (Mobile, Tablet, Desktop)\n• Codice nativo ultra-performante (Google Core Web Vitals 99+)\n• Modulo contatti rapido e ottimizzazione SEO tecnica con indicizzazione Google\n• Tariffa agevolata Bundle (300€ anziché 350€)',
        quantity: 1,
        unit: 'una tantum',
        unitPrice: 300,
        discountPercent: 0,
        vatRate: 22,
        isOptional: false
      },
      {
        id: 'item-2',
        code: 'MOD-HR1',
        title: 'Modulo Interattivo "Lavora con Noi" con Caricamento CV',
        description:
          '• Form dedicato per ricezione candidature spontanee con upload allegato CV (PDF/Word)\n• Validazione sicurezza e inoltro automatico immediato alla casella HR aziendale',
        quantity: 1,
        unit: 'una tantum',
        unitPrice: 180,
        discountPercent: 10,
        vatRate: 22,
        isOptional: false
      },
      {
        id: 'item-3',
        code: 'BND-002',
        title: 'Canone Integrato Bundle Premium (Social Media + Manutenzione Sito)',
        description:
          '• Gestione continuativa canali Instagram & Facebook con materiale fornito dall’azienda\n• Piano editoriale, copywriting e grafiche coordinate brand-sito\n• Manutenzione ordinaria sito web, backup di sicurezza e assistenza tecnica inclusa',
        quantity: 1,
        unit: '/ semestre',
        unitPrice: 400,
        discountPercent: 0,
        vatRate: 22,
        isOptional: false
      }
    ],
    milestones: [
      {
        id: 'ms-1',
        label: 'Acconto di avvio progetto',
        percentage: 50,
        timing: 'Alla firma per accettazione del preventivo'
      },
      {
        id: 'ms-2',
        label: 'Saldo alla messa online / consegna',
        percentage: 50,
        timing: 'Al collaudo finale e pubblicazione del sito'
      }
    ],
    fiscal: {
      regime: 'forfettario',
      cassaType: 'inps_4',
      cassaRate: 4,
      withholdingTaxEnabled: false,
      withholdingTaxRate: 20,
      withholdingTaxBasePercent: 100,
      stampDutyEnabled: true,
      stampDutyChargeClient: true,
      globalDiscountType: 'percent',
      globalDiscountValue: 0,
      forfettarioNote:
        'Operazione effettuata ai sensi dell’art. 1, commi da 54 a 89, della Legge n. 190/2014 e s.m.i. (Regime Forfettario) - Operazione in franchigia da IVA e non soggetta a ritenuta d’acconto. Imposta di bollo da € 2,00 assolta sull’originale per importi superiori a € 77,47.'
    },
    updatedAt: new Date().toISOString()
  };
}

