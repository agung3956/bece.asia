import type { AppItem } from "@/data/apps";

export const attendanceApps: AppItem[] = [
  {
    slug: "attendance-workspace",
    name: { en: "Attendance Workspace", id: "Attendance Workspace" },
    tagline: { en: "A privacy-safe attendance utility for simple daily records.", id: "Utilitas presensi privacy-safe untuk pencatatan harian sederhana." },
    description: { en: "A browser-based attendance workspace with local storage, neutral sample data, fast recap, and CSV export.", id: "Workspace presensi berbasis browser dengan penyimpanan lokal, data contoh netral, rekap cepat, dan export CSV." },
    category: "Productivity",
    status: "beta",
    region: "Global",
    scope: "Attendance Management",
    url: "/apps/attendance-workspace",
    featured: true,
    tags: ["attendance", "presence", "productivity", "privacy-safe"],
    utilities: { en: ["Attendance form", "Presence recap", "CSV export"], id: ["Form presensi", "Rekap kehadiran", "Export CSV"] },
    lastUpdated: "2026-07-11",
    officialStatus: "community-built"
  }
];
