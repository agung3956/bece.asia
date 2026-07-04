import type { Locale } from "./apps";

export const categories: Array<{ key: string; label: Record<Locale, string>; description: Record<Locale, string> }> = [
  { key: "Administration", label: { en: "Administration", id: "Administrasi" }, description: { en: "Office workflows and internal administration.", id: "Alur kerja kantor dan administrasi internal." } },
  { key: "Customs Tools", label: { en: "Customs Tools", id: "Kepabeanan" }, description: { en: "Utilities for customs-related work.", id: "Utilitas untuk pekerjaan kepabeanan." } },
  { key: "Trade Facilitation", label: { en: "Trade Facilitation", id: "Fasilitasi Perdagangan" }, description: { en: "Tools for trade support and facilitation.", id: "Alat bantu dukungan dan fasilitasi perdagangan." } },
  { key: "Procurement", label: { en: "Procurement", id: "Pengadaan" }, description: { en: "Procurement documents and workflows.", id: "Dokumen dan alur kerja pengadaan." } },
  { key: "Document Workflow", label: { en: "Document Workflow", id: "Tata Naskah" }, description: { en: "Document generation, OCR, filing, and templates.", id: "Generate dokumen, OCR, arsip, dan template." } },
  { key: "Export Assistance", label: { en: "Export Assistance", id: "Asistensi Ekspor" }, description: { en: "MSME export readiness and coordination.", id: "Kesiapan ekspor UMKM dan koordinasi." } },
  { key: "Monitoring", label: { en: "Monitoring", id: "Monitoring" }, description: { en: "Dashboards and program tracking.", id: "Dashboard dan pelacakan program." } },
  { key: "Research", label: { en: "Research", id: "Kajian" }, description: { en: "Research workbenches and analysis matrices.", id: "Workbench kajian dan matriks analisis." } },
  { key: "Learning", label: { en: "Learning", id: "Pembelajaran" }, description: { en: "Training, games, and learning tools.", id: "Pelatihan, game, dan alat pembelajaran." } },
  { key: "Productivity", label: { en: "Productivity", id: "Produktivitas" }, description: { en: "Small utilities for daily productivity.", id: "Utilitas kecil untuk produktivitas harian." } },
  { key: "Public Service", label: { en: "Public Service", id: "Layanan Publik" }, description: { en: "Service desk and public-facing workflows.", id: "Service desk dan alur layanan publik." } },
  { key: "Experimental", label: { en: "Experimental", id: "Eksperimen" }, description: { en: "Prototype ideas and early-stage tools.", id: "Ide prototipe dan alat tahap awal." } }
];
