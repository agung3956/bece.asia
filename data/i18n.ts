import type { Locale } from "./apps";

export const dictionary = {
  en: {
    nav: {
      home: "Home",
      apps: "Apps",
      utilities: "Utilities",
      useCases: "Use Cases",
      docs: "Docs",
      roadmap: "Roadmap",
      about: "About",
      feedback: "Feedback"
    },
    hero: {
      eyebrow: "Utility-first digital portal",
      title: "Public digital tools for trade, documents, learning, and everyday workflows.",
      subtitle: "bece.asia is a utility-first portal for sanitized community apps, workflow automation, document tools, monitoring dashboards, and learning experiments.",
      primary: "Explore Apps",
      secondary: "Open Utilities"
    },
    sections: {
      featured: "Featured apps",
      latest: "Latest updates",
      categories: "Work areas",
      utilities: "Practical utilities",
      useCases: "Use cases",
      roadmap: "Roadmap",
      allApps: "All apps",
      appDetail: "App detail"
    },
    apps: {
      search: "Search apps, tags, or categories",
      noResult: "No apps found.",
      open: "Open app",
      detail: "View detail",
      status: "Status",
      region: "Region",
      scope: "Scope",
      updated: "Updated",
      utilities: "Utilities",
      category: "Category",
      allCategories: "All categories"
    },
    status: {
      active: "Active",
      beta: "Beta",
      maintenance: "Maintenance",
      experimental: "Experimental",
      archived: "Archived"
    },
    footer: {
      disclaimer: "bece.asia is an independent utility portal for productivity, learning, and workflow experiments. It is not an official government website and does not replace official systems, procedures, or regulations."
    }
  },
  id: {
    nav: {
      home: "Beranda",
      apps: "Aplikasi",
      utilities: "Utilities",
      useCases: "Skenario Penggunaan",
      docs: "Dokumentasi",
      roadmap: "Roadmap",
      about: "Tentang",
      feedback: "Masukan"
    },
    hero: {
      eyebrow: "Portal digital berbasis utilitas",
      title: "Alat digital publik untuk perdagangan, dokumen, pembelajaran, dan alur kerja harian.",
      subtitle: "bece.asia adalah portal utilitas untuk aplikasi komunitas yang disanitasi, otomasi alur kerja, tata naskah, dashboard monitoring, dan media pembelajaran.",
      primary: "Lihat Aplikasi",
      secondary: "Buka Utilities"
    },
    sections: {
      featured: "Aplikasi unggulan",
      latest: "Update terbaru",
      categories: "Area kerja",
      utilities: "Utilities praktis",
      useCases: "Skenario penggunaan",
      roadmap: "Roadmap",
      allApps: "Semua aplikasi",
      appDetail: "Detail aplikasi"
    },
    apps: {
      search: "Cari aplikasi, tag, atau kategori",
      noResult: "Aplikasi tidak ditemukan.",
      open: "Buka aplikasi",
      detail: "Lihat detail",
      status: "Status",
      region: "Wilayah",
      scope: "Scope",
      updated: "Update",
      utilities: "Utilities",
      category: "Kategori",
      allCategories: "Semua kategori"
    },
    status: {
      active: "Aktif",
      beta: "Beta",
      maintenance: "Maintenance",
      experimental: "Eksperimen",
      archived: "Arsip"
    },
    footer: {
      disclaimer: "bece.asia adalah portal utilitas independen untuk produktivitas, pembelajaran, dan eksperimen alur kerja. Website ini bukan situs resmi pemerintah dan tidak menggantikan sistem, prosedur, atau ketentuan resmi."
    }
  }
} as const;

export function t(locale: Locale) {
  return dictionary[locale];
}
