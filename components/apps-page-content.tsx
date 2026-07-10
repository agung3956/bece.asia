import type { AppItem, Locale } from "@/data/apps";
import { apps } from "@/data/apps";
import { t } from "@/data/i18n-safe";
import { AppsClient } from "./apps-client";
import { SectionHeading } from "./section-heading";

const palmOilCalculator: AppItem = {
  slug: "kalkulator-sawit",
  name: {
    en: "Palm Oil Export Calculator",
    id: "Kalkulator Sawit",
  },
  tagline: {
    en: "Estimate export tax and levy for palm oil and derivative products.",
    id: "Simulasikan bea keluar dan pungutan ekspor sawit serta produk turunannya.",
  },
  description: {
    en: "A browser-based calculator for preliminary simulations of palm oil export tax and levy. Official figures must still be validated against the latest applicable regulations and official references.",
    id: "Kalkulator berbasis browser untuk simulasi awal bea keluar dan pungutan ekspor kelapa sawit serta produk turunannya. Angka resmi tetap harus divalidasi terhadap ketentuan dan referensi resmi terbaru.",
  },
  category: "Trade Tools",
  status: "beta",
  region: "Indonesia",
  scope: "Export Calculation",
  url: "/apps/kalkulator-sawit",
  featured: true,
  tags: ["palm oil", "export", "tax", "levy", "calculator"],
  utilities: {
    en: ["Export tax estimate", "Levy simulation", "Transaction worksheet"],
    id: ["Estimasi bea keluar", "Simulasi pungutan", "Kertas kerja transaksi"],
  },
  lastUpdated: "2026-07-11",
  officialStatus: "community-built",
};

export function AppsPageContent({ locale }: { locale: Locale }) {
  const dict = t(locale);
  const description = locale === "en"
    ? "Browse practical apps, prototypes, and utilities that have been cleaned for public use: trade tools, document workflows, dashboards, learning, and productivity."
    : locale === "zh"
      ? "浏览已清理供公共使用的实用应用、原型和工具：贸易工具、文档流程、仪表板、学习和生产力。"
      : "Telusuri aplikasi, prototipe, dan utilities yang sudah dibersihkan untuk penggunaan publik: alat perdagangan, tata naskah, dashboard, pembelajaran, dan produktivitas.";

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="bece.asia"
        title={dict.sections.allApps}
        description={description}
      />
      <div className="mt-8">
        <AppsClient apps={[...apps, palmOilCalculator]} locale={locale} />
      </div>
    </section>
  );
}
