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

export default async function LocalizedDocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/docs`}>
      <BasicPage
        title={locale === "zh" ? "文档" : "Docs"}
        description={locale === "zh" ? "每个应用和工具的简短指南将整理在这里。" : "Short guides for each app and utility will be organized here."}
        items={locale === "zh" ? ["应用概览", "设置说明", "数据结构", "用户指南", "已知限制", "发布说明"] : ["App overview", "Setup notes", "Data structure", "User guide", "Known limits", "Release notes"]}
      />
    </PageShell>
  );
}
