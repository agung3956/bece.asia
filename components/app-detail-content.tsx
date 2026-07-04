import { ArrowLeft, ArrowUpRight, Code2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/data/apps";
import { getAppBySlug } from "@/data/apps";
import { t } from "@/data/i18n";
import { localePath } from "@/lib/routes";
import { StatusBadge } from "./status-badge";

export function AppDetailContent({ slug, locale }: { slug: string; locale: Locale }) {
  const app = getAppBySlug(slug);
  if (!app) notFound();

  const dict = t(locale);

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <Link href={localePath(locale, "/apps")} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy">
        <ArrowLeft size={16} />
        {dict.sections.allApps}
      </Link>

      <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">{app.category}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">{app.name[locale]}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{app.description[locale]}</p>
          </div>
          <StatusBadge status={app.status} locale={locale} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Info label={dict.apps.region} value={app.region} />
          <Info label={dict.apps.scope} value={app.scope} />
          <Info label={dict.apps.updated} value={app.lastUpdated} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-navy">{dict.apps.utilities}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {app.utilities[locale].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700">{item}</div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={app.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-light">
            {dict.apps.open}
            <ArrowUpRight size={17} />
          </a>
          {app.repo ? (
            <a href={app.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-navy transition hover:border-teal">
              <Code2 size={17} />
              {dict.apps.repo}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 font-bold text-navy">{value}</p>
    </div>
  );
}
