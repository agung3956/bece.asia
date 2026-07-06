import { notFound } from "next/navigation";
import { BasicPage } from "@/components/basic-page";
import { PageShell } from "@/components/page-shell";
import type { Locale } from "@/data/apps";

const supportedLocales: Locale[] = ["en", "zh"];

function resolveLocale(locale: string): Locale {
  if (supportedLocales.includes(locale as Locale)) return locale as Locale;
  notFound();
}

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export default async function LocalizedRoadmapPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/roadmap`}>
      <BasicPage
        title={locale === "zh" ? "路线图" : "Roadmap"}
        description={locale === "zh" ? "该门户将从精选目录发展为实用工具工作台。" : "The portal will grow from a curated catalog into a practical utility workbench."}
        items={locale === "zh" ? ["阶段 1：目录和多语言页面", "阶段 2：交互式工具", "阶段 3：应用文档", "阶段 4：反馈表单", "阶段 5：分析和状态页", "阶段 6：可复用模板"] : ["Phase 1: catalog and multilingual pages", "Phase 2: interactive utilities", "Phase 3: app documentation", "Phase 4: feedback form", "Phase 5: analytics and status page", "Phase 6: reusable templates"]}
      />
    </PageShell>
  );
}
