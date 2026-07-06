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

export default async function LocalizedAboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/about`}>
      <BasicPage
        title={locale === "zh" ? "关于 bece.asia" : "About bece.asia"}
        description={locale === "zh" ? "bece.asia 是一个面向实用数字工具、轻量应用和生产力实验的门户。" : "bece.asia is a portal for practical digital tools, lightweight apps, and productivity experiments."}
        items={locale === "zh" ? ["印尼语默认", "英语和中文选项", "中性品牌", "Vercel 部署", "可编辑应用目录", "社区构建状态"] : ["Indonesian by default", "English and Chinese options", "Neutral branding", "Vercel deployment", "Editable app catalog", "Community-built status"]}
      />
    </PageShell>
  );
}
