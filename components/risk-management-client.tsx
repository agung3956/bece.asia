"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  Eraser,
  FileSpreadsheet,
  Gauge,
  Layers3,
  Plus,
  Radar,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Trash2,
  Upload,
} from "lucide-react";

type RiskStatus = "Open" | "Mitigating" | "Monitoring" | "Closed";
type Strategy = "Reduce" | "Avoid" | "Transfer" | "Accept";
type ControlEffectiveness = "Weak" | "Moderate" | "Adequate" | "Strong";
type Trend = "Stable" | "Up" | "Down";

type RiskRecord = {
  id: string;
  code: string;
  area: string;
  objective: string;
  event: string;
  cause: string;
  impactDescription: string;
  owner: string;
  likelihood: number;
  impact: number;
  residualLikelihood: number;
  residualImpact: number;
  targetLikelihood: number;
  targetImpact: number;
  control: string;
  effectiveness: ControlEffectiveness;
  treatment: Strategy;
  actionPlan: string;
  dueDate: string;
  indicator: string;
  threshold: string;
  currentValue: string;
  trend: Trend;
  status: RiskStatus;
  createdAt: string;
};

type StoredData = {
  risks: RiskRecord[];
};

type RiskLevel = {
  tier: 1 | 2 | 3 | 4 | 5;
  label: string;
  range: string;
  colorName: string;
  cellClass: string;
  badgeClass: string;
  textClass: string;
};

const STORAGE_KEY = "beceasia:risk-management-tool:v1";

const impactLabels = [
  "Tidak Signifikan",
  "Minor",
  "Moderat",
  "Signifikan",
  "Sangat Signifikan",
];

const likelihoodLabels = [
  "Hampir Tidak terjadi",
  "Jarang terjadi",
  "Kadang terjadi",
  "Sering terjadi",
  "Hampir Pasti terjadi",
];

const matrixValues: Record<number, Record<number, number>> = {
  1: { 1: 1, 2: 5, 3: 10, 4: 15, 5: 20 },
  2: { 1: 2, 2: 6, 3: 11, 4: 16, 5: 21 },
  3: { 1: 3, 2: 8, 3: 13, 4: 18, 5: 23 },
  4: { 1: 4, 2: 9, 3: 14, 4: 19, 5: 24 },
  5: { 1: 7, 2: 12, 3: 17, 4: 22, 5: 25 },
};

const blankRisk = {
  code: "",
  area: "",
  objective: "",
  event: "",
  cause: "",
  impactDescription: "",
  owner: "",
  likelihood: 3,
  impact: 3,
  residualLikelihood: 2,
  residualImpact: 3,
  targetLikelihood: 2,
  targetImpact: 2,
  control: "",
  effectiveness: "Moderate" as ControlEffectiveness,
  treatment: "Reduce" as Strategy,
  actionPlan: "",
  dueDate: "",
  indicator: "",
  threshold: "",
  currentValue: "",
  trend: "Stable" as Trend,
  status: "Open" as RiskStatus,
};

const sampleRisks: RiskRecord[] = [
  {
    id: "sample-1",
    code: "R-01",
    area: "Layanan digital",
    objective: "Menjaga layanan tetap tersedia dan mudah diakses.",
    event: "Gangguan aplikasi saat trafik meningkat.",
    cause: "Kapasitas server dan pengujian beban belum memadai.",
    impactDescription: "Layanan tertunda, pengguna gagal mengakses fitur utama.",
    owner: "Product Owner",
    likelihood: 4,
    impact: 4,
    residualLikelihood: 3,
    residualImpact: 3,
    targetLikelihood: 2,
    targetImpact: 3,
    control: "Monitoring uptime, backup deployment, dan checklist rilis.",
    effectiveness: "Adequate",
    treatment: "Reduce",
    actionPlan: "Tambahkan health check dan simulasi load test bulanan.",
    dueDate: "",
    indicator: "Uptime aplikasi",
    threshold: ">= 99%",
    currentValue: "98,5%",
    trend: "Down",
    status: "Mitigating",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    code: "R-02",
    area: "Data publik",
    objective: "Memastikan data yang ditampilkan aman untuk publik.",
    event: "Data internal terbawa ke aplikasi publik.",
    cause: "Belum ada proses sanitasi sebelum publikasi.",
    impactDescription: "Risiko reputasi dan pelanggaran tata kelola data.",
    owner: "Content Reviewer",
    likelihood: 3,
    impact: 5,
    residualLikelihood: 2,
    residualImpact: 4,
    targetLikelihood: 1,
    targetImpact: 3,
    control: "Review konten, masking data, dan daftar larangan publikasi.",
    effectiveness: "Strong",
    treatment: "Reduce",
    actionPlan: "Buat checklist sanitasi wajib sebelum deploy.",
    dueDate: "",
    indicator: "Temuan data sensitif",
    threshold: "0 temuan",
    currentValue: "0",
    trend: "Stable",
    status: "Monitoring",
    createdAt: new Date().toISOString(),
  },
];

function scoreFor(likelihood: number, impact: number) {
  return matrixValues[likelihood]?.[impact] ?? 1;
}

function levelFor(score: number): RiskLevel {
  if (score >= 20) {
    return {
      tier: 5,
      label: "Sangat Tinggi",
      range: "20 - 25",
      colorName: "Merah",
      cellClass: "bg-red-600 text-white",
      badgeClass: "bg-red-100 text-red-700 ring-red-200",
      textClass: "text-red-700",
    };
  }
  if (score >= 16) {
    return {
      tier: 4,
      label: "Tinggi",
      range: "16 - 19",
      colorName: "Oranye",
      cellClass: "bg-orange-500 text-white",
      badgeClass: "bg-orange-100 text-orange-700 ring-orange-200",
      textClass: "text-orange-700",
    };
  }
  if (score >= 12) {
    return {
      tier: 3,
      label: "Sedang",
      range: "12 - 15",
      colorName: "Kuning",
      cellClass: "bg-yellow-300 text-slate-950",
      badgeClass: "bg-yellow-100 text-yellow-800 ring-yellow-200",
      textClass: "text-yellow-800",
    };
  }
  if (score >= 6) {
    return {
      tier: 2,
      label: "Rendah",
      range: "6 - 11",
      colorName: "Hijau",
      cellClass: "bg-emerald-500 text-white",
      badgeClass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      textClass: "text-emerald-700",
    };
  }
  return {
    tier: 1,
    label: "Sangat Rendah",
    range: "1 - 5",
    colorName: "Biru",
    cellClass: "bg-sky-500 text-white",
    badgeClass: "bg-sky-100 text-sky-700 ring-sky-200",
    textClass: "text-sky-700",
  };
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function textFromForm(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function numberFromForm(form: FormData, key: string) {
  const value = Number(form.get(key) || 1);
  return Math.min(5, Math.max(1, value));
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function RiskManagementClient() {
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        setRisks(Array.isArray(parsed.risks) ? parsed.risks : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ risks }));
  }, [loaded, risks]);

  const enrichedRisks = useMemo(() => {
    return risks.map((risk) => {
      const inherentScore = scoreFor(risk.likelihood, risk.impact);
      const residualScore = scoreFor(risk.residualLikelihood, risk.residualImpact);
      const targetScore = scoreFor(risk.targetLikelihood, risk.targetImpact);
      return {
        ...risk,
        inherentScore,
        residualScore,
        targetScore,
        inherentLevel: levelFor(inherentScore),
        residualLevel: levelFor(residualScore),
        targetLevel: levelFor(targetScore),
        gap: Math.max(0, residualScore - targetScore),
      };
    });
  }, [risks]);

  const filteredRisks = useMemo(() => {
    if (filter === "All") return enrichedRisks;
    return enrichedRisks.filter((risk) => risk.residualLevel.label === filter || risk.status === filter);
  }, [enrichedRisks, filter]);

  const summary = useMemo(() => {
    const veryHigh = enrichedRisks.filter((risk) => risk.residualLevel.tier === 5).length;
    const high = enrichedRisks.filter((risk) => risk.residualLevel.tier === 4).length;
    const medium = enrichedRisks.filter((risk) => risk.residualLevel.tier === 3).length;
    const openAction = enrichedRisks.filter((risk) => risk.status !== "Closed").length;
    const overdue = enrichedRisks.filter((risk) => risk.dueDate && risk.dueDate < todayIso() && risk.status !== "Closed").length;
    const averageResidual = enrichedRisks.length === 0
      ? 0
      : Math.round(enrichedRisks.reduce((sum, risk) => sum + risk.residualScore, 0) / enrichedRisks.length);
    return { total: enrichedRisks.length, veryHigh, high, medium, openAction, overdue, averageResidual };
  }, [enrichedRisks]);

  const selectedRisk = enrichedRisks.find((risk) => risk.id === selectedId) ?? enrichedRisks[0];

  function addRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextRisk: RiskRecord = {
      id: crypto.randomUUID(),
      code: textFromForm(form, "code") || `R-${String(risks.length + 1).padStart(2, "0")}`,
      area: textFromForm(form, "area") || "Area proses",
      objective: textFromForm(form, "objective"),
      event: textFromForm(form, "event") || "Peristiwa risiko belum diisi",
      cause: textFromForm(form, "cause"),
      impactDescription: textFromForm(form, "impactDescription"),
      owner: textFromForm(form, "owner") || "Owner belum ditetapkan",
      likelihood: numberFromForm(form, "likelihood"),
      impact: numberFromForm(form, "impact"),
      residualLikelihood: numberFromForm(form, "residualLikelihood"),
      residualImpact: numberFromForm(form, "residualImpact"),
      targetLikelihood: numberFromForm(form, "targetLikelihood"),
      targetImpact: numberFromForm(form, "targetImpact"),
      control: textFromForm(form, "control"),
      effectiveness: textFromForm(form, "effectiveness") as ControlEffectiveness,
      treatment: textFromForm(form, "treatment") as Strategy,
      actionPlan: textFromForm(form, "actionPlan"),
      dueDate: textFromForm(form, "dueDate"),
      indicator: textFromForm(form, "indicator"),
      threshold: textFromForm(form, "threshold"),
      currentValue: textFromForm(form, "currentValue"),
      trend: textFromForm(form, "trend") as Trend,
      status: textFromForm(form, "status") as RiskStatus,
      createdAt: new Date().toISOString(),
    };
    setRisks((previous) => [nextRisk, ...previous]);
    setSelectedId(nextRisk.id);
    event.currentTarget.reset();
  }

  function removeRisk(id: string) {
    setRisks((previous) => previous.filter((risk) => risk.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateRisk(id: string, patch: Partial<RiskRecord>) {
    setRisks((previous) => previous.map((risk) => risk.id === id ? { ...risk, ...patch } : risk));
  }

  function clearWorkspace() {
    setRisks([]);
    setSelectedId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function loadSample() {
    setRisks(sampleRisks);
    setSelectedId(sampleRisks[0]?.id ?? null);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ risks }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "risk-management-register.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = [
      "Kode",
      "Area",
      "Tujuan",
      "Peristiwa Risiko",
      "Penyebab",
      "Dampak",
      "Owner",
      "Kemungkinan",
      "Dampak Level",
      "Skor Inheren",
      "Level Inheren",
      "Pengendalian",
      "Efektivitas",
      "Skor Residual",
      "Level Residual",
      "Target Score",
      "Strategi",
      "Rencana Aksi",
      "Jatuh Tempo",
      "IRU",
      "Threshold",
      "Nilai Saat Ini",
      "Tren",
      "Status",
    ];
    const rows = enrichedRisks.map((risk) => [
      risk.code,
      risk.area,
      risk.objective,
      risk.event,
      risk.cause,
      risk.impactDescription,
      risk.owner,
      String(risk.likelihood),
      String(risk.impact),
      String(risk.inherentScore),
      risk.inherentLevel.label,
      risk.control,
      risk.effectiveness,
      String(risk.residualScore),
      risk.residualLevel.label,
      String(risk.targetScore),
      risk.treatment,
      risk.actionPlan,
      risk.dueDate,
      risk.indicator,
      risk.threshold,
      risk.currentValue,
      risk.trend,
      risk.status,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "risk-management-register.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setRisks(Array.isArray(parsed.risks) ? parsed.risks : []);
      } catch {
        alert("File JSON tidak dapat dibaca.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">Administration</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">Manajemen Risiko Tool</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
                Workspace untuk register risiko, matriks analisis 5 x 5, peta pengendalian, target risiko residual, rencana mitigasi, dan indikator risiko utama.
              </p>
            </div>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-xs font-bold text-violet-700">Advanced Beta</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Wilayah" value="Indonesia" />
            <InfoCard label="Scope" value="Governance" />
            <InfoCard label="Update" value="2026-07-09" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>
                Data tersimpan lokal di browser melalui localStorage. Gunakan data contoh atau data yang aman untuk publik. Jangan masukkan informasi rahasia, identitas pribadi, atau data operasional sensitif.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <MetricCard icon={ClipboardList} label="Total risiko" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={AlertTriangle} label="Sangat tinggi" value={`${summary.veryHigh}`} tone={summary.veryHigh === 0 ? "safe" : "danger"} />
          <MetricCard icon={Gauge} label="Tinggi" value={`${summary.high}`} tone={summary.high === 0 ? "safe" : "warning"} />
          <MetricCard icon={BarChart3} label="Sedang" value={`${summary.medium}`} tone="neutral" />
          <MetricCard icon={Activity} label="Aksi terbuka" value={`${summary.openAction}`} tone="neutral" />
          <MetricCard icon={Target} label="Rata-rata residual" value={`${summary.averageResidual}`} tone={summary.averageResidual >= 16 ? "danger" : summary.averageResidual >= 12 ? "warning" : "safe"} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <Panel title="Matriks analisis risiko" icon={Radar}>
            <RiskMatrix risks={enrichedRisks} onSelect={setSelectedId} selectedId={selectedId} />
            <RiskLegend />
          </Panel>

          <Panel title="Input register risiko" icon={Plus}>
            <RiskForm onSubmit={addRisk} />
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Peta pengendalian dan IRU" icon={SlidersHorizontal}>
            {selectedRisk ? (
              <RiskDetail risk={selectedRisk} onUpdate={updateRisk} />
            ) : (
              <EmptyState title="Belum ada risiko dipilih" description="Tambah risiko baru atau muat contoh data untuk melihat peta pengendalian dan indikator risiko utama." />
            )}
          </Panel>

          <Panel title="Register risiko" icon={FileSpreadsheet}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
                <option>All</option>
                <option>Sangat Tinggi</option>
                <option>Tinggi</option>
                <option>Sedang</option>
                <option>Rendah</option>
                <option>Sangat Rendah</option>
                <option>Open</option>
                <option>Mitigating</option>
                <option>Monitoring</option>
                <option>Closed</option>
              </select>
              <button onClick={loadSample} className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2 text-sm font-bold text-white"><Layers3 size={16} /> Muat contoh</button>
              <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold text-white"><Download size={16} /> JSON</button>
              <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy ring-1 ring-slate-200"><ArrowDownToLine size={16} /> CSV</button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy ring-1 ring-slate-200">
                <Upload size={16} /> Import
                <input type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
              </label>
              <button onClick={clearWorkspace} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-100"><Eraser size={16} /> Bersihkan</button>
            </div>

            {filteredRisks.length === 0 ? (
              <EmptyState title="Belum ada register risiko" description="Tambahkan risiko baru dari form. Matriks, level, dan prioritas akan dihitung otomatis." />
            ) : (
              <RiskTable risks={filteredRisks} selectedId={selectedId} onSelect={setSelectedId} onRemove={removeRisk} />
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function RiskForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="code" label="Kode risiko" placeholder="R-01" />
        <TextInput name="area" label="Area/proses" placeholder="Contoh: Layanan digital" />
        <TextInput name="owner" label="Risk owner" placeholder="Pemilik risiko" />
        <TextInput name="dueDate" label="Target aksi" type="date" />
      </div>
      <TextInput name="objective" label="Tujuan proses" placeholder="Tujuan yang ingin dijaga" />
      <TextArea name="event" label="Peristiwa risiko" placeholder="Apa yang dapat menghambat tujuan?" />
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea name="cause" label="Penyebab" placeholder="Sumber/akar masalah" />
        <TextArea name="impactDescription" label="Dampak" placeholder="Dampak jika risiko terjadi" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectInput name="likelihood" label="Kemungkinan inheren" options={[1, 2, 3, 4, 5]} />
        <SelectInput name="impact" label="Dampak inheren" options={[1, 2, 3, 4, 5]} />
        <SelectText name="treatment" label="Strategi" options={["Reduce", "Avoid", "Transfer", "Accept"]} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectInput name="residualLikelihood" label="Kemungkinan residual" options={[1, 2, 3, 4, 5]} defaultValue={blankRisk.residualLikelihood} />
        <SelectInput name="residualImpact" label="Dampak residual" options={[1, 2, 3, 4, 5]} defaultValue={blankRisk.residualImpact} />
        <SelectText name="effectiveness" label="Efektivitas kontrol" options={["Weak", "Moderate", "Adequate", "Strong"]} defaultValue="Moderate" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea name="control" label="Pengendalian yang ada" placeholder="Kontrol yang sudah berjalan" />
        <TextArea name="actionPlan" label="Rencana mitigasi" placeholder="Aksi perbaikan dan tindak lanjut" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectInput name="targetLikelihood" label="Target kemungkinan" options={[1, 2, 3, 4, 5]} defaultValue={blankRisk.targetLikelihood} />
        <SelectInput name="targetImpact" label="Target dampak" options={[1, 2, 3, 4, 5]} defaultValue={blankRisk.targetImpact} />
        <SelectText name="status" label="Status" options={["Open", "Mitigating", "Monitoring", "Closed"]} defaultValue="Open" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput name="indicator" label="IRU/KRI" placeholder="Contoh: Uptime aplikasi" />
        <TextInput name="threshold" label="Threshold" placeholder="Contoh: >= 99%" />
        <TextInput name="currentValue" label="Nilai saat ini" placeholder="Contoh: 98,5%" />
      </div>
      <SelectText name="trend" label="Tren indikator" options={["Stable", "Up", "Down"]} defaultValue="Stable" />
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Plus size={18} /> Tambah risiko
      </button>
    </form>
  );
}

function RiskMatrix({ risks, onSelect, selectedId }: { risks: Array<RiskRecord & { residualScore: number; residualLevel: RiskLevel }>; onSelect: (id: string) => void; selectedId: string | null }) {
  const rows = [5, 4, 3, 2, 1];
  const cols = [1, 2, 3, 4, 5];
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-300 bg-white">
      <div className="grid grid-cols-[150px_repeat(5,minmax(74px,1fr))] bg-slate-100 text-center text-xs font-black text-slate-700">
        <div className="row-span-2 flex items-center justify-center border-b border-r border-slate-300 p-3 text-sm">Matriks Analisis Risiko</div>
        <div className="col-span-5 border-b border-slate-300 p-3 text-sm">Level Dampak</div>
        {cols.map((impact) => <div key={impact} className="border-b border-r border-slate-300 p-2 last:border-r-0">{impact}<br /><span className="text-[10px] font-medium">{impactLabels[impact - 1]}</span></div>)}
      </div>
      {rows.map((likelihood) => (
        <div key={likelihood} className="grid grid-cols-[150px_repeat(5,minmax(74px,1fr))]">
          <div className="flex items-center gap-2 border-b border-r border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-700">
            <span className="text-lg font-black text-navy">{likelihood}</span>
            <span>{likelihoodLabels[likelihood - 1]}</span>
          </div>
          {cols.map((impact) => {
            const score = scoreFor(likelihood, impact);
            const level = levelFor(score);
            const cellRisks = risks.filter((risk) => risk.residualLikelihood === likelihood && risk.residualImpact === impact);
            return (
              <div key={`${likelihood}-${impact}`} className={`relative min-h-[82px] border-b border-r border-slate-300 p-2 last:border-r-0 ${level.cellClass}`}>
                <div className="text-center text-xl font-black">{score}</div>
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {cellRisks.slice(0, 4).map((risk) => (
                    <button key={risk.id} onClick={() => onSelect(risk.id)} title={`${risk.code} - ${risk.event}`} className={`grid h-7 min-w-7 place-items-center rounded-full bg-slate-950 px-1.5 text-[10px] font-black text-white ring-2 ${selectedId === risk.id ? "ring-white" : "ring-black/10"}`}>
                      {risk.code.replace("R-", "")}
                    </button>
                  ))}
                  {cellRisks.length > 4 ? <span className="rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-white">+{cellRisks.length - 4}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function RiskLegend() {
  const legends = [levelFor(25), levelFor(19), levelFor(15), levelFor(11), levelFor(5)];
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
      <div className="grid grid-cols-4 bg-slate-100 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        <div className="p-3">Tingkatan</div>
        <div className="p-3">Level Risiko</div>
        <div className="p-3">Besaran Risiko</div>
        <div className="p-3">Warna</div>
      </div>
      {legends.map((legend) => (
        <div key={legend.tier} className="grid grid-cols-4 border-t border-slate-200 text-sm">
          <div className="p-3 font-bold">{legend.tier}</div>
          <div className="p-3 font-bold text-navy">{legend.label}</div>
          <div className="p-3">{legend.range}</div>
          <div className={`p-3 font-bold ${legend.cellClass}`}>{legend.colorName}</div>
        </div>
      ))}
    </div>
  );
}

function RiskDetail({ risk, onUpdate }: { risk: RiskRecord & { inherentScore: number; residualScore: number; targetScore: number; inherentLevel: RiskLevel; residualLevel: RiskLevel; targetLevel: RiskLevel; gap: number }; onUpdate: (id: string, patch: Partial<RiskRecord>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-teal">{risk.code}</p>
        <h3 className="mt-2 text-2xl font-black text-navy">{risk.event}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{risk.area} · Owner: {risk.owner}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <ScoreBox title="Inheren" score={risk.inherentScore} level={risk.inherentLevel} />
        <ScoreBox title="Residual" score={risk.residualScore} level={risk.residualLevel} />
        <ScoreBox title="Target" score={risk.targetScore} level={risk.targetLevel} />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
        <p className="font-black text-navy">Pengendalian</p>
        <p className="mt-2">{risk.control || "Belum ada pengendalian yang diisi."}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InlineSelect label="Efektivitas" value={risk.effectiveness} options={["Weak", "Moderate", "Adequate", "Strong"]} onChange={(value) => onUpdate(risk.id, { effectiveness: value as ControlEffectiveness })} />
          <InlineSelect label="Status" value={risk.status} options={["Open", "Mitigating", "Monitoring", "Closed"]} onChange={(value) => onUpdate(risk.id, { status: value as RiskStatus })} />
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
        <p className="font-black text-navy">Rencana mitigasi</p>
        <p className="mt-2">{risk.actionPlan || "Belum ada rencana aksi."}</p>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Jatuh tempo: {risk.dueDate || "Belum ditentukan"}</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
        <p className="font-black text-navy">Indikator Risiko Utama</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <InfoPill label="IRU" value={risk.indicator || "Belum diisi"} />
          <InfoPill label="Threshold" value={risk.threshold || "Belum diisi"} />
          <InfoPill label="Saat ini" value={risk.currentValue || "Belum diisi"} />
        </div>
        <p className="mt-4 text-sm">Tren: <span className="font-black text-navy">{risk.trend}</span></p>
      </div>
    </div>
  );
}

function RiskTable({ risks, selectedId, onSelect, onRemove }: { risks: Array<RiskRecord & { residualScore: number; residualLevel: RiskLevel; targetScore: number; gap: number }>; selectedId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Risiko</th>
              <th className="px-4 py-3">Residual</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Kontrol</th>
              <th className="px-4 py-3">IRU</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {risks.map((risk) => (
              <tr key={risk.id} className={selectedId === risk.id ? "bg-teal/5" : ""}>
                <td className="px-4 py-4 align-top">
                  <button onClick={() => onSelect(risk.id)} className="text-left">
                    <p className="font-black text-navy">{risk.code} · {risk.area}</p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{risk.event}</p>
                  </button>
                </td>
                <td className="px-4 py-4 align-top">
                  <RiskBadge score={risk.residualScore} level={risk.residualLevel} />
                </td>
                <td className="px-4 py-4 align-top text-slate-600">
                  <p className="font-bold text-navy">{risk.targetScore}</p>
                  <p className="text-xs">Gap {risk.gap}</p>
                </td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{risk.effectiveness}<br />{risk.treatment}</td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{risk.indicator || "-"}<br />{risk.currentValue || "-"}</td>
                <td className="px-4 py-4 align-top"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{risk.status}</span></td>
                <td className="px-4 py-4 align-top text-right">
                  <button onClick={() => onRemove(risk.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus risiko"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreBox({ title, score, level }: { title: string; score: number; level: RiskLevel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-navy">{score}</p>
      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${level.badgeClass}`}>{level.label}</span>
    </div>
  );
}

function RiskBadge({ score, level }: { score: number; level: RiskLevel }) {
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ring-1 ${level.badgeClass}`}>{score} · {level.label}</span>;
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
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 font-bold text-navy">{value}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <ShieldCheck className="mx-auto text-slate-400" size={32} />
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

function SelectInput({ name, label, options, defaultValue = 3 }: { name: string; label: string; options: number[]; defaultValue?: number }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
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
