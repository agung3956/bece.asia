export type Locale = "en" | "id" | "zh";
export type Localized<T> = Record<"en" | "id", T> & Partial<Record<"zh", T>>;
export type AppStatus = "active" | "beta" | "maintenance" | "experimental" | "archived";

export type AppItem = {
  slug: string;
  name: Localized<string>;
  tagline: Localized<string>;
  description: Localized<string>;
  category: string;
  status: AppStatus;
  region: string;
  scope: string;
  url: string;
  embedUrl?: string;
  featured: boolean;
  tags: string[];
  utilities: Localized<string[]>;
  lastUpdated: string;
  officialStatus: "community-built";
};

export const apps: AppItem[] = [
  {
    slug: "procurement-workflow",
    name: { en: "Procurement Workflow", id: "Aplikasi Pengadaan" },
    tagline: { en: "Document numbering, procurement filing, and automated document generation.", id: "Penomoran, arsip dokumen, dan generate dokumen pengadaan otomatis." },
    description: { en: "A lightweight workflow tool for procurement administration, document control, filing, and template-based document generation.", id: "Aplikasi ringan untuk administrasi pengadaan, kontrol dokumen, pengarsipan, dan pembuatan dokumen berbasis template." },
    category: "Procurement",
    status: "beta",
    region: "Indonesia",
    scope: "General Workflow",
    url: "/apps/procurement-workflow",
    featured: true,
    tags: ["procurement", "documents", "numbering", "workflow"],
    utilities: { en: ["Auto numbering", "Document generation", "Drive filing", "Sheet backend"], id: ["Penomoran otomatis", "Generate dokumen", "Arsip Drive", "Backend Sheet"] },
    lastUpdated: "2026-07-04",
    officialStatus: "community-built"
  },
  {
    slug: "travel-duty-planner",
    name: { en: "Travel Duty Planner", id: "Perjadin" },
    tagline: { en: "Plan trips, monitor budget use, and keep team availability visible.", id: "Rencanakan perjalanan, pantau anggaran, dan jaga ketersediaan tim." },
    description: { en: "A planning workspace for travel scenarios, budget visibility, team coverage, and activity recap.", id: "Workspace perencanaan perjalanan, visibilitas anggaran, ketersediaan tim, dan rekap kegiatan." },
    category: "Administration",
    status: "beta",
    region: "Indonesia",
    scope: "Team Productivity",
    url: "/apps/travel-duty-planner",
    featured: true,
    tags: ["travel", "budget", "planning"],
    utilities: { en: ["Budget check", "Scenario planning", "Team availability"], id: ["Cek anggaran", "Skenario kegiatan", "Pantauan tim"] },
    lastUpdated: "2026-07-04",
    officialStatus: "community-built"
  },
  {
    slug: "export-clinic-workbench",
    name: { en: "Export Clinic Workbench", id: "Workbench Klinik Ekspor" },
    tagline: { en: "A workbench for MSME export assistance and stakeholder coordination.", id: "Workbench untuk asistensi ekspor UMKM dan koordinasi lintas pihak." },
    description: { en: "Collect MSME profiles, track assistance, map readiness, and coordinate export support activities in one lightweight workspace.", id: "Kelola profil UMKM, pantau asistensi, petakan kesiapan, dan koordinasikan dukungan ekspor dalam satu workspace ringan." },
    category: "Export Assistance",
    status: "experimental",
    region: "Indonesia",
    scope: "Trade Facilitation",
    url: "/apps/export-clinic-workbench",
    featured: true,
    tags: ["MSME", "export", "trade", "coordination"],
    utilities: { en: ["Readiness scoring", "Assistance records", "Export pipeline"], id: ["Skor kesiapan", "Riwayat asistensi", "Pipeline ekspor"] },
    lastUpdated: "2026-07-04",
    officialStatus: "community-built"
  },
  {
    slug: "learning-monitoring",
    name: { en: "Learning Monitoring", id: "Monitoring Pembelajaran" },
    tagline: { en: "Monitor cohorts, teams, mentors, evidence, and learning progress.", id: "Pantau cohort, tim, mentor, bukti, dan progres pembelajaran." },
    description: { en: "A general monitoring workspace for learning programs with team progress, evidence collection, coaching signals, and performance recap.", id: "Workspace monitoring umum untuk program pembelajaran dengan progres tim, pengumpulan bukti, sinyal pendampingan, dan rekap kinerja." },
    category: "Learning",
    status: "beta",
    region: "Indonesia",
    scope: "Learning Program",
    url: "/apps/learning-monitoring",
    featured: true,
    tags: ["learning", "monitoring", "cohort", "dashboard"],
    utilities: { en: ["Cohort dashboard", "Evidence log", "Progress radar"], id: ["Dashboard cohort", "Log bukti", "Radar progres"] },
    lastUpdated: "2026-07-10",
    officialStatus: "community-built"
  },
  {
    slug: "english-day",
    name: { en: "English Day", id: "English Day" },
    tagline: { en: "A learning game for workplace English practice.", id: "Game pembelajaran untuk latihan bahasa Inggris di tempat kerja." },
    description: { en: "A gamified English learning app for adult learners, quizzes, progress tracking, and practice sessions.", id: "Aplikasi belajar bahasa Inggris berbasis game untuk peserta dewasa, kuis, progres, dan sesi latihan." },
    category: "Learning",
    status: "active",
    region: "Indonesia",
    scope: "Training",
    url: "/apps/english-day",
    featured: false,
    tags: ["learning", "english", "game"],
    utilities: { en: ["Quizzes", "Levels", "Progress"], id: ["Kuis", "Level", "Progres"] },
    lastUpdated: "2026-07-04",
    officialStatus: "community-built"
  },
  {
    slug: "research-workbench",
    name: { en: "Research Workbench", id: "Research Workbench" },
    tagline: { en: "A general workspace for research questions, sources, evidence, and insights.", id: "Workspace umum untuk pertanyaan riset, sumber, evidence, dan insight." },
    description: { en: "A public-safe research workspace for managing projects, source libraries, evidence matrices, methodology notes, insight synthesis, and exportable research briefs.", id: "Workspace riset public-safe untuk mengelola proyek, pustaka sumber, matriks evidence, catatan metodologi, sintesis insight, dan brief penelitian yang bisa diekspor." },
    category: "Research",
    status: "experimental",
    region: "Global",
    scope: "Research Operations",
    url: "/apps/research-workbench",
    featured: true,
    tags: ["research", "evidence", "sources", "analysis", "brief"],
    utilities: { en: ["Research brief", "Source library", "Evidence matrix", "Insight synthesis"], id: ["Research brief", "Pustaka sumber", "Matriks evidence", "Sintesis insight"] },
    lastUpdated: "2026-07-10",
    officialStatus: "community-built"
  },
  {
    slug: "reminder",
    name: { en: "Reminder", id: "Reminder" },
    tagline: { en: "A good-habit reminder for tiny daily acts of kindness.", id: "Pengingat kebiasaan baik untuk aksi kebaikan kecil setiap hari." },
    description: { en: "A public-safe daily reminder workspace inspired by micro-habit principles: cue, tiny action, reward, identity, reflection, and local progress tracking.", id: "Workspace reminder harian public-safe yang terinspirasi prinsip micro-habit: pemicu, aksi kecil, reward, identitas, refleksi, dan pelacakan progres lokal." },
    category: "Productivity",
    status: "beta",
    region: "Global",
    scope: "Personal Growth",
    url: "/apps/reminder",
    featured: true,
    tags: ["reminder", "habits", "kindness", "reflection", "productivity"],
    utilities: { en: ["Good habit loops", "Tiny action tracker", "Reflection journal"], id: ["Loop kebiasaan baik", "Tracker aksi kecil", "Jurnal refleksi"] },
    lastUpdated: "2026-07-10",
    officialStatus: "community-built"
  },
  {
    slug: "frontdesk",
    name: { en: "FrontDesk", id: "FrontDesk" },
    tagline: { en: "A service desk utility for intake and tracking.", id: "Utilitas service desk untuk penerimaan dan pelacakan layanan." },
    description: { en: "A service intake and tracking interface for simple public service workflows.", id: "Antarmuka penerimaan dan pelacakan layanan untuk alur kerja layanan sederhana." },
    category: "Public Service",
    status: "beta",
    region: "Indonesia",
    scope: "Service Desk",
    url: "/apps/frontdesk",
    featured: false,
    tags: ["frontdesk", "service", "ticket"],
    utilities: { en: ["Service intake", "Queue view", "Tracking"], id: ["Penerimaan layanan", "Pantauan antrean", "Pelacakan"] },
    lastUpdated: "2026-07-04",
    officialStatus: "community-built"
  },
  {
    slug: "chm-documentation-viewer",
    name: { en: "CHM Documentation Viewer", id: "CHM Documentation Viewer" },
    tagline: { en: "Convert legacy CHM documentation into modern searchable HTML.", id: "Ubah dokumentasi CHM lama menjadi HTML modern yang mudah dicari." },
    description: { en: "A documentation conversion concept for extracting, restructuring, and presenting legacy help files in a modern web interface.", id: "Konsep konversi dokumentasi untuk mengekstrak, menyusun ulang, dan menyajikan file bantuan lama dalam antarmuka web modern." },
    category: "Document Workflow",
    status: "experimental",
    region: "Global",
    scope: "Documentation",
    url: "/apps/chm-documentation-viewer",
    featured: false,
    tags: ["documentation", "CHM", "HTML"],
    utilities: { en: ["Content extraction", "Search", "Sidebar navigation"], id: ["Ekstraksi konten", "Pencarian", "Navigasi sidebar"] },
    lastUpdated: "2026-07-04",
    officialStatus: "community-built"
  },
  {
    slug: "ocr-translate-pdf",
    name: { en: "OCR Translate PDF", id: "OCR Translate PDF" },
    tagline: { en: "Turn scanned PDFs into searchable and translated documents.", id: "Ubah PDF scan menjadi dokumen searchable dan terjemahan." },
    description: { en: "A document utility concept for OCR, text extraction, translation, and quality control of technical PDFs.", id: "Konsep utilitas dokumen untuk OCR, ekstraksi teks, terjemahan, dan kontrol kualitas PDF teknis." },
    category: "Document Workflow",
    status: "experimental",
    region: "Global",
    scope: "Documentation",
    url: "/apps/ocr-translate-pdf",
    featured: false,
    tags: ["OCR", "PDF", "translation"],
    utilities: { en: ["OCR", "Translation", "Searchable PDF"], id: ["OCR", "Terjemahan", "PDF searchable"] },
    lastUpdated: "2026-07-04",
    officialStatus: "community-built"
  },
  {
    slug: "risk-management-tool",
    name: { en: "Risk Management Tool", id: "Manajemen Risiko Tool" },
    tagline: { en: "Map risks, controls, indicators, and mitigation plans.", id: "Petakan risiko, pengendalian, indikator, dan rencana mitigasi." },
    description: { en: "A structured workspace for risk registers, control mapping, residual risk targets, and key risk indicators.", id: "Workspace terstruktur untuk register risiko, pemetaan pengendalian, target risiko residual, dan indikator risiko utama." },
    category: "Administration",
    status: "experimental",
    region: "Indonesia",
    scope: "Governance",
    url: "/apps/risk-management-tool",
    featured: false,
    tags: ["risk", "controls", "mitigation"],
    utilities: { en: ["Risk register", "Control map", "KRI"], id: ["Register risiko", "Peta pengendalian", "IRU"] },
    lastUpdated: "2026-07-04",
    officialStatus: "community-built"
  },
  {
    slug: "btki-smart-search",
    name: { en: "BTKI Smart Search", id: "BTKI Smart Search" },
    tagline: { en: "Search HS references, compare codes, and prepare classification notes.", id: "Cari referensi HS, bandingkan kode, dan susun catatan klasifikasi." },
    description: { en: "A browser-based helper for exploring tariff references, comparing HS codes, and preparing neutral classification notes. The bundled dataset is sample/reference material and should be validated against official sources before use.", id: "Helper berbasis browser untuk menelusuri referensi tarif, membandingkan kode HS, dan menyusun catatan klasifikasi netral. Dataset bawaan bersifat contoh/referensi dan tetap perlu divalidasi ke sumber resmi sebelum digunakan." },
    category: "Trade Tools",
    status: "beta",
    region: "Indonesia",
    scope: "Public Utility",
    url: "/apps/btki-smart-search",
    embedUrl: "/apps/btki-smart-search.html",
    featured: true,
    tags: ["HS", "BTKI", "tariff", "classification"],
    utilities: { en: ["HS search", "Code comparison", "Classification notes"], id: ["Pencarian HS", "Perbandingan kode", "Catatan klasifikasi"] },
    lastUpdated: "2026-07-06",
    officialStatus: "community-built"
  },
  {
    slug: "ews-dashboard",
    name: { en: "News Scraper Dashboard", id: "News Scraper Dashboard" },
    tagline: { en: "Scrape public news by query, RSS, or URLs and classify sentiment signals.", id: "Scrape berita publik dari query, RSS, atau URL dan klasifikasikan sinyal sentimen." },
    description: { en: "A general public news monitoring workspace with keyword criteria, positive-neutral-negative classification, source tracking, and exportable recaps.", id: "Workspace monitoring berita umum dengan kriteria kata kunci, klasifikasi positif-netral-negatif, pelacakan sumber, dan rekap yang bisa diekspor." },
    category: "Monitoring",
    status: "beta",
    region: "Global",
    scope: "Public News Monitoring",
    url: "/apps/ews-dashboard",
    featured: true,
    tags: ["news", "scraping", "sentiment", "monitoring"],
    utilities: { en: ["News scraping", "Sentiment classification", "Export recap"], id: ["Scraping berita", "Klasifikasi sentimen", "Export rekap"] },
    lastUpdated: "2026-07-10",
    officialStatus: "community-built"
  },
  {
    slug: "imei-helper",
    name: { en: "IMEI Helper", id: "IMEI Helper" },
    tagline: { en: "A lightweight public reference tool for device identifier checks.", id: "Tool referensi ringan untuk pengecekan identitas perangkat." },
    description: { en: "A simple utility launcher for device identifier workflows. It is presented as a general public helper and does not include internal user records.", id: "Launcher utilitas sederhana untuk alur kerja identitas perangkat. Disajikan sebagai helper publik umum dan tidak memuat catatan pengguna internal." },
    category: "Trade Tools",
    status: "experimental",
    region: "Indonesia",
    scope: "Public Utility",
    url: "/apps/imei-helper",
    featured: false,
    tags: ["IMEI", "device", "lookup"],
    utilities: { en: ["Identifier check", "Reference workflow", "Public launcher"], id: ["Cek identitas", "Alur referensi", "Launcher publik"] },
    lastUpdated: "2026-07-06",
    officialStatus: "community-built"
  },
  {
    slug: "umkm-workspace",
    name: { en: "MSME Workspace", id: "Workspace UMKM" },
    tagline: { en: "Organize MSME profiles, product notes, and assistance progress.", id: "Kelola profil UMKM, catatan produk, dan progres pendampingan." },
    description: { en: "A public-facing launcher for MSME support workflows, stripped of organizational identities and personal participant records.", id: "Launcher publik untuk alur dukungan UMKM, tanpa identitas organisasi dan tanpa data pribadi peserta." },
    category: "Trade Facilitation",
    status: "beta",
    region: "Indonesia",
    scope: "Community Productivity",
    url: "/apps/umkm-workspace",
    featured: false,
    tags: ["MSME", "products", "assistance"],
    utilities: { en: ["Profile notes", "Product list", "Progress tracking"], id: ["Catatan profil", "Daftar produk", "Pelacakan progres"] },
    lastUpdated: "2026-07-06",
    officialStatus: "community-built"
  },

];

export function getAppBySlug(slug: string) {
  return apps.find((app) => app.slug === slug);
}

export function getFeaturedApps() {
  return apps.filter((app) => app.featured);
}

export function localized<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value.id ?? value.en;
}
