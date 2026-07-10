"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { BookOpenText, CalendarDays, ClipboardList, FileText, Globe2, MessageSquareText, PackageCheck, Plus, Sparkles, Trash2 } from "lucide-react";

export type CreativeToolKind = "pageforge" | "content-planner" | "guestbook" | "orderflow";

type Guest = { id: string; name: string; message: string; rating: number; createdAt: string };
type ContentItem = { id: string; title: string; pillar: string; format: string; date: string; status: string };
type Order = { id: string; customer: string; item: string; qty: number; amount: number; status: string; createdAt: string };

type PageData = {
  brand: string;
  headline: string;
  description: string;
  cta: string;
  services: string;
  testimonial: string;
  contact: string;
};

const meta: Record<CreativeToolKind, { title: string; subtitle: string; icon: ReactNode }> = {
  pageforge: { title: "PageForge", subtitle: "Susun landing page bisnis sederhana dengan preview langsung dan salinan siap pakai.", icon: <Globe2 size={22} /> },
  "content-planner": { title: "Content Planner", subtitle: "Rancang kalender konten, pilar, format, status, dan ide publikasi dalam satu workspace.", icon: <CalendarDays size={22} /> },
  guestbook: { title: "Digital Guestbook", subtitle: "Buku tamu digital umum untuk pesan, rating, dan rekap kunjungan lokal.", icon: <MessageSquareText size={22} /> },
  orderflow: { title: "OrderFlow", subtitle: "Kelola pesanan, nilai transaksi, jumlah item, dan status pemenuhan secara ringan.", icon: <PackageCheck size={22} /> },
};

function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, [key]);
  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(value));
  }, [key, loaded, value]);
  return [value, setValue] as const;
}

function money(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
}

export function CreativeBusinessToolsClient({ kind }: { kind: CreativeToolKind }) {
  const item = meta[kind];
  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal/10 text-teal">{item.icon}</div>
            <div><p className="text-xs font-black uppercase tracking-[0.24em] text-teal">Creative Business Utility</p><h1 className="mt-2 text-4xl font-black text-navy">{item.title}</h1><p className="mt-3 max-w-3xl text-slate-600">{item.subtitle}</p></div>
          </div>
          <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Data disimpan lokal di browser. Gunakan data contoh atau data non-sensitif.</p>
        </header>
        {kind === "pageforge" && <PageForgeTool />}
        {kind === "content-planner" && <ContentPlannerTool />}
        {kind === "guestbook" && <GuestbookTool />}
        {kind === "orderflow" && <OrderFlowTool />}
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-navy">{title}</h2><div className="mt-5">{children}</div></div>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />;
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return <label className="space-y-2 text-sm font-semibold text-slate-700"><span>{text}</span>{children}</label>;
}

function PageForgeTool() {
  const [data, setData] = useLocalState<PageData>("bece:pageforge", {
    brand: "Sample Studio",
    headline: "Buat ide Anda terlihat lebih meyakinkan",
    description: "Landing page ringkas untuk memperkenalkan layanan, keunggulan, dan kontak bisnis.",
    cta: "Hubungi Sekarang",
    services: "Konsultasi, Desain, Implementasi",
    testimonial: "Pelayanannya jelas, cepat, dan mudah dipahami.",
    contact: "contact@example.com",
  });
  const services = useMemo(() => data.services.split(",").map((x) => x.trim()).filter(Boolean), [data.services]);
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card title="Landing Page Builder"><div className="space-y-4">{Object.entries(data).map(([key, value]) => <Label key={key} text={key}><Input value={value} onChange={(e) => setData({ ...data, [key]: e.target.value })} /></Label>)}</div></Card><Card title="Live Preview"><div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy to-slate-900 p-8 text-white"><p className="text-xs font-black uppercase tracking-[0.24em] text-teal">{data.brand}</p><h3 className="mt-4 max-w-3xl text-4xl font-black leading-tight">{data.headline}</h3><p className="mt-4 max-w-2xl leading-7 text-slate-300">{data.description}</p><div className="mt-6 flex flex-wrap gap-2">{services.map((service) => <span key={service} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">{service}</span>)}</div><div className="mt-8 rounded-3xl bg-white/10 p-5"><p className="text-sm italic text-slate-200">“{data.testimonial}”</p></div><div className="mt-8 flex flex-wrap items-center gap-4"><button className="rounded-2xl bg-teal px-5 py-3 font-black text-white">{data.cta}</button><span className="text-sm text-slate-300">{data.contact}</span></div></div></Card></div>;
}

function ContentPlannerTool() {
  const [items, setItems] = useLocalState<ContentItem[]>("bece:content-planner", [
    { id: "1", title: "Cerita di balik produk", pillar: "Story", format: "Carousel", date: "", status: "Idea" },
  ]);
  const counts = useMemo(() => ({ total: items.length, planned: items.filter((x) => x.status === "Planned").length, published: items.filter((x) => x.status === "Published").length }), [items]);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setItems([{ id: crypto.randomUUID(), title: String(form.get("title") || "Ide baru"), pillar: String(form.get("pillar") || "General"), format: String(form.get("format") || "Post"), date: String(form.get("date") || ""), status: "Idea" }, ...items]);
    event.currentTarget.reset();
  }
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card title="Tambah Ide Konten"><form onSubmit={add} className="space-y-4"><Label text="Judul ide"><Input name="title" required /></Label><Label text="Pilar"><Input name="pillar" placeholder="Education / Story / Offer" /></Label><Label text="Format"><Select name="format"><option>Post</option><option>Carousel</option><option>Reel</option><option>Story</option><option>Newsletter</option></Select></Label><Label text="Tanggal"><Input name="date" type="date" /></Label><button className="w-full rounded-2xl bg-navy px-5 py-3 font-black text-white">Tambah Ide</button></form></Card><Card title="Content Board"><div className="mb-4 grid grid-cols-3 gap-3"><MiniStat label="Total" value={counts.total} /><MiniStat label="Planned" value={counts.planned} /><MiniStat label="Published" value={counts.published} /></div><div className="space-y-3">{items.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black text-navy">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.pillar} · {item.format} · {item.date || "No date"}</p></div><div className="flex gap-2"><Select value={item.status} onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, status: e.target.value } : x))}><option>Idea</option><option>Planned</option><option>Drafting</option><option>Published</option></Select><button onClick={() => setItems(items.filter((x) => x.id !== item.id))} className="rounded-xl bg-rose-50 px-3 text-rose-600"><Trash2 size={16} /></button></div></div></div>)}</div></Card></div>;
}

function GuestbookTool() {
  const [items, setItems] = useLocalState<Guest[]>("bece:guestbook", []);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setItems([{ id: crypto.randomUUID(), name: String(form.get("name") || "Sample Guest"), message: String(form.get("message") || ""), rating: Number(form.get("rating") || 5), createdAt: new Date().toISOString() }, ...items]);
    event.currentTarget.reset();
  }
  const avg = items.length ? Math.round((items.reduce((s, x) => s + x.rating, 0) / items.length) * 10) / 10 : 0;
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card title="Form Buku Tamu"><form onSubmit={add} className="space-y-4"><Label text="Nama"><Input name="name" placeholder="Sample Guest" /></Label><Label text="Pesan"><Textarea name="message" rows={4} required /></Label><Label text="Rating"><Select name="rating"><option value="5">5 - Sangat baik</option><option value="4">4 - Baik</option><option value="3">3 - Cukup</option><option value="2">2 - Kurang</option><option value="1">1 - Buruk</option></Select></Label><button className="w-full rounded-2xl bg-navy px-5 py-3 font-black text-white">Simpan Pesan</button></form></Card><Card title="Guestbook Feed"><div className="mb-4 grid grid-cols-2 gap-3"><MiniStat label="Kunjungan" value={items.length} /><MiniStat label="Rata-rata rating" value={avg} /></div><div className="space-y-3">{items.length === 0 ? <p className="text-slate-500">Belum ada pesan.</p> : items.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex justify-between gap-3"><div><p className="font-black text-navy">{item.name}</p><p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p><p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("id-ID")}</p></div><span className="font-black text-teal">{item.rating}/5</span></div></div>)}</div></Card></div>;
}

function OrderFlowTool() {
  const [items, setItems] = useLocalState<Order[]>("bece:orderflow", []);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setItems([{ id: crypto.randomUUID(), customer: String(form.get("customer") || "Sample Customer"), item: String(form.get("item") || "Sample Product"), qty: Number(form.get("qty") || 1), amount: Number(form.get("amount") || 0), status: "New", createdAt: new Date().toISOString() }, ...items]);
    event.currentTarget.reset();
  }
  const total = items.reduce((s, x) => s + x.amount * x.qty, 0);
  const open = items.filter((x) => x.status !== "Completed" && x.status !== "Cancelled").length;
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card title="Tambah Pesanan"><form onSubmit={add} className="space-y-4"><Label text="Pelanggan"><Input name="customer" placeholder="Sample Customer" /></Label><Label text="Produk / Layanan"><Input name="item" required /></Label><div className="grid grid-cols-2 gap-3"><Label text="Jumlah"><Input name="qty" type="number" defaultValue={1} min={1} /></Label><Label text="Harga satuan"><Input name="amount" type="number" defaultValue={0} min={0} /></Label></div><button className="w-full rounded-2xl bg-navy px-5 py-3 font-black text-white">Tambah Pesanan</button></form></Card><Card title="Order Pipeline"><div className="mb-4 grid grid-cols-3 gap-3"><MiniStat label="Orders" value={items.length} /><MiniStat label="Open" value={open} /><MiniStat label="Value" value={money(total)} /></div><div className="space-y-3">{items.length === 0 ? <p className="text-slate-500">Belum ada pesanan.</p> : items.map((order) => <div key={order.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black text-navy">{order.customer}</p><p className="mt-1 text-sm text-slate-500">{order.item} × {order.qty} · {money(order.amount * order.qty)}</p></div><div className="flex gap-2"><Select value={order.status} onChange={(e) => setItems(items.map((x) => x.id === order.id ? { ...x, status: e.target.value } : x))}><option>New</option><option>Confirmed</option><option>Processing</option><option>Ready</option><option>Completed</option><option>Cancelled</option></Select><button onClick={() => setItems(items.filter((x) => x.id !== order.id))} className="rounded-xl bg-rose-50 px-3 text-rose-600"><Trash2 size={16} /></button></div></div></div>)}</div></Card></div>;
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-2 text-xl font-black text-navy">{value}</p></div>;
}
