import { notFound } from "next/navigation";
import { UtilitiesClient } from "@/components/utilities-client";
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

export default async function LocalizedUtilitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <PageShell locale={locale} currentPath={`/${locale}/utilities`}>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight text-navy">{locale === "zh" ? "实用工具" : "Practical utilities"}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">{locale === "zh" ? "用于快速日常任务的小型浏览器工具。" : "Small browser-based helpers for fast daily tasks."}</p>
        <div className="mt-8">
          <UtilitiesClient locale={locale} />
        </div>
      </section>
    </PageShell>
  );
}
