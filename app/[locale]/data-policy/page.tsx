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

export default async function LocalizedDataPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/data-policy`}>
      <BasicPage
        title={locale === "zh" ? "\u6570\u636e\u653f\u7b56" : "Data Policy"}
        description={locale === "zh" ? "\u516c\u5171\u5e94\u7528\u76ee\u5f55\u53ea\u4f7f\u7528\u7ecf\u8fc7\u6e05\u7406\u7684\u793a\u4f8b\u3001\u516c\u5171\u53c2\u8003\u548c\u4e2d\u6027\u5de5\u4f5c\u6d41\u3002" : "The public app catalog only uses sanitized examples, public references, and neutral workflows."}
        items={locale === "zh" ? ["\u79fb\u9664\u529e\u516c\u5ba4\u8eab\u4efd", "\u79fb\u9664\u5458\u5de5\u8eab\u4efd", "\u79fb\u9664\u5185\u90e8\u51ed\u636e", "\u4ec5\u4fdd\u7559\u901a\u7528\u5de5\u5177\u884c\u4e3a"] : ["Remove office identities", "Remove employee identities", "Remove internal credentials", "Keep only generic tool behavior"]}
      />
    </PageShell>
  );
}
