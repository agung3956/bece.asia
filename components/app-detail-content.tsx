import { ArrowLeft, ArrowUpRight, Info as InfoIcon, PanelTopOpen } from "lucide-react";
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
          {app.embedUrl ? (
            <a href={app.embedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-light">
              {dict.apps.open}
              <ArrowUpRight size={17} />
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
        <div className="flex gap-3">
          <InfoIcon className="mt-0.5 shrink-0 text-teal" size={18} />
          <p>
            {locale === "en"
              ? "Public-use notice: this tool is independently maintained by bece.asia, is not an official government service, and must not be used as a substitute for official systems, regulations, or source documents. Do not enter confidential, personal, or operational data."
              : "Pemberitahuan penggunaan publik: alat ini dikelola independen oleh bece.asia, bukan layanan resmi pemerintah, dan tidak menggantikan sistem, peraturan, atau dokumen sumber resmi. Jangan memasukkan data rahasia, pribadi, atau operasional."}
          </p>
        </div>
      </div>

      {app.embedUrl ? (
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-bold text-navy">
              <PanelTopOpen size={18} />
              {locale === "en" ? "Embedded app" : "Aplikasi tertempel"}
            </div>
            <a href={app.embedUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal hover:text-navy">
              {locale === "en" ? "Open full page" : "Buka layar penuh"}
            </a>
          </div>
          <iframe title={app.name[locale]} src={app.embedUrl} className="h-[760px] w-full border-0" loading="lazy" />
        </div>
      ) : (
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black text-navy">{locale === "en" ? "Internal version in preparation" : "Versi internal sedang disiapkan"}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {locale === "en"
              ? "This app is listed as a sanitized public concept. The runnable version will appear here after its old source is copied, cleaned, and checked for public-safe data."
              : "Aplikasi ini tercatat sebagai konsep publik yang disanitasi. Versi yang dapat dijalankan akan muncul di sini setelah sumber lama disalin, dibersihkan, dan dicek agar aman untuk publik."}
          </p>
        </div>
      )}
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
