"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownToLine,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Download,
  Eraser,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Globe2,
  HelpCircle,
  Layers3,
  Link2,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  Upload,
} from "lucide-react";

type ScrapeMode = "google-news" | "rss" | "urls";
type Sentiment = "positive" | "neutral" | "negative";
type Priority = "Low" | "Normal" | "High" | "Critical";

type ScrapedItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  excerpt: string;
};

type NewsRecord = ScrapedItem & {
  query: string;
  sentiment: Sentiment;
  score: number;
  priority: Priority;
  positiveHits: string[];
  negativeHits: string[];
  neutralHits: string[];
  tags: string[];
  note: string;
  capturedAt: string;
};

type StoredData = {
  records: NewsRecord[];
  rules: SentimentRules;
};

type SentimentRules = {
  positive: string;
  negative: string;
  neutral: string;
};

type Tone = "safe" | "warning" | "danger" | "neutral" | "prime";

const STORAGE_KEY = "beceasia:general-news-scraper:v1";

const defaultRules: SentimentRules = {
  positive: "apresiasi, penghargaan, berhasil, sukses, tumbuh, meningkat, inovasi, kolaborasi, ekspor naik, investasi, peluang, dukungan, prestasi, pulih, kuat, positif",
  negative: "korupsi, tersangka, gagal, turun, rugi, konflik, krisis, protes, demo, keluhan, penipuan, penahanan, pelanggaran, masalah, terhambat, negatif, kecelakaan, kebocoran",
  neutral: "menjelaskan, menyampaikan, mengumumkan, rencana, agenda, rapat, aturan, kebijakan, data, laporan, sosialisasi, jadwal, informasi",
};

const sampleRecords: NewsRecord[] = [
  {
    id: "sample-1",
    title: "Program pelatihan digital membuka peluang baru untuk pelaku usaha lokal",
    source: "sample.local",
    url: "https://example.com/positive-sample",
    publishedAt: new Date().toISOString(),
    excerpt: "Pelatihan digital dinilai berhasil meningkatkan kesiapan peserta dan membuka peluang kolaborasi lintas komunitas.",
    query: "pelatihan digital UMKM",
    sentiment: "positive",
    score: 3,
    priority: "Normal",
    positiveHits: ["berhasil", "meningkat", "peluang", "kolaborasi"],
    negativeHits: [],
    neutralHits: [],
    tags: ["learning", "business"],
    note: "Contoh data publik.",
    capturedAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    title: "Sejumlah pengguna mengeluhkan gangguan layanan aplikasi publik",
    source: "sample.local",
    url: "https://example.com/negative-sample",
    publishedAt: new Date().toISOString(),
    excerpt: "Keluhan muncul setelah layanan sempat gagal diakses selama beberapa jam dan memicu respons perbaikan teknis.",
    query: "gangguan layanan aplikasi",
    sentiment: "negative",
    score: -4,
    priority: "High",
    positiveHits: [],
    negativeHits: ["keluhan", "gagal", "gangguan"],
    neutralHits: [],
    tags: ["service", "risk"],
    note: "Contoh data publik.",
    capturedAt: new Date().toISOString(),
  },
];

function splitKeywords(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function countHits(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.filter((keyword) => lower.includes(keyword));
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function normalizeUrlList(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function classifyPriority(sentiment: Sentiment, score: number) {
  if (sentiment === "negative" && score <= -4) return "Critical";
  if (sentiment === "negative") return "High";
  if (sentiment === "positive" && score >= 4) return "Normal";
  return "Low";
}

function analyzeItem(item: ScrapedItem, query: string, rules: SentimentRules): NewsRecord {
  const text = `${item.title} ${item.excerpt}`;
  const positiveHits = countHits(text, splitKeywords(rules.positive));
  const negativeHits = countHits(text, splitKeywords(rules.negative));
  const neutralHits = countHits(text, splitKeywords(rules.neutral));
  const score = positiveHits.length - negativeHits.length;
  const sentiment: Sentiment = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
  return {
    ...item,
    query,
    sentiment,
    score,
    priority: classifyPriority(sentiment, score),
    positiveHits,
    negativeHits,
    neutralHits,
    tags: [sentiment, item.source].filter(Boolean),
    note: "",
    capturedAt: new Date().toISOString(),
  };
}

function sentimentLabel(value: Sentiment) {
  if (value === "positive") return "Positif";
  if (value === "negative") return "Negatif";
  return "Netral";
}

function sentimentTone(value: Sentiment): Tone {
  if (value === "positive") return "safe";
  if (value === "negative") return "danger";
  return "neutral";
}

function toneClass(tone: Tone) {
  if (tone === "safe") return "bg-teal/10 text-teal ring-teal/20";
  if (tone === "danger") return "bg-rose-100 text-rose-700 ring-rose-200";
  if (tone === "warning") return "bg-amber-100 text-amber-700 ring-amber-200";
  if (tone === "prime") return "bg-violet-50 text-violet-700 ring-violet-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function buildBrief(record: NewsRecord) {
  return [
    `Judul: ${record.title}`,
    `Sumber: ${record.source}`,
    `Kategori: ${sentimentLabel(record.sentiment)}`,
    `Skor: ${record.score}`,
    `Kata positif: ${record.positiveHits.join(", ") || "-"}`,
    `Kata negatif: ${record.negativeHits.join(", ") || "-"}`,
    `Ringkasan: ${record.excerpt || "-"}`,
    `URL: ${record.url}`,
  ].join("\n");
}

export function EwsDashboardClient() {
  const [records, setRecords] = useState<NewsRecord[]>([]);
  const [rules, setRules] = useState<SentimentRules>(defaultRules);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<ScrapeMode>("google-news");
  const [query, setQuery] = useState("ekonomi indonesia");
  const [rssUrl, setRssUrl] = useState("");
  const [urlList, setUrlList] = useState("");
  const [limit, setLimit] = useState(20);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        setRecords(Array.isArray(parsed.records) ? parsed.records : []);
        setRules(parsed.rules ?? defaultRules);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ records, rules }));
  }, [loaded, records, rules]);

  const filtered = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return records.filter((item) => {
      const text = `${item.title} ${item.source} ${item.excerpt} ${item.query}`.toLowerCase();
      const matchText = !keyword || text.includes(keyword);
      const matchFilter = filter === "All" || item.sentiment === filter || item.priority === filter || item.source === filter;
      return matchText && matchFilter;
    });
  }, [records, searchTerm, filter]);

  const selected = records.find((item) => item.id === selectedId) ?? filtered[0] ?? records[0];

  const summary = useMemo(() => {
    const total = records.length;
    const positive = records.filter((item) => item.sentiment === "positive").length;
    const neutral = records.filter((item) => item.sentiment === "neutral").length;
    const negative = records.filter((item) => item.sentiment === "negative").length;
    const critical = records.filter((item) => item.priority === "Critical" || item.priority === "High").length;
    const sources = new Set(records.map((item) => item.source)).size;
    const avgScore = total === 0 ? 0 : Math.round(records.reduce((sum, item) => sum + item.score, 0) / total);
    return { total, positive, neutral, negative, critical, sources, avgScore };
  }, [records]);

  async function runScrape(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setStatusText("Mengambil data berita...");
    try {
      const response = await fetch("/api/news-scraper", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          query,
          rssUrl,
          urls: normalizeUrlList(urlList),
          limit,
        }),
      });
      const payload = await response.json() as { items?: ScrapedItem[]; error?: string };
      if (!response.ok || payload.error) throw new Error(payload.error ?? "Scraping gagal.");
      const next = (payload.items ?? []).map((item) => analyzeItem(item, query, rules));
      setRecords((previous) => {
        const seen = new Set(previous.map((item) => item.url || item.title));
        const fresh = next.filter((item) => !seen.has(item.url || item.title));
        return [...fresh, ...previous];
      });
      setSelectedId(next[0]?.id ?? null);
      setStatusText(`Selesai. ${next.length} item diproses.`);
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Scraping gagal.");
    } finally {
      setLoading(false);
    }
  }

  function removeRecord(id: string) {
    setRecords((previous) => previous.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function clearWorkspace() {
    setRecords([]);
    setSelectedId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function loadSample() {
    setRecords(sampleRecords);
    setSelectedId(sampleRecords[0]?.id ?? null);
  }

  function reanalyzeAll() {
    setRecords((previous) => previous.map((item) => analyzeItem(item, item.query, rules)));
    setStatusText("Seluruh item dianalisis ulang memakai kriteria terbaru.");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ records, rules }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "general-news-scraper-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Captured", "Query", "Sentiment", "Score", "Priority", "Source", "Title", "Excerpt", "Positive Hits", "Negative Hits", "URL"];
    const rows = records.map((item) => [
      item.capturedAt,
      item.query,
      sentimentLabel(item.sentiment),
      String(item.score),
      item.priority,
      item.source,
      item.title,
      item.excerpt,
      item.positiveHits.join(" | "),
      item.negativeHits.join(" | "),
      item.url,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "general-news-scraper-recap.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setRecords(Array.isArray(parsed.records) ? parsed.records : []);
        setRules(parsed.rules ?? defaultRules);
      } catch {
        alert("File JSON tidak dapat dibaca.");
      }
    };
    reader.readAsText(file);
  }

  async function copyBrief() {
    if (!selected) return;
    await navigator.clipboard.writeText(buildBrief(selected));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const uniqueSources = Array.from(new Set(records.map((item) => item.source))).filter(Boolean);

  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">General Intelligence</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">News Scraper Dashboard</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
                Workspace umum untuk mengambil berita dari query, RSS, atau daftar URL, lalu mengelompokkan hasil menjadi positif, netral, dan negatif berdasarkan kriteria kata kunci yang Anda tentukan.
              </p>
            </div>
            <span className="rounded-full border border-teal/30 bg-teal/10 px-4 py-1 text-xs font-bold text-teal">Public Scraper</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Fokus" value="Scraping Berita Umum" />
            <InfoCard label="Mode" value="Query, RSS, URL" />
            <InfoCard label="Kategori" value="Positif · Netral · Negatif" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>
                Gunakan untuk monitoring informasi publik. Jangan gunakan untuk mengambil data berbayar, data privat, data login, atau situs yang melarang pengambilan otomatis. Hasil klasifikasi bersifat indikatif dan tetap perlu review manusia.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <MetricCard icon={ClipboardList} label="Total" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={CheckCircle2} label="Positif" value={`${summary.positive}`} tone="safe" />
          <MetricCard icon={Filter} label="Netral" value={`${summary.neutral}`} tone="neutral" />
          <MetricCard icon={AlertTriangle} label="Negatif" value={`${summary.negative}`} tone={summary.negative === 0 ? "safe" : "danger"} />
          <MetricCard icon={Target} label="Prioritas" value={`${summary.critical}`} tone={summary.critical === 0 ? "safe" : "warning"} />
          <MetricCard icon={Globe2} label="Sumber" value={`${summary.sources}`} tone="prime" />
          <MetricCard icon={BarChart3} label="Avg score" value={`${summary.avgScore}`} tone={summary.avgScore >= 0 ? "safe" : "danger"} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Scraper Control" icon={Search}>
            <form onSubmit={runScrape} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  <span>Mode scraping</span>
                  <select value={mode} onChange={(event) => setMode(event.target.value as ScrapeMode)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4">
                    <option value="google-news">Search query</option>
                    <option value="rss">RSS feed</option>
                    <option value="urls">Daftar URL</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  <span>Limit</span>
                  <input type="number" min="1" max="50" value={limit} onChange={(event) => setLimit(Number(event.target.value || 20))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
                </label>
                <div className="flex items-end">
                  <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    Jalankan scraping
                  </button>
                </div>
              </div>

              {mode === "google-news" ? (
                <TextInput label="Search criteria / query" value={query} onChange={setQuery} placeholder="Contoh: ekonomi Indonesia, UMKM ekspor, teknologi AI" />
              ) : null}
              {mode === "rss" ? (
                <TextInput label="RSS URL" value={rssUrl} onChange={setRssUrl} placeholder="https://example.com/rss" />
              ) : null}
              {mode === "urls" ? (
                <TextAreaInput label="Daftar URL berita" value={urlList} onChange={setUrlList} placeholder="Satu URL per baris" />
              ) : null}

              {statusText ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">{statusText}</p> : null}
            </form>
          </Panel>

          <Panel title="Sentiment Criteria" icon={SlidersHorizontal}>
            <div className="space-y-4">
              <TextAreaInput label="Kata kunci positif" value={rules.positive} onChange={(value) => setRules((previous) => ({ ...previous, positive: value }))} />
              <TextAreaInput label="Kata kunci negatif" value={rules.negative} onChange={(value) => setRules((previous) => ({ ...previous, negative: value }))} />
              <TextAreaInput label="Kata kunci netral" value={rules.neutral} onChange={(value) => setRules((previous) => ({ ...previous, neutral: value }))} />
              <button onClick={reanalyzeAll} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3 text-sm font-black text-white">
                <Sparkles size={18} /> Analisis ulang semua berita
              </button>
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Analysis Brief" icon={BrainCircuit}>
            {selected ? <AnalysisBrief record={selected} onCopy={copyBrief} copied={copied} /> : <EmptyState title="Belum ada berita" description="Jalankan scraping atau muat contoh data untuk melihat brief klasifikasi." />}
          </Panel>

          <Panel title="News Workspace" icon={FileSpreadsheet}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Cari judul, sumber, ringkasan, query" className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-teal/20 focus:ring-4" />
              </div>
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
                <option>All</option>
                <option value="positive">Positif</option>
                <option value="neutral">Netral</option>
                <option value="negative">Negatif</option>
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Critical</option>
                {uniqueSources.map((source) => <option key={source}>{source}</option>)}
              </select>
              <button onClick={loadSample} className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2.5 text-sm font-bold text-white"><Layers3 size={16} /> Contoh</button>
              <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white"><Download size={16} /> JSON</button>
              <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200"><ArrowDownToLine size={16} /> CSV</button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200">
                <Upload size={16} /> Import
                <input type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
              </label>
              <button onClick={clearWorkspace} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 ring-1 ring-rose-100"><Eraser size={16} /> Bersihkan</button>
            </div>
            {filtered.length === 0 ? <EmptyState title="Belum ada hasil" description="Masukkan search criteria, RSS feed, atau daftar URL untuk mulai membuat daftar monitoring berita." /> : <NewsTable records={filtered} selectedId={selected?.id ?? null} onSelect={setSelectedId} onRemove={removeRecord} />}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function AnalysisBrief({ record, onCopy, copied }: { record: NewsRecord; onCopy: () => void; copied: boolean }) {
  const tone = sentimentTone(record.sentiment);
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Selected article</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">{record.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{record.source} · {formatDate(record.publishedAt)}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${toneClass(tone)}`}>{sentimentLabel(record.sentiment)}</span>
        </div>
        <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{record.excerpt || "Tidak ada excerpt."}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Score" value={`${record.score}`} />
        <InfoPill label="Priority" value={record.priority} />
        <InfoPill label="Query" value={record.query || "-"} />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
        <p className="font-black text-navy">Keyword hits</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <KeywordBox label="Positif" items={record.positiveHits} tone="safe" />
          <KeywordBox label="Netral" items={record.neutralHits} tone="neutral" />
          <KeywordBox label="Negatif" items={record.negativeHits} tone="danger" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={onCopy} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
          <Sparkles size={18} /> {copied ? "Brief tersalin" : "Salin brief"}
        </button>
        <a href={record.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-navy ring-1 ring-slate-200 transition hover:bg-slate-50">
          <ExternalLink size={18} /> Buka sumber
        </a>
      </div>
    </div>
  );
}

function NewsTable({ records, selectedId, onSelect, onRemove }: { records: NewsRecord[]; selectedId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Berita</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Sumber</th>
              <th className="px-4 py-3">Query</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {records.map((record) => (
              <tr key={record.id} className={selectedId === record.id ? "bg-teal/5" : ""}>
                <td className="px-4 py-4 align-top">
                  <button onClick={() => onSelect(record.id)} className="text-left">
                    <p className="max-w-xl font-black text-navy">{record.title}</p>
                    <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-5 text-slate-500">{record.excerpt || "-"}</p>
                  </button>
                </td>
                <td className="px-4 py-4 align-top"><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${toneClass(sentimentTone(record.sentiment))}`}>{sentimentLabel(record.sentiment)}</span></td>
                <td className="px-4 py-4 align-top font-black text-navy">{record.score}</td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{record.source}<br />{formatDate(record.publishedAt)}</td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{record.query || "-"}</td>
                <td className="px-4 py-4 align-top text-right">
                  <button onClick={() => onRemove(record.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus berita"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeywordBox({ label, items, tone }: { label: string; items: string[]; tone: Tone }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length === 0 ? <span className="text-xs text-slate-500">Tidak ada</span> : items.map((item) => <span key={item} className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${toneClass(tone)}`}>{item}</span>)}
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal/10 text-teal"><Icon size={20} /></div>
        <h2 className="text-xl font-black text-navy">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  const background = tone === "safe" ? "bg-teal/10 text-teal" : tone === "danger" ? "bg-rose-50 text-rose-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : tone === "prime" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-navy";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${background}`}><Icon size={21} /></div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black text-navy">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 font-black text-navy">{value}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-navy">{value}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <HelpCircle className="mx-auto text-slate-400" size={32} />
      <h3 className="mt-3 text-lg font-black text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}

function TextAreaInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}
