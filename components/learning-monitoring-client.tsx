"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  Eraser,
  FileSpreadsheet,
  Gauge,
  GraduationCap,
  HelpCircle,
  Layers3,
  Lightbulb,
  Link2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UsersRound,
} from "lucide-react";

type Stage = "Onboarding" | "Learning" | "Practice" | "Mentoring" | "Showcase" | "Completed";
type Status = "Draft" | "Active" | "Need Support" | "At Risk" | "Completed";
type Priority = "Low" | "Normal" | "High" | "Critical";
type ProgramType = "Workshop" | "Bootcamp" | "Mentoring" | "Challenge" | "Community Class" | "Hybrid Program";

type LearningRecord = {
  id: string;
  programName: string;
  cohort: string;
  programType: ProgramType;
  teamName: string;
  learnerCount: number;
  mentorLabel: string;
  topic: string;
  stage: Stage;
  status: Status;
  priority: Priority;
  attendance: number;
  assignment: number;
  evidence: number;
  reflection: number;
  collaboration: number;
  impact: number;
  meetings: number;
  evidenceLinks: string;
  milestone: string;
  risk: string;
  nextAction: string;
  dueDate: string;
  notes: string;
  createdAt: string;
};

type StoredData = {
  records: LearningRecord[];
};

type ScoreLevel = {
  label: string;
  description: string;
  tone: "safe" | "medium" | "warning" | "danger" | "prime";
  badgeClass: string;
};

type EnrichedRecord = LearningRecord & {
  score: number;
  level: ScoreLevel;
  gaps: string[];
  quickWin: string;
  overdue: boolean;
  evidenceCount: number;
  stageProgress: number;
};

type Tone = "safe" | "medium" | "warning" | "danger" | "neutral" | "prime";

const STORAGE_KEY = "beceasia:learning-monitoring:v1";

const stages: Stage[] = ["Onboarding", "Learning", "Practice", "Mentoring", "Showcase", "Completed"];
const statuses: Status[] = ["Draft", "Active", "Need Support", "At Risk", "Completed"];
const priorities: Priority[] = ["Low", "Normal", "High", "Critical"];
const programTypes: ProgramType[] = ["Workshop", "Bootcamp", "Mentoring", "Challenge", "Community Class", "Hybrid Program"];

const sampleRecords: LearningRecord[] = [
  {
    id: "sample-1",
    programName: "Digital Growth Class",
    cohort: "Batch A",
    programType: "Bootcamp",
    teamName: "Team Alpha",
    learnerCount: 12,
    mentorLabel: "Mentor A",
    topic: "Digital product, content, and market validation",
    stage: "Practice",
    status: "Active",
    priority: "High",
    attendance: 88,
    assignment: 72,
    evidence: 70,
    reflection: 65,
    collaboration: 78,
    impact: 62,
    meetings: 4,
    evidenceLinks: "https://example.com/evidence-alpha",
    milestone: "Prototype and field validation",
    risk: "Assignment submission is slower than the weekly target.",
    nextAction: "Run a focused mentoring session and lock the next evidence checklist.",
    dueDate: "",
    notes: "Public sample data for simulation.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    programName: "Community Learning Sprint",
    cohort: "Open Cohort",
    programType: "Community Class",
    teamName: "Team Beta",
    learnerCount: 8,
    mentorLabel: "Mentor B",
    topic: "Presentation, problem framing, and project delivery",
    stage: "Mentoring",
    status: "Need Support",
    priority: "Normal",
    attendance: 76,
    assignment: 55,
    evidence: 48,
    reflection: 60,
    collaboration: 66,
    impact: 42,
    meetings: 3,
    evidenceLinks: "",
    milestone: "Evidence and reflection review",
    risk: "Evidence is not consistent across participants.",
    nextAction: "Simplify the evidence format and assign one team coordinator.",
    dueDate: "",
    notes: "Public sample data for simulation.",
    createdAt: new Date().toISOString(),
  },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function numberFromForm(form: FormData, key: string) {
  return clamp(Number(form.get(key) || 0));
}

function textFromForm(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function safeAverage(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function evidenceCount(value: string) {
  return value.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean).length;
}

function scoreLevel(score: number): ScoreLevel {
  if (score >= 85) return { label: "High Performing", description: "Program berjalan kuat, bukti lengkap, dan siap masuk showcase atau publikasi hasil.", tone: "prime", badgeClass: "bg-violet-50 text-violet-700 ring-violet-200" };
  if (score >= 70) return { label: "On Track", description: "Fondasi monitoring baik. Fokus pada gap kecil dan konsistensi evidence.", tone: "safe", badgeClass: "bg-teal/10 text-teal ring-teal/20" };
  if (score >= 55) return { label: "Needs Coaching", description: "Program masih berjalan, tetapi butuh intervensi mentor dan perapian bukti.", tone: "warning", badgeClass: "bg-amber-100 text-amber-700 ring-amber-200" };
  if (score >= 40) return { label: "Recovery Zone", description: "Perlu pemulihan ritme belajar, target mingguan, dan format evidence yang lebih sederhana.", tone: "medium", badgeClass: "bg-orange-100 text-orange-700 ring-orange-200" };
  return { label: "Critical Support", description: "Program membutuhkan pendampingan intensif sebelum dapat dinilai progresnya.", tone: "danger", badgeClass: "bg-rose-100 text-rose-700 ring-rose-200" };
}

function computeScore(record: LearningRecord) {
  const weighted =
    record.attendance * 0.16 +
    record.assignment * 0.18 +
    record.evidence * 0.18 +
    record.reflection * 0.14 +
    record.collaboration * 0.12 +
    record.impact * 0.12 +
    Math.min(100, record.meetings * 12) * 0.1;
  return Math.round(clamp(weighted));
}

function stageProgress(stage: Stage) {
  const index = stages.indexOf(stage);
  return index < 0 ? 0 : Math.round(((index + 1) / stages.length) * 100);
}

function buildGaps(record: LearningRecord) {
  const gaps: string[] = [];
  if (record.attendance < 70) gaps.push("Attendance");
  if (record.assignment < 70) gaps.push("Assignment");
  if (record.evidence < 70) gaps.push("Evidence");
  if (record.reflection < 70) gaps.push("Reflection");
  if (record.collaboration < 70) gaps.push("Collaboration");
  if (record.impact < 70) gaps.push("Impact");
  if (!record.evidenceLinks.trim()) gaps.push("Evidence links");
  return gaps;
}

function buildQuickWin(record: LearningRecord, gaps: string[]) {
  if (gaps.includes("Evidence") || gaps.includes("Evidence links")) return "Buat evidence checklist sederhana dan minta setiap tim unggah bukti mingguan.";
  if (gaps.includes("Assignment")) return "Pecah tugas besar menjadi weekly deliverables dan tetapkan batas submit yang jelas.";
  if (gaps.includes("Attendance")) return "Cek hambatan kehadiran dan ubah sesi menjadi format singkat yang lebih mudah diikuti.";
  if (gaps.includes("Reflection")) return "Tambahkan form refleksi 3 pertanyaan setelah setiap sesi.";
  if (record.stage === "Showcase") return "Siapkan pitch deck, bukti dampak, dan ringkasan pembelajaran final.";
  return "Pertahankan ritme monitoring dan pilih satu next action untuk minggu ini.";
}

function enrichRecord(record: LearningRecord): EnrichedRecord {
  const score = computeScore(record);
  const gaps = buildGaps(record);
  return {
    ...record,
    score,
    level: scoreLevel(score),
    gaps,
    quickWin: buildQuickWin(record, gaps),
    overdue: Boolean(record.dueDate && record.dueDate < todayIso() && record.status !== "Completed"),
    evidenceCount: evidenceCount(record.evidenceLinks),
    stageProgress: stageProgress(record.stage),
  };
}

function buildBrief(record: EnrichedRecord) {
  return [
    `Program: ${record.programName}`,
    `Cohort: ${record.cohort}`,
    `Team: ${record.teamName}`,
    `Topic: ${record.topic}`,
    `Stage: ${record.stage}`,
    `Status: ${record.status}`,
    `Score: ${record.score} - ${record.level.label}`,
    `Gap: ${record.gaps.join(", ") || "No major gap"}`,
    `Quick win: ${record.quickWin}`,
    `Next action: ${record.nextAction || "Not set"}`,
  ].join("\n");
}

export function LearningMonitoringClient() {
  const [records, setRecords] = useState<LearningRecord[]>([]);
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

  const enriched = useMemo(() => records.map(enrichRecord), [records]);
  const selected = enriched.find((item) => item.id === selectedId) ?? enriched[0];

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase();
    return enriched.filter((item) => {
      const text = `${item.programName} ${item.cohort} ${item.teamName} ${item.mentorLabel} ${item.topic} ${item.milestone}`.toLowerCase();
      const matchText = !keyword || text.includes(keyword);
      const matchFilter = filter === "All" || item.stage === filter || item.status === filter || item.priority === filter || item.programType === filter || item.level.label === filter;
      return matchText && matchFilter;
    });
  }, [enriched, query, filter]);

  const summary = useMemo(() => {
    const total = enriched.length;
    const learners = enriched.reduce((sum, item) => sum + item.learnerCount, 0);
    const avgScore = safeAverage(enriched.map((item) => item.score));
    const active = enriched.filter((item) => item.status === "Active" || item.status === "Need Support").length;
    const atRisk = enriched.filter((item) => item.status === "At Risk" || item.overdue || item.score < 55).length;
    const evidenceTotal = enriched.reduce((sum, item) => sum + item.evidenceCount, 0);
    const weakest = total === 0 ? "-" : [
      ["Attendance", safeAverage(enriched.map((item) => item.attendance))],
      ["Assignment", safeAverage(enriched.map((item) => item.assignment))],
      ["Evidence", safeAverage(enriched.map((item) => item.evidence))],
      ["Reflection", safeAverage(enriched.map((item) => item.reflection))],
      ["Collaboration", safeAverage(enriched.map((item) => item.collaboration))],
      ["Impact", safeAverage(enriched.map((item) => item.impact))],
    ].sort((a, b) => Number(a[1]) - Number(b[1]))[0][0] as string;
    return { total, learners, avgScore, active, atRisk, evidenceTotal, weakest };
  }, [enriched]);

  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const record: LearningRecord = {
      id: crypto.randomUUID(),
      programName: textFromForm(form, "programName") || "Learning Program",
      cohort: textFromForm(form, "cohort") || "General Cohort",
      programType: textFromForm(form, "programType") as ProgramType,
      teamName: textFromForm(form, "teamName") || "Team Baru",
      learnerCount: Math.max(0, Number(form.get("learnerCount") || 0)),
      mentorLabel: textFromForm(form, "mentorLabel") || "Mentor",
      topic: textFromForm(form, "topic") || "Learning topic",
      stage: textFromForm(form, "stage") as Stage,
      status: textFromForm(form, "status") as Status,
      priority: textFromForm(form, "priority") as Priority,
      attendance: numberFromForm(form, "attendance"),
      assignment: numberFromForm(form, "assignment"),
      evidence: numberFromForm(form, "evidence"),
      reflection: numberFromForm(form, "reflection"),
      collaboration: numberFromForm(form, "collaboration"),
      impact: numberFromForm(form, "impact"),
      meetings: Math.max(0, Number(form.get("meetings") || 0)),
      evidenceLinks: textFromForm(form, "evidenceLinks"),
      milestone: textFromForm(form, "milestone"),
      risk: textFromForm(form, "risk"),
      nextAction: textFromForm(form, "nextAction"),
      dueDate: textFromForm(form, "dueDate"),
      notes: textFromForm(form, "notes"),
      createdAt: new Date().toISOString(),
    };
    setRecords((previous) => [record, ...previous]);
    setSelectedId(record.id);
    event.currentTarget.reset();
  }

  function updateRecord(id: string, patch: Partial<LearningRecord>) {
    setRecords((previous) => previous.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function removeRecord(id: string) {
    setRecords((previous) => previous.filter((item) => item.id !== id));
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
    link.download = "learning-monitoring-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Program", "Cohort", "Type", "Team", "Learners", "Mentor", "Stage", "Status", "Score", "Level", "Gap", "Evidence", "Next Action", "Due Date"];
    const rows = enriched.map((item) => [
      item.programName,
      item.cohort,
      item.programType,
      item.teamName,
      String(item.learnerCount),
      item.mentorLabel,
      item.stage,
      item.status,
      String(item.score),
      item.level.label,
      item.gaps.join(" | "),
      String(item.evidenceCount),
      item.nextAction,
      item.dueDate,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "learning-monitoring-recap.csv";
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
              <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">Learning Operations</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">Learning Monitoring</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
                Workspace monitoring program pembelajaran yang bisa dipakai untuk bootcamp, mentoring, workshop, challenge, komunitas, dan program pendampingan umum.
              </p>
            </div>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-xs font-bold text-violet-700">General Program</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Fokus" value="Learning Program" />
            <InfoCard label="Mode" value="Monitoring Workspace" />
            <InfoCard label="Update" value="2026-07-10" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>
                Data tersimpan lokal di browser melalui localStorage. Gunakan label aman dan hindari data pribadi peserta, dokumen internal, atau informasi sensitif.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <MetricCard icon={ClipboardList} label="Program/team" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={UsersRound} label="Learners" value={`${summary.learners}`} tone="prime" />
          <MetricCard icon={Gauge} label="Avg score" value={`${summary.avgScore}`} tone={summary.avgScore >= 70 ? "safe" : summary.avgScore >= 55 ? "warning" : "danger"} />
          <MetricCard icon={TrendingUp} label="Aktif" value={`${summary.active}`} tone="safe" />
          <MetricCard icon={Target} label="At risk" value={`${summary.atRisk}`} tone={summary.atRisk === 0 ? "safe" : "danger"} />
          <MetricCard icon={Lightbulb} label="Gap utama" value={summary.weakest} tone="neutral" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Learning Command Center" icon={BrainCircuit}>
            {selected ? <CommandCenter record={selected} onUpdate={updateRecord} onCopy={copyBrief} copied={copied} /> : <EmptyState title="Belum ada data" description="Tambahkan program atau muat contoh untuk melihat command center, skor, gap, dan quick win." />}
          </Panel>
          <Panel title="Tambah program/team" icon={Plus}>
            <LearningForm onSubmit={addRecord} />
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Learning Radar" icon={BarChart3}>
            {selected ? <LearningRadar record={selected} /> : <EmptyState title="Radar belum tersedia" description="Pilih program dari tabel untuk melihat komposisi monitoring." />}
          </Panel>
          <Panel title="Learning Workspace" icon={FileSpreadsheet}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari program, cohort, team, mentor, topik" className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-teal/20 focus:ring-4" />
              </div>
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
                <option>All</option>
                {programTypes.map((item) => <option key={item}>{item}</option>)}
                {stages.map((item) => <option key={item}>{item}</option>)}
                {statuses.map((item) => <option key={item}>{item}</option>)}
                {priorities.map((item) => <option key={item}>{item}</option>)}
                <option>High Performing</option>
                <option>On Track</option>
                <option>Needs Coaching</option>
                <option>Recovery Zone</option>
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
            {filtered.length === 0 ? <EmptyState title="Belum ada data" description="Tambahkan program baru atau klik Contoh untuk mencoba monitoring, radar, dan smart brief." /> : <LearningTable records={filtered} selectedId={selectedId} onSelect={setSelectedId} onRemove={removeRecord} />}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function CommandCenter({ record, onUpdate, onCopy, copied }: { record: EnrichedRecord; onUpdate: (id: string, patch: Partial<LearningRecord>) => void; onCopy: () => void; copied: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Selected program</p>
            <h2 className="mt-2 text-3xl font-black">{record.programName}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{record.cohort} · {record.teamName} · {record.topic}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-teal">{record.score}</p>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">{record.level.label}</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{record.level.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Quick win" value={record.quickWin} />
        <InfoPill label="Gap 1" value={record.gaps[0] ?? "Tidak ada gap besar"} />
        <InfoPill label="Evidence" value={`${record.evidenceCount} link/item`} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
        <p className="font-black text-navy">Milestone</p>
        <p className="mt-2">{record.milestone || "Belum ada milestone."}</p>
        <p className="mt-4 font-black text-navy">Risk note</p>
        <p className="mt-2">{record.risk || "Belum ada catatan risiko."}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InlineSelect label="Stage" value={record.stage} options={stages} onChange={(value) => onUpdate(record.id, { stage: value })} />
        <InlineSelect label="Status" value={record.status} options={statuses} onChange={(value) => onUpdate(record.id, { status: value })} />
      </div>

      <button onClick={onCopy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Sparkles size={18} /> {copied ? "Brief tersalin" : "Salin smart brief"}
      </button>
    </div>
  );
}

function LearningRadar({ record }: { record: EnrichedRecord }) {
  const items = [
    ["Attendance", record.attendance],
    ["Assignment", record.assignment],
    ["Evidence", record.evidence],
    ["Reflection", record.reflection],
    ["Collaboration", record.collaboration],
    ["Impact", record.impact],
  ] as const;
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Stage progress</p>
            <p className="mt-2 text-2xl font-black text-navy">{record.stageProgress}%</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${record.level.badgeClass}`}>{record.level.label}</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-teal" style={{ width: `${record.stageProgress}%` }} />
        </div>
      </div>
      {items.map(([label, value]) => (
        <div key={label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-bold text-navy">{label}</span>
            <span className="font-black text-slate-600">{value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${value >= 70 ? "bg-teal" : value >= 55 ? "bg-amber-400" : "bg-rose-500"}`} style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LearningForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="programName" label="Nama program" placeholder="Contoh: Learning Sprint" />
        <TextInput name="cohort" label="Cohort/batch" placeholder="Batch umum" />
        <SelectText name="programType" label="Jenis program" options={programTypes} defaultValue="Bootcamp" />
        <TextInput name="teamName" label="Team/kelas" placeholder="Gunakan label aman" />
        <TextInput name="learnerCount" label="Jumlah peserta" type="number" placeholder="0" />
        <TextInput name="mentorLabel" label="Mentor/fasilitator" placeholder="Gunakan label aman" />
      </div>
      <TextInput name="topic" label="Topik pembelajaran" placeholder="Topik utama program" />
      <div className="grid gap-4 md:grid-cols-3">
        <SelectText name="stage" label="Stage" options={stages} defaultValue="Onboarding" />
        <SelectText name="status" label="Status" options={statuses} defaultValue="Draft" />
        <SelectText name="priority" label="Prioritas" options={priorities} defaultValue="Normal" />
      </div>
      <div className="grid gap-4 md:grid-cols-6">
        <ScoreInput name="attendance" label="Attendance" defaultValue={60} />
        <ScoreInput name="assignment" label="Assignment" defaultValue={55} />
        <ScoreInput name="evidence" label="Evidence" defaultValue={50} />
        <ScoreInput name="reflection" label="Reflection" defaultValue={50} />
        <ScoreInput name="collaboration" label="Collab" defaultValue={55} />
        <ScoreInput name="impact" label="Impact" defaultValue={45} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="meetings" label="Jumlah sesi/meeting" type="number" placeholder="0" />
        <TextInput name="dueDate" label="Target tindak lanjut" type="date" />
      </div>
      <TextArea name="evidenceLinks" label="Evidence links" placeholder="Satu link per baris atau pisahkan dengan koma" />
      <TextArea name="milestone" label="Milestone" placeholder="Target atau capaian utama" />
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea name="risk" label="Risk note" placeholder="Risiko keterlambatan, kehadiran, bukti, atau pendampingan" />
        <TextArea name="nextAction" label="Next action" placeholder="Aksi berikutnya" />
      </div>
      <TextArea name="notes" label="Catatan" placeholder="Catatan aman untuk publik" />
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Plus size={18} /> Tambah data
      </button>
    </form>
  );
}

function LearningTable({ records, selectedId, onSelect, onRemove }: { records: EnrichedRecord[]; selectedId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Gap</th>
              <th className="px-4 py-3">Next Action</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {records.map((record) => (
              <tr key={record.id} className={selectedId === record.id ? "bg-teal/5" : ""}>
                <td className="px-4 py-4 align-top">
                  <button onClick={() => onSelect(record.id)} className="text-left">
                    <p className="font-black text-navy">{record.programName}</p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{record.cohort} · {record.teamName} · {record.learnerCount} learners</p>
                  </button>
                </td>
                <td className="px-4 py-4 align-top"><ScoreBadge score={record.score} level={record.level} /></td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{record.stage}<br />{record.status}</td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{record.gaps.join(" | ") || "-"}</td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{record.nextAction || record.quickWin}</td>
                <td className="px-4 py-4 align-top text-right">
                  <button onClick={() => onRemove(record.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus data"><Trash2 size={16} /></button>
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
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${level.badgeClass}`}>{score} · {level.label}</span>;
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
  const toneClass = tone === "safe" ? "bg-teal/10 text-teal" : tone === "danger" ? "bg-rose-50 text-rose-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : tone === "prime" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-navy";
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

function InlineSelect<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-400">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold normal-case tracking-normal text-navy outline-none ring-teal/20 focus:ring-4">
        {options.map((option) => <option key={option}>{option}</option>)}
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
