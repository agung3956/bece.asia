"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AppItem, Locale } from "@/data/apps";
import { categories } from "@/data/categories";
import { t } from "@/data/i18n";
import { AppGrid } from "./app-grid";

export function AppsClient({ apps, locale }: { apps: AppItem[]; locale: Locale }) {
  const dict = t(locale);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const selectedCategory = new URLSearchParams(window.location.search).get("category");
    if (selectedCategory && categories.some((item) => item.key === selectedCategory)) {
      setCategory(selectedCategory);
    }
  }, []);

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesCategory = category === "all" || app.category === category;
      const haystack = [app.name[locale], app.tagline[locale], app.description[locale], app.category, app.scope, app.region, ...app.tags].join(" ").toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [apps, category, locale, query]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={dict.apps.search} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/10" />
          </label>
          <select value={category} onChange={(event) => {
            const nextCategory = event.target.value;
            setCategory(nextCategory);
            const url = new URL(window.location.href);
            if (nextCategory === "all") {
              url.searchParams.delete("category");
            } else {
              url.searchParams.set("category", nextCategory);
            }
            window.history.replaceState(null, "", url);
          }} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/10">
            <option value="all">{dict.apps.allCategories}</option>
            {categories.map((item) => (
              <option key={item.key} value={item.key}>{item.label[locale]}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredApps.length > 0 ? <AppGrid apps={filteredApps} locale={locale} /> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">{dict.apps.noResult}</div>}
    </div>
  );
}
