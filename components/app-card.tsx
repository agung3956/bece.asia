import { ArrowUpRight, Boxes, Code2 } from "lucide-react";
import Link from "next/link";
import type { AppItem, Locale } from "@/data/apps";
import { t } from "@/data/i18n";
import { localePath } from "@/lib/routes";
import { StatusBadge } from "./status-badge";

export function AppCard({ app, locale }: { app: AppItem; locale: Locale }) {
  const dict = t(locale);

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal/40 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-navy transition group-hover:bg-navy group-hover:text-white">
          <Boxes size={22} />
        </div>
        <StatusBadge status={app.status} locale={locale} />
      </div>
      <div className="mt-5 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">{app.category}</p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-navy">{app.name[locale]}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{app.tagline[locale]}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {app.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{tag}</span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={localePath(locale, `/apps/${app.slug}`)} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-light">
          {dict.apps.detail}
          <ArrowUpRight size={16} />
        </Link>
        {app.repo ? (
          <a href={app.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal hover:text-navy">
            <Code2 size={16} />
            Repo
          </a>
        ) : null}
      </div>
    </article>
  );
}
