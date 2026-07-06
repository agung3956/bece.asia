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

export default async function LocalizedTermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/terms`}>
      <BasicPage
        title={locale === "zh" ? "\u6761\u6b3e" : "Terms"}
        description={locale === "zh" ? "bece.asia \u4ee5\u516c\u5171\u53c2\u8003\u5de5\u5177\u5f62\u5f0f\u63d0\u4f9b\uff0c\u4e0d\u53d6\u4ee3\u5b98\u65b9\u7cfb\u7edf\u6216\u89c4\u5b9a\u3002" : "bece.asia is provided as a public reference utility and does not replace official systems or regulations."}
        items={locale === "zh" ? ["\u72ec\u7acb\u7ef4\u62a4", "\u7528\u6237\u81ea\u884c\u9a8c\u8bc1\u8f93\u51fa", "\u4e0d\u8f93\u5165\u654f\u611f\u6570\u636e", "\u5b98\u65b9\u6765\u6e90\u4f18\u5148"] : ["Independently maintained", "Users validate outputs", "Do not enter sensitive data", "Official sources remain primary"]}
      />
    </PageShell>
  );
}
