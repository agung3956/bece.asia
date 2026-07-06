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

export default async function LocalizedFeedbackPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/feedback`}>
      <BasicPage
        title={locale === "zh" ? "反馈" : "Feedback"}
        description={locale === "zh" ? "公开发布后将接入反馈渠道。" : "Feedback channels will be connected after the first public release."}
        items={locale === "zh" ? ["应用想法", "错误报告", "功能请求", "内容修正", "流程建议", "集成请求"] : ["App idea", "Bug report", "Feature request", "Content correction", "Workflow suggestion", "Integration request"]}
      />
    </PageShell>
  );
}
