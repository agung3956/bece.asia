import Link from "next/link";
import type { Locale } from "@/data/apps";
import { t } from "@/data/i18n";
import { localePath } from "@/lib/routes";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

const navItems = [
  { key: "home", path: "/" },
  { key: "apps", path: "/apps" },
  { key: "utilities", path: "/utilities" },
  { key: "useCases", path: "/use-cases" },
  { key: "docs", path: "/docs" },
  { key: "roadmap", path: "/roadmap" },
  { key: "about", path: "/about" },
  { key: "feedback", path: "/feedback" }
] as const;

export function Navbar({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  const dict = t(locale);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo locale={locale} />
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link key={item.key} href={localePath(locale, item.path)} className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-navy">
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher locale={locale} currentPath={currentPath} />
      </div>
    </header>
  );
}
