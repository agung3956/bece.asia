import type { AppItem } from "@/data/apps";

export const creativeBusinessApps: AppItem[] = [
  {
    slug: "pageforge",
    name: { en: "PageForge", id: "PageForge" },
    tagline: { en: "Build a compact landing page with live preview and reusable copy.", id: "Buat landing page ringkas dengan preview langsung dan teks siap pakai." },
    description: { en: "A browser-based landing page builder for brand headlines, service highlights, testimonials, calls to action, and contact details.", id: "Builder landing page berbasis browser untuk headline merek, layanan, testimoni, CTA, dan kontak." },
    category: "Creative Tools", status: "beta", region: "Global", scope: "Landing Page Builder", url: "/apps/pageforge", featured: true,
    tags: ["landing page", "business", "website", "copywriting"],
    utilities: { en: ["Live preview", "Service blocks", "CTA builder"], id: ["Preview langsung", "Blok layanan", "Builder CTA"] },
    lastUpdated: "2026-07-11", officialStatus: "community-built"
  },
  {
    slug: "content-planner",
    name: { en: "Content Planner", id: "Content Planner" },
    tagline: { en: "Plan content pillars, formats, dates, and publishing status.", id: "Rencanakan pilar konten, format, tanggal, dan status publikasi." },
    description: { en: "A lightweight content calendar for ideas, formats, publishing stages, and editorial tracking.", id: "Kalender konten ringan untuk ide, format, tahap publikasi, dan pemantauan editorial." },
    category: "Creative Tools", status: "beta", region: "Global", scope: "Content Planning", url: "/apps/content-planner", featured: true,
    tags: ["content", "calendar", "social media", "editorial"],
    utilities: { en: ["Content board", "Pillar planning", "Status tracking"], id: ["Papan konten", "Perencanaan pilar", "Pelacakan status"] },
    lastUpdated: "2026-07-11", officialStatus: "community-built"
  },
  {
    slug: "digital-guestbook",
    name: { en: "Digital Guestbook", id: "Digital Guestbook" },
    tagline: { en: "Collect guest messages, ratings, and visit recaps locally.", id: "Kumpulkan pesan tamu, rating, dan rekap kunjungan secara lokal." },
    description: { en: "A public-safe digital guestbook for events, communities, small businesses, and simple service desks.", id: "Buku tamu digital public-safe untuk acara, komunitas, usaha kecil, dan meja layanan sederhana." },
    category: "Productivity", status: "beta", region: "Global", scope: "Guest Management", url: "/apps/digital-guestbook", featured: true,
    tags: ["guestbook", "visitors", "rating", "events"],
    utilities: { en: ["Guest form", "Message feed", "Rating recap"], id: ["Form tamu", "Feed pesan", "Rekap rating"] },
    lastUpdated: "2026-07-11", officialStatus: "community-built"
  },
  {
    slug: "orderflow",
    name: { en: "OrderFlow", id: "OrderFlow" },
    tagline: { en: "Track customer orders, transaction value, and fulfillment status.", id: "Pantau pesanan pelanggan, nilai transaksi, dan status pemenuhan." },
    description: { en: "A lightweight order pipeline for products, services, quantities, values, and fulfillment stages.", id: "Pipeline pesanan ringan untuk produk, layanan, jumlah, nilai, dan tahap pemenuhan." },
    category: "Business Tools", status: "beta", region: "Global", scope: "Order Management", url: "/apps/orderflow", featured: true,
    tags: ["orders", "sales", "fulfillment", "MSME"],
    utilities: { en: ["Order entry", "Status pipeline", "Order value recap"], id: ["Input pesanan", "Pipeline status", "Rekap nilai pesanan"] },
    lastUpdated: "2026-07-11", officialStatus: "community-built"
  }
];
