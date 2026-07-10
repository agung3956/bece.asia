"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  Boxes,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ClipboardList,
  Compass,
  Download,
  Eraser,
  Factory,
  FileCheck2,
  FileSpreadsheet,
  Globe2,
  Handshake,
  HelpCircle,
  Layers3,
  Lightbulb,
  Map,
  PackageCheck,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
  Warehouse,
} from "lucide-react";

type FacilityType = "Export Basics" | "KITE" | "Bonded Facility" | "Logistics" | "Partnership" | "Market Access" | "Support Program";
type Readiness = "Basic" | "Growing" | "Ready" | "Advanced";
type Segment = "MSME" | "Manufacturer" | "Trader" | "Logistics Provider" | "Exporter" | "Other";
type Status = "Exploring" | "Preparing" | "Assisted" | "Ready to Apply" | "Archived";
type Priority = "Low" | "Normal" | "High" | "Critical";

type Facility = {
  id: string;
  name: string;
  type: FacilityType;
  audience: string;
  purpose: string;
  benefit: string;
  bestFor: string;
  commonDocuments: string[];
  readinessHint: string;
  caution: string;
  icon: "rocket" | "factory" | "warehouse" | "globe" | "handshake" | "boxes" | "file";
};

type ExportCase = {
  id: string;
  businessName: string;
  segment: Segment;
  product: string;
  destination: string;
  monthlyCapacity: number;
  hasBuyer: boolean;
  importsInput: boolean;
  manufactures: boolean;
  needsWarehouse: boolean;
  frequentShipment: boolean;
  needsCertification: boolean;
  legalScore: number;
  productScore: number;
  documentScore: number;
  marketScore: number;
  logisticsScore: number;
  facilityInterest: string;
  obstacle: string;
  nextAction: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  notes: string;
  createdAt: string;
};

type StoredData = {
  cases: ExportCase[];
};

type MatchResult = {
  facility: Facility;
  score: number;
  reason: string;
  actions: string[];
};

type EnrichedCase = ExportCase & {
  readinessScore: number;
  readiness: Readiness;
  gaps: string[];
  bestMatches: MatchResult[];
  mainRecommendation: string;
  overdue: boolean;
};

type Tone = "safe" | "medium" | "warning" | "danger" | "neutral" | "prime";

const STORAGE_KEY = "beceasia:export-facility-workbench:v1";

const segments: Segment[] = ["MSME", "Manufacturer", "Trader", "Logistics Provider", "Exporter", "Other"];
const statuses: Status[] = ["Exploring", "Preparing", "Assisted", "Ready to Apply", "Archived"];
const priorities: Priority[] = ["Low", "Normal", "High", "Critical"];

const facilities: Facility[] = [
  {
    id: "export-basics",
    name: "Export Basics Pathway",
    type: "Export Basics",
    audience: "UMKM, eksportir pemula, dan pelaku usaha yang baru memetakan proses ekspor.",
    purpose: "Membantu pengguna memahami alur dasar ekspor, dokumen umum, kesiapan produk, dan tahapan validasi awal.",
    benefit: "Membuat proses ekspor terasa lebih terstruktur sebelum masuk ke fasilitas atau skema yang lebih kompleks.",
    bestFor: "Produk sudah ada, tetapi buyer, dokumen, sertifikasi, atau rute logistik belum jelas.",
    commonDocuments: ["NIB", "Invoice", "Packing list", "Dokumen pengangkutan", "Dokumen teknis sesuai komoditas"],
    readinessHint: "Mulai dari pemetaan produk, HS, dokumen, pasar, dan rute logistik.",
    caution: "Bukan fasilitas pembebasan. Ini jalur edukasi dasar sebelum proses ekspor riil.",
    icon: "rocket",
  },
  {
    id: "kite-ikm",
    name: "KITE IKM Readiness",
    type: "KITE",
    audience: "Industri kecil dan menengah berorientasi ekspor yang memakai bahan baku impor.",
    purpose: "Membantu pelaku usaha menilai kesiapan sebelum mencari informasi lebih lanjut mengenai fasilitas KITE IKM.",
    benefit: "Membuka cara berpikir bahwa pembiayaan input impor, produksi, dan ekspor perlu dirancang sebagai satu siklus.",
    bestFor: "Usaha produksi yang memiliki input impor, rencana ekspor, dan kebutuhan efisiensi biaya produksi.",
    commonDocuments: ["Profil usaha", "Legalitas usaha", "Data produksi", "Data bahan baku", "Rencana ekspor", "Pembukuan sederhana"],
    readinessHint: "Kuatkan legalitas, pembukuan, data produksi, dan proyeksi ekspor.",
    caution: "Ketentuan rinci harus divalidasi ke sumber resmi sebelum digunakan untuk permohonan.",
    icon: "factory",
  },
  {
    id: "kite-manufacturing",
    name: "KITE Manufacturing Track",
    type: "KITE",
    audience: "Perusahaan manufaktur berorientasi ekspor yang membutuhkan tata kelola input dan output produksi.",
    purpose: "Mengarahkan pengguna memahami hubungan antara impor bahan baku, proses produksi, pengawasan, dan ekspor hasil produksi.",
    benefit: "Memberi gambaran awal tentang efisiensi biaya dan kontrol rantai produksi ekspor.",
    bestFor: "Manufaktur dengan ekspor berulang, data produksi rapi, dan kebutuhan fasilitas atas bahan baku impor.",
    commonDocuments: ["Profil perusahaan", "Izin usaha", "Alur produksi", "Bill of material", "Data impor", "Data ekspor", "Pembukuan"],
    readinessHint: "Pastikan data input, output, waste, dan realisasi ekspor dapat ditelusuri.",
    caution: "Gunakan sebagai navigator informasi. Bukan penetapan kelayakan resmi.",
    icon: "factory",
  },
  {
    id: "bonded-zone",
    name: "Bonded Zone Concept",
    type: "Bonded Facility",
    audience: "Perusahaan produksi atau kawasan yang membutuhkan pengelolaan kegiatan berikat.",
    purpose: "Mengenalkan konsep kawasan atau fasilitas berikat untuk kegiatan produksi dan ekspor dalam skala lebih terstruktur.",
    benefit: "Membantu pengguna memahami bahwa fasilitas berikat membutuhkan sistem, lokasi, pengawasan, dan tata kelola stok yang kuat.",
    bestFor: "Perusahaan dengan kegiatan produksi, volume memadai, dan kebutuhan pengelolaan bahan atau barang dalam skema berikat.",
    commonDocuments: ["Profil perusahaan", "Lokasi dan layout", "Sistem pencatatan", "Data produksi", "Rencana kegiatan", "SOP internal"],
    readinessHint: "Siapkan lokasi, sistem IT inventory, SOP, dan pengendalian internal.",
    caution: "Tidak semua pelaku usaha cocok. Skala, lokasi, sistem, dan kepatuhan harus dinilai lebih lanjut.",
    icon: "warehouse",
  },
  {
    id: "plb",
    name: "Logistics Hub and PLB Concept",
    type: "Logistics",
    audience: "Pelaku logistik, distributor, trader, dan industri yang membutuhkan hub penyimpanan dan distribusi.",
    purpose: "Membantu pengguna membaca apakah persoalan utama ada pada penyimpanan, konsolidasi, distribusi, atau rantai pasok.",
    benefit: "Mendorong desain rute logistik yang lebih efisien sebelum memilih bentuk fasilitas lanjutan.",
    bestFor: "Kegiatan yang membutuhkan hub, konsolidasi, stok, atau distribusi lintas wilayah.",
    commonDocuments: ["Profil kegiatan", "Data barang", "Data pelanggan", "Rencana lokasi", "Sistem pencatatan", "SOP gudang"],
    readinessHint: "Kunci use case logistik, volume barang, rute, dan kebutuhan penyimpanan.",
    caution: "PLB adalah konsep fasilitas lanjutan. Perlu validasi lokasi, model bisnis, dan aturan resmi.",
    icon: "boxes",
  },
  {
    id: "aeo-mita",
    name: "Trusted Partner Pathway",
    type: "Partnership",
    audience: "Pelaku usaha dengan frekuensi kegiatan tinggi, kepatuhan baik, dan sistem pengendalian internal matang.",
    purpose: "Mengenalkan jalur kemitraan dan trusted trader mindset untuk pelaku usaha yang sudah matang.",
    benefit: "Membantu pelaku usaha memahami bahwa reputasi kepatuhan dan sistem internal menjadi aset operasional.",
    bestFor: "Eksportir atau importir rutin dengan proses terdokumentasi, kepatuhan kuat, dan kontrol internal jelas.",
    commonDocuments: ["Profil kepatuhan", "SOP", "Riwayat transaksi", "Sistem pengendalian", "PIC kepatuhan", "Dokumentasi audit internal"],
    readinessHint: "Bangun compliance file, rekam jejak, dan SOP lintas fungsi.",
    caution: "Tidak cocok untuk tahap awal. Fokus dulu pada konsistensi dan kepatuhan dasar.",
    icon: "handshake",
  },
  {
    id: "fta-origin",
    name: "Market Access and Origin Notes",
    type: "Market Access",
    audience: "Eksportir yang ingin memahami catatan akses pasar, dokumen asal barang, dan peluang preferensi tarif.",
    purpose: "Membantu pengguna menyiapkan pertanyaan awal tentang asal barang, akses pasar, dan dokumen pendukung ekspor.",
    benefit: "Membuat diskusi dengan buyer, forwarder, dan instansi teknis lebih siap.",
    bestFor: "Produk yang sudah punya target negara, buyer awal, dan kebutuhan klarifikasi dokumen pasar tujuan.",
    commonDocuments: ["Invoice", "Packing list", "HS code", "Komposisi produk", "Data asal bahan", "Permintaan buyer"],
    readinessHint: "Petakan HS, negara tujuan, komposisi produk, dan permintaan dokumen dari buyer.",
    caution: "Preferensi tarif dan dokumen asal barang harus divalidasi melalui otoritas dan aturan yang berlaku.",
    icon: "globe",
  },
  {
    id: "export-clinic",
    name: "Export Clinic Assistance",
    type: "Support Program",
    audience: "UMKM, komunitas usaha, mahasiswa pendamping, dan tim fasilitasi ekspor.",
    purpose: "Menyediakan jalur pendampingan bertahap untuk memetakan masalah, aksi, dan progres kesiapan ekspor.",
    benefit: "Mengubah konsultasi satu kali menjadi pipeline pendampingan yang terukur.",
    bestFor: "Usaha dengan hambatan campuran seperti legalitas, sertifikasi, kemasan, buyer, logistik, dan dokumen.",
    commonDocuments: ["Profil usaha", "Foto produk", "Legalitas", "Daftar harga", "Kapasitas produksi", "Catatan masalah"],
    readinessHint: "Gunakan readiness scan, bottleneck, dan next action mingguan.",
    caution: "Pendampingan tidak menjamin ekspor. Keputusan bisnis tetap bergantung pada kesiapan produk dan pasar.",
    icon: "file",
  },
];

const sampleCases: ExportCase[] = [
  {
    id: "sample-1",
    businessName: "Tropical Snack Studio",
    segment: "MSME",
    product: "Snack olahan laut kemasan premium",
    destination: "Malaysia, Singapura",
    monthlyCapacity: 600,
    hasBuyer: false,
    importsInput: false,
    manufactures: true,
    needsWarehouse: false,
    frequentShipment: false,
    needsCertification: true,
    legalScore: 65,
    productScore: 72,
    documentScore: 48,
    marketScore: 55,
    logisticsScore: 45,
    facilityInterest: "Export Clinic Assistance",
    obstacle: "Sertifikasi dan validasi buyer belum kuat.",
    nextAction: "Buat daftar dokumen produk, rapikan katalog, dan validasi target buyer.",
    status: "Preparing",
    priority: "High",
    dueDate: "",
    notes: "Contoh data publik untuk simulasi.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    businessName: "Export Component Lab",
    segment: "Manufacturer",
    product: "Komponen produksi berbasis bahan impor",
    destination: "Asia Tenggara",
    monthlyCapacity: 2500,
    hasBuyer: true,
    importsInput: true,
    manufactures: true,
    needsWarehouse: false,
    frequentShipment: true,
    needsCertification: false,
    legalScore: 82,
    productScore: 78,
    documentScore: 72,
    marketScore: 75,
    logisticsScore: 70,
    facilityInterest: "KITE Manufacturing Track",
    obstacle: "Data input output dan alur produksi perlu dirapikan.",
    nextAction: "Susun bill of material, data impor bahan baku, dan proyeksi ekspor.",
    status: "Assisted",
    priority: "Normal",
    dueDate: "",
    notes: "Contoh data publik untuk simulasi.",
    createdAt: new Date().toISOString(),
  },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function textFromForm(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function numberFromForm(form: FormData, key: string) {
  return clamp(Number(form.get(key) || 0));
}

function boolFromForm(form: FormData, key: string) {
  return form.get(key) === "on";
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
}

function facilityIcon(name: Facility["icon"]) {
  const map: Record<Facility["icon"], LucideIcon> = {
    rocket: Rocket,
    factory: Factory,
    warehouse: Warehouse,
    globe: Globe2,
    handshake: Handshake,
    boxes: Boxes,
    file: FileCheck2,
  };
  return map[name];
}

function readinessScore(record: ExportCase) {
  const base =
    record.legalScore * 0.18 +
    record.productScore * 0.2 +
    record.documentScore * 0.18 +
    record.marketScore * 0.18 +
    record.logisticsScore * 0.14 +
    (record.hasBuyer ? 6 : 0) +
    (record.manufactures ? 3 : 0) +
    (record.frequentShipment ? 3 : 0);
  return Math.round(clamp(base));
}

function readinessLevel(score: number): Readiness {
  if (score >= 80) return "Advanced";
  if (score >= 65) return "Ready";
  if (score >= 45) return "Growing";
  return "Basic";
}

function buildGaps(record: ExportCase) {
  const gaps: string[] = [];
  if (record.legalScore < 60) gaps.push("Legalitas dasar");
  if (record.productScore < 60) gaps.push("Kesiapan produk");
  if (record.documentScore < 60) gaps.push("Dokumen ekspor");
  if (record.marketScore < 60) gaps.push("Buyer dan pasar tujuan");
  if (record.logisticsScore < 60) gaps.push("Rute logistik");
  if (record.needsCertification) gaps.push("Sertifikasi teknis");
  return gaps;
}

function matchFacility(record: ExportCase, facility: Facility): MatchResult {
  let score = 20;
  const actions: string[] = [];
  const reasons: string[] = [];

  if (facility.id === "export-basics") {
    score += 20;
    if (readinessScore(record) < 65) score += 25;
    actions.push("Susun peta produk, HS, dokumen, buyer, dan rute pengiriman.");
    reasons.push("Cocok untuk pemetaan awal sebelum memilih fasilitas lanjutan.");
  }

  if (facility.id === "kite-ikm") {
    if (record.segment === "MSME") score += 20;
    if (record.importsInput) score += 30;
    if (record.manufactures) score += 20;
    if (record.hasBuyer) score += 8;
    actions.push("Rapikan legalitas, pembukuan, data bahan baku, dan proyeksi ekspor.");
    reasons.push("Relevan untuk usaha produksi berorientasi ekspor yang memakai input impor.");
  }

  if (facility.id === "kite-manufacturing") {
    if (record.segment === "Manufacturer") score += 30;
    if (record.importsInput) score += 30;
    if (record.manufactures) score += 20;
    if (record.frequentShipment) score += 10;
    actions.push("Siapkan alur produksi, bill of material, data input-output, dan kontrol pembukuan.");
    reasons.push("Relevan untuk manufaktur dengan siklus impor, produksi, dan ekspor.");
  }

  if (facility.id === "bonded-zone") {
    if (record.manufactures) score += 20;
    if (record.frequentShipment) score += 12;
    if (record.monthlyCapacity >= 2000) score += 18;
    if (record.logisticsScore >= 65) score += 10;
    actions.push("Evaluasi skala kegiatan, lokasi, sistem persediaan, dan SOP kontrol barang.");
    reasons.push("Masuk akal bila skala, lokasi, dan sistem pengendalian sudah kuat.");
  }

  if (facility.id === "plb") {
    if (record.needsWarehouse) score += 35;
    if (record.segment === "Logistics Provider" || record.segment === "Trader") score += 20;
    if (record.frequentShipment) score += 10;
    actions.push("Peta kebutuhan hub, stok, konsolidasi, rute, dan model bisnis logistik.");
    reasons.push("Relevan jika masalah utama ada pada penyimpanan, distribusi, atau konsolidasi barang.");
  }

  if (facility.id === "aeo-mita") {
    if (record.frequentShipment) score += 20;
    if (record.legalScore >= 80 && record.documentScore >= 75) score += 25;
    if (record.status === "Ready to Apply") score += 10;
    actions.push("Bangun compliance file, SOP, riwayat transaksi, dan rekam pengendalian internal.");
    reasons.push("Cocok untuk pelaku usaha matang dengan frekuensi dan kepatuhan kuat.");
  }

  if (facility.id === "fta-origin") {
    if (record.destination.trim()) score += 20;
    if (record.hasBuyer) score += 20;
    if (record.marketScore >= 60) score += 15;
    actions.push("Kunci HS, negara tujuan, komposisi produk, asal bahan, dan permintaan dokumen buyer.");
    reasons.push("Relevan untuk menyiapkan diskusi akses pasar dan dokumen asal barang.");
  }

  if (facility.id === "export-clinic") {
    score += 15;
    if (buildGaps(record).length >= 3) score += 25;
    if (record.segment === "MSME") score += 15;
    actions.push("Buat agenda pendampingan 30 hari berdasarkan gap terlemah.");
    reasons.push("Cocok untuk kasus dengan hambatan campuran dan butuh pendampingan bertahap.");
  }

  return {
    facility,
    score: clamp(score, 0, 100),
    reason: reasons[0] ?? "Relevan sebagai referensi awal.",
    actions,
  };
}

function enrichCase(record: ExportCase): EnrichedCase {
  const score = readinessScore(record);
  const gaps = buildGaps(record);
  const matches = facilities.map((facility) => matchFacility(record, facility)).sort((a, b) => b.score - a.score);
  const best = matches[0];
  const overdue = Boolean(record.dueDate && record.dueDate < todayIso() && record.status !== "Archived");
  const recommendation = best
    ? `${best.facility.name}: ${best.actions[0]}`
    : "Mulai dari pemetaan ekspor dasar dan checklist dokumen awal.";
  return {
    ...record,
    readinessScore: score,
    readiness: readinessLevel(score),
    gaps,
    bestMatches: matches.slice(0, 3),
    mainRecommendation: recommendation,
    overdue,
  };
}

function buildBrief(record: EnrichedCase) {
  return [
    `Usaha: ${record.businessName}`,
    `Produk: ${record.product}`,
    `Tujuan: ${record.destination || "Belum ditentukan"}`,
    `Segment: ${record.segment}`,
    `Readiness: ${record.readinessScore} - ${record.readiness}`,
    `Gap utama: ${record.gaps.join(", ") || "Tidak ada gap besar"}`,
    `Rekomendasi utama: ${record.mainRecommendation}`,
    `Next action: ${record.nextAction || "Belum diisi"}`,
  ].join("\n");
}

export function ExportClinicWorkbenchClient() {
  const [cases, setCases] = useState<ExportCase[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeFacility, setActiveFacility] = useState(facilities[0].id);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        setCases(Array.isArray(parsed.cases) ? parsed.cases : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cases }));
  }, [loaded, cases]);

  const enriched = useMemo(() => cases.map(enrichCase), [cases]);
  const selected = enriched.find((item) => item.id === selectedId) ?? enriched[0];
  const facility = facilities.find((item) => item.id === activeFacility) ?? facilities[0];

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase();
    return enriched.filter((item) => {
      const text = `${item.businessName} ${item.product} ${item.destination} ${item.segment} ${item.facilityInterest} ${item.obstacle}`.toLowerCase();
      const matchText = !keyword || text.includes(keyword);
      const matchFilter = filter === "All" || item.segment === filter || item.status === filter || item.priority === filter || item.readiness === filter || item.bestMatches.some((match) => match.facility.type === filter || match.facility.name === filter);
      return matchText && matchFilter;
    });
  }, [enriched, query, filter]);

  const summary = useMemo(() => {
    const total = enriched.length;
    const avg = total === 0 ? 0 : Math.round(enriched.reduce((sum, item) => sum + item.readinessScore, 0) / total);
    const ready = enriched.filter((item) => item.readiness === "Ready" || item.readiness === "Advanced").length;
    const critical = enriched.filter((item) => item.priority === "Critical" || item.overdue).length;
    const withBuyer = enriched.filter((item) => item.hasBuyer).length;
    const topGap = enriched.length === 0 ? "-" : [
      ["Legalitas", enriched.filter((item) => item.legalScore < 60).length],
      ["Produk", enriched.filter((item) => item.productScore < 60).length],
      ["Dokumen", enriched.filter((item) => item.documentScore < 60).length],
      ["Market", enriched.filter((item) => item.marketScore < 60).length],
      ["Logistik", enriched.filter((item) => item.logisticsScore < 60).length],
    ].sort((a, b) => Number(b[1]) - Number(a[1]))[0][0] as string;
    return { total, avg, ready, critical, withBuyer, topGap };
  }, [enriched]);

  function addCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const record: ExportCase = {
      id: crypto.randomUUID(),
      businessName: textFromForm(form, "businessName") || "Export Case Baru",
      segment: textFromForm(form, "segment") as Segment,
      product: textFromForm(form, "product") || "Produk belum diisi",
      destination: textFromForm(form, "destination") || "Belum ditentukan",
      monthlyCapacity: Number(form.get("monthlyCapacity") || 0),
      hasBuyer: boolFromForm(form, "hasBuyer"),
      importsInput: boolFromForm(form, "importsInput"),
      manufactures: boolFromForm(form, "manufactures"),
      needsWarehouse: boolFromForm(form, "needsWarehouse"),
      frequentShipment: boolFromForm(form, "frequentShipment"),
      needsCertification: boolFromForm(form, "needsCertification"),
      legalScore: numberFromForm(form, "legalScore"),
      productScore: numberFromForm(form, "productScore"),
      documentScore: numberFromForm(form, "documentScore"),
      marketScore: numberFromForm(form, "marketScore"),
      logisticsScore: numberFromForm(form, "logisticsScore"),
      facilityInterest: textFromForm(form, "facilityInterest"),
      obstacle: textFromForm(form, "obstacle"),
      nextAction: textFromForm(form, "nextAction"),
      status: textFromForm(form, "status") as Status,
      priority: textFromForm(form, "priority") as Priority,
      dueDate: textFromForm(form, "dueDate"),
      notes: textFromForm(form, "notes"),
      createdAt: new Date().toISOString(),
    };
    setCases((previous) => [record, ...previous]);
    setSelectedId(record.id);
    event.currentTarget.reset();
  }

  function removeCase(id: string) {
    setCases((previous) => previous.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateCase(id: string, patch: Partial<ExportCase>) {
    setCases((previous) => previous.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function loadSample() {
    setCases(sampleCases);
    setSelectedId(sampleCases[0]?.id ?? null);
  }

  function clearWorkspace() {
    setCases([]);
    setSelectedId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ cases }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "export-clinic-workbench-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = ["Usaha", "Segment", "Produk", "Tujuan", "Skor", "Readiness", "Top Facility", "Gap", "Next Action", "Status", "Priority"];
    const rows = enriched.map((item) => [
      item.businessName,
      item.segment,
      item.product,
      item.destination,
      String(item.readinessScore),
      item.readiness,
      item.bestMatches[0]?.facility.name ?? "-",
      item.gaps.join(" | "),
      item.nextAction,
      item.status,
      item.priority,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "export-clinic-workbench-recap.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setCases(Array.isArray(parsed.cases) ? parsed.cases : []);
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
              <p className="text-sm font-black uppercase tracking-[0.28em] text-teal">Export Assistance</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">Export Facility Workbench</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
                Pusat informasi interaktif untuk memahami fasilitas, jalur bantuan, dan kesiapan awal ekspor. Tool ini membantu pengguna memilih arah belajar, bukan menetapkan kelayakan resmi.
              </p>
            </div>
            <span className="rounded-full border border-teal/30 bg-teal/10 px-4 py-1 text-xs font-bold text-teal">Information Lab</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard label="Fokus" value="Fasilitas Ekspor" />
            <InfoCard label="Mode" value="Navigator Edukatif" />
            <InfoCard label="Update" value="2026-07-10" />
          </div>

          <div className="mt-8 rounded-3xl border border-teal/20 bg-teal/5 p-5 text-sm leading-6 text-slate-700">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={19} />
              <p>
                Aplikasi ini bersifat informasi umum dan edukasi publik. Ketentuan fasilitas, syarat, dan alur resmi harus divalidasi kembali melalui kanal resmi sebelum digunakan untuk permohonan atau keputusan bisnis.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <MetricCard icon={ClipboardList} label="Kasus" value={`${summary.total}`} tone="neutral" />
          <MetricCard icon={Compass} label="Rata-rata readiness" value={`${summary.avg}`} tone={summary.avg >= 70 ? "safe" : summary.avg >= 50 ? "warning" : "danger"} />
          <MetricCard icon={Rocket} label="Siap diarahkan" value={`${summary.ready}`} tone="safe" />
          <MetricCard icon={Target} label="Prioritas" value={`${summary.critical}`} tone={summary.critical === 0 ? "safe" : "danger"} />
          <MetricCard icon={Handshake} label="Ada buyer" value={`${summary.withBuyer}`} tone="prime" />
          <MetricCard icon={Lightbulb} label="Gap utama" value={summary.topGap} tone="neutral" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Facility Navigator" icon={Map}>
            <FacilityNavigator activeId={activeFacility} onSelect={setActiveFacility} />
          </Panel>
          <Panel title="Facility Detail" icon={facilityIcon(facility.icon)}>
            <FacilityDetail facility={facility} />
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Export Command Center" icon={BrainCircuit}>
            {selected ? <CommandCenter record={selected} onUpdate={updateCase} onCopy={copyBrief} copied={copied} /> : <EmptyState title="Belum ada kasus" description="Tambahkan kasus atau muat contoh untuk melihat rekomendasi fasilitas dan action plan." />}
          </Panel>
          <Panel title="Tambah kasus ekspor" icon={Plus}>
            <ExportCaseForm onSubmit={addCase} />
          </Panel>
        </div>

        <Panel title="Export Clinic Workspace" icon={FileSpreadsheet}>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari usaha, produk, negara, fasilitas, hambatan" className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none ring-teal/20 focus:ring-4" />
            </div>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy outline-none ring-teal/20 focus:ring-4">
              <option>All</option>
              {segments.map((item) => <option key={item}>{item}</option>)}
              {statuses.map((item) => <option key={item}>{item}</option>)}
              {priorities.map((item) => <option key={item}>{item}</option>)}
              <option>Basic</option>
              <option>Growing</option>
              <option>Ready</option>
              <option>Advanced</option>
              {Array.from(new Set(facilities.map((item) => item.type))).map((item) => <option key={item}>{item}</option>)}
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
          {filtered.length === 0 ? <EmptyState title="Belum ada data" description="Tambahkan kasus ekspor baru atau klik Contoh untuk mencoba matching fasilitas dan readiness scoring." /> : <CaseTable records={filtered} selectedId={selectedId} onSelect={setSelectedId} onRemove={removeCase} />}
        </Panel>
      </div>
    </section>
  );
}

function FacilityNavigator({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {facilities.map((facility) => {
        const Icon = facilityIcon(facility.icon);
        const active = activeId === facility.id;
        return (
          <button key={facility.id} onClick={() => onSelect(facility.id)} className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${active ? "border-teal bg-teal/5" : "border-slate-200 bg-white"}`}>
            <div className="flex items-start gap-3">
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${active ? "bg-teal text-white" : "bg-slate-100 text-navy"}`}><Icon size={20} /></div>
              <div>
                <p className="font-black text-navy">{facility.name}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{facility.type}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FacilityDetail({ facility }: { facility: Facility }) {
  const Icon = facilityIcon(facility.icon);
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal text-white"><Icon size={25} /></div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">{facility.type}</p>
            <h2 className="mt-2 text-3xl font-black">{facility.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{facility.purpose}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoPill label="Untuk siapa" value={facility.audience} />
        <InfoPill label="Paling cocok" value={facility.bestFor} />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
        <p className="font-black text-navy">Manfaat utama</p>
        <p className="mt-2">{facility.benefit}</p>
      </div>
      <div>
        <p className="mb-3 text-sm font-black text-navy">Dokumen atau data yang biasanya perlu dipetakan</p>
        <div className="flex flex-wrap gap-2">
          {facility.commonDocuments.map((doc) => <span key={doc} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">{doc}</span>)}
        </div>
      </div>
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <p className="font-black">Catatan validasi</p>
        <p className="mt-2">{facility.caution}</p>
      </div>
    </div>
  );
}

function CommandCenter({ record, onUpdate, onCopy, copied }: { record: EnrichedCase; onUpdate: (id: string, patch: Partial<ExportCase>) => void; onCopy: () => void; copied: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Selected case</p>
            <h2 className="mt-2 text-3xl font-black">{record.businessName}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{record.product} · {record.destination}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-teal">{record.readinessScore}</p>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">{record.readiness}</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">{record.mainRecommendation}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Top match" value={record.bestMatches[0]?.facility.name ?? "-"} />
        <InfoPill label="Gap utama" value={record.gaps[0] ?? "Tidak ada gap besar"} />
        <InfoPill label="Status" value={record.status} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="font-black text-navy">Facility matching</p>
        <div className="mt-4 space-y-3">
          {record.bestMatches.map((match) => (
            <div key={match.facility.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-navy">{match.facility.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{match.reason}</p>
                </div>
                <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-black text-teal">{match.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InlineSelect label="Status" value={record.status} options={statuses} onChange={(value) => onUpdate(record.id, { status: value as Status })} />
        <InlineSelect label="Prioritas" value={record.priority} options={priorities} onChange={(value) => onUpdate(record.id, { priority: value as Priority })} />
      </div>

      <button onClick={onCopy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Sparkles size={18} /> {copied ? "Brief tersalin" : "Salin smart brief"}
      </button>
    </div>
  );
}

function ExportCaseForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput name="businessName" label="Nama usaha/case" placeholder="Gunakan label aman" />
        <SelectText name="segment" label="Segment" options={segments} defaultValue="MSME" />
        <TextInput name="product" label="Produk" placeholder="Produk utama" />
        <TextInput name="destination" label="Negara/target pasar" placeholder="Contoh: Malaysia" />
        <TextInput name="monthlyCapacity" label="Kapasitas bulanan" type="number" placeholder="0" />
        <TextInput name="facilityInterest" label="Minat fasilitas" placeholder="Contoh: KITE IKM, PLB, klinik ekspor" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CheckInput name="hasBuyer" label="Sudah ada buyer" />
        <CheckInput name="importsInput" label="Memakai input impor" />
        <CheckInput name="manufactures" label="Ada proses produksi" />
        <CheckInput name="needsWarehouse" label="Butuh hub/gudang" />
        <CheckInput name="frequentShipment" label="Pengiriman rutin" />
        <CheckInput name="needsCertification" label="Butuh sertifikasi" />
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <ScoreInput name="legalScore" label="Legalitas" defaultValue={50} />
        <ScoreInput name="productScore" label="Produk" defaultValue={50} />
        <ScoreInput name="documentScore" label="Dokumen" defaultValue={45} />
        <ScoreInput name="marketScore" label="Market" defaultValue={45} />
        <ScoreInput name="logisticsScore" label="Logistik" defaultValue={45} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectText name="status" label="Status" options={statuses} defaultValue="Exploring" />
        <SelectText name="priority" label="Prioritas" options={priorities} defaultValue="Normal" />
        <TextInput name="dueDate" label="Target tindak lanjut" type="date" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea name="obstacle" label="Hambatan utama" placeholder="Apa yang paling menghambat ekspor?" />
        <TextArea name="nextAction" label="Next action" placeholder="Aksi pendampingan berikutnya" />
      </div>
      <TextArea name="notes" label="Catatan" placeholder="Catatan aman untuk publik" />
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-navy-light">
        <Plus size={18} /> Tambah kasus
      </button>
    </form>
  );
}

function CaseTable({ records, selectedId, onSelect, onRemove }: { records: EnrichedCase[]; selectedId: string | null; onSelect: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Case</th>
              <th className="px-4 py-3">Readiness</th>
              <th className="px-4 py-3">Top Facility</th>
              <th className="px-4 py-3">Gap</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {records.map((record) => (
              <tr key={record.id} className={selectedId === record.id ? "bg-teal/5" : ""}>
                <td className="px-4 py-4 align-top">
                  <button onClick={() => onSelect(record.id)} className="text-left">
                    <p className="font-black text-navy">{record.businessName}</p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{record.product} · {record.destination}</p>
                  </button>
                </td>
                <td className="px-4 py-4 align-top"><ScoreBadge score={record.readinessScore} label={record.readiness} /></td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{record.bestMatches[0]?.facility.name ?? "-"}</td>
                <td className="px-4 py-4 align-top text-xs text-slate-600">{record.gaps.join(" | ") || "-"}</td>
                <td className="px-4 py-4 align-top"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{record.status}</span></td>
                <td className="px-4 py-4 align-top text-right">
                  <button onClick={() => onRemove(record.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label="Hapus kasus"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const tone = score >= 80 ? "bg-teal/10 text-teal ring-teal/20" : score >= 65 ? "bg-emerald-100 text-emerald-700 ring-emerald-200" : score >= 45 ? "bg-amber-100 text-amber-700 ring-amber-200" : "bg-rose-100 text-rose-700 ring-rose-200";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${tone}`}>{score} · {label}</span>;
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

function ScoreInput({ name, label, defaultValue }: { name: string; label: string; defaultValue: number }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input name={name} type="number" min="0" max="100" defaultValue={defaultValue} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />
    </label>
  );
}

function CheckInput({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700">
      <input name={name} type="checkbox" className="h-4 w-4 accent-teal" />
      <span>{label}</span>
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
