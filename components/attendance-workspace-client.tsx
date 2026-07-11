"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Clock3, Download, Eraser, LogIn, LogOut, Plus, Search, ShieldCheck, Trash2, Users } from "lucide-react";

type Status = "Present" | "Late" | "Excused" | "Absent";
type Entry = { id: string; name: string; date: string; checkIn: string; checkOut: string; status: Status; note: string };

const KEY = "beceasia:attendance-workspace:v1";
const samples: Entry[] = [
  { id: "sample-1", name: "Sample User 1", date: "2026-07-11", checkIn: "08:02", checkOut: "16:10", status: "Present", note: "Sample record" },
  { id: "sample-2", name: "Sample User 2", date: "2026-07-11", checkIn: "08:18", checkOut: "16:05", status: "Late", note: "Sample record" },
  { id: "sample-3", name: "Sample User 3", date: "2026-07-11", checkIn: "", checkOut: "", status: "Excused", note: "Sample record" },
];

function csv(value: string) { return `"${value.replaceAll('"', '""')}"`; }

export function AttendanceWorkspaceClient() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setEntries(JSON.parse(raw)); } catch { localStorage.removeItem(KEY); }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(entries)); }, [entries, loaded]);

  const filtered = useMemo(() => entries.filter((item) => `${item.name} ${item.status} ${item.note}`.toLowerCase().includes(query.toLowerCase())), [entries, query]);
  const summary = useMemo(() => ({
    total: entries.length,
    present: entries.filter((item) => item.status === "Present").length,
    late: entries.filter((item) => item.status === "Late").length,
    open: entries.filter((item) => item.checkIn && !item.checkOut).length,
  }), [entries]);

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry: Entry = {
      id: crypto.randomUUID(), name: String(form.get("name") || "Sample User").trim() || "Sample User",
      date: String(form.get("date") || ""), checkIn: String(form.get("checkIn") || ""), checkOut: String(form.get("checkOut") || ""),
      status: String(form.get("status") || "Present") as Status, note: String(form.get("note") || "").trim(),
    };
    setEntries((previous) => [entry, ...previous]); event.currentTarget.reset();
  }

  function exportCsv() {
    const rows = [["Name", "Date", "Check In", "Check Out", "Status", "Note"], ...entries.map((e) => [e.name, e.date, e.checkIn, e.checkOut, e.status, e.note])];
    const blob = new Blob([rows.map((r) => r.map(csv).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "attendance-workspace.csv"; link.click(); URL.revokeObjectURL(url);
  }

  return <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-6">
    <header className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.25em] text-teal">bece.asia</p><h1 className="mt-3 text-4xl font-black text-navy">Attendance Workspace</h1><p className="mt-3 max-w-3xl text-slate-600">Workspace presensi umum dengan data lokal, nama contoh netral, rekap cepat, dan ekspor CSV.</p><div className="mt-5 flex gap-3 rounded-2xl bg-teal/5 p-4 text-sm text-slate-700"><ShieldCheck className="shrink-0 text-teal" size={18}/><span>Data hanya tersimpan pada browser ini. Jangan masukkan identitas pribadi atau data kepegawaian sensitif.</span></div></header>
    <div className="grid gap-4 md:grid-cols-4"><Metric icon={Users} label="Total" value={summary.total}/><Metric icon={CheckCircle2} label="Present" value={summary.present}/><Metric icon={Clock3} label="Late" value={summary.late}/><Metric icon={LogIn} label="Open session" value={summary.open}/></div>
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <form onSubmit={add} className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-navy">Add attendance</h2><Field name="name" label="Name" placeholder="Sample User"/><Field name="date" label="Date" type="date"/><div className="grid grid-cols-2 gap-3"><Field name="checkIn" label="Check in" type="time"/><Field name="checkOut" label="Check out" type="time"/></div><label className="text-sm font-semibold text-slate-700">Status<select name="status" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"><option>Present</option><option>Late</option><option>Excused</option><option>Absent</option></select></label><Field name="note" label="Note" placeholder="Optional note"/><button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white"><Plus size={17}/> Add record</button></form>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap gap-3"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search sample records" className="w-full rounded-full border border-slate-200 py-2.5 pl-10 pr-4"/></div><button onClick={()=>setEntries(samples)} className="rounded-full bg-teal px-4 py-2.5 text-sm font-bold text-white">Load sample</button><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white"><Download size={16}/> CSV</button><button onClick={()=>{setEntries([]);localStorage.removeItem(KEY)}} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700"><Eraser size={16}/> Clear</button></div><div className="mt-5 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wider text-slate-400"><th className="p-3">Name</th><th className="p-3">Date</th><th className="p-3">Time</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead><tbody>{filtered.map((e)=><tr key={e.id} className="border-b border-slate-100"><td className="p-3 font-bold text-navy">{e.name}</td><td className="p-3">{e.date || "-"}</td><td className="p-3">{e.checkIn || "-"} — {e.checkOut || "-"}</td><td className="p-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{e.status}</span></td><td className="p-3 text-right"><button onClick={()=>setEntries((p)=>p.filter((x)=>x.id!==e.id))} className="text-rose-600"><Trash2 size={16}/></button></td></tr>)}</tbody></table>{filtered.length===0?<p className="py-12 text-center text-sm text-slate-500">No records yet.</p>:null}</div></div>
    </div>
  </div></section>;
}

function Metric({icon:Icon,label,value}:{icon:typeof Users;label:string;value:number}) { return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="text-teal" size={21}/><p className="mt-3 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-navy">{value}</p></div>; }
function Field({name,label,placeholder,type="text"}:{name:string;label:string;placeholder?:string;type?:string}) { return <label className="text-sm font-semibold text-slate-700">{label}<input name={name} type={type} placeholder={placeholder} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"/></label>; }
