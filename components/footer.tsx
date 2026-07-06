import Link from "next/link";
import type { Locale } from "@/data/apps";
import { t } from "@/data/i18n";
import { localePath } from "@/lib/routes";
import { Logo } from "./logo";

export function Footer({ locale }: { locale: Locale }) {
  const dict = t(locale);
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div className="space-y-4">
          <Logo locale={locale} />
          <p className="max-w-3xl text-sm leading-6 text-slate-600">{dict.footer.disclaimer}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Link href={localePath(locale, "/apps")} className="text-slate-600 hover:text-navy">{dict.nav.apps}</Link>
          <Link href={localePath(locale, "/utilities")} className="text-slate-600 hover:text-navy">{dict.nav.utilities}</Link>
          <Link href={localePath(locale, "/roadmap")} className="text-slate-600 hover:text-navy">{dict.nav.roadmap}</Link>
          <Link href={localePath(locale, "/feedback")} className="text-slate-600 hover:text-navy">{dict.nav.feedback}</Link>
          <Link href={localePath(locale, "/privacy")} className="text-slate-600 hover:text-navy">Privacy</Link>
          <Link href={localePath(locale, "/terms")} className="text-slate-600 hover:text-navy">Terms</Link>
          <Link href={localePath(locale, "/disclaimer")} className="text-slate-600 hover:text-navy">Disclaimer</Link>
          <Link href={localePath(locale, "/data-policy")} className="text-slate-600 hover:text-navy">Data Policy</Link>
        </div>
      </div>
    </footer>
  );
}
