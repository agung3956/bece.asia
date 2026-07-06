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

export default async function LocalizedPrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/privacy`}>
      <BasicPage
        title={locale === "zh" ? "\u9690\u79c1" : "Privacy"}
        description={locale === "zh" ? "\u516c\u5171\u7248 bece.asia \u4e0d\u5e94\u6536\u96c6\u673a\u5bc6\u3001\u4e2a\u4eba\u6216\u5185\u90e8\u8fd0\u8425\u6570\u636e\u3002" : "The public version of bece.asia should not collect confidential, personal, or internal operational data."}
        items={locale === "zh" ? ["\u4e0d\u8f93\u5165\u673a\u5bc6\u6570\u636e", "\u4e0d\u8f93\u5165\u5458\u5de5\u8eab\u4efd", "\u4f7f\u7528\u5df2\u6e05\u7406\u7684\u793a\u4f8b", "\u5728\u4f7f\u7528\u524d\u68c0\u67e5\u5d4c\u5165\u5e94\u7528"] : ["Do not enter confidential data", "Do not enter employee identities", "Use sanitized sample content", "Review embedded apps before use"]}
      />
    </PageShell>
  );
}
