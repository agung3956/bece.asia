"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { apps, type Locale } from "@/data/apps";

const monthId = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const monthEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function UtilitiesClient({ locale }: { locale: Locale }) {
  const [numberSeq, setNumberSeq] = useState("001");
  const [code, setCode] = useState("BC-ASIA");
  const [year, setYear] = useState("2026");
  const [date, setDate] = useState("2026-07-04");
  const [score, setScore] = useState("4.87");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(localStorage.getItem("bece-notes") ?? "");
  }, []);

  const formattedNumber = `${numberSeq}/${code}/${year}`;
  const formattedDate = useMemo(() => {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return "-";
    const months = locale === "id" ? monthId : monthEn;
    return `${parsed.getDate()} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }, [date, locale]);

  const convertedScore = useMemo(() => {
    const value = Number(score.replace(",", "."));
    if (!Number.isFinite(value)) return "-";
    return ((value / 5) * 4).toFixed(2);
  }, [score]);

  const copy = locale === "en" ? {
    number: "Document number helper",
    date: "Date formatter",
    checklist: "Procurement checklist",
    scale: "Scale converter",
    notes: "Local notes",
    launcher: "App launcher",
    save: "Save note",
    saved: "Saved in this browser",
    seq: "Sequence",
    code: "Code",
    year: "Year",
    score: "Score on 5 scale",
    result: "Result on 4 scale"
  } : {
    number: "Bantuan nomor dokumen",
    date: "Format tanggal",
    checklist: "Checklist pengadaan",
    scale: "Konverter skala",
    notes: "Catatan lokal",
    launcher: "Launcher aplikasi",
    save: "Simpan catatan",
    saved: "Tersimpan di browser ini",
    seq: "Urutan",
    code: "Kode",
    year: "Tahun",
    score: "Nilai skala 5",
    result: "Hasil skala 4"
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <UtilityCard title={copy.number}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label={copy.seq} value={numberSeq} onChange={setNumberSeq} />
          <Input label={copy.code} value={code} onChange={setCode} />
          <Input label={copy.year} value={year} onChange={setYear} />
        </div>
        <Result value={formattedNumber} />
      </UtilityCard>

      <UtilityCard title={copy.date}>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/10" />
        <Result value={formattedDate} />
      </UtilityCard>

      <UtilityCard title={copy.scale}>
        <Input label={copy.score} value={score} onChange={setScore} />
        <Result value={`${copy.result}: ${convertedScore}`} />
      </UtilityCard>

      <UtilityCard title={copy.checklist}>
        <div className="space-y-3">
          {["Terms of reference", "Budget availability", "Vendor document", "Evaluation notes", "Contract draft", "Handover record"].map((item) => (
            <label key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
              <input type="checkbox" className="h-4 w-4 accent-teal" />
              {locale === "id" ? translateChecklist(item) : item}
            </label>
          ))}
        </div>
      </UtilityCard>

      <UtilityCard title={copy.notes}>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/10" />
        <button onClick={() => localStorage.setItem("bece-notes", notes)} className="mt-3 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white hover:bg-navy-light">{copy.save}</button>
        <p className="mt-2 text-xs text-slate-500">{copy.saved}</p>
      </UtilityCard>

      <UtilityCard title={copy.launcher}>
        <div className="grid gap-3">
          {apps.slice(0, 6).map((app) => (
            <a key={app.slug} href={app.url} target="_blank" rel="noreferrer" className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-navy transition hover:bg-teal/10">
              {app.name[locale]}
            </a>
          ))}
        </div>
      </UtilityCard>
    </div>
  );
}

function UtilityCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-navy">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-slate-600">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-teal focus:ring-4 focus:ring-teal/10" />
    </label>
  );
}

function Result({ value }: { value: string }) {
  return <div className="mt-4 rounded-2xl bg-navy px-4 py-3 font-bold text-white">{value}</div>;
}

function translateChecklist(item: string) {
  const map: Record<string, string> = {
    "Terms of reference": "Kerangka acuan kerja",
    "Budget availability": "Ketersediaan anggaran",
    "Vendor document": "Dokumen penyedia",
    "Evaluation notes": "Catatan evaluasi",
    "Contract draft": "Draft kontrak",
    "Handover record": "Berita acara serah terima"
  };
  return map[item] ?? item;
}
