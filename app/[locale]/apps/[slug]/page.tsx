import { notFound } from "next/navigation";
import { AppDetailContent } from "@/components/app-detail-content";
import { PageShell } from "@/components/page-shell";
import { apps, type Locale } from "@/data/apps";

const supportedLocales: Locale[] = ["en", "zh"];

function resolveLocale(locale: string): Locale {
  if (supportedLocales.includes(locale as Locale)) return locale as Locale;
  notFound();
}

export function generateStaticParams() {
  return supportedLocales.flatMap((locale) => apps.map((app) => ({ locale, slug: app.slug })));
}

export default async function LocalizedAppDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/apps/${slug}`}>
      <AppDetailContent locale={locale} slug={slug} />
    </PageShell>
  );
}
