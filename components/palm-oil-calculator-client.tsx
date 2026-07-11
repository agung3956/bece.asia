"use client";

import { useMemo, useState } from "react";
import { Calculator, Download, ShieldCheck } from "lucide-react";

function money(value: number, currency: "USD" | "IDR") {
  return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function PalmOilCalculatorClient() {
  const [quantity, setQuantity] = useState(25);
  const [price, setPrice] = useState(900);
  const [exportDutyRate, setExportDutyRate] = useState(0);
  const [levyRate, setLevyRate] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(16000);

  const result = useMemo(() => {
    const exportValueUsd = Math.max(0, quantity) * Math.max(0, price);
    const exportDutyUsd = exportValueUsd * Math.max(0, exportDutyRate) / 100;
    const levyUsd = Math.max(0, quantity) * Math.max(0, levyRate);
    const totalUsd = exportDutyUsd + levyUsd;
    return { exportValueUsd, exportDutyUsd, levyUsd, totalUsd, totalIdr: totalUsd * Math.max(0, exchangeRate) };
  }, [quantity, price, exportDutyRate, levyRate, exchangeRate]);

  function exportCsv() {
    const rows = [
      ["Field", "Value"],
      ["Quantity (MT)", String(quantity)],
      ["Reference price (USD/MT)", String(price)],
      ["Export duty rate (%)", String(exportDutyRate)],
      ["Levy (USD/MT)", String(levyRate)],
      ["Exchange rate", String(exchangeRate)],
      ["Export value (USD)", String(result.exportValueUsd)],
      ["Export duty (USD)", String(result.exportDutyUsd)],
      ["Levy (USD)", String(result.levyUsd)],
      ["Total (USD)", String(result.totalUsd)],
      ["Total (IDR)", String(result.totalIdr)],
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "palm-oil-calculation.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-teal">bece.asia</p>
          <h1 className="mt-3 text-4xl font-black text-navy">Palm Oil Export Calculator</h1>
          <p className="mt-3 max-w-3xl text-slate-600">Simulasi lokal untuk menghitung nilai ekspor, estimasi bea keluar, dan pungutan berdasarkan parameter yang dimasukkan pengguna.</p>
          <div className="mt-5 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900"><ShieldCheck className="shrink-0" size={18}/><span>Hasil hanya simulasi. Masukkan sendiri tarif dan referensi terbaru dari sumber resmi sebelum digunakan.</span></div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><Calculator className="text-teal"/><h2 className="text-xl font-black text-navy">Input simulation</h2></div>
            <div className="mt-5 grid gap-4">
              <NumberField label="Quantity (metric ton)" value={quantity} onChange={setQuantity}/>
              <NumberField label="Reference price (USD/MT)" value={price} onChange={setPrice}/>
              <NumberField label="Export duty rate (%)" value={exportDutyRate} onChange={setExportDutyRate}/>
              <NumberField label="Levy (USD/MT)" value={levyRate} onChange={setLevyRate}/>
              <NumberField label="Exchange rate (IDR/USD)" value={exchangeRate} onChange={setExchangeRate}/>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black text-navy">Calculation result</h2><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white"><Download size={16}/> CSV</button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Result label="Export value" value={money(result.exportValueUsd, "USD")}/>
              <Result label="Export duty" value={money(result.exportDutyUsd, "USD")}/>
              <Result label="Levy" value={money(result.levyUsd, "USD")}/>
              <Result label="Total charge" value={money(result.totalUsd, "USD")}/>
            </div>
            <div className="mt-4 rounded-3xl bg-navy p-6 text-white"><p className="text-sm text-slate-300">Estimated total in IDR</p><p className="mt-2 text-3xl font-black text-teal">{money(result.totalIdr, "IDR")}</p></div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Formula: export value = quantity × price; export duty = export value × duty rate; levy = quantity × levy per MT.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="text-sm font-semibold text-slate-700">{label}<input type="number" min="0" step="any" value={value} onChange={(event) => onChange(Number(event.target.value || 0))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-teal/20 focus:ring-4"/></label>;
}
function Result({ label, value }: { label: string; value: string }) { return <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-black text-navy">{value}</p></div>; }
