"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  Eraser,
  FileSpreadsheet,
  Plane,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

type BudgetState = {
  ceiling: number;
  realized: number;
  reserve: number;
};

type TeamState = {
  totalStaff: number;
  minimumOffice: number;
  travelers: number;
};

type Scenario = {
  id: string;
  name: string;
  activityType: string;
  location: string;
  startDate: string;
  endDate: string;
  participants: number;
  days: number;
  transport: number;
  lodging: number;
  daily: number;
  other: number;
  total: number;
  notes: string;
};

type StoredData = {
  budget: BudgetState;
  team: TeamState;
  scenarios: Scenario[];
};

const STORAGE_KEY = "beceasia:perjadin-public-workspace:v1";

const initialBudget: BudgetState = {
  ceiling: 0,
  realized: 0,
  reserve: 0,
};

const initialTeam: TeamState = {
  totalStaff: 0,
  minimumOffice: 0,
  travelers: 0,
};

const sampleActivityTypes = [
  "Koordinasi",
  "Monitoring",
  "Sosialisasi",
  "Konsultasi",
  "Pendampingan",
  "Rapat kerja",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function numberFromForm(form: FormData, key: string) {
  return Number(form.get(key) || 0);
}

function textFromForm(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function calculateDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diff = Math.ceil((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.max(1, diff);
}

export function PerjadinClient() {
  const [budget, setBudget] = useState<BudgetState>(initialBudget);
  const [team, setTeam] = useState<TeamState>(initialTeam);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        setBudget(parsed.budget ?? initialBudget);
        setTeam(parsed.team ?? initialTeam);
        setScenarios(Array.isArray(parsed.scenarios) ? parsed.scenarios : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const data: StoredData = { budget, team, scenarios };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [budget, team, scenarios, loaded]);

  const summary = useMemo(() => {
    const scenarioTotal = scenarios.reduce((sum, item) => sum + item.total, 0);
    const available = budget.ceiling - budget.realized - budget.reserve;
    const remaining = available - scenarioTotal;
    const standby = team.totalStaff - team.travelers;
    const coverageSafe = team.totalStaff === 0 ? true : standby >= team.minimumOffice;
    return { scenarioTotal, available, remaining, standby, coverageSafe };
  }, [budget, scenarios, team]);

  function handleBudgetChange(key: keyof BudgetState, value: string) {
    setBudget((prev) => ({ ...prev, [key]: Number(value || 0) }));
  }

  function handleTeamChange(key: keyof TeamState, value: string) {
    setTeam((prev) => ({ ...prev, [key]: Number(value || 0) }));
  }

  function addScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = textFromForm(form, "name") || "Skenario kegiatan";
    const activityType = textFromForm(form, "activityType") || "Kegiatan";
    const location = textFromForm(form, "location") || "Lokasi belum diisi";
    const startDate = textFromForm(form, "startDate");
    const endDate = textFromForm(form, "endDate") || startDate;
    const participants = Math.max(0, numberFromForm(form, "participants"));
    const transport = Math.max(0, numberFromForm(form, "transport"));
    const lodging = Math.max(0, numberFromForm(form, "lodging"));
    const daily = Math.max(0, numberFromForm(form, "daily"));
    const other = Math.max(0, numberFromForm(form, "other"));
    const days = calculateDays(startDate, endDate);
    const total = participants * transport + participants * lodging * days + participants * daily * days + other;

    const nextScenario: Scenario = {
      id: crypto.randomUUID(),
      name,
      activityType,
      location,
      startDate,
      endDate,
      participants,
      days,
      transport,
      lodging,
      daily,
      other,
      total,
      notes: textFromForm(form, "notes"),
    };

    setScenarios((prev) => [nextScenario, ...prev]);
    setTeam((prev) => ({ ...prev, travelers: prev.travelers + participants }));
    event.currentTarget.reset();
  }

  function removeScenario(id: string) {
    const removed = scenarios.find((item) => item.id === id);
    setScenarios((prev) => prev.filter((item) => item.id !== id));
    if (removed) {
      setTeam((prev) => ({ ...prev, travelers: Math.max(0, prev.travelers - removed.participants) }));
    }
  }

  function clearWorkspace() {
    setBudget(initialBudget);
    setTeam(initialTeam);
    setScenarios([]);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function exportJson() {
    const payload: StoredData = { budget, team, scenarios };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "perjadin-public-workspace.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Nama", "Jenis", "Lokasi", "Mulai", "Selesai", "Peserta", "Hari", "Total", "Catatan"];
    const rows = scenarios.map((item) => [
      item.name,
      item.activityType,
      item.location,
      item.startDate,
      item.endDate,
      String(item.participants),
      String(item.days),
      String(item.total),
      item.notes,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "perjadin-scenario-recap.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setBudget(parsed.budget ?? initialBudget);
        setTeam(parsed.team ?? initialTeam);
        setScenarios(Array.isArray(parsed.scenarios) ? parsed.scenarios : []);
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
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">Perjadin</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Workspace perencanaan perjalanan, visibilitas anggaran, ketersediaan tim, dan rekap kegiatan. Versi ini sudah disanitasi dan tidak membawa data lama.
              </p>
            </div>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-bold text-sky-700">Beta</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Wilayah" value="Indonesia" />
            <InfoCard label="Scope" value="Team Productivity" />
            <InfoCard label="Update" value="2026-07-09" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>
                Gunakan hanya data contoh atau data yang aman untuk publik. Data yang Anda input tersimpan di browser melalui localStorage, tidak dikirim ke server bece.asia.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard icon={Calculator} label="Anggaran tersedia" value={formatCurrency(summary.available)} tone={summary.available >= 0 ? "safe" : "danger"} />
          <MetricCard icon={Plane} label="Estimasi skenario" value={formatCurrency(summary.scenarioTotal)} tone="neutral" />
          <MetricCard icon={Users} label="Pegawai standby" value={`${Math.max(0, summary.standby)} orang`} tone={summary.coverageSafe ? "safe" : "danger"} />
          <MetricCard icon={CheckCircle2} label="Status simulasi" value={summary.remaining >= 0 && summary.coverageSafe ? "Aman" : "Perlu revisi"} tone={summary.remaining >= 0 && summary.coverageSafe ? "safe" : "danger"} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Panel title="Cek anggaran" icon={Calculator}>
              <div className="grid gap-4">
                <CurrencyInput label="Pagu/anggaran total" value={budget.ceiling} onChange={(value) => handleBudgetChange("ceiling", value)} />
                <CurrencyInput label="Realisasi berjalan" value={budget.realized} onChange={(value) => handleBudgetChange("realized", value)} />
                <CurrencyInput label="Cadangan minimum" value={budget.reserve} onChange={(value) => handleBudgetChange("reserve", value)} />
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-bold text-navy">Sisa setelah skenario</p>
                  <p className={`mt-1 text-xl font-black ${summary.remaining >= 0 ? "text-teal" : "text-rose-600"}`}>{formatCurrency(summary.remaining)}</p>
                </div>
              </div>
            </Panel>

            <Panel title="Pantauan tim" icon={Users}>
              <div className="grid gap-4">
                <NumberInput label="Jumlah pegawai tersedia" value={team.totalStaff} onChange={(value) => handleTeamChange("totalStaff", value)} />
                <NumberInput label="Minimal standby kantor" value={team.minimumOffice} onChange={(value) => handleTeamChange("minimumOffice", value)} />
                <NumberInput label="Pegawai ikut perjalanan" value={team.travelers} onChange={(value) => handleTeamChange("travelers", value)} />
                <div className={`rounded-2xl p-4 text-sm ${summary.coverageSafe ? "bg-teal/10 text-teal" : "bg-rose-50 text-rose-700"}`}>
                  <p className="font-bold">{summary.coverageSafe ? "Komposisi tim aman" : "Komposisi tim perlu ditinjau"}</p>
                  <p className="mt-1">Standby saat ini: {Math.max(0, summary.standby)} orang.</p>
                </div>
              </div>
            </Panel>
          </div>

          <Panel title="Skenario kegiatan" icon={ClipboardList}>
            <form onSubmit={addScenario} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput name="name" label="Nama kegiatan" placeholder="Contoh: Koordinasi lapangan" />
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  <span>Jenis kegiatan</span>
                  <select name="activityType" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4">
                    {sampleActivityTypes.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <TextInput name="location" label="Tujuan/lokasi" placeholder="Isi lokasi umum" />
                <TextInput name="participants" type="number" label="Jumlah pegawai" placeholder="0" />
                <TextInput name="startDate" type="date" label="Tanggal mulai" />
                <TextInput name="endDate" type="date" label="Tanggal selesai" />
                <TextInput name="transport" type="number" label="Transport per orang" placeholder="0" />
                <TextInput name="lodging" type="number" label="Penginapan per malam/orang" placeholder="0" />
                <TextInput name="daily" type="number" label="Uang harian per orang" placeholder="0" />
                <TextInput name="other" type="number" label="Biaya lain" placeholder="0" />
              </div>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                <span>Catatan</span>
                <textarea name="notes" rows={3} placeholder="Catatan singkat, tanpa data rahasia" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
              </label>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
                <Plus size={18} /> Tambah skenario
              </button>
            </form>
          </Panel>
        </div>

        <Panel title="Rekap kegiatan" icon={FileSpreadsheet}>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold text-white"><Download size={16} /> Export JSON</button>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy ring-1 ring-slate-200"><ArrowDownToLine size={16} /> Export CSV</button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy ring-1 ring-slate-200">
              <Upload size={16} /> Import JSON
              <input type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
            </label>
            <button onClick={clearWorkspace} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-100"><Eraser size={16} /> Bersihkan data</button>
          </div>

          {scenarios.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <CalendarDays className="mx-auto text-slate-400" size={32} />
              <h3 className="mt-3 text-lg font-black text-navy">Belum ada skenario</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Masukkan skenario kegiatan untuk melihat estimasi biaya, kebutuhan pegawai, dan status simulasi.</p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Kegiatan</th>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">Pegawai</th>
                      <th className="px-4 py-3">Estimasi</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {scenarios.map((item) => {
                      const statusSafe = item.total <= Math.max(0, summary.available);
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-4">
                            <p className="font-black text-navy">{item.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.activityType} · {item.location}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{item.startDate || "-"} s.d. {item.endDate || "-"}<br />{item.days} hari</td>
                          <td className="px-4 py-4 text-slate-600">{item.participants} orang</td>
                          <td className="px-4 py-4 font-bold text-navy">{formatCurrency(item.total)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${statusSafe ? "bg-teal/10 text-teal" : "bg-amber-50 text-amber-700"}`}>
                              {statusSafe ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                              {statusSafe ? "Masuk pagu" : "Cek ulang"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => removeScenario(item.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus skenario"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </section>
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

function MetricCard({ icon: Icon, label, value, tone }: { icon: typeof Calculator; label: string; value: string; tone: "safe" | "danger" | "neutral" }) {
  const toneClass = tone === "safe" ? "bg-teal/10 text-teal" : tone === "danger" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-navy";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}><Icon size={21} /></div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black text-navy">{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Calculator; children: React.ReactNode }) {
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

function CurrencyInput({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return <NumberInput label={label} value={value} onChange={onChange} />;
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input type="number" min="0" value={value || ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
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
