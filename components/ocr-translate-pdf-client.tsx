"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownToLine,
  BookOpenText,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  Eraser,
  FileJson,
  FileSearch,
  FileText,
  Gauge,
  Languages,
  Layers3,
  Lightbulb,
  Plus,
  ScanText,
  Search,
  ShieldCheck,
  Sparkles,
  SplitSquareVertical,
  Tags,
  Trash2,
  Upload,
} from "lucide-react";

type SegmentStatus = "Raw OCR" | "Translated" | "Review" | "Ready" | "Archived";
type Priority = "Low" | "Normal" | "High" | "Critical";
type SourceType = "PDF OCR" | "Scanned PDF" | "Text Extract" | "Manual Paste" | "Translation Draft";
type LanguagePair = "EN-ID" | "ID-EN" | "Mixed-ID" | "Other";

type Segment = {
  id: string;
  documentTitle: string;
  pageLabel: string;
  sourceType: SourceType;
  languagePair: LanguagePair;
  sourceText: string;
  translationText: string;
  confidence: number;
  terms: string;
  status: SegmentStatus;
  priority: Priority;
  reviewer: string;
  dueDate: string;
  notes: string;
  createdAt: string;
};

type StoredData = {
  segments: Segment[];
};

type QualityLevel = {
  label: string;
  description: string;
  tone: "safe" | "medium" | "warning" | "danger";
  badgeClass: string;
};

type EnrichedSegment = Segment & {
  sourceWords: number;
  translationWords: number;
  completion: number;
  issues: string[];
  level: QualityLevel;
  tagList: string[];
  recommendation: string;
  readingMinutes: number;
};

const STORAGE_KEY = "beceasia:ocr-translate-pdf:v1";

const statuses: SegmentStatus[] = ["Raw OCR", "Translated", "Review", "Ready", "Archived"];
const priorities: Priority[] = ["Low", "Normal", "High", "Critical"];
const sourceTypes: SourceType[] = ["PDF OCR", "Scanned PDF", "Text Extract", "Manual Paste", "Translation Draft"];
const languagePairs: LanguagePair[] = ["EN-ID", "ID-EN", "Mixed-ID", "Other"];

const sampleSegments: Segment[] = [
  {
    id: "sample-1",
    documentTitle: "Sample Technical PDF",
    pageLabel: "Page 1",
    sourceType: "PDF OCR",
    languagePair: "EN-ID",
    sourceText: "This sample paragraph represents OCR output from a scanned technical PDF. It contains a few terms that should be checked before translation, including customs, classification, and supporting documents.",
    translationText: "Paragraf contoh ini mewakili keluaran OCR dari PDF teknis hasil pindai. Teks ini memuat beberapa istilah yang perlu diperiksa sebelum terjemahan, termasuk kepabeanan, klasifikasi, dan dokumen pendukung.",
    confidence: 82,
    terms: "customs:kepabeanan, classification:klasifikasi, supporting documents:dokumen pendukung",
    status: "Review",
    priority: "High",
    reviewer: "Reviewer A",
    dueDate: "",
    notes: "Contoh data publik untuk simulasi.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    documentTitle: "Sample Table Appendix",
    pageLabel: "Appendix A",
    sourceType: "Text Extract",
    languagePair: "EN-ID",
    sourceText: "The table below lists product categories, document references, and notes. Some rows may need manual reconstruction because OCR often breaks table columns.",
    translationText: "",
    confidence: 58,
    terms: "table:tabel, product category:kategori produk",
    status: "Raw OCR",
    priority: "Normal",
    reviewer: "Reviewer B",
    dueDate: "",
    notes: "Perlu cek struktur tabel.",
    createdAt: new Date().toISOString(),
  },
];

function clamp(value: number) {
  return Math.min(100, Math.max(0, Number(value) || 0));
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

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(words: number) {
  return Math.max(1, Math.ceil(words / 220));
}

function splitTerms(value: string) {
  return value.split(/[;,]+/).map((item) => item.trim()).filter(Boolean);
}

function completionFor(sourceWords: number, translationWords: number) {
  if (sourceWords === 0) return 0;
  if (translationWords === 0) return 0;
  const ratio = Math.round((translationWords / sourceWords) * 100);
  return clamp(Math.min(100, ratio));
}

function qualityLevel(score: number): QualityLevel {
  if (score >= 85) return { label: "Publication Ready", description: "OCR bersih, terjemahan lengkap, dan siap masuk paket dokumen akhir.", tone: "safe", badgeClass: "bg-teal/10 text-teal ring-teal/20" };
  if (score >= 70) return { label: "Good Draft", description: "Cukup kuat untuk review akhir. Periksa istilah dan format sebelum dipakai.", tone: "safe", badgeClass: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
  if (score >= 55) return { label: "Needs Review", description: "Masih perlu validasi OCR, istilah, atau kelengkapan terjemahan.", tone: "warning", badgeClass: "bg-amber-100 text-amber-700 ring-amber-200" };
  if (score >= 40) return { label: "Repair Zone", description: "Perlu perbaikan struktur dan pengecekan manual sebelum diterjemahkan.", tone: "medium", badgeClass: "bg-orange-100 text-orange-700 ring-orange-200" };
  return { label: "Critical Cleanup", description: "Keluaran belum layak. Ekstrak ulang atau lakukan OCR ulang.", tone: "danger", badgeClass: "bg-rose-100 text-rose-700 ring-rose-200" };
}

function buildIssues(segment: Segment, sourceWords: number, translationWords: number, completion: number) {
  const issues: string[] = [];
  if (sourceWords < 20) issues.push("Teks sumber terlalu pendek");
  if (segment.confidence < 60) issues.push("Confidence OCR rendah");
  if (segment.translationText.trim().length === 0) issues.push("Terjemahan kosong");
  if (completion > 0 && completion < 55) issues.push("Terjemahan terlalu pendek");
  if (/\t|\|{2,}| {4,}/.test(segment.sourceText)) issues.push("Kemungkinan tabel rusak");
  if (/[�□■]/.test(segment.sourceText)) issues.push("Karakter rusak terdeteksi");
  if (segment.sourceText.length > 1200 && !segment.sourceText.includes("\n")) issues.push("Paragraf terlalu panjang");
  if (!segment.terms.trim()) issues.push("Terminologi belum dikunci");
  if (!segment.pageLabel.trim()) issues.push("Label halaman belum jelas");
  return issues;
}

function buildRecommendation(segment: Segment, issues: string[]) {
  if (segment.status === "Archived") return "Simpan sebagai arsip pembanding. Jangan jadikan versi final kecuali sudah direview ulang.";
  if (issues.includes("Confidence OCR rendah")) return "Lakukan OCR ulang dengan resolusi lebih baik, lalu bandingkan hasilnya sebelum menerjemahkan.";
  if (issues.includes("Kemungkinan tabel rusak")) return "Rekonstruksi tabel secara manual. Pisahkan header, baris, dan catatan kaki sebelum ekspor.";
  if (issues.includes("Terjemahan kosong")) return "Buat draft terjemahan halaman ini, lalu kunci istilah penting di Terminology Lock.";
  if (issues.includes("Terminologi belum dikunci")) return "Tambahkan pasangan istilah kunci agar terjemahan konsisten antar halaman.";
  if (segment.confidence >= 85 && segment.translationText.trim()) return "Masukkan ke antrean final QC dan export sebagai bilingual documentation pack.";
  return "Lakukan review teks sumber, rapikan segmentasi, dan validasi istilah sebelum publikasi.";
}

function enrich(segment: Segment): EnrichedSegment {
  const sourceWords = wordCount(segment.sourceText);
  const translationWords = wordCount(segment.translationText);
  const completion = completionFor(sourceWords, translationWords);
  const issues = buildIssues(segment, sourceWords, translationWords, completion);
  const qualityScore = Math.round(segment.confidence * 0.55 + completion * 0.3 + Math.max(0, 100 - issues.length * 10) * 0.15);
  return {
    ...segment,
    sourceWords,
    translationWords,
    completion,
    issues,
    level: qualityLevel(qualityScore),
    tagList: splitTerms(segment.terms),
    recommendation: buildRecommendation(segment, issues),
    readingMinutes: readingMinutes(sourceWords),
  };
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function buildBrief(segment: EnrichedSegment) {
  return [
    `Dokumen: ${segment.documentTitle}`,
    `Halaman: ${segment.pageLabel}`,
    `Sumber: ${segment.sourceType}`,
    `Bahasa: ${segment.languagePair}`,
    `Status: ${segment.status}`,
    `Confidence OCR: ${segment.confidence}`,
    `Completion: ${segment.completion}%`,
    `Level: ${segment.level.label}`,
    `Issue: ${segment.issues.join(", ") || "Tidak ada"}`,
    `Rekomendasi: ${segment.recommendation}`,
  ].join("\n");
}

export function OcrTranslatePdfClient() {
  const [segments, setSegments] = useState<Segment[]>([]);
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
        setSegments(Array.isArray(parsed.segments) ? parsed.segments : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ segments }));
  }, [loaded, segments]);

  const enriched = useMemo(() => segments.map(enrich), [segments]);
  const selected = enriched.find((item) => item.id === selectedId) ?? enriched[0];

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase();
    return enriched.filter((item) => {
      const text = `${item.documentTitle} ${item.pageLabel} ${item.sourceText} ${item.translationText} ${item.terms} ${item.reviewer}`.toLowerCase();
      const matchText = !keyword || text.includes(keyword);
      const matchFilter = filter === "All" || item.status === filter || item.sourceType === filter || item.languagePair === filter || item.priority === filter || item.level.label === filter;
      return matchText && matchFilter;
    });
  }, [enriched, query, filter]);

  const summary = useMemo(() => {
    const total = enriched.length;
    const sourceWords = enriched.reduce((sum, item) => sum + item.sourceWords, 0);
    const translated = enriched.filter((item) => item.translationText.trim().length > 0).length;
    const ready = enriched.filter((item) => item.status === "Ready" || item.level.label === "Publication Ready").length;
    const issues = enriched.reduce((sum, item) => sum + item.issues.length, 0);
    const avgConfidence = total === 0 ? 0 : Math.round(enriched.reduce((sum, item) => sum + item.confidence, 0) / total);
    const overdue = enriched.filter((item) => item.dueDate && item.dueDate < todayIso() && item.status !== "Ready" && item.status !== "Archived").length;
    return { total, sourceWords, translated, ready, issues, avgConfidence, overdue };
  }, [enriched]);

  function addSegment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const record: Segment = {
      id: crypto.randomUUID(),
      documentTitle: textFromForm(form, "documentTitle") || "Untitled PDF",
      pageLabel: textFromForm(form, "pageLabel") || `Page ${segments.length + 1}`,
      sourceType: textFromForm(form, "sourceType") as SourceType,
      languagePair: textFromForm(form, "languagePair") as LanguagePair,
      sourceText: textFromForm(form, "sourceText"),
      translationText: textFromForm(form, "translationText"),
      confidence: numberFromForm(form, "confidence"),
      terms: textFromForm(form, "terms"),
      status: textFromForm(form, "status") as SegmentStatus,
      priority: textFromForm(form, "priority") as Priority,
      reviewer: textFromForm(form, "reviewer") || "Reviewer",
      dueDate: textFromForm(form, "dueDate"),
      notes: textFromForm(form, "notes"),
      createdAt: new Date().toISOString(),
    };
    setSegments((previous) => [record, ...previous]);
    setSelectedId(record.id);
    event.currentTarget.reset();
  }

  function updateSegment(id: string, patch: Partial<Segment>) {
    setSegments((previous) => previous.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function removeSegment(id: string) {
    setSegments((previous) => previous.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function loadSample() {
    setSegments(sampleSegments);
    setSelectedId(sampleSegments[0]?.id ?? null);
  }

  function clearWorkspace() {
    setSegments([]);
    setSelectedId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setSegments(Array.isArray(parsed.segments) ? parsed.segments : []);
      } catch {
        alert("File JSON tidak dapat dibaca.");
      }
    };
    reader.readAsText(file);
  }

  function importText(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "").trim();
      if (!text) return;
      const record: Segment = {
        id: crypto.randomUUID(),
        documentTitle: file.name.replace(/\.(txt|md)$/i, ""),
        pageLabel: "Imported text",
        sourceType: "Text Extract",
        languagePair: "EN-ID",
        sourceText: text,
        translationText: "",
        confidence: 75,
        terms: "",
        status: "Raw OCR",
        priority: "Normal",
        reviewer: "Reviewer",
        dueDate: "",
        notes: "Imported from text file.",
        createdAt: new Date().toISOString(),
      };
      setSegments((previous) => [record, ...previous]);
      setSelectedId(record.id);
    };
    reader.readAsText(file);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ segments }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ocr-translate-pdf-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Document", "Page", "Source", "Language", "Confidence", "Completion", "Level", "Status", "Priority", "Source Words", "Translation Words", "Issues", "Recommendation"];
    const rows = enriched.map((item) => [
      item.documentTitle,
      item.pageLabel,
      item.sourceType,
      item.languagePair,
      String(item.confidence),
      `${item.completion}%`,
      item.level.label,
      item.status,
      item.priority,
      String(item.sourceWords),
      String(item.translationWords),
      item.issues.join(" | "),
      item.recommendation,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ocr-translate-pdf-recap.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportHtml() {
    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bilingual OCR Translation Pack</title><style>body{font-family:Arial,sans-serif;line-height:1.6;max-width:1040px;margin:40px auto;padding:0 20px;color:#111827}.seg{border-top:1px solid #e5e7eb;padding:24px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.box{background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:16px}h1,h2{color:#001B4D}.meta{color:#64748b;font-size:13px}@media(max-width:760px){.grid{grid-template-columns:1fr}}</style></head><body><h1>Bilingual OCR Translation Pack</h1>${enriched.map((item) => `<section class="seg"><h2>${htmlEscape(item.documentTitle)} · ${htmlEscape(item.pageLabel)}</h2><p class="meta">${htmlEscape(item.sourceType)} · ${htmlEscape(item.languagePair)} · ${htmlEscape(item.level.label)} · Confidence ${item.confidence}</p><div class="grid"><div class="box"><h3>Source</h3><p>${htmlEscape(item.sourceText).replaceAll("\n", "<br>")}</p></div><div class="box"><h3>Translation</h3><p>${htmlEscape(item.translationText || "Belum diterjemahkan").replaceAll("\n", "<br>")}</p></div></div></section>`).join("")}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bilingual-ocr-translation-pack.html";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportMarkdown() {
    const markdown = enriched.map((item) => [
      `## ${item.documentTitle} - ${item.pageLabel}`,
      `Source: ${item.sourceType} | Language: ${item.languagePair} | Status: ${item.status}`,
      `Quality: ${item.level.label} | Confidence: ${item.confidence} | Completion: ${item.completion}%`,
      "",
      "### Source",
      item.sourceText,
      "",
      "### Translation",
      item.translationText || "Belum diterjemahkan.",
      "",
      `Recommendation: ${item.recommendation}`,
    ].join("\n")).join("\n\n---\n\n");
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ocr-translation-pack.md";
    link.click();
    URL.revokeObjectURL(url);
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
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">OCR Translate PDF</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
                Workspace untuk mengelola hasil OCR PDF, menerjemahkan teks, mengunci terminologi, mengecek kualitas, dan mengekspor paket bilingual yang siap direview.
              </p>
            </div>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-xs font-bold text-violet-700">Translation Lab</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Format" value="PDF OCR / Text" />
            <InfoCard label="Scope" value="OCR QA & Translation" />
            <InfoCard label="Update" value="2026-07-10" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>
                Tool ini tidak mengirim file ke server dan tidak menjalankan OCR cloud. Gunakan hasil OCR dari sumber yang Anda percaya, lalu tempel atau impor teks yang aman untuk publik. Data tersimpan lokal di browser.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <MetricCard icon={FileText} label="Segmen" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={Gauge} label="Confidence" value={`${summary.avgConfidence}`} tone={summary.avgConfidence >= 80 ? "safe" : summary.avgConfidence >= 60 ? "warning" : "danger"} />
          <MetricCard icon={Languages} label="Translated" value={`${summary.translated}`} tone="safe" />
          <MetricCard icon={CheckCircle2} label="Ready" value={`${summary.ready}`} tone="safe" />
          <MetricCard icon={AlertTriangle} label="Issues" value={`${summary.issues}`} tone={summary.issues === 0 ? "safe" : "danger"} />
          <MetricCard icon={BookOpenText} label="Source words" value={`${summary.sourceWords}`} tone="neutral" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Translation Command Center" icon={BrainCircuit}>
            {selected ? <CommandCenter segment={selected} onUpdate={updateSegment} onCopy={copyBrief} copied={copied} /> : <EmptyState title="Belum ada segmen" description="Tambahkan hasil OCR atau muat contoh untuk melihat command center." />}
          </Panel>

          <Panel title="Tambah segmen OCR" icon={Plus}>
            <SegmentForm onSubmit={addSegment} />
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Terminology Lock & Quality Flags" icon={Tags}>
            {selected ? <TerminologyPanel segment={selected} /> : <EmptyState title="Belum ada terminologi" description="Pilih segmen untuk melihat istilah kunci dan quality flags." />}
          </Panel>

          <Panel title="OCR Translation Workspace" icon={ScanText}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari dokumen, halaman, isi, terjemahan, istilah" className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-teal/20 focus:ring-4" />
              </div>
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
                <option>All</option>
                {statuses.map((item) => <option key={item}>{item}</option>)}
                {sourceTypes.map((item) => <option key={item}>{item}</option>)}
                {languagePairs.map((item) => <option key={item}>{item}</option>)}
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
              <button onClick={exportMarkdown} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200"><FileText size={16} /> MD</button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200">
                <Upload size={16} /> Import JSON
                <input type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-navy ring-1 ring-slate-200">
                <FileSearch size={16} /> Import TXT
                <input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={(event) => importText(event.target.files?.[0])} />
              </label>
              <button onClick={clearWorkspace} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 ring-1 ring-rose-100"><Eraser size={16} /> Bersihkan</button>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="Belum ada segmen" description="Tempel hasil OCR, impor TXT, atau klik Contoh untuk mencoba quality scoring dan export bilingual." />
            ) : (
              <SegmentTable segments={filtered} selectedId={selectedId} onSelect={setSelectedId} onRemove={removeSegment} />
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function SegmentForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="documentTitle" label="Judul dokumen" placeholder="Nama PDF" />
        <TextInput name="pageLabel" label="Halaman/segmen" placeholder="Page 1" />
        <SelectText name="sourceType" label="Tipe sumber" options={sourceTypes} defaultValue="PDF OCR" />
        <SelectText name="languagePair" label="Pasangan bahasa" options={languagePairs} defaultValue="EN-ID" />
        <SelectText name="status" label="Status" options={statuses} defaultValue="Raw OCR" />
        <SelectText name="priority" label="Prioritas" options={priorities} defaultValue="Normal" />
        <TextInput name="reviewer" label="Reviewer" placeholder="Reviewer" />
        <TextInput name="dueDate" label="Target review" type="date" />
      </div>
      <ScoreInput name="confidence" label="OCR confidence" defaultValue={75} />
      <TextArea name="sourceText" label="Teks sumber OCR" placeholder="Tempel hasil OCR dari PDF di sini" rows={6} />
      <TextArea name="translationText" label="Draft terjemahan" placeholder="Isi draft terjemahan atau kosongkan untuk diterjemahkan nanti" rows={6} />
      <TextInput name="terms" label="Terminology lock" placeholder="customs:kepabeanan, invoice:faktur" />
      <TextArea name="notes" label="Catatan QC" placeholder="Catatan aman untuk publik" rows={3} />
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Plus size={18} /> Tambah segmen
      </button>
    </form>
  );
}

function CommandCenter({ segment, onUpdate, onCopy, copied }: { segment: EnrichedSegment; onUpdate: (id: string, patch: Partial<Segment>) => void; onCopy: () => void; copied: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Selected Segment</p>
            <h2 className="mt-2 text-3xl font-black">{segment.documentTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{segment.pageLabel} · {segment.languagePair} · {segment.sourceType}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-teal">{segment.confidence}</p>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">OCR confidence</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{segment.level.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Completion" value={`${segment.completion}%`} />
        <InfoPill label="Source words" value={`${segment.sourceWords}`} />
        <InfoPill label="Reading" value={`${segment.readingMinutes} min`} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Smart Recommendation</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{segment.recommendation}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InlineSelect label="Status" value={segment.status} options={statuses} onChange={(value) => onUpdate(segment.id, { status: value as SegmentStatus })} />
        <InlineSelect label="Priority" value={segment.priority} options={priorities} onChange={(value) => onUpdate(segment.id, { priority: value as Priority })} />
      </div>

      <button onClick={onCopy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white">
        <Copy size={17} /> {copied ? "Brief tersalin" : "Salin QC brief"}
      </button>
    </div>
  );
}

function TerminologyPanel({ segment }: { segment: EnrichedSegment }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-black text-navy">Terminology Lock</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {segment.tagList.length === 0 ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Belum ada istilah</span> : segment.tagList.map((term) => <span key={term} className="rounded-full bg-teal/10 px-3 py-1 text-xs font-bold text-teal ring-1 ring-teal/20">{term}</span>)}
        </div>
      </div>

      <div>
        <p className="text-sm font-black text-navy">Quality Flags</p>
        <div className="mt-3 grid gap-2">
          {segment.issues.length === 0 ? (
            <div className="flex gap-3 rounded-2xl bg-teal/10 p-4 text-sm text-teal"><CheckCircle2 size={18} /> Tidak ada issue utama.</div>
          ) : segment.issues.map((issue) => (
            <div key={issue} className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle size={18} /> {issue}</div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Bilingual Preview</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <PreviewBox title="Source" content={segment.sourceText} />
          <PreviewBox title="Translation" content={segment.translationText || "Belum diterjemahkan."} />
        </div>
      </div>
    </div>
  );
}

function SegmentTable({ segments, selectedId, onSelect, onRemove }: { segments: EnrichedSegment[]; selectedId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Segmen</th>
              <th className="px-4 py-3">Quality</th>
              <th className="px-4 py-3">Completion</th>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {segments.map((item) => (
              <tr key={item.id} className={selectedId === item.id ? "bg-teal/5" : ""}>
                <td className="px-4 py-4 align-top">
                  <button onClick={() => onSelect(item.id)} className="text-left">
                    <p className="font-black text-navy">{item.documentTitle}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.pageLabel} · {item.sourceType} · {item.languagePair}</p>
                  </button>
                </td>
                <td className="px-4 py-4 align-top"><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${item.level.badgeClass}`}>{item.level.label}</span></td>
                <td className="px-4 py-4 align-top text-slate-600">{item.completion}%<br /><span className="text-xs">OCR {item.confidence}</span></td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{item.issues.slice(0, 2).join(", ") || "-"}</td>
                <td className="px-4 py-4 align-top"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item.status}</span></td>
                <td className="px-4 py-4 align-top text-right">
                  <button onClick={() => onRemove(item.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus segmen"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PreviewBox({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">{content}</p>
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

function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "safe" | "danger" | "warning" | "neutral" }) {
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 font-bold text-navy">{value}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <Sparkles className="mx-auto text-slate-400" size={32} />
      <h3 className="mt-3 text-lg font-black text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
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
