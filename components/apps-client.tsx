"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { AppItem, Locale } from "@/data/apps";
import { localized } from "@/data/apps";
import { categories } from "@/data/categories";
import { t } from "@/data/i18n-safe";
import { AppGrid } from "./app-grid";

export function AppsClient({ apps, locale }: { apps: AppItem[]; locale: Locale }) {
  const dict = t(locale);
  const copy = {
    viewApps: locale === "en" ? "View apps" : locale === "zh" ? "\u67e5\u770b\u5e94\u7528" : "Lihat aplikasi",
    backToCategories: locale === "en" ? "Back to categories" : locale === "zh" ? "\u8fd4\u56de\u5206\u7c7b" : "Kembali ke kategori"
  };
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() => {
    if (typeof window === "undefined") return "all";
    const selectedCategory = new URLSearchParams(window.location.search).get("category");
    if (selectedCategory && categories.some((item) => item.key === selectedCategory)) {
      return selectedCategory;
    }
    return "all";
  });

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesCategory = category === "all" || app.category === category;
      const haystack = [localized(app.name, locale), localized(app.tagline, locale), localized(app.description, locale), app.category, app.scope, app.region, ...app.tags].join(" ").toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [apps, category, locale, query]);

  const categoryCounts = useMemo(() => {
    return categories.map((item) => ({
      ...item,
      count: apps.filter((app) => app.category === item.key).length
    })).filter((item) => item.count > 0);
  }, [apps]);

  const chooseCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    const url = new URL(window.location.href);
    if (nextCategory === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", nextCategory);
    }
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={dict.apps.search} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/10" />
          </label>
          <select value={category} onChange={(event) => chooseCategory(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/10">
            <option value="all">{dict.apps.allCategories}</option>
            {categories.map((item) => (
              <option key={item.key} value={item.key}>{localized(item.label, locale)}</option>
            ))}
          </select>
        </div>
      </div>

      {category === "all" && !query.trim() ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryCounts.map((item) => (
            <button key={item.key} onClick={() => chooseCategory(item.key)} className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-teal/40 hover:shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">{dict.apps.category}</p>
                  <h2 className="mt-2 text-2xl font-black text-navy">{localized(item.label, locale)}</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item.count}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{localized(item.description, locale)}</p>
              <span className="mt-5 inline-flex rounded-full bg-navy px-4 py-2 text-sm font-bold text-white transition group-hover:bg-navy-light">
                {copy.viewApps}
              </span>
            </button>
          ))}
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="space-y-5">
          {category !== "all" ? (
            <button onClick={() => chooseCategory("all")} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-navy transition hover:border-teal">
              {copy.backToCategories}
            </button>
          ) : null}
          <AppGrid apps={filteredApps} locale={locale} />
        </div>
      ) : <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">{dict.apps.noResult}</div>}
    </div>
  );
}
