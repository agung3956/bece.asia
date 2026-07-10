"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  Eraser,
  FileArchive,
  FileJson,
  FileSearch,
  FileText,
  Gauge,
  Layers3,
  Lightbulb,
  ListTree,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  Trash2,
  Upload,
} from "lucide-react";

type FragmentStatus = "Draft" | "Review" | "Ready" | "Archived";
type SourceType = "CHM Export" | "HTML" | "Text" | "PDF Notes" | "Manual Notes";
type Language = "Indonesian" | "English" | "Mixed";
type Priority = "Low" | "Normal" | "High" | "Critical";

type DocFragment = {
  id: string;
  title: string;
  section: string;
  sourceType: SourceType;
  language: Language;
  content: string;
  tags: string;
  quality: number;
  hasTables: boolean;
  hasImages: boolean;
  needsTranslation: boolean;
  priority: Priority;
  status: FragmentStatus;
  owner: string;
  dueDate: string;
  notes: string;
  createdAt: string;
};

type StoredData = {
  fragments: DocFragment[];
};

type QualityLevel = {
  label: string;
  description: string;
  badgeClass: string;
  tone: "safe" | "medium" | "warning" | "danger";
};

type EnrichedFragment = DocFragment & {
  wordCount: number;
  readingMinutes: number;
  level: QualityLevel;
  tagList: string[];
  issues: string[];
  recommendation: string;
};

const STORAGE_KEY = "beceasia:documentation-viewer:v1";

const sourceTypes: SourceType[] = ["CHM Export", "HTML", "Text", "PDF Notes", "Manual Notes"];
const languages: Language[] = ["Indonesian", "English", "Mixed"];
const statuses: FragmentStatus[] = ["Draft", "Review", "Ready", "Archived"];
const priorities: Priority[] = ["Low", "Normal", "High", "Critical"];

const sampleFragments: DocFragment[] = [
  {
    id: "sample-1",
    title: "Getting Started Guide",
    section: "01. Introduction",
    sourceType: "CHM Export",
    language: "English",
    content: "This sample chapter explains the basic structure of a legacy help file after extraction. It contains a short overview, navigation notes, and a placeholder for screenshots that must be reviewed manually before publication.",
    tags: "onboarding, legacy, help",
    quality: 72,
    hasTables: false,
    hasImages: true,
    needsTranslation: true,
    priority: "High",
    status: "Review",
    owner: "Documentation Team",
    dueDate: "",
    notes: "Sample data only. Replace with safe public content.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    title: "Reference Table Notes",
    section: "04. Appendix",
    sourceType: "Text",
    language: "Mixed",
    content: "This section keeps table notes and terms that need quality control. Use it to mark missing rows, broken formatting, unclear abbreviations, and items that require validation before publishing.",
    tags: "appendix, table, qc",
    quality: 58,
    hasTables: true,
    hasImages: false,
    needsTranslation: false,
    priority: "Normal",
    status: "Draft",
    owner: "Reviewer A",
    dueDate: "",
    notes: "Check table format before export.",
    createdAt: new Date().toISOString(),
  },
];

function clamp(value: number) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(words: number) {
  return Math.max(1, Math.ceil(words / 220));
}

function qualityLevel(score: number): QualityLevel {
  if (score >= 85) return { label: "Publication Ready", description: "Struktur kuat, konten jelas, dan siap masuk paket dokumentasi modern.", badgeClass: "bg-teal/10 text-teal ring-teal/20", tone: "safe" };
  if (score >= 70) return { label: "Good Draft", description: "Konten sudah berguna. Perlu review kecil sebelum dipublikasikan.", badgeClass: "bg-emerald-100 text-emerald-700 ring-emerald-200", tone: "safe" };
  if (score >= 55) return { label: "Needs Review", description: "Konten dapat dipakai sebagai dasar, tetapi butuh perapian struktur dan validasi.", badgeClass: "bg-amber-100 text-amber-700 ring-amber-200", tone: "warning" };
  if (score >= 40) return { label: "Repair Zone", description: "Konten perlu diperbaiki sebelum layak masuk knowledge base.", badgeClass: "bg-orange-100 text-orange-700 ring-orange-200", tone: "medium" };
  return { label: "Critical Cleanup", description: "Konten belum layak. Perlu ekstraksi ulang atau penulisan ulang.", badgeClass: "bg-rose-100 text-rose-700 ring-rose-200", tone: "danger" };
}

function splitTags(value: string) {
  return value.split(/[;,]+/).map((item) => item.trim()).filter(Boolean);
}

function textFromForm(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function numberFromForm(form: FormData, key: string) {
  return clamp(Number(form.get(key) || 0));
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function htmlEscape(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function buildIssues(fragment: DocFragment) {
  const issues: string[] = [];
  if (fragment.content.trim().length < 120) issues.push("Konten terlalu pendek");
  if (fragment.quality < 60) issues.push("Skor kualitas rendah");
  if (fragment.hasImages) issues.push("Perlu cek gambar/screenshot");
  if (fragment.hasTables) issues.push("Perlu cek tabel");
  if (fragment.needsTranslation) issues.push("Perlu terjemahan");
  if (!fragment.tags.trim()) issues.push("Tag belum diisi");
  if (!fragment.section.trim()) issues.push("Section belum jelas");
  return issues;
}

function buildRecommendation(fragment: DocFragment, issues: string[]) {
  if (fragment.status === "Archived") return "Arsipkan sebagai referensi. Jangan jadikan konten utama kecuali sudah ditinjau ulang.";
  if (issues.includes("Skor kualitas rendah")) return "Prioritaskan perapian struktur, istilah, dan kejelasan langkah sebelum migrasi.";
  if (issues.includes("Perlu terjemahan")) return "Buat versi Indonesia ringkas, lalu validasi istilah teknis sebelum publikasi.";
  if (issues.includes("Perlu cek tabel")) return "Konversi tabel menjadi format responsif dan beri caption agar mudah dipahami di mobile.";
  if (issues.includes("Perlu cek gambar/screenshot")) return "Ganti screenshot lama dengan visual baru atau beri placeholder yang aman untuk publik.";
  if (fragment.quality >= 85) return "Masukkan ke paket publikasi dan hubungkan dengan daftar isi, pencarian, serta halaman referensi terkait.";
  return "Lanjutkan review editorial, tambahkan tag, dan hubungkan dengan section terkait.";
}

function enrich(fragment: DocFragment): EnrichedFragment {
  const words = wordCount(fragment.content);
  const issues = buildIssues(fragment);
  return {
    ...fragment,
    wordCount: words,
    readingMinutes: readingMinutes(words),
    level: qualityLevel(fragment.quality),
    tagList: splitTags(fragment.tags),
    issues,
    recommendation: buildRecommendation(fragment, issues),
  };
}

function buildBrief(fragment: EnrichedFragment) {
  return [
    `Judul: ${fragment.title}`,
    `Section: ${fragment.section || "Belum diisi"}`,
    `Sumber: ${fragment.sourceType}`,
    `Bahasa: ${fragment.language}`,
    `Status: ${fragment.status}`,
    `Quality score: ${fragment.quality} - ${fragment.level.label}`,
    `Estimasi baca: ${fragment.readingMinutes} menit`,
    `Tag: ${fragment.tagList.join(", ") || "Belum ada"}`,
    `Issue: ${fragment.issues.join(", ") || "Tidak ada"}`,
    `Rekomendasi: ${fragment.recommendation}`,
  ].join("\n");
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export function ChmDocumentationViewerClient() {
  const [fragments, setFragments] = useState<DocFragment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        setFragments(Array.isArray(parsed.fragments) ? parsed.fragments : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ fragments }));
  }, [loaded, fragments]);

  const enriched = useMemo(() => fragments.map(enrich), [fragments]);
  const selected = enriched.find((item) => item.id === selectedId) ?? enriched[0];

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase();
    return enriched.filter((item) => {
      const text = `${item.title} ${item.section} ${item.content} ${item.tags} ${item.owner}`.toLowerCase();
      const matchText = !keyword || text.includes(keyword);
      const matchFilter = filter === "All" || item.status === filter || item.sourceType === filter || item.language === filter || item.priority === filter || item.level.label === filter || item.tagList.includes(filter);
      return matchText && matchFilter;
    });
  }, [enriched, query, filter]);

  const summary = useMemo(() => {
    const total = enriched.length;
    const words = enriched.reduce((sum, item) => sum + item.wordCount, 0);
    const ready = enriched.filter((item) => item.quality >= 85 || item.status === "Ready").length;
    const review = enriched.filter((item) => item.status === "Review" || item.quality < 70).length;
    const issueCount = enriched.reduce((sum, item) => sum + item.issues.length, 0);
    const avgQuality = total === 0 ? 0 : Math.round(enriched.reduce((sum, item) => sum + item.quality, 0) / total);
    const overdue = enriched.filter((item) => item.dueDate && item.dueDate < todayIso() && item.status !== "Ready" && item.status !== "Archived").length;
    return { total, words, ready, review, issueCount, avgQuality, overdue };
  }, [enriched]);

  const uniqueTags = useMemo(() => Array.from(new Set(enriched.flatMap((item) => item.tagList))).slice(0, 12), [enriched]);

  function addFragment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const record: DocFragment = {
      id: crypto.randomUUID(),
      title: textFromForm(form, "title") || `Untitled Fragment ${fragments.length + 1}`,
      section: textFromForm(form, "section") || "Unsorted",
      sourceType: textFromForm(form, "sourceType") as SourceType,
      language: textFromForm(form, "language") as Language,
      content: textFromForm(form, "content"),
      tags: textFromForm(form, "tags"),
      quality: numberFromForm(form, "quality"),
      hasTables: form.get("hasTables") === "on",
      hasImages: form.get("hasImages") === "on",
      needsTranslation: form.get("needsTranslation") === "on",
      priority: textFromForm(form, "priority") as Priority,
      status: textFromForm(form, "status") as FragmentStatus,
      owner: textFromForm(form, "owner") || "Reviewer",
      dueDate: textFromForm(form, "dueDate"),
      notes: textFromForm(form, "notes"),
      createdAt: new Date().toISOString(),
    };
    setFragments((previous) => [record, ...previous]);
    setSelectedId(record.id);
    event.currentTarget.reset();
  }

  function updateFragment(id: string, patch: Partial<DocFragment>) {
    setFragments((previous) => previous.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function removeFragment(id: string) {
    setFragments((previous) => previous.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function loadSample() {
    setFragments(sampleFragments);
    setSelectedId(sampleFragments[0]?.id ?? null);
  }

  function clearWorkspace() {
    setFragments([]);
    setSelectedId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ fragments }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "documentation-viewer-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Title", "Section", "Source", "Language", "Quality", "Level", "Status", "Priority", "Words", "Issues", "Recommendation", "Tags"];
    const rows = enriched.map((item) => [
      item.title,
      item.section,
      item.sourceType,
      item.language,
      String(item.quality),
      item.level.label,
      item.status,
      item.priority,
      String(item.wordCount),
      item.issues.join(" | "),
      item.recommendation,
      item.tagList.join(" | "),
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "documentation-viewer-recap.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportHtml() {
    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Documentation Pack</title><style>body{font-family:Arial,sans-serif;line-height:1.6;max-width:920px;margin:40px auto;padding:0 20px;color:#111827}article{border-top:1px solid #e5e7eb;padding:24px 0}h1,h2{color:#001B4D}.meta{color:#64748b;font-size:13px}</style></head><body><h1>Documentation Pack</h1>${enriched.map((item) => `<article><h2>${htmlEscape(item.title)}</h2><p class="meta">${htmlEscape(item.section)} · ${htmlEscape(item.sourceType)} · ${htmlEscape(item.status)} · Quality ${item.quality}</p><p>${htmlEscape(item.content).replaceAll("\n", "<br>")}</p></article>`).join("")}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "documentation-pack.html";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setFragments(Array.isArray(parsed.fragments) ? parsed.fragments : []);
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

  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">Document Workflow</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">CHM Documentation Viewer</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
                Workspace modern untuk mengubah dokumentasi lama menjadi knowledge base yang searchable, terstruktur, tervalidasi, dan siap dipublikasikan secara aman.
              </p>
            </div>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-xs font-bold text-violet-700">Migration Lab</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Format" value="CHM / HTML / Text" />
            <InfoCard label="Scope" value="Documentation QA" />
            <InfoCard label="Update" value="2026-07-10" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>
                Tool ini tidak mengekstrak file CHM langsung dari browser. Gunakan hasil ekspor CHM ke HTML/text, lalu tempelkan fragmen aman di sini. Data tersimpan lokal di browser dan tidak dikirim ke server.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <MetricCard icon={FileText} label="Fragmen" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={Gauge} label="Kualitas rata-rata" value={`${summary.avgQuality}`} tone={summary.avgQuality >= 70 ? "safe" : summary.avgQuality >= 55 ? "warning" : "danger"} />
          <MetricCard icon={BookOpenCheck} label="Ready" value={`${summary.ready}`} tone="safe" />
          <MetricCard icon={FileSearch} label="Perlu review" value={`${summary.review}`} tone={summary.review === 0 ? "safe" : "warning"} />
          <MetricCard icon={AlertIcon} label="Issue" value={`${summary.issueCount}`} tone={summary.issueCount === 0 ? "safe" : "danger"} />
          <MetricCard icon={ClipboardList} label="Total kata" value={`${summary.words}`} tone="neutral" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Knowledge Command Center" icon={BrainCircuit}>
            {selected ? <CommandCenter fragment={selected} onUpdate={updateFragment} onCopy={copyBrief} copied={copied} /> : <EmptyState title="Belum ada fragmen" description="Tambahkan fragmen dokumentasi atau muat contoh untuk melihat command center." />}
          </Panel>

          <Panel title="Tambah fragmen dokumentasi" icon={Plus}>
            <FragmentForm onSubmit={addFragment} />
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Smart Index & Tags" icon={ListTree}>
            {enriched.length === 0 ? (
              <EmptyState title="Index belum tersedia" description="Tambahkan konten untuk membangun tag, section, dan peta kualitas dokumentasi." />
            ) : (
              <SmartIndex fragments={enriched} tags={uniqueTags} onFilter={setFilter} />
            )}
          </Panel>

          <Panel title="Documentation Workspace" icon={FileArchive}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, section, isi, tag, owner" className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-teal/20 focus:ring-4" />
              </div>
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
                <option>All</option>
                {statuses.map((item) => <option key={item}>{item}</option>)}
                {sourceTypes.map((item) => <option key={item}>{item}</option>)}
                {languages.map((item) => <option key={item}>{item}</option>)}
                {priorities.map((item) => <option key={item}>{item}</option>)}
                <option>Publication Ready</option>
                <option>Good Draft</option>
                <option>Needs Review</option>
                <option>Repair Zone</option>
              </select>
              <button onClick={loadSample} className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2.5 text-sm font-bold text-white"><Layers3 size={16} /> Contoh</button>
              <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white"><Download size={16} /> JSON</button>
              <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200"><ArrowDownToLine size={16} /> CSV</button>
              <button onClick={exportHtml} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200"><FileJson size={16} /> HTML</button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200">
                <Upload size={16} /> Import
                <input type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
              </label>
              <button onClick={clearWorkspace} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 ring-1 ring-rose-100"><Eraser size={16} /> Bersihkan</button>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="Belum ada data" description="Tambahkan fragmen dokumentasi atau klik Contoh untuk mencoba search, smart index, dan quality control." />
            ) : (
              <FragmentTable fragments={filtered} selectedId={selectedId} onSelect={setSelectedId} onRemove={removeFragment} />
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function FragmentForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="title" label="Judul" placeholder="Judul topik" />
        <TextInput name="section" label="Section" placeholder="Contoh: 01. Getting Started" />
        <SelectText name="sourceType" label="Sumber" options={sourceTypes} defaultValue="CHM Export" />
        <SelectText name="language" label="Bahasa" options={languages} defaultValue="Mixed" />
        <SelectText name="priority" label="Prioritas" options={priorities} defaultValue="Normal" />
        <SelectText name="status" label="Status" options={statuses} defaultValue="Draft" />
        <TextInput name="owner" label="Reviewer/owner" placeholder="Reviewer" />
        <TextInput name="dueDate" label="Target review" type="date" />
      </div>
      <TextArea name="content" label="Konten hasil ekstraksi" placeholder="Tempelkan teks hasil ekspor CHM/HTML di sini" rows={6} />
      <TextInput name="tags" label="Tag" placeholder="panduan, instalasi, konfigurasi" />
      <ScoreInput name="quality" label="Skor kualitas awal" defaultValue={60} />
      <div className="grid gap-3 sm:grid-cols-3">
        <CheckInput name="hasTables" label="Ada tabel" />
        <CheckInput name="hasImages" label="Ada gambar" />
        <CheckInput name="needsTranslation" label="Perlu terjemahan" />
      </div>
      <TextArea name="notes" label="Catatan QC" placeholder="Catatan validasi, istilah, atau perbaikan" rows={3} />
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Plus size={18} /> Tambah fragmen
      </button>
    </form>
  );
}

function CommandCenter({ fragment, onUpdate, onCopy, copied }: { fragment: EnrichedFragment; onUpdate: (id: string, patch: Partial<DocFragment>) => void; onCopy: () => void; copied: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Selected Fragment</p>
            <h2 className="mt-2 text-3xl font-black">{fragment.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{fragment.section} · {fragment.sourceType}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-teal">{fragment.quality}</p>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">Quality</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{fragment.level.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Estimasi baca" value={`${fragment.readingMinutes} menit`} />
        <InfoPill label="Jumlah kata" value={`${fragment.wordCount}`} />
        <InfoPill label="Status" value={fragment.status} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-2 text-sm font-black text-navy"><Sparkles size={18} className="text-teal" /> Magic Recommendation</div>
        <p className="mt-3 text-sm leading-6 text-slate-700">{fragment.recommendation}</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-black text-navy">Quality flags</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {fragment.issues.length === 0 ? <StatusBadge text="No issue" tone="safe" /> : fragment.issues.map((issue) => <StatusBadge key={issue} text={issue} tone="warning" />)}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InlineSelect label="Status" value={fragment.status} options={statuses} onChange={(value) => onUpdate(fragment.id, { status: value as FragmentStatus })} />
        <InlineSelect label="Prioritas" value={fragment.priority} options={priorities} onChange={(value) => onUpdate(fragment.id, { priority: value as Priority })} />
      </div>

      <button onClick={onCopy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Copy size={18} /> {copied ? "Brief tersalin" : "Salin smart brief"}
      </button>
    </div>
  );
}

function SmartIndex({ fragments, tags, onFilter }: { fragments: EnrichedFragment[]; tags: string[]; onFilter: (value: string) => void }) {
  const sections = Array.from(new Set(fragments.map((item) => item.section || "Unsorted"))).slice(0, 10);
  const ready = fragments.filter((item) => item.quality >= 85).length;
  const repair = fragments.filter((item) => item.quality < 55).length;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Section" value={`${sections.length}`} />
        <InfoPill label="Ready" value={`${ready}`} />
        <InfoPill label="Repair" value={`${repair}`} />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="flex items-center gap-2 text-sm font-black text-navy"><ListTree size={18} className="text-teal" /> Section Map</p>
        <div className="mt-4 grid gap-2">
          {sections.map((section) => {
            const count = fragments.filter((item) => (item.section || "Unsorted") === section).length;
            return <div key={section} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm"><span className="font-bold text-navy">{section}</span><span className="text-slate-500">{count} item</span></div>;
          })}
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-black text-navy"><Tags size={18} className="text-teal" /> Tag Atlas</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.length === 0 ? <StatusBadge text="No tag" tone="neutral" /> : tags.map((tag) => <button key={tag} onClick={() => onFilter(tag)} className="rounded-full bg-teal/10 px-3 py-1 text-xs font-black text-teal ring-1 ring-teal/20">{tag}</button>)}
        </div>
      </div>
    </div>
  );
}

function FragmentTable({ fragments, selectedId, onSelect, onRemove }: { fragments: EnrichedFragment[]; selectedId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Dokumen</th>
              <th className="px-4 py-3">Kualitas</th>
              <th className="px-4 py-3">QC</th>
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {fragments.map((item) => (
              <tr key={item.id} className={selectedId === item.id ? "bg-teal/5" : ""}>
                <td className="px-4 py-4 align-top">
                  <button onClick={() => onSelect(item.id)} className="text-left">
                    <p className="font-black text-navy">{item.title}</p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{item.section} · {item.sourceType} · {item.wordCount} kata</p>
                  </button>
                </td>
                <td className="px-4 py-4 align-top"><QualityBadge score={item.quality} level={item.level} /></td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{item.issues.slice(0, 2).join(" · ") || "Clear"}</td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{item.tagList.slice(0, 3).join(", ") || "-"}</td>
                <td className="px-4 py-4 align-top"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item.status}</span></td>
                <td className="px-4 py-4 align-top text-right">
                  <button onClick={() => onRemove(item.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus fragmen"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "safe" | "warning" | "danger" | "neutral" }) {
  const toneClass = tone === "safe" ? "bg-teal/10 text-teal" : tone === "danger" ? "bg-rose-50 text-rose-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-navy";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}><Icon size={21} /></div>
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
      <p className="mt-2 font-bold text-navy">{value}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <FileSearch className="mx-auto text-slate-400" size={32} />
      <h3 className="mt-3 text-lg font-black text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function TextInput({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder?: string; type?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input name={name} type={type} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}

function TextArea({ name, label, placeholder, rows = 3 }: { name: string; label: string; placeholder?: string; rows?: number }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <textarea name={name} rows={rows} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}

function SelectText({ name, label, options, defaultValue }: { name: string; label: string; options: string[]; defaultValue?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue ?? options[0]} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ScoreInput({ name, label, defaultValue }: { name: string; label: string; defaultValue: number }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input name={name} type="number" min="0" max="100" defaultValue={defaultValue} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}

function CheckInput({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-navy">
      <input name={name} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal" />
      {label}
    </label>
  );
}

function InlineSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold normal-case tracking-normal text-navy outline-none ring-teal/20 focus:ring-4">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function QualityBadge({ score, level }: { score: number; level: QualityLevel }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${level.badgeClass}`}>{score} · {level.label}</span>;
}

function StatusBadge({ text, tone }: { text: string; tone: "safe" | "warning" | "neutral" }) {
  const cls = tone === "safe" ? "bg-teal/10 text-teal ring-teal/20" : tone === "warning" ? "bg-amber-100 text-amber-700 ring-amber-200" : "bg-slate-100 text-slate-600 ring-slate-200";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${cls}`}>{text}</span>;
}

const AlertIcon = Lightbulb;
