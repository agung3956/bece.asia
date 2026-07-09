"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  Gift,
  Home,
  Info,
  Package,
  Plane,
  Printer,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  UserCheck,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";

type StepId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "stop" | "redirect";
type Currency = "USD" | "IDR";
type CarrierStatus = "penumpang" | "haji" | "awak" | "penumpang-kantor";

type Answers = {
  asal?: "dalam-negeri" | "luar-negeri";
  sumber?: "penumpang" | "kiriman";
  dokumen?: "ada" | "tidak";
  arrivalDate?: string;
  arrivalDays?: number;
  jumlah?: number;
  invoice?: "ada" | "setuju-database" | "tolak";
  kepemilikan?: "pemilik" | "ada-kuasa" | "tidak-kuasa";
  status?: CarrierStatus;
};

type Result = {
  hargaIDR: number;
  pembebasanIDR: number;
  pembebasanUSD: number;
  nkp: number;
  bm: number;
  ppn: number;
  total: number;
};

const totalSteps = 10;

const exemptions: Record<CarrierStatus, number> = {
  penumpang: 500,
  haji: 2500,
  awak: 50,
  "penumpang-kantor": 0,
};

const statusLabels: Record<CarrierStatus, string> = {
  penumpang: "Penumpang biasa",
  haji: "Jemaah haji khusus",
  awak: "Awak sarana pengangkut",
  "penumpang-kantor": "Penumpang biasa melalui kanal lanjutan",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
}

function calculateArrivalDays(dateValue: string) {
  const arrival = new Date(dateValue);
  const today = new Date();
  arrival.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((today.getTime() - arrival.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

function calculateResult(price: number, currency: Currency, exchangeRate: number, status: CarrierStatus): Result {
  const hargaIDR = currency === "USD" ? price * exchangeRate : price;
  const pembebasanUSD = exemptions[status] ?? 500;
  const pembebasanIDR = pembebasanUSD * exchangeRate;
  const nkp = Math.max(0, hargaIDR - pembebasanIDR);
  const bm = nkp * 0.1;
  const ppn = (nkp + bm) * 0.11;
  const total = bm + ppn;
  return { hargaIDR, pembebasanIDR, pembebasanUSD, nkp, bm, ppn, total };
}

export function ImeiHelperClient() {
  const [step, setStep] = useState<StepId>(0);
  const [answers, setAnswers] = useState<Answers>({ status: "penumpang", jumlah: 1 });
  const [stopReason, setStopReason] = useState("");
  const [stopDetail, setStopDetail] = useState("");
  const [jumlahUnit, setJumlahUnit] = useState(1);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [price, setPrice] = useState("");
  const [exchangeRate, setExchangeRate] = useState(15800);
  const [kursStatus, setKursStatus] = useState("Kurs default: Rp 15.800. Silakan ubah jika perlu.");
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchExchangeRate() {
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        if (!response.ok) throw new Error("rate unavailable");
        const data = await response.json();
        const idr = Math.round(Number(data?.rates?.IDR));
        if (active && Number.isFinite(idr) && idr > 0) {
          setExchangeRate(idr);
          setKursStatus(`Kurs referensi terbaca: Rp ${formatNumber(idr)} per USD.`);
        }
      } catch {
        if (active) setKursStatus("Gagal membaca kurs otomatis. Gunakan kurs manual bila diperlukan.");
      }
    }
    fetchExchangeRate();
    return () => { active = false; };
  }, []);

  const progress = useMemo(() => {
    const numericStep = typeof step === "number" ? step : step === "redirect" || step === "stop" ? 2 : 0;
    return Math.min(100, Math.round((numericStep / totalSteps) * 100));
  }, [step]);

  const selectedStatus = answers.status ?? "penumpang";
  const exemption = exemptions[selectedStatus];

  function goTo(next: StepId) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showStop(reason: string, detail: string) {
    setStopReason(reason);
    setStopDetail(detail);
    goTo("stop");
  }

  function choose<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((previous) => ({ ...previous, [key]: value }));

    if (key === "asal" && value === "dalam-negeri") {
      showStop(
        "Perangkat dari dalam negeri tidak perlu registrasi IMEI mandiri.",
        "Perangkat yang dibeli melalui kanal dalam negeri umumnya sudah melalui proses distribusi domestik. Gunakan kanal penjual atau layanan resmi bila ada kendala sinyal atau jaringan.",
      );
      return;
    }

    if (key === "sumber" && value === "kiriman") {
      goTo("redirect");
      return;
    }

    if (key === "dokumen" && value === "tidak") {
      showStop(
        "Dokumen awal belum lengkap.",
        "Paspor atau dokumen perjalanan dan bukti kedatangan diperlukan untuk proses registrasi IMEI perangkat bawaan penumpang. Lengkapi dokumen sebelum melanjutkan.",
      );
      return;
    }

    if (key === "invoice" && value === "tolak") {
      showStop(
        "Perhitungan tidak dapat dilanjutkan.",
        "Tanpa bukti pembelian atau persetujuan memakai referensi nilai, estimasi pungutan tidak dapat dihitung secara memadai.",
      );
      return;
    }

    if (key === "kepemilikan" && value === "tidak-kuasa") {
      showStop(
        "Surat kuasa diperlukan.",
        "Jika perangkat bukan milik sendiri, siapkan surat kuasa dari pemilik sebelum menggunakan jalur bantuan registrasi.",
      );
      return;
    }

    const nextMap: Partial<Record<keyof Answers, StepId>> = {
      asal: 2,
      sumber: 3,
      dokumen: 4,
      invoice: 7,
      kepemilikan: 8,
      status: 9,
    };
    const next = nextMap[key];
    if (next) goTo(next);
  }

  function verifyArrivalDate() {
    if (!answers.arrivalDate) {
      alert("Pilih tanggal kedatangan terlebih dahulu.");
      return;
    }
    const days = calculateArrivalDays(answers.arrivalDate);
    setAnswers((previous) => ({ ...previous, arrivalDays: days }));
    if (days > 60) {
      showStop(
        "Melebihi batas waktu 60 hari.",
        `Tanggal kedatangan sudah lewat ${days} hari. Gunakan kanal konsultasi resmi untuk memastikan opsi yang masih tersedia.`,
      );
      return;
    }
    goTo(5);
  }

  function verifyQuantity() {
    if (jumlahUnit > 2) {
      showStop("Jumlah perangkat melebihi batas.", "Maksimal 2 unit HKT per penumpang atau awak yang dapat diproses melalui skema bawaan penumpang.");
      return;
    }
    setAnswers((previous) => ({ ...previous, jumlah: jumlahUnit }));
    goTo(6);
  }

  function runCalculation() {
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      alert("Masukkan harga barang terlebih dahulu.");
      return;
    }
    const computed = calculateResult(numericPrice, currency, Number(exchangeRate) || 15800, selectedStatus);
    setResult(computed);
    goTo(10);
  }

  function resetApp() {
    setStep(0);
    setAnswers({ status: "penumpang", jumlah: 1 });
    setStopReason("");
    setStopDetail("");
    setJumlahUnit(1);
    setCurrency("USD");
    setPrice("");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_#17365f_0,_#0a1929_38%,_#08111f_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]" aria-hidden="true" style={{ backgroundImage: "radial-gradient(#facc15 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-white shadow-2xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal to-cyan-400 text-white shadow-lg">
                <Smartphone size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal">bece.asia tool</p>
                <h1 className="text-xl font-black">IMEI Registration Helper</h1>
                <p className="text-xs text-slate-400">Screening mandiri dan kalkulator estimasi pungutan</p>
              </div>
            </div>
            <span className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-bold text-teal">Public-safe</span>
          </div>
        </header>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-white shadow-xl backdrop-blur">
          <div className="mb-3 flex items-end justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck size={15} className="text-teal" />
              <span className="font-bold uppercase tracking-[0.18em]">Langkah {typeof step === "number" ? step : "-"} dari {totalSteps}</span>
            </div>
            <span className="text-lg font-black text-teal">{progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-teal to-yellow-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {step === 0 ? <Landing onStart={() => goTo(1)} /> : null}

        {step === 1 ? (
          <StepCard number="1" title="Asal Barang" subtitle="Pertanyaan pertama dari 8" onBack={() => goTo(0)}>
            <Question>Apakah HP atau tablet Anda dibeli dari dalam negeri?</Question>
            <Option icon={Home} title="Ya, dari dalam negeri" description="Dibeli di toko atau marketplace dalam negeri" onClick={() => choose("asal", "dalam-negeri")} />
            <Option icon={Plane} title="Tidak, dari luar negeri" description="Dibeli atau diperoleh dari luar Indonesia" onClick={() => choose("asal", "luar-negeri")} />
          </StepCard>
        ) : null}

        {step === 2 ? (
          <StepCard number="2" title="Sumber Kedatangan" subtitle="Pertanyaan kedua dari 8" onBack={() => goTo(1)}>
            <Question>Apakah barang dibawa dari luar negeri oleh penumpang atau awak sarana pengangkut?</Question>
            <Option icon={UserRoundCheck} title="Ya, oleh penumpang atau awak" description="Dibawa saat kedatangan" onClick={() => choose("sumber", "penumpang")} />
            <Option icon={Package} title="Tidak, barang kiriman" description="Dikirim melalui jasa pengiriman" tone="orange" onClick={() => choose("sumber", "kiriman")} />
          </StepCard>
        ) : null}

        {step === 3 ? (
          <StepCard number="3" title="Dokumen Wajib" subtitle="Pertanyaan ketiga dari 8" onBack={() => goTo(2)}>
            <Question>Apakah Anda memiliki dokumen perjalanan dan bukti kedatangan?</Question>
            <Notice icon={Info} tone="amber">Siapkan paspor atau dokumen perjalanan dan boarding pass atau bukti kedatangan yang relevan.</Notice>
            <Option icon={FileCheck2} title="Ya, dokumen tersedia" description="Dokumen perjalanan dan bukti kedatangan dapat ditunjukkan" onClick={() => choose("dokumen", "ada")} />
            <Option icon={X} title="Tidak, dokumen belum lengkap" description="Salah satu dokumen belum tersedia" tone="red" onClick={() => choose("dokumen", "tidak")} />
          </StepCard>
        ) : null}

        {step === 4 ? (
          <StepCard number="4" title="Batas Waktu" subtitle="Pertanyaan keempat dari 8" onBack={() => goTo(3)}>
            <Question>Kapan tanggal kedatangan Anda ke Indonesia?</Question>
            <Notice icon={Clock3} tone="red">Batas waktu registrasi IMEI adalah maksimal 60 hari sejak tanggal kedatangan.</Notice>
            <label className="block text-sm font-bold text-navy">
              Tanggal kedatangan
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={answers.arrivalDate ?? ""}
                onChange={(event) => setAnswers((previous) => ({ ...previous, arrivalDate: event.target.value }))}
                className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-lg font-bold outline-none ring-teal/20 focus:border-teal focus:ring-4"
              />
            </label>
            {answers.arrivalDate ? (
              <div className="rounded-2xl border border-teal/20 bg-teal/5 p-4 text-sm text-slate-700">
                Sudah {calculateArrivalDays(answers.arrivalDate)} hari sejak kedatangan. Sisa waktu estimasi: {Math.max(0, 60 - calculateArrivalDays(answers.arrivalDate))} hari.
              </div>
            ) : null}
            <PrimaryButton onClick={verifyArrivalDate}>Verifikasi batas waktu</PrimaryButton>
          </StepCard>
        ) : null}

        {step === 5 ? (
          <StepCard number="5" title="Jumlah Perangkat" subtitle="Pertanyaan kelima dari 8" onBack={() => goTo(4)}>
            <Question>Berapa unit HKT yang akan didaftarkan?</Question>
            <Notice icon={Info} tone="amber">Maksimal 2 unit handphone atau tablet per penumpang atau awak.</Notice>
            <div className="flex items-center justify-center gap-5 py-4">
              <button onClick={() => setJumlahUnit((value) => Math.max(1, value - 1))} className="grid h-14 w-14 place-items-center rounded-2xl bg-navy text-white shadow-lg">-</button>
              <div className="grid h-20 w-28 place-items-center rounded-2xl border-2 border-teal bg-slate-50 text-4xl font-black text-navy">{jumlahUnit}</div>
              <button onClick={() => setJumlahUnit((value) => Math.min(2, value + 1))} className="grid h-14 w-14 place-items-center rounded-2xl bg-teal text-white shadow-lg">+</button>
            </div>
            <PrimaryButton onClick={verifyQuantity}>Lanjutkan</PrimaryButton>
          </StepCard>
        ) : null}

        {step === 6 ? (
          <StepCard number="6" title="Bukti Pembelian" subtitle="Pertanyaan keenam dari 8" onBack={() => goTo(5)}>
            <Question>Apakah Anda memiliki invoice atau bukti pembelian?</Question>
            <Option icon={FileText} title="Ya, ada invoice" description="Harga barang dapat dihitung dari dokumen pembelian" onClick={() => choose("invoice", "ada")} />
            <Option icon={Calculator} title="Tidak ada, gunakan referensi nilai" description="Setuju memakai referensi nilai untuk estimasi awal" tone="orange" onClick={() => choose("invoice", "setuju-database")} />
            <Option icon={X} title="Tidak setuju memakai referensi" description="Perhitungan tidak dapat dilanjutkan" tone="red" onClick={() => choose("invoice", "tolak")} />
          </StepCard>
        ) : null}

        {step === 7 ? (
          <StepCard number="7" title="Kepemilikan" subtitle="Pertanyaan ketujuh dari 8" onBack={() => goTo(6)}>
            <Question>Apakah Anda pemilik langsung perangkat ini?</Question>
            <Option icon={UserCheck} title="Ya, saya pemilik barang" description="Perangkat milik sendiri" onClick={() => choose("kepemilikan", "pemilik")} />
            <Notice icon={FileText} tone="amber">Jika perangkat bukan milik sendiri, siapkan surat kuasa dari pemilik.</Notice>
            <Option icon={FileCheck2} title="Bukan milik saya, ada surat kuasa" description="Surat kuasa tersedia" tone="orange" onClick={() => choose("kepemilikan", "ada-kuasa")} />
            <Option icon={X} title="Bukan milik saya, tidak ada surat kuasa" description="Dokumen kuasa belum tersedia" tone="red" onClick={() => choose("kepemilikan", "tidak-kuasa")} />
          </StepCard>
        ) : null}

        {step === 8 ? (
          <StepCard number="8" title="Status Pembawa" subtitle="Pertanyaan terakhir screening" onBack={() => goTo(7)}>
            <Question>Pilih status pembawa perangkat.</Question>
            <Option icon={UsersRound} title="Penumpang biasa" description="Pembebasan USD 500" onClick={() => choose("status", "penumpang")} />
            <Option icon={BadgeCheck} title="Jemaah haji khusus" description="Pembebasan USD 2.500" onClick={() => choose("status", "haji")} />
            <Option icon={Plane} title="Awak sarana pengangkut" description="Pembebasan USD 50" onClick={() => choose("status", "awak")} />
            <Option icon={Building2} title="Kanal lanjutan setelah kedatangan" description="Tidak mendapat pembebasan" tone="red" onClick={() => choose("status", "penumpang-kantor")} />
          </StepCard>
        ) : null}

        {step === 9 ? (
          <StepCard number="9" title="Input Data Perangkat" subtitle="Langkah terakhir sebelum perhitungan" onBack={() => goTo(8)}>
            <div className="grid gap-5">
              <div>
                <label className="block text-sm font-bold text-navy">Harga barang</label>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setCurrency("USD")} className={`rounded-xl px-5 py-2.5 text-sm font-black ${currency === "USD" ? "bg-teal text-white" : "bg-slate-100 text-slate-600"}`}>USD</button>
                  <button onClick={() => setCurrency("IDR")} className={`rounded-xl px-5 py-2.5 text-sm font-black ${currency === "IDR" ? "bg-teal text-white" : "bg-slate-100 text-slate-600"}`}>IDR</button>
                </div>
                <div className="relative mt-3">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">{currency === "USD" ? "$" : "Rp"}</span>
                  <input value={price} onChange={(event) => setPrice(event.target.value)} type="number" min="0" placeholder="0" className="w-full rounded-2xl border-2 border-slate-200 py-4 pl-14 pr-5 text-xl font-black text-navy outline-none ring-teal/20 focus:border-teal focus:ring-4" />
                </div>
              </div>

              <label className="block text-sm font-bold text-navy">
                Kurs USD ke IDR
                <div className="relative mt-2">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">Rp</span>
                  <input value={exchangeRate} onChange={(event) => setExchangeRate(Number(event.target.value || 0))} type="number" min="0" className="w-full rounded-2xl border-2 border-slate-200 py-4 pl-14 pr-5 font-black text-navy outline-none ring-teal/20 focus:border-teal focus:ring-4" />
                </div>
                <span className="mt-2 block text-xs font-medium text-slate-500">{kursStatus}</span>
              </label>

              <div className="rounded-2xl border border-teal/20 bg-teal/5 p-5">
                <div className="flex items-center gap-3 text-sm">
                  <Gift className="text-teal" size={19} />
                  <span className="font-bold text-navy">Status:</span>
                  <span className="font-black text-teal">{statusLabels[selectedStatus]}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <CircleDollarSign className="text-teal" size={19} />
                  <span className="font-bold text-navy">Pembebasan:</span>
                  <span className={`font-black ${exemption === 0 ? "text-rose-600" : "text-teal"}`}>{exemption === 0 ? "Tidak ada" : `USD ${formatNumber(exemption)}`}</span>
                </div>
              </div>

              <PrimaryButton onClick={runCalculation}>Hitung estimasi biaya</PrimaryButton>
            </div>
          </StepCard>
        ) : null}

        {step === 10 ? (
          <ResultCard result={result} status={selectedStatus} onReset={resetApp} />
        ) : null}

        {step === "stop" ? <StopCard reason={stopReason} detail={stopDetail} onReset={resetApp} /> : null}
        {step === "redirect" ? <RedirectCard onReset={resetApp} /> : null}

        <footer className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-center text-xs leading-6 text-slate-400 backdrop-blur">
          <p className="font-bold text-teal">bece.asia</p>
          <p>Alat edukatif mandiri. Bukan layanan resmi dan tidak menggantikan ketentuan, sistem, atau dokumen sumber resmi.</p>
        </footer>
      </div>
    </section>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white p-8 text-center shadow-2xl sm:p-10">
      <div className="mx-auto mb-7 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-teal to-cyan-500 text-white shadow-2xl">
        <Smartphone size={42} />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-navy sm:text-4xl">Registrasi IMEI</h2>
      <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-teal">bece.asia public helper</p>
      <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-600">
        Cek kelayakan dan hitung estimasi pungutan Bea Masuk dan PPN untuk perangkat seluler sebelum menggunakan kanal registrasi resmi.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MiniFeature icon={CheckCircle2} title="Cek kelayakan" description="Screening bertahap" />
        <MiniFeature icon={Calculator} title="Hitung estimasi" description="BM dan PPN" />
        <MiniFeature icon={ShieldCheck} title="Public-safe" description="Tanpa data lama" />
      </div>
      <PrimaryButton onClick={onStart} className="mt-8">Mulai screening</PrimaryButton>
      <p className="mt-5 text-xs text-slate-400">Registrasi IMEI tidak dipungut biaya layanan. Pungutan yang dihitung hanya estimasi BM dan PPN.</p>
    </div>
  );
}

function StepCard({ number, title, subtitle, children, onBack }: { number: string; title: string; subtitle: string; children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="rounded-[2rem] border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
      <div className="mb-7 flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal to-cyan-500 text-lg font-black text-white shadow-lg">{number}</div>
        <div>
          <h3 className="text-xl font-black text-navy">{title}</h3>
          <p className="text-xs font-medium text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
      <button onClick={onBack} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3.5 text-sm font-bold text-white transition hover:bg-navy-light">
        <ArrowLeft size={17} /> Kembali
      </button>
    </div>
  );
}

function Question({ children }: { children: React.ReactNode }) {
  return <p className="text-lg font-black leading-7 text-navy">{children}</p>;
}

function Option({ icon: Icon, title, description, onClick, tone = "teal" }: { icon: LucideIcon; title: string; description: string; onClick: () => void; tone?: "teal" | "orange" | "red" }) {
  const styles = tone === "red" ? "from-rose-100 to-red-100 text-rose-700" : tone === "orange" ? "from-amber-100 to-orange-100 text-amber-700" : "from-teal/10 to-cyan-100 text-teal";
  return (
    <button onClick={onClick} className="group flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-teal hover:bg-slate-50 hover:shadow-lg">
      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${styles}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <p className="font-black text-navy">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-slate-200 text-slate-300 transition group-hover:border-teal group-hover:bg-teal group-hover:text-white">
        <Check size={15} />
      </div>
    </button>
  );
}

function Notice({ icon: Icon, children, tone = "teal" }: { icon: LucideIcon; children: React.ReactNode; tone?: "teal" | "amber" | "red" }) {
  const style = tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700" : tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-teal/20 bg-teal/5 text-slate-700";
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 text-sm leading-6 ${style}`}>
      <Icon className="mt-0.5 shrink-0" size={18} />
      <p>{children}</p>
    </div>
  );
}

function PrimaryButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal to-cyan-500 px-5 py-4 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl ${className}`}>
      <span>{children}</span>
      <ArrowRight size={18} />
    </button>
  );
}

function MiniFeature({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-teal/10 text-teal"><Icon size={20} /></div>
      <p className="mt-3 text-xs font-black text-navy">{title}</p>
      <p className="mt-1 text-[11px] text-slate-500">{description}</p>
    </div>
  );
}

function ResultCard({ result, status, onReset }: { result: Result | null; status: CarrierStatus; onReset: () => void }) {
  if (!result) return null;
  return (
    <div className="rounded-[2rem] border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-2xl">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-3xl font-black text-navy">Perhitungan selesai</h2>
        <p className="mt-2 text-sm text-slate-500">Berikut rincian estimasi pungutan.</p>
      </div>
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-navy to-slate-900 p-6 text-white shadow-xl">
        <ResultRow label="Harga barang" value={formatRupiah(result.hargaIDR)} />
        <ResultRow label="Pembebasan" value={`- ${formatRupiah(result.pembebasanIDR)} ${result.pembebasanUSD > 0 ? `(USD ${formatNumber(result.pembebasanUSD)})` : "(Tidak ada)"}`} muted />
        <ResultRow label="Nilai kena pajak" value={formatRupiah(result.nkp)} />
        <div className="my-4 border-t border-white/15 pt-4">
          <ResultRow label="Bea Masuk 10%" value={formatRupiah(result.bm)} small />
          <ResultRow label="PPN 11%" value={formatRupiah(result.ppn)} small />
          <ResultRow label="PPh 0%" value={formatRupiah(0)} small />
        </div>
        <div className="flex items-center justify-between border-t border-white/15 pt-5">
          <span className="text-lg font-black">Total estimasi</span>
          <span className="text-2xl font-black text-teal">{formatRupiah(result.total)}</span>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
        <p className="font-black text-navy">Status: {statusLabels[status]}</p>
        <p className="mt-1">Registrasi IMEI tidak dipungut biaya layanan. Nilai di atas hanya estimasi pungutan BM dan PPN. Periksa kembali melalui kanal resmi sebelum digunakan.</p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-200 px-5 py-3.5 text-sm font-black text-navy transition hover:bg-slate-300">
          <RotateCcw size={17} /> Hitung lagi
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3.5 text-sm font-black text-white transition hover:bg-navy-light">
          <Printer size={17} /> Cetak
        </button>
      </div>
    </div>
  );
}

function ResultRow({ label, value, muted = false, small = false }: { label: string; value: string; muted?: boolean; small?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${small ? "py-1.5 text-sm" : "border-b border-white/15 py-4 last:border-b-0"}`}>
      <span className="text-white/75">{label}</span>
      <span className={`${muted ? "text-emerald-300" : "text-white"} ${small ? "font-semibold" : "font-black"}`}>{value}</span>
    </div>
  );
}

function StopCard({ reason, detail, onReset }: { reason: string; detail: string; onReset: () => void }) {
  return (
    <div className="rounded-[2rem] border border-white/20 bg-white p-8 text-center shadow-2xl">
      <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-2xl">
        <X size={42} />
      </div>
      <h2 className="text-2xl font-black text-navy">Tidak memenuhi syarat</h2>
      <p className="mt-3 font-semibold text-slate-600">{reason}</p>
      <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-left text-sm leading-6 text-rose-700">
        {detail}
      </div>
      <PrimaryButton onClick={onReset} className="mt-6">Coba lagi</PrimaryButton>
    </div>
  );
}

function RedirectCard({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-[2rem] border border-white/20 bg-white p-8 text-center shadow-2xl">
      <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-2xl">
        <Package size={42} />
      </div>
      <h2 className="text-2xl font-black text-navy">Barang kiriman</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">Untuk barang kiriman, alurnya berbeda dari perangkat bawaan penumpang. Gunakan kanal layanan barang kiriman atau penyedia jasa pengiriman yang relevan.</p>
      <PrimaryButton onClick={onReset} className="mt-6">Kembali ke awal</PrimaryButton>
    </div>
  );
}
