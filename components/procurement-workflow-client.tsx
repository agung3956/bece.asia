"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Boxes,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Download,
  Eraser,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Layers3,
  Lightbulb,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
  WalletCards,
} from "lucide-react";

type ProcurementMethod = "Direct Purchase" | "Direct Procurement" | "Quotation" | "Tender" | "E-Purchasing" | "Other";
type Stage = "Planning" | "Preparation" | "Selection" | "Contract" | "Handover" | "Payment" | "Closed";
type Status = "Draft" | "On Track" | "Need Action" | "At Risk" | "Done";
type Priority = "Low" | "Normal" | "High" | "Critical";
type DocumentKey = "planning" | "request" | "spec" | "hps" | "survey" | "invitation" | "evaluation" | "contract" | "handover" | "payment";

type DocumentState = Record<DocumentKey, boolean>;

type PackageRecord = {
  id: string;
  packageNo: string;
  title: string;
  unit: string;
  method: ProcurementMethod;
  stage: Stage;
  status: Status;
  priority: Priority;
  budget: number;
  hps: number;
  contractValue: number;
  vendorLabel: string;
  startDate: string;
  dueDate: string;
  output: string;
  risk: string;
  nextAction: string;
  notes: string;
  documents: DocumentState;
  createdAt: string;
};

type StoredData = {
  packages: PackageRecord[];
};

type EnrichedPackage = PackageRecord & {
  completion: number;
  budgetUsage: number;
  saving: number;
  urgency: "Safe" | "Soon" | "Overdue" | "No Date";
  missingDocs: DocumentKey[];
  score: number;
  recommendation: string;
};

const STORAGE_KEY = "beceasia:procurement-workflow:v1";

const methods: ProcurementMethod[] = ["Direct Purchase", "Direct Procurement", "Quotation", "Tender", "E-Purchasing", "Other"];
const stages: Stage[] = ["Planning", "Preparation", "Selection", "Contract", "Handover", "Payment", "Closed"];
const statuses: Status[] = ["Draft", "On Track", "Need Action", "At Risk", "Done"];
const priorities: Priority[] = ["Low", "Normal", "High", "Critical"];

const documentLabels: Record<DocumentKey, string> = {
  planning: "Rencana kebutuhan",
  request: "Nota/permintaan",
  spec: "Spesifikasi/KAK",
  hps: "HPS/OE",
  survey: "Survei pasar",
  invitation: "Undangan/permintaan penawaran",
  evaluation: "Evaluasi/negosiasi",
  contract: "Kontrak/SPK/pesanan",
  handover: "BAST/serah terima",
  payment: "Dokumen pembayaran",
};

const emptyDocuments: DocumentState = {
  planning: false,
  request: false,
  spec: false,
  hps: false,
  survey: false,
  invitation: false,
  evaluation: false,
  contract: false,
  handover: false,
  payment: false,
};

const samplePackages: PackageRecord[] = [
  {
    id: "sample-1",
    packageNo: "PKG-001",
    title: "Perangkat pendukung layanan digital",
    unit: "Tim Layanan",
    method: "E-Purchasing",
    stage: "Preparation",
    status: "On Track",
    priority: "High",
    budget: 25000000,
    hps: 24500000,
    contractValue: 0,
    vendorLabel: "Vendor A",
    startDate: "",
    dueDate: "",
    output: "Perangkat siap digunakan dan terdokumentasi.",
    risk: "Spesifikasi belum dikunci dan dapat berubah saat proses berjalan.",
    nextAction: "Finalisasi spesifikasi, validasi harga, dan siapkan dokumen permintaan.",
    notes: "Contoh data publik untuk simulasi.",
    documents: { ...emptyDocuments, planning: true, request: true, spec: true, hps: true, survey: true },
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    packageNo: "PKG-002",
    title: "Jasa desain materi publikasi edukatif",
    unit: "Komunikasi",
    method: "Direct Procurement",
    stage: "Selection",
    status: "Need Action",
    priority: "Normal",
    budget: 12000000,
    hps: 11800000,
    contractValue: 11000000,
    vendorLabel: "Vendor B",
    startDate: "",
    dueDate: "",
    output: "Materi desain siap publikasi.",
    risk: "Timeline revisi dapat memanjang karena kebutuhan konten belum final.",
    nextAction: "Kunci brief, buat daftar deliverable, dan tetapkan jadwal review.",
    notes: "Contoh data publik untuk simulasi.",
    documents: { ...emptyDocuments, planning: true, request: true, spec: true, hps: true, survey: true, invitation: true, evaluation: true },
    createdAt: new Date().toISOString(),
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function numberFromForm(form: FormData, key: string) {
  return Math.max(0, Number(form.get(key) || 0));
}

function textFromForm(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function daysUntil(date: string) {
  if (!date) return null;
  const target = new Date(date);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function completionFor(documents: DocumentState) {
  const keys = Object.keys(documentLabels) as DocumentKey[];
  const done = keys.filter((key) => documents[key]).length;
  return Math.round((done / keys.length) * 100);
}

function urgencyFor(date: string): EnrichedPackage["urgency"] {
  const days = daysUntil(date);
  if (days === null) return "No Date";
  if (days < 0) return "Overdue";
  if (days <= 7) return "Soon";
  return "Safe";
}

function buildRecommendation(item: EnrichedPackage) {
  if (item.urgency === "Overdue") return "Tutup gap jadwal dulu. Tetapkan keputusan hari ini dan ubah status paket.";
  if (item.missingDocs.includes("hps")) return "Lengkapi HPS dan dasar harga sebelum lanjut ke pemilihan penyedia.";
  if (item.missingDocs.includes("spec")) return "Kunci spesifikasi atau KAK agar proses tidak berubah di tengah jalan.";
  if (item.stage === "Selection" && item.missingDocs.includes("evaluation")) return "Siapkan evaluasi, negosiasi, dan catatan keputusan secara rapi.";
  if (item.budgetUsage > 100) return "Nilai kontrak melewati pagu. Koreksi nominal atau siapkan justifikasi perubahan.";
  if (item.completion >= 85) return "Paket hampir lengkap. Fokus ke final check dan arsip bukti.";
  return "Lanjutkan dokumen dengan urutan paling berisiko dan tetapkan satu aksi berikutnya.";
}

function enrichPackage(item: PackageRecord): EnrichedPackage {
  const completion = completionFor(item.documents);
  const baseValue = item.contractValue || item.hps || 0;
  const budgetUsage = item.budget > 0 ? Math.round((baseValue / item.budget) * 100) : 0;
  const saving = item.budget > 0 && item.contractValue > 0 ? item.budget - item.contractValue : item.budget - item.hps;
  const urgency = urgencyFor(item.dueDate);
  const missingDocs = (Object.keys(documentLabels) as DocumentKey[]).filter((key) => !item.documents[key]);
  const priorityPenalty = item.priority === "Critical" ? 20 : item.priority === "High" ? 12 : item.priority === "Normal" ? 5 : 0;
  const urgencyPenalty = urgency === "Overdue" ? 30 : urgency === "Soon" ? 15 : urgency === "No Date" ? 8 : 0;
  const budgetPenalty = budgetUsage > 100 ? 25 : budgetUsage >= 95 ? 10 : 0;
  const score = clamp(completion - priorityPenalty - urgencyPenalty - budgetPenalty, 0, 100);
  const enriched = { ...item, completion, budgetUsage, saving, urgency, missingDocs, score, recommendation: "" };
  return { ...enriched, recommendation: buildRecommendation(enriched) };
}

function buildBrief(item: EnrichedPackage) {
  return [
    `Paket: ${item.packageNo} - ${item.title}`,
    `Unit: ${item.unit}`,
    `Metode: ${item.method}`,
    `Tahap: ${item.stage}`,
    `Status: ${item.status}`,
    `Pagu: ${formatCurrency(item.budget)}`,
    `HPS: ${formatCurrency(item.hps)}`,
    `Nilai kontrak: ${item.contractValue ? formatCurrency(item.contractValue) : "Belum ada"}`,
    `Progress dokumen: ${item.completion}%`,
    `Dokumen kurang: ${item.missingDocs.map((key) => documentLabels[key]).join(", ") || "Tidak ada"}`,
    `Risiko: ${item.risk || "Belum diisi"}`,
    `Rekomendasi: ${item.recommendation}`,
    `Next action: ${item.nextAction || "Belum diisi"}`,
  ].join("\n");
}

export function ProcurementWorkflowClient() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
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
        setPackages(Array.isArray(parsed.packages) ? parsed.packages : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ packages }));
  }, [loaded, packages]);

  const enriched = useMemo(() => packages.map(enrichPackage), [packages]);
  const selected = enriched.find((item) => item.id === selectedId) ?? enriched[0];

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase();
    return enriched.filter((item) => {
      const text = `${item.packageNo} ${item.title} ${item.unit} ${item.vendorLabel} ${item.output} ${item.method}`.toLowerCase();
      const matchText = !keyword || text.includes(keyword);
      const matchFilter = filter === "All" || item.stage === filter || item.status === filter || item.priority === filter || item.urgency === filter;
      return matchText && matchFilter;
    });
  }, [enriched, query, filter]);

  const summary = useMemo(() => {
    const totalBudget = enriched.reduce((sum, item) => sum + item.budget, 0);
    const totalContract = enriched.reduce((sum, item) => sum + (item.contractValue || item.hps || 0), 0);
    const avgCompletion = enriched.length === 0 ? 0 : Math.round(enriched.reduce((sum, item) => sum + item.completion, 0) / enriched.length);
    const urgent = enriched.filter((item) => item.urgency === "Soon" || item.urgency === "Overdue" || item.status === "At Risk").length;
    const readyToClose = enriched.filter((item) => item.completion >= 90 && item.stage !== "Closed").length;
    const missingHps = enriched.filter((item) => item.missingDocs.includes("hps")).length;
    return { total: enriched.length, totalBudget, totalContract, avgCompletion, urgent, readyToClose, missingHps };
  }, [enriched]);

  function addPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const documents = { ...emptyDocuments };
    (Object.keys(documentLabels) as DocumentKey[]).forEach((key) => {
      documents[key] = form.get(key) === "on";
    });
    const record: PackageRecord = {
      id: crypto.randomUUID(),
      packageNo: textFromForm(form, "packageNo") || `PKG-${String(packages.length + 1).padStart(3, "0")}`,
      title: textFromForm(form, "title") || "Paket pengadaan baru",
      unit: textFromForm(form, "unit") || "Unit kerja",
      method: textFromForm(form, "method") as ProcurementMethod,
      stage: textFromForm(form, "stage") as Stage,
      status: textFromForm(form, "status") as Status,
      priority: textFromForm(form, "priority") as Priority,
      budget: numberFromForm(form, "budget"),
      hps: numberFromForm(form, "hps"),
      contractValue: numberFromForm(form, "contractValue"),
      vendorLabel: textFromForm(form, "vendorLabel"),
      startDate: textFromForm(form, "startDate"),
      dueDate: textFromForm(form, "dueDate"),
      output: textFromForm(form, "output"),
      risk: textFromForm(form, "risk"),
      nextAction: textFromForm(form, "nextAction"),
      notes: textFromForm(form, "notes"),
      documents,
      createdAt: new Date().toISOString(),
    };
    setPackages((previous) => [record, ...previous]);
    setSelectedId(record.id);
    event.currentTarget.reset();
  }

  function updatePackage(id: string, patch: Partial<PackageRecord>) {
    setPackages((previous) => previous.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function toggleDoc(id: string, key: DocumentKey) {
    setPackages((previous) => previous.map((item) => item.id === id ? { ...item, documents: { ...item.documents, [key]: !item.documents[key] } } : item));
  }

  function removePackage(id: string) {
    setPackages((previous) => previous.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function loadSample() {
    setPackages(samplePackages);
    setSelectedId(samplePackages[0]?.id ?? null);
  }

  function clearWorkspace() {
    setPackages([]);
    setSelectedId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ packages }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "procurement-workflow-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Nomor", "Paket", "Unit", "Metode", "Tahap", "Status", "Prioritas", "Pagu", "HPS", "Kontrak", "Progress", "Urgency", "Dokumen Kurang", "Rekomendasi", "Next Action"];
    const rows = enriched.map((item) => [
      item.packageNo,
      item.title,
      item.unit,
      item.method,
      item.stage,
      item.status,
      item.priority,
      String(item.budget),
      String(item.hps),
      String(item.contractValue),
      `${item.completion}%`,
      item.urgency,
      item.missingDocs.map((key) => documentLabels[key]).join(" | "),
      item.recommendation,
      item.nextAction,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "procurement-workflow-recap.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setPackages(Array.isArray(parsed.packages) ? parsed.packages : []);
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
              <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">Procurement</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">Procurement Workflow</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
                Workspace cerdas untuk mengelola paket, membaca kelengkapan dokumen, memantau anggaran, menemukan bottleneck, dan menyiapkan brief tindak lanjut pengadaan.
              </p>
            </div>
            <span className="rounded-full border border-teal/30 bg-teal/10 px-4 py-1 text-xs font-bold text-teal">Smart Beta</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Wilayah" value="Indonesia" />
            <InfoCard label="Scope" value="Document Workflow" />
            <InfoCard label="Update" value="2026-07-10" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>Data tersimpan lokal di browser. Gunakan data contoh atau data aman untuk publik. Jangan masukkan data penyedia, kontrak, harga sensitif, dokumen internal, atau informasi rahasia.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <MetricCard icon={Boxes} label="Paket" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={WalletCards} label="Pagu" value={formatCurrency(summary.totalBudget)} tone="neutral" />
          <MetricCard icon={ReceiptText} label="Nilai berjalan" value={formatCurrency(summary.totalContract)} tone="neutral" />
          <MetricCard icon={ClipboardCheck} label="Progress rata-rata" value={`${summary.avgCompletion}%`} tone={summary.avgCompletion >= 75 ? "safe" : summary.avgCompletion >= 50 ? "medium" : "warning"} />
          <MetricCard icon={AlertTriangle} label="Perlu perhatian" value={`${summary.urgent}`} tone={summary.urgent === 0 ? "safe" : "danger"} />
          <MetricCard icon={FileCheck2} label="Siap final" value={`${summary.readyToClose}`} tone="prime" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Command Center" icon={Sparkles}>
            {selected ? <CommandCenter item={selected} onUpdate={updatePackage} onToggleDoc={toggleDoc} onCopyBrief={copyBrief} copied={copied} /> : <EmptyState title="Belum ada paket" description="Tambahkan paket baru atau muat contoh untuk melihat command center." />}
          </Panel>

          <Panel title="Tambah Paket" icon={Plus}>
            <ProcurementForm onSubmit={addPackage} />
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Pipeline" icon={Layers3}>
            <Pipeline packages={enriched} onSelect={setSelectedId} selectedId={selectedId} />
          </Panel>

          <Panel title="Register Pengadaan" icon={FileSpreadsheet}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[230px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari paket, unit, metode, penyedia" className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-teal/20 focus:ring-4" />
              </div>
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
                <option>All</option>
                {stages.map((item) => <option key={item}>{item}</option>)}
                {statuses.map((item) => <option key={item}>{item}</option>)}
                {priorities.map((item) => <option key={item}>{item}</option>)}
                <option>Overdue</option>
                <option>Soon</option>
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
              <EmptyState title="Belum ada data" description="Tambahkan paket atau klik Contoh untuk mencoba workflow, pipeline, dan smart brief." />
            ) : (
              <PackageTable packages={filtered} selectedId={selectedId} onSelect={setSelectedId} onRemove={removePackage} />
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function ProcurementForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="packageNo" label="Nomor/label paket" placeholder="PKG-001" />
        <TextInput name="title" label="Nama paket" placeholder="Nama paket pengadaan" />
        <TextInput name="unit" label="Unit/pemilik kebutuhan" placeholder="Unit kerja" />
        <TextInput name="vendorLabel" label="Penyedia/label" placeholder="Gunakan label aman" />
        <SelectText name="method" label="Metode" options={methods} defaultValue="Direct Procurement" />
        <SelectText name="stage" label="Tahap" options={stages} defaultValue="Planning" />
        <SelectText name="status" label="Status" options={statuses} defaultValue="Draft" />
        <SelectText name="priority" label="Prioritas" options={priorities} defaultValue="Normal" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput name="budget" label="Pagu" type="number" placeholder="0" />
        <TextInput name="hps" label="HPS/OE" type="number" placeholder="0" />
        <TextInput name="contractValue" label="Nilai kontrak" type="number" placeholder="0" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="startDate" label="Tanggal mulai" type="date" />
        <TextInput name="dueDate" label="Target selesai" type="date" />
      </div>
      <TextArea name="output" label="Output" placeholder="Hasil yang harus tersedia" />
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea name="risk" label="Risiko proses" placeholder="Risiko jadwal, spesifikasi, harga, dokumen, atau penyedia" />
        <TextArea name="nextAction" label="Next action" placeholder="Tindakan berikutnya" />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-black text-navy">Checklist dokumen</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(documentLabels) as DocumentKey[]).map((key) => (
            <label key={key} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-100">
              <input name={key} type="checkbox" className="h-4 w-4 accent-teal" />
              {documentLabels[key]}
            </label>
          ))}
        </div>
      </div>
      <TextArea name="notes" label="Catatan" placeholder="Catatan aman untuk publik" />
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Plus size={18} /> Tambah paket
      </button>
    </form>
  );
}

function CommandCenter({ item, onUpdate, onToggleDoc, onCopyBrief, copied }: { item: EnrichedPackage; onUpdate: (id: string, patch: Partial<PackageRecord>) => void; onToggleDoc: (id: string, key: DocumentKey) => void; onCopyBrief: () => void; copied: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Selected package</p>
            <h2 className="mt-2 text-3xl font-black">{item.packageNo}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.title} · {item.unit}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-teal">{item.completion}%</p>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">document ready</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{item.recommendation}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Urgency" value={item.urgency} />
        <InfoPill label="Budget usage" value={`${item.budgetUsage}%`} />
        <InfoPill label="Saving/gap" value={formatCurrency(item.saving)} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="font-black text-navy">Magic brief</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Ringkasan otomatis untuk rapat singkat, tindak lanjut, atau catatan monitoring.</p>
        <button onClick={onCopyBrief} className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2 text-sm font-bold text-white">
          <Sparkles size={16} /> {copied ? "Brief tersalin" : "Copy smart brief"}
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-black text-navy">Document map</p>
            <p className="mt-1 text-xs text-slate-500">Klik dokumen untuk mengubah status kelengkapan.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">Kurang {item.missingDocs.length}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(documentLabels) as DocumentKey[]).map((key) => (
            <button key={key} onClick={() => onToggleDoc(item.id, key)} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-bold ring-1 ${item.documents[key] ? "bg-teal/10 text-teal ring-teal/20" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>
              <CheckCircle2 size={16} /> {documentLabels[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InlineSelect label="Tahap" value={item.stage} options={stages} onChange={(value) => onUpdate(item.id, { stage: value as Stage })} />
        <InlineSelect label="Status" value={item.status} options={statuses} onChange={(value) => onUpdate(item.id, { status: value as Status })} />
      </div>
    </div>
  );
}

function Pipeline({ packages, onSelect, selectedId }: { packages: EnrichedPackage[]; onSelect: (id: string) => void; selectedId: string | null }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
      {stages.map((stage) => {
        const items = packages.filter((item) => item.stage === stage);
        const avg = items.length === 0 ? 0 : Math.round(items.reduce((sum, item) => sum + item.completion, 0) / items.length);
        return (
          <div key={stage} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-navy">{stage}</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">{items.length} paket · {avg}%</span>
            </div>
            <div className="mt-3 space-y-2">
              {items.length === 0 ? <p className="text-xs text-slate-400">Belum ada paket.</p> : null}
              {items.map((item) => (
                <button key={item.id} onClick={() => onSelect(item.id)} className={`w-full rounded-2xl bg-white p-3 text-left text-sm ring-1 transition hover:ring-teal ${selectedId === item.id ? "ring-teal" : "ring-slate-200"}`}>
                  <p className="font-black text-navy">{item.packageNo}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.title}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal" style={{ width: `${item.completion}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PackageTable({ packages, selectedId, onSelect, onRemove }: { packages: EnrichedPackage[]; selectedId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Paket</th>
              <th className="px-4 py-3">Tahap</th>
              <th className="px-4 py-3">Anggaran</th>
              <th className="px-4 py-3">Dokumen</th>
              <th className="px-4 py-3">Sinyal</th>
              <th className="px-4 py-3">Next Action</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {packages.map((item) => (
              <tr key={item.id} className={selectedId === item.id ? "bg-teal/5" : ""}>
                <td className="px-4 py-4 align-top">
                  <button onClick={() => onSelect(item.id)} className="text-left">
                    <p className="font-black text-navy">{item.packageNo} · {item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.unit} · {item.method}</p>
                  </button>
                </td>
                <td className="px-4 py-4 align-top"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item.stage}</span><br /><span className="mt-2 inline-block text-xs text-slate-500">{item.status}</span></td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">Pagu {formatCurrency(item.budget)}<br />HPS {formatCurrency(item.hps)}<br />Kontrak {formatCurrency(item.contractValue)}</td>
                <td className="px-4 py-4 align-top"><ProgressBadge value={item.completion} /></td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{item.urgency}<br />{item.priority}</td>
                <td className="max-w-xs px-4 py-4 align-top text-xs leading-5 text-slate-600">{item.nextAction || item.recommendation}</td>
                <td className="px-4 py-4 align-top text-right"><button onClick={() => onRemove(item.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus paket"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProgressBadge({ value }: { value: number }) {
  const tone = value >= 85 ? "bg-teal/10 text-teal ring-teal/20" : value >= 60 ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-rose-50 text-rose-700 ring-rose-200";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${tone}`}>{value}%</span>;
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

function TextInput({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder?: string; type?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input name={name} type={type} min={type === "number" ? 0 : undefined} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
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
  const toneClass = tone === "safe" ? "bg-teal/10 text-teal" : tone === "danger" ? "bg-rose-50 text-rose-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : tone === "medium" ? "bg-yellow-50 text-yellow-700" : tone === "prime" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-navy";
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
      <Lightbulb className="mx-auto text-slate-400" size={32} />
      <h3 className="mt-3 text-lg font-black text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
