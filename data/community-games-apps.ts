import type { AppItem } from "@/data/apps";

export const communityGamesApps: AppItem[] = [
  {
    slug: "tokomath-kids",
    name: { en: "TokoMath Kids", id: "TokoMath Kids" },
    tagline: { en: "Learn shopping math through an interactive buyer and seller game.", id: "Belajar matematika belanja melalui permainan pembeli dan penjual." },
    description: { en: "A playful math game for totals, payments, change, levels, and progress tracking.", id: "Game matematika interaktif untuk menghitung total, pembayaran, kembalian, level, dan progres." },
    category: "Kids Learning", status: "beta", region: "Indonesia", scope: "Math Learning", url: "/apps/tokomath-kids", featured: true,
    tags: ["kids", "math", "shopping", "game"],
    utilities: { en: ["Buyer mode", "Seller mode", "Progress map"], id: ["Mode pembeli", "Mode penjual", "Peta progres"] },
    lastUpdated: "2026-07-11", officialStatus: "community-built"
  },
  {
    slug: "nusantara-games",
    name: { en: "Nusantara Games", id: "Nusantara Games" },
    tagline: { en: "Explore Indonesian knowledge through quizzes, maps, badges, and collections.", id: "Jelajahi pengetahuan Indonesia melalui kuis, peta, badge, dan koleksi." },
    description: { en: "An educational game covering provinces, culture, geography, and general knowledge with multiple play modes.", id: "Game edukasi tentang provinsi, budaya, geografi, dan pengetahuan umum dengan berbagai mode bermain." },
    category: "Kids Learning", status: "beta", region: "Indonesia", scope: "Cultural Learning", url: "/apps/nusantara-games", featured: true,
    tags: ["Indonesia", "quiz", "culture", "education"],
    utilities: { en: ["Quiz modes", "Province map", "Badge collection"], id: ["Mode kuis", "Peta provinsi", "Koleksi badge"] },
    lastUpdated: "2026-07-11", officialStatus: "community-built"
  },
  {
    slug: "bintang-penjaga",
    name: { en: "Bintang Penjaga", id: "Bintang Penjaga" },
    tagline: { en: "A browser adventure game with characters, worlds, and achievement scenes.", id: "Game petualangan browser dengan karakter, dunia, dan scene pencapaian." },
    description: { en: "A Phaser-based adventure game with character selection, world map, gameplay, victory, and settings.", id: "Game petualangan berbasis Phaser dengan pemilihan karakter, peta dunia, gameplay, victory, dan pengaturan." },
    category: "Games", status: "experimental", region: "Global", scope: "Browser Game", url: "/apps/bintang-penjaga", featured: true,
    tags: ["game", "Phaser", "adventure", "kids"],
    utilities: { en: ["Character select", "World map", "Adventure gameplay"], id: ["Pilih karakter", "Peta dunia", "Gameplay petualangan"] },
    lastUpdated: "2026-07-11", officialStatus: "community-built"
  },
  {
    slug: "family-mission",
    name: { en: "Family Mission", id: "Family Mission" },
    tagline: { en: "Turn daily family routines into missions, points, and rewards.", id: "Ubah rutinitas keluarga menjadi misi, poin, dan hadiah." },
    description: { en: "A local family mission board for tasks, points, light consequences, reward draws, and daily history.", id: "Papan misi keluarga untuk tugas, poin, konsekuensi ringan, undian hadiah, dan riwayat harian." },
    category: "Family", status: "beta", region: "Global", scope: "Family Productivity", url: "/apps/family-mission", featured: true,
    tags: ["family", "missions", "rewards", "habits"],
    utilities: { en: ["Mission board", "Point system", "Reward draw"], id: ["Papan misi", "Sistem poin", "Undian hadiah"] },
    lastUpdated: "2026-07-11", officialStatus: "community-built"
  }
];
