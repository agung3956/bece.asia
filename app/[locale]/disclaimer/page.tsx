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

export default async function LocalizedDisclaimerPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/disclaimer`}>
      <BasicPage
        title="Disclaimer"
        description={locale === "zh" ? "\u672c\u7ad9\u662f\u72ec\u7acb\u7684\u516c\u5171\u5de5\u5177\u95e8\u6237\uff0c\u4e0d\u662f\u5b98\u65b9\u653f\u5e9c\u670d\u52a1\u3002" : "This site is an independent public utility portal and is not an official government service."}
        items={locale === "zh" ? ["\u4e0d\u4ee3\u8868\u5b98\u65b9\u7acb\u573a", "\u4e0d\u66ff\u4ee3\u89c4\u5b9a", "\u4e0d\u4fdd\u5b58\u673a\u5bc6\u64cd\u4f5c\u6570\u636e", "\u4f7f\u7528\u524d\u8bf7\u6838\u5bf9\u5b98\u65b9\u6765\u6e90"] : ["Does not represent official policy", "Does not replace regulations", "Does not store confidential operational data", "Check official sources before use"]}
      />
    </PageShell>
  );
}
