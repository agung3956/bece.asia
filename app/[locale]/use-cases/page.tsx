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

export default async function LocalizedUseCasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/use-cases`}>
      <BasicPage
        title={locale === "zh" ? "使用场景" : "Use Cases"}
        description={locale === "zh" ? "bece.asia 工具在常见工作流程中的实用场景。" : "Practical scenarios for using bece.asia tools in common workflows."}
        items={locale === "zh" ? ["文档流程", "项目监控", "出口支持", "研究工作区", "学习工具", "公共工具"] : ["Document workflow", "Program monitoring", "Export support", "Research workspace", "Learning tools", "Public utilities"]}
      />
    </PageShell>
  );
}
