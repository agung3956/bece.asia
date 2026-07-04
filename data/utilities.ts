import type { Locale } from "./apps";

export const utilities = [
  {
    title: { en: "Document Number Helper", id: "Bantuan Nomor Dokumen" },
    description: { en: "Prepare consistent document numbering patterns.", id: "Susun pola penomoran dokumen secara konsisten." }
  },
  {
    title: { en: "Indonesian Date Converter", id: "Konverter Tanggal Indonesia" },
    description: { en: "Format dates for formal letters and reports.", id: "Format tanggal untuk surat dan laporan." }
  },
  {
    title: { en: "Procurement Checklist", id: "Checklist Pengadaan" },
    description: { en: "Check common procurement document completeness.", id: "Cek kelengkapan umum dokumen pengadaan." }
  },
  {
    title: { en: "Scale Converter", id: "Konverter Skala Nilai" },
    description: { en: "Convert score scales for quick performance calculations.", id: "Konversi skala nilai untuk perhitungan cepat." }
  },
  {
    title: { en: "App Launcher", id: "Launcher Aplikasi" },
    description: { en: "Open frequently used tools from one place.", id: "Buka tools yang sering dipakai dari satu tempat." }
  },
  {
    title: { en: "Local Notes", id: "Catatan Lokal" },
    description: { en: "Keep short notes in browser storage.", id: "Simpan catatan singkat di browser." }
  }
] satisfies Array<{ title: Record<Locale, string>; description: Record<Locale, string> }>;
