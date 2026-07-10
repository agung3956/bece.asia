"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  BarChart3,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Compass,
  Download,
  Eraser,
  FileSpreadsheet,
  Flame,
  Globe2,
  Handshake,
  Layers3,
  Lightbulb,
  PackageCheck,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UsersRound,
} from "lucide-react";

type Stage = "Discovery" | "Nurture" | "Ready" | "Export Pilot" | "Scale";
type Status = "Prospect" | "Assisted" | "Priority" | "Dormant";
type ProductCategory = "Food" | "Craft" | "Agriculture" | "Marine" | "Fashion" | "Other";

type UmkmRecord = {
  id: string;
  name: string;
  owner: string;
  location: string;
  product: string;
  category: ProductCategory;
  targetMarket: string;
  capacity: number;
  legal: number;
  certification: number;
  packaging: number;
  branding: number;
  digital: number;
  documents: number;
  production: number;
  market: number;
  consistency: number;
  assistance: number;
  stage: Stage;
  status: Status;
  obstacle: string;
  nextAction: string;
  dueDate: string;
  notes: string;
  createdAt: string;
};

type StoredData = { records: UmkmRecord[] };

type ScoreLevel = {
  label: string;
  tone: "danger" | "warning" | "medium" | "safe" | "prime";
  description: string;
};

const STORAGE_KEY = "beceasia:umkm-workspace:v1";

const categories: ProductCategory[] = ["Food", "Craft", "Agriculture", "Marine", "Fashion", "Other"];
const stages: Stage[] = ["Discovery", "Nurture", "Ready", "Export Pilot", "Scale"];
const statuses: Status[] = ["Prospect", "Assisted", "Priority", "Dormant"];

const sampleRecords: UmkmRecord[] = [
  {
    id: "sample-1",
    name: "Kopi Lada Heritage",
    owner: "Owner A",
    location: "Bangka Belitung",
    product: "Kopi rempah kemasan premium",
    category: "Food",
    targetMarket: "Malaysia, Singapura",
    capacity: 70,
    legal: 80,
    certification: 55,
    packaging: 78,
    branding: 72,
    digital: 65,
    documents: 55,
    production: 70,
    market: 60,
    consistency: 72,
    assistance: 68,
    stage: "Ready",
    status: "Priority",
    obstacle: "Sertifikasi dan dokumen ekspor belum lengkap.",
    nextAction: "Buat checklist dokumen, rapikan katalog produk, dan validasi buyer persona.",
    dueDate: "",
    notes: "Contoh data publik untuk simulasi.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    name: "Lidi Craft Studio",
    owner: "Owner B",
    location: "Pulau Bangka",
    product: "Kerajinan lidi sawit dan dekorasi rumah",
    category: "Craft",
    targetMarket: "Jepang, Korea Selatan",
    capacity: 60,
    legal: 70,
    certification: 45,
    packaging: 70,
    branding: 64,
    digital: 52,
    documents: 40,
    production: 58,
    market: 50,
    consistency: 55,
    assistance: 58,
    stage: "Nurture",
    status: "Assisted",
    obstacle: "Kapasitas dan konsistensi pasokan masih perlu dikunci.",
    nextAction: "Petakan pemasok, buat standar kualitas, dan siapkan foto katalog.",
    dueDate: "",
    notes: "Contoh data publik untuk simulasi.",
    createdAt: new Date().toISOString(),
  },
];

function clamp(value: number) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function readinessScore(record: UmkmRecord) {
  const weighted =
    record.legal * 0.12 +
    record.certification * 0.13 +
    record.packaging * 0.1 +
    record.branding * 0.1 +
    record.digital * 0.1 +
    record.documents * 0.12 +
    record.production * 0.11 +
    record.market * 0.1 +
    record.consistency * 0.08 +
    record.assistance * 0.04;
  return Math.round(weighted);
}

function scoreLevel(score: number): ScoreLevel {
  if (score >= 85) return { label: "Export Prime", tone: "prime", description: "Siap masuk simulasi buyer dan pilot ekspor." };
  if (score >= 70) return { label: "Ready", tone: "safe", description: "Fondasi kuat. Lengkapi gap kecil dan validasi pasar." };
  if (score >= 55) return { label: "Nurture", tone: "medium", description: "Potensial. Perlu pendampingan terarah." };
  if (score >= 40) return { label: "Discovery", tone: "warning", description: "Masih perlu pembenahan dasar." };
  return { label: "Foundation", tone: "danger", description: "Mulai dari legalitas, produk, dan kapasitas." };
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
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

function safeAverage(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}

export function UmkmWorkspaceClient() {
  const [records, setRecords] = useState<UmkmRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        setRecords(Array.isArray(parsed.records) ? parsed.records : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ records }));
  }, [loaded, records]);

  const enriched = useMemo(() => records.map((record) => {
    const score = readinessScore(record);
    const level = scoreLevel(score);
    const bottlenecks = [
      ["Legalitas", record.legal],
      ["Sertifikasi", record.certification],
      ["Kemasan", record.packaging],
      ["Branding", record.branding],
      ["Digital", record.digital],
      ["Dokumen", record.documents],
      ["Produksi", record.production],
      ["Market", record.market],
      ["Konsistensi", record.consistency],
    ].sort((a, b) => Number(a[1]) - Number(b[1])).slice(0, 3).map(([name]) => String(name));
    const opportunity = record.market >= 70 && record.packaging >= 70 ? "Buyer pitch" : record.digital < 55 ? "Digital upgrade" : record.documents < 60 ? "Document sprint" : "Product polish";
    return { ...record, score, level, bottlenecks, opportunity };
  }), [records]);

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase();
    return enriched.filter((record) => {
      const text = `${record.name} ${record.owner} ${record.location} ${record.product} ${record.targetMarket} ${record.category}`.toLowerCase();
      const matchText = !keyword || text.includes(keyword);
      const matchStage = stageFilter === "All" || record.stage === stageFilter || record.status === stageFilter || record.level.label === stageFilter;
      return matchText && matchStage;
    });
  }, [enriched, query, stageFilter]);

  const selected = enriched.find((record) => record.id === selectedId) ?? enriched[0];

  const summary = useMemo(() => {
    const scores = enriched.map((item) => item.score);
    const priority = enriched.filter((item) => item.status === "Priority" || item.score >= 70).length;
    const exportPrime = enriched.filter((item) => item.score >= 85).length;
    const overdue = enriched.filter((item) => item.dueDate && item.dueDate < todayIso() && item.status !== "Dormant").length;
    const avg = safeAverage(scores);
    const weakest = enriched.length === 0 ? "-" : [
      ["Legalitas", safeAverage(enriched.map((item) => item.legal))],
      ["Sertifikasi", safeAverage(enriched.map((item) => item.certification))],
      ["Kemasan", safeAverage(enriched.map((item) => item.packaging))],
      ["Branding", safeAverage(enriched.map((item) => item.branding))],
      ["Digital", safeAverage(enriched.map((item) => item.digital))],
      ["Dokumen", safeAverage(enriched.map((item) => item.documents))],
      ["Produksi", safeAverage(enriched.map((item) => item.production))],
      ["Market", safeAverage(enriched.map((item) => item.market))],
    ].sort((a, b) => Number(a[1]) - Number(b[1]))[0][0] as string;
    return { total: enriched.length, avg, priority, exportPrime, overdue, weakest };
  }, [enriched]);

  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const record: UmkmRecord = {
      id: crypto.randomUUID(),
      name: textFromForm(form, "name") || "UMKM Baru",
      owner: textFromForm(form, "owner") || "Owner belum diisi",
      location: textFromForm(form, "location") || "Indonesia",
      product: textFromForm(form, "product") || "Produk belum diisi",
      category: textFromForm(form, "category") as ProductCategory,
      targetMarket: textFromForm(form, "targetMarket") || "Belum ditentukan",
      capacity: numberFromForm(form, "capacity"),
      legal: numberFromForm(form, "legal"),
      certification: numberFromForm(form, "certification"),
      packaging: numberFromForm(form, "packaging"),
      branding: numberFromForm(form, "branding"),
      digital: numberFromForm(form, "digital"),
      documents: numberFromForm(form, "documents"),
      production: numberFromForm(form, "production"),
      market: numberFromForm(form, "market"),
      consistency: numberFromForm(form, "consistency"),
      assistance: numberFromForm(form, "assistance"),
      stage: textFromForm(form, "stage") as Stage,
      status: textFromForm(form, "status") as Status,
      obstacle: textFromForm(form, "obstacle"),
      nextAction: textFromForm(form, "nextAction"),
      dueDate: textFromForm(form, "dueDate"),
      notes: textFromForm(form, "notes"),
      createdAt: new Date().toISOString(),
    };
    setRecords((previous) => [record, ...previous]);
    setSelectedId(record.id);
    event.currentTarget.reset();
  }

  function updateRecord(id: string, patch: Partial<UmkmRecord>) {
    setRecords((previous) => previous.map((record) => record.id === id ? { ...record, ...patch } : record));
  }

  function removeRecord(id: string) {
    setRecords((previous) => previous.filter((record) => record.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function loadSample() {
    setRecords(sampleRecords);
    setSelectedId(sampleRecords[0]?.id ?? null);
  }

  function clearWorkspace() {
    setRecords([]);
    setSelectedId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ records }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "umkm-workspace-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Nama", "Owner", "Lokasi", "Produk", "Kategori", "Target Market", "Skor", "Level", "Stage", "Status", "Bottleneck", "Next Action", "Due Date"];
    const rows = enriched.map((record) => [
      record.name,
      record.owner,
      record.location,
      record.product,
      record.category,
      record.targetMarket,
      String(record.score),
      record.level.label,
      record.stage,
      record.status,
      record.bottlenecks.join(" | "),
      record.nextAction,
      record.dueDate,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "umkm-workspace-recap.csv";
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
      } catch {
        alert("File JSON tidak dapat dibaca.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">Trade Facilitation</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">UMKM Export Workspace</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
                Workspace cerdas untuk membaca kesiapan UMKM, menemukan bottleneck, memetakan produk, menyusun next action, dan memprioritaskan pendampingan ekspor.
              </p>
            </div>
            <span className="rounded-full border border-teal/30 bg-teal/10 px-4 py-1 text-xs font-bold text-teal">Smart Beta</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Wilayah" value="Indonesia" />
            <InfoCard label="Scope" value="MSME Growth" />
            <InfoCard label="Update" value="2026-07-09" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>Data tersimpan lokal di browser. Gunakan data contoh atau data yang aman untuk publik. Jangan masukkan data pribadi, data bisnis rahasia, kontrak, harga sensitif, atau dokumen internal.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <MetricCard icon={UsersRound} label="UMKM" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={GaugeIcon} label="Rata-rata skor" value={`${summary.avg}`} tone={summary.avg >= 70 ? "safe" : summary.avg >= 55 ? "medium" : "warning"} />
          <MetricCard icon={Flame} label="Prioritas" value={`${summary.priority}`} tone="prime" />
          <MetricCard icon={Rocket} label="Export Prime" value={`${summary.exportPrime}`} tone="safe" />
          <MetricCard icon={Target} label="Overdue" value={`${summary.overdue}`} tone={summary.overdue === 0 ? "safe" : "danger"} />
          <MetricCard icon={Compass} label="Gap utama" value={summary.weakest} tone="neutral" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Mission Control" icon={BrainCircuit}>
            {selected ? <MissionControl record={selected} onUpdate={updateRecord} /> : <EmptyState title="Belum ada UMKM" description="Tambahkan data UMKM atau muat contoh untuk melihat mission control." />}
          </Panel>

          <Panel title="Tambah UMKM" icon={Plus}>
            <UmkmForm onSubmit={addRecord} />
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Readiness Radar" icon={BarChart3}>
            {selected ? <ReadinessRadar record={selected} /> : <EmptyState title="Radar belum tersedia" description="Pilih UMKM dari tabel untuk melihat komposisi kesiapan." />}
          </Panel>

          <Panel title="Workspace UMKM" icon={FileSpreadsheet}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari UMKM, produk, lokasi, pasar" className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-teal/20 focus:ring-4" />
              </div>
              <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
                <option>All</option>
                {stages.map((item) => <option key={item}>{item}</option>)}
                {statuses.map((item) => <option key={item}>{item}</option>)}
                <option>Export Prime</option>
                <option>Ready</option>
                <option>Nurture</option>
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

            {filtered.length === 0 ? (
              <EmptyState title="Belum ada data" description="Tambahkan UMKM baru atau klik Contoh untuk mencoba fitur scoring, radar, dan mission control." />
            ) : (
              <UmkmTable records={filtered} selectedId={selectedId} onSelect={setSelectedId} onRemove={removeRecord} />
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function UmkmForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="name" label="Nama UMKM" placeholder="Nama usaha" />
        <TextInput name="owner" label="Owner/label" placeholder="Gunakan label aman" />
        <TextInput name="location" label="Lokasi" placeholder="Kabupaten/kota" />
        <TextInput name="product" label="Produk utama" placeholder="Produk unggulan" />
        <SelectText name="category" label="Kategori" options={categories} />
        <TextInput name="targetMarket" label="Target pasar" placeholder="Negara/segmen pasar" />
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <ScoreInput name="legal" label="Legalitas" defaultValue={50} />
        <ScoreInput name="certification" label="Sertifikasi" defaultValue={40} />
        <ScoreInput name="packaging" label="Kemasan" defaultValue={50} />
        <ScoreInput name="branding" label="Branding" defaultValue={50} />
        <ScoreInput name="digital" label="Digital" defaultValue={45} />
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <ScoreInput name="documents" label="Dokumen" defaultValue={40} />
        <ScoreInput name="production" label="Produksi" defaultValue={50} />
        <ScoreInput name="market" label="Market" defaultValue={45} />
        <ScoreInput name="consistency" label="Konsistensi" defaultValue={50} />
        <ScoreInput name="assistance" label="Asistensi" defaultValue={50} />
      </div>
      <ScoreInput name="capacity" label="Kapasitas umum" defaultValue={50} />
      <div className="grid gap-4 md:grid-cols-3">
        <SelectText name="stage" label="Stage" options={stages} defaultValue="Discovery" />
        <SelectText name="status" label="Status" options={statuses} defaultValue="Prospect" />
        <TextInput name="dueDate" label="Target tindak lanjut" type="date" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea name="obstacle" label="Hambatan utama" placeholder="Apa yang paling menghambat?" />
        <TextArea name="nextAction" label="Next action" placeholder="Aksi pendampingan berikutnya" />
      </div>
      <TextArea name="notes" label="Catatan" placeholder="Catatan aman untuk publik" />
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Plus size={18} /> Tambah UMKM
      </button>
    </form>
  );
}

function MissionControl({ record, onUpdate }: { record: UmkmRecord & { score: number; level: ScoreLevel; bottlenecks: string[]; opportunity: string }; onUpdate: (id: string, patch: Partial<UmkmRecord>) => void }) {
  const mission = buildMission(record);
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Selected UMKM</p>
            <h2 className="mt-2 text-3xl font-black">{record.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{record.product} · {record.location}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-teal">{record.score}</p>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">{record.level.label}</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{record.level.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Peluang cepat" value={record.opportunity} />
        <InfoPill label="Bottleneck 1" value={record.bottlenecks[0] ?? "-"} />
        <InfoPill label="Stage" value={record.stage} />
      </div>

      <div className="rounded-3xl border border-teal/20 bg-teal/5 p-5">
        <div className="flex items-center gap-3">
          <Sparkles className="text-teal" size={20} />
          <h3 className="font-black text-navy">Magic Mission</h3>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-700">{mission}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InlineSelect label="Stage" value={record.stage} options={stages} onChange={(value) => onUpdate(record.id, { stage: value as Stage })} />
        <InlineSelect label="Status" value={record.status} options={statuses} onChange={(value) => onUpdate(record.id, { status: value as Status })} />
      </div>
    </div>
  );
}

function buildMission(record: UmkmRecord & { score: number; bottlenecks: string[] }) {
  const topGap = record.bottlenecks[0] ?? "kesiapan dasar";
  if (record.score >= 85) return `Masukkan ${record.name} ke mode Export Pilot. Siapkan pitch deck 1 halaman, validasi harga ekspor, dan hubungi minimal 3 calon buyer untuk ${record.targetMarket}.`;
  if (record.score >= 70) return `Fokus 14 hari ke ${topGap}. Setelah gap turun, buat simulasi biaya ekspor dan buyer persona untuk ${record.product}.`;
  if (record.score >= 55) return `Bangun sprint pendampingan 30 hari. Prioritas: ${record.bottlenecks.join(", ")}. Output minimal: katalog, checklist dokumen, dan rencana produksi.`;
  return `Mulai dari fondasi. Rapikan legalitas, produk, kemasan, dan narasi brand. Jangan masuk pasar ekspor sebelum ${topGap} membaik.`;
}

function ReadinessRadar({ record }: { record: UmkmRecord & { score: number; level: ScoreLevel; bottlenecks: string[] } }) {
  const items = [
    ["Legalitas", record.legal],
    ["Sertifikasi", record.certification],
    ["Kemasan", record.packaging],
    ["Branding", record.branding],
    ["Digital", record.digital],
    ["Dokumen", record.documents],
    ["Produksi", record.production],
    ["Market", record.market],
    ["Konsistensi", record.consistency],
    ["Asistensi", record.assistance],
  ] as const;
  return (
    <div className="space-y-4">
      {items.map(([label, value]) => (
        <div key={label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-bold text-navy">{label}</span>
            <span className="font-black text-teal">{value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${value >= 70 ? "bg-teal" : value >= 55 ? "bg-yellow-400" : "bg-rose-500"}`} style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
      <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
        <p className="font-black text-navy">Diagnosis cepat</p>
        <p className="mt-2">Tiga gap utama: <span className="font-bold">{record.bottlenecks.join(", ")}</span>. Gunakan bagian ini sebagai dasar agenda pendampingan berikutnya.</p>
      </div>
    </div>
  );
}

function UmkmTable({ records, selectedId, onSelect, onRemove }: { records: Array<UmkmRecord & { score: number; level: ScoreLevel; bottlenecks: string[]; opportunity: string }>; selectedId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">UMKM</th>
              <th className="px-4 py-3">Skor</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Bottleneck</th>
              <th className="px-4 py-3">Next Action</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {records.map((record) => (
              <tr key={record.id} className={selectedId === record.id ? "bg-teal/5" : ""}>
                <td className="px-4 py-4 align-top">
                  <button onClick={() => onSelect(record.id)} className="text-left">
                    <p className="font-black text-navy">{record.name}</p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{record.product} · {record.category} · {record.targetMarket}</p>
                  </button>
                </td>
                <td className="px-4 py-4 align-top"><ScoreBadge score={record.score} level={record.level} /></td>
                <td className="px-4 py-4 align-top"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{record.stage}</span></td>
                <td className="px-4 py-4 align-top text-xs leading-5 text-slate-600">{record.bottlenecks.join(", ")}</td>
                <td className="px-4 py-4 align-top text-xs leading-5 text-slate-600">{record.nextAction || "Belum ada aksi."}</td>
                <td className="px-4 py-4 align-top text-right">
                  <button onClick={() => onRemove(record.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus UMKM"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreBadge({ score, level }: { score: number; level: ScoreLevel }) {
  const classes = level.tone === "prime" ? "bg-violet-100 text-violet-700 ring-violet-200" : level.tone === "safe" ? "bg-teal/10 text-teal ring-teal/20" : level.tone === "medium" ? "bg-sky-100 text-sky-700 ring-sky-200" : level.tone === "warning" ? "bg-amber-100 text-amber-700 ring-amber-200" : "bg-rose-100 text-rose-700 ring-rose-200";
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ring-1 ${classes}`}>{score} · {level.label}</span>;
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

function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "safe" | "danger" | "warning" | "medium" | "prime" | "neutral" }) {
  const toneClass = tone === "safe" ? "bg-teal/10 text-teal" : tone === "danger" ? "bg-rose-50 text-rose-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : tone === "medium" ? "bg-sky-50 text-sky-700" : tone === "prime" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-navy";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}><Icon size={21} /></div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black text-navy">{value}</p>
    </div>
  );
}

function GaugeIcon(props: { size?: number }) {
  return <TrendingUp {...props} />;
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
      <PackageCheck className="mx-auto text-slate-400" size={32} />
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

function TextArea({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <textarea name={name} rows={3} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}

function SelectText<T extends string>({ name, label, options, defaultValue }: { name: string; label: string; options: readonly T[]; defaultValue?: T }) {
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

function InlineSelect<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold normal-case tracking-normal text-navy outline-none ring-teal/20 focus:ring-4">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
