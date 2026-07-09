"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  Eraser,
  FileJson,
  FileSpreadsheet,
  Info,
  ListChecks,
  Plus,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
} from "lucide-react";

type DeviceRecord = {
  id: string;
  ownerLabel: string;
  brand: string;
  model: string;
  category: string;
  sourceCountry: string;
  arrivalDate: string;
  imeis: string[];
  serials: string[];
  notes: string;
  createdAt: string;
};

type StoredData = {
  records: DeviceRecord[];
};

type ImeiCheck = {
  value: string;
  clean: string;
  status: "valid" | "invalid-length" | "invalid-checksum";
};

const STORAGE_KEY = "beceasia:imei-helper-public:v1";

const categories = [
  "Smartphone",
  "Tablet seluler",
  "Modem/router seluler",
  "Wearable seluler",
  "Perangkat lain",
];

function cleanIdentifier(value: string) {
  return value.replace(/\D/g, "");
}

function uniqueLines(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function validateImei(value: string): ImeiCheck {
  const clean = cleanIdentifier(value);
  if (clean.length !== 15) return { value, clean, status: "invalid-length" };

  let sum = 0;
  for (let index = 0; index < clean.length; index += 1) {
    let digit = Number(clean[index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return { value, clean, status: sum % 10 === 0 ? "valid" : "invalid-checksum" };
}

function formatDate(value: string) {
  if (!value) return "Belum diisi";
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return value;
  }
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function textFromForm(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

export function ImeiHelperClient() {
  const [records, setRecords] = useState<DeviceRecord[]>([]);
  const [imeiInput, setImeiInput] = useState("");
  const [serialInput, setSerialInput] = useState("");
  const [loaded, setLoaded] = useState(false);
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

  const imeiChecks = useMemo(() => uniqueLines(imeiInput).map(validateImei), [imeiInput]);

  const summary = useMemo(() => {
    const allImeis = records.flatMap((record) => record.imeis);
    const validImeis = allImeis.filter((imei) => validateImei(imei).status === "valid");
    const invalidImeis = allImeis.length - validImeis.length;
    const duplicates = allImeis.filter((imei, index) => allImeis.indexOf(imei) !== index);
    return {
      devices: records.length,
      imeis: allImeis.length,
      validImeis: validImeis.length,
      invalidImeis,
      duplicates: Array.from(new Set(duplicates)).length,
    };
  }, [records]);

  const recapText = useMemo(() => {
    if (records.length === 0) {
      return "Belum ada data perangkat. Masukkan contoh data perangkat untuk membuat rekap.";
    }

    const lines = records.map((record, index) => {
      const imeiLine = record.imeis.length > 0 ? record.imeis.join(", ") : "Belum diisi";
      const serialLine = record.serials.length > 0 ? record.serials.join(", ") : "Belum diisi";
      return [
        `${index + 1}. ${record.brand || "Merek belum diisi"} ${record.model || ""}`.trim(),
        `   Kategori: ${record.category}`,
        `   IMEI: ${imeiLine}`,
        `   Serial Number: ${serialLine}`,
        `   Asal pembelian: ${record.sourceCountry || "Belum diisi"}`,
        `   Tanggal kedatangan: ${formatDate(record.arrivalDate)}`,
        record.notes ? `   Catatan: ${record.notes}` : "",
      ].filter(Boolean).join("\n");
    });

    return [
      "Rekap perangkat",
      "Sifat dokumen: draft bantuan mandiri, bukan bukti resmi.",
      "",
      ...lines,
      "",
      "Periksa kembali ketentuan, kanal resmi, dan dokumen sumber sebelum digunakan untuk proses apa pun.",
    ].join("\n");
  }, [records]);

  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const imeis = uniqueLines(imeiInput).map(cleanIdentifier).filter(Boolean);
    const serials = uniqueLines(serialInput);

    const record: DeviceRecord = {
      id: crypto.randomUUID(),
      ownerLabel: textFromForm(form, "ownerLabel"),
      brand: textFromForm(form, "brand"),
      model: textFromForm(form, "model"),
      category: textFromForm(form, "category") || categories[0],
      sourceCountry: textFromForm(form, "sourceCountry"),
      arrivalDate: textFromForm(form, "arrivalDate"),
      imeis,
      serials,
      notes: textFromForm(form, "notes"),
      createdAt: new Date().toISOString(),
    };

    setRecords((previous) => [record, ...previous]);
    setImeiInput("");
    setSerialInput("");
    event.currentTarget.reset();
  }

  function removeRecord(id: string) {
    setRecords((previous) => previous.filter((record) => record.id !== id));
  }

  function clearWorkspace() {
    setRecords([]);
    setImeiInput("");
    setSerialInput("");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ records }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "imei-helper-public-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Label", "Merek", "Model", "Kategori", "Asal Pembelian", "Tanggal Kedatangan", "IMEI", "Serial Number", "Catatan"];
    const rows = records.map((record) => [
      record.ownerLabel,
      record.brand,
      record.model,
      record.category,
      record.sourceCountry,
      record.arrivalDate,
      record.imeis.join(" | "),
      record.serials.join(" | "),
      record.notes,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "imei-helper-public-recap.csv";
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

  async function copyRecap() {
    await navigator.clipboard.writeText(recapText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">Trade Tools</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">IMEI Helper</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Workspace mandiri untuk mencatat perangkat, memeriksa format IMEI, menyiapkan checklist, dan membuat rekap awal. Versi ini sudah disanitasi tanpa logo, nama kantor, atau data lama.
              </p>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-bold text-amber-700">Experimental</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Wilayah" value="Indonesia" />
            <InfoCard label="Scope" value="Public Utility" />
            <InfoCard label="Update" value="2026-07-09" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>
                Alat ini bukan layanan resmi dan tidak terhubung ke sistem pemerintah. Data tersimpan lokal di browser Anda. Jangan gunakan untuk menyimpan data rahasia, identitas pribadi, atau dokumen operasional.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <MetricCard icon={Smartphone} label="Perangkat" value={`${summary.devices}`} tone="neutral" />
          <MetricCard icon={SearchCheck} label="Total IMEI" value={`${summary.imeis}`} tone="neutral" />
          <MetricCard icon={CheckCircle2} label="Format valid" value={`${summary.validImeis}`} tone="safe" />
          <MetricCard icon={AlertTriangle} label="Perlu cek" value={`${summary.invalidImeis}`} tone={summary.invalidImeis === 0 ? "safe" : "danger"} />
          <MetricCard icon={ListChecks} label="Duplikat" value={`${summary.duplicates}`} tone={summary.duplicates === 0 ? "safe" : "danger"} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Input perangkat" icon={Smartphone}>
            <form onSubmit={addRecord} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput name="ownerLabel" label="Label pemilik/pemohon" placeholder="Contoh: Pemohon 1" />
                <TextInput name="brand" label="Merek" placeholder="Contoh: Brand A" />
                <TextInput name="model" label="Model/tipe" placeholder="Contoh: Model X" />
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  <span>Kategori perangkat</span>
                  <select name="category" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4">
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <TextInput name="sourceCountry" label="Negara/tempat pembelian" placeholder="Contoh: Luar negeri" />
                <TextInput name="arrivalDate" type="date" label="Tanggal kedatangan" />
              </div>

              <label className="space-y-2 text-sm font-semibold text-slate-700">
                <span>IMEI</span>
                <textarea value={imeiInput} onChange={(event) => setImeiInput(event.target.value)} rows={4} placeholder="Tulis satu IMEI per baris. Contoh: 490154203237518" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
                <p className="text-xs leading-5 text-slate-500">Sistem hanya mengecek panjang 15 digit dan checksum Luhn. Ini bukan pengecekan status resmi perangkat.</p>
              </label>

              {imeiChecks.length > 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-navy">Hasil cek format</p>
                  <div className="mt-3 grid gap-2">
                    {imeiChecks.map((item) => <ImeiStatus key={`${item.value}-${item.status}`} check={item} />)}
                  </div>
                </div>
              ) : null}

              <label className="space-y-2 text-sm font-semibold text-slate-700">
                <span>Serial Number</span>
                <textarea value={serialInput} onChange={(event) => setSerialInput(event.target.value)} rows={3} placeholder="Tulis satu serial number per baris" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-700">
                <span>Catatan</span>
                <textarea name="notes" rows={3} placeholder="Catatan singkat, tanpa data rahasia" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
              </label>

              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
                <Plus size={18} /> Tambah perangkat
              </button>
            </form>
          </Panel>

          <div className="space-y-6">
            <Panel title="Checklist awal" icon={ClipboardCheck}>
              <div className="grid gap-3 sm:grid-cols-2">
                <ChecklistItem text="Cek jumlah IMEI per perangkat" />
                <ChecklistItem text="Cek serial number pada perangkat atau kemasan" />
                <ChecklistItem text="Siapkan bukti pembelian bila ada" />
                <ChecklistItem text="Siapkan data kedatangan secara umum" />
                <ChecklistItem text="Pastikan perangkat bukan barang untuk diperjualbelikan" />
                <ChecklistItem text="Validasi ketentuan melalui sumber resmi" />
              </div>
            </Panel>

            <Panel title="Draft rekap" icon={FileJson}>
              <textarea readOnly value={recapText} rows={12} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs leading-6 text-slate-700 outline-none" />
              <button onClick={copyRecap} className="mt-3 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold text-white">
                <Copy size={16} /> {copied ? "Tersalin" : "Salin rekap"}
              </button>
            </Panel>
          </div>
        </div>

        <Panel title="Daftar perangkat" icon={FileSpreadsheet}>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold text-white"><Download size={16} /> Export JSON</button>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy ring-1 ring-slate-200"><ArrowDownToLine size={16} /> Export CSV</button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy ring-1 ring-slate-200">
              <Upload size={16} /> Import JSON
              <input type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
            </label>
            <button onClick={clearWorkspace} className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-100"><Eraser size={16} /> Bersihkan data</button>
          </div>

          {records.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Smartphone className="mx-auto text-slate-400" size={32} />
              <h3 className="mt-3 text-lg font-black text-navy">Belum ada perangkat</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Masukkan data contoh atau data yang aman untuk publik. Semua data hanya tersimpan di browser Anda.</p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Perangkat</th>
                      <th className="px-4 py-3">IMEI</th>
                      <th className="px-4 py-3">Serial Number</th>
                      <th className="px-4 py-3">Kedatangan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {records.map((record) => {
                      const invalid = record.imeis.filter((imei) => validateImei(imei).status !== "valid").length;
                      return (
                        <tr key={record.id}>
                          <td className="px-4 py-4">
                            <p className="font-black text-navy">{record.brand || "Merek belum diisi"} {record.model}</p>
                            <p className="mt-1 text-xs text-slate-500">{record.category} · {record.ownerLabel || "Tanpa label"}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{record.imeis.length > 0 ? record.imeis.join("\n") : "-"}</td>
                          <td className="px-4 py-4 text-slate-600">{record.serials.length > 0 ? record.serials.join("\n") : "-"}</td>
                          <td className="px-4 py-4 text-slate-600">{formatDate(record.arrivalDate)}<br />{record.sourceCountry || "-"}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${invalid === 0 ? "bg-teal/10 text-teal" : "bg-amber-50 text-amber-700"}`}>
                              {invalid === 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                              {invalid === 0 ? "Format OK" : "Cek ulang"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => removeRecord(record.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus perangkat"><Trash2 size={16} /></button>
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

function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "safe" | "danger" | "neutral" }) {
  const toneClass = tone === "safe" ? "bg-teal/10 text-teal" : tone === "danger" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-navy";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}><Icon size={21} /></div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black text-navy">{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
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

function TextInput({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder?: string; type?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input name={name} type={type} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}

function ImeiStatus({ check }: { check: ImeiCheck }) {
  const statusText = check.status === "valid" ? "Valid format" : check.status === "invalid-length" ? "Harus 15 digit" : "Checksum tidak sesuai";
  const safe = check.status === "valid";
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm">
      <span className="font-mono text-slate-700">{check.clean || check.value}</span>
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${safe ? "bg-teal/10 text-teal" : "bg-amber-50 text-amber-700"}`}>
        {safe ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
        {statusText}
      </span>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
      <CheckCircle2 className="mt-0.5 shrink-0 text-teal" size={17} />
      <span>{text}</span>
    </div>
  );
}
