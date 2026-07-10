"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, CheckCircle2, ClipboardList, FileText, Package, Plus, ReceiptText, Trash2, WandSparkles } from "lucide-react";

export type BusinessToolKind = "invoice" | "pos" | "booking" | "tasks" | "profile" | "quote";

type InvoiceItem = { id: string; name: string; qty: number; price: number };
type PosProduct = { id: string; name: string; price: number; stock: number };
type Booking = { id: string; customer: string; service: string; date: string; time: string; status: string };
type Task = { id: string; title: string; owner: string; due: string; priority: string; status: string };

const toolMeta: Record<BusinessToolKind, { title: string; subtitle: string; icon: ReactNode }> = {
  invoice: { title: "InvoiceFlow", subtitle: "Buat invoice sederhana, hitung total otomatis, dan cetak langsung.", icon: <ReceiptText size={22} /> },
  pos: { title: "Mini POS", subtitle: "Kelola produk, transaksi, stok, dan omzet harian secara lokal.", icon: <Package size={22} /> },
  booking: { title: "Booking Workspace", subtitle: "Catat jadwal layanan, pelanggan, dan status booking.", icon: <CalendarDays size={22} /> },
  tasks: { title: "Task Workspace", subtitle: "Pantau tugas, PIC, deadline, prioritas, dan status pekerjaan.", icon: <ClipboardList size={22} /> },
  profile: { title: "Business Profile Builder", subtitle: "Ubah data usaha menjadi profil bisnis yang rapi dan siap pakai.", icon: <FileText size={22} /> },
  quote: { title: "Price Quote Builder", subtitle: "Susun estimasi harga jasa dan waktu pengerjaan secara cepat.", icon: <WandSparkles size={22} /> },
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

export function BusinessToolsClient({ kind }: { kind: BusinessToolKind }) {
  const meta = toolMeta[kind];
  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal/10 text-teal">{meta.icon}</div>
            <div><p className="text-xs font-black uppercase tracking-[0.24em] text-teal">Business Utility</p><h1 className="mt-2 text-4xl font-black text-navy">{meta.title}</h1><p className="mt-3 max-w-3xl text-slate-600">{meta.subtitle}</p></div>
          </div>
          <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Data disimpan lokal di browser. Gunakan data contoh atau data non-sensitif.</p>
        </header>
        {kind === "invoice" && <InvoiceTool />}
        {kind === "pos" && <PosTool />}
        {kind === "booking" && <BookingTool />}
        {kind === "tasks" && <TaskTool />}
        {kind === "profile" && <ProfileTool />}
        {kind === "quote" && <QuoteTool />}
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

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal/20 focus:ring-4" />;
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return <label className="space-y-2 text-sm font-semibold text-slate-700"><span>{text}</span>{children}</label>;
}

function InvoiceTool() {
  const [client, setClient] = useLocalState("bece:invoice:client", "Sample Client");
  const [invoiceNo, setInvoiceNo] = useLocalState("bece:invoice:no", `INV-${new Date().getFullYear()}-001`);
  const [discount, setDiscount] = useLocalState("bece:invoice:discount", 0);
  const [items, setItems] = useLocalState<InvoiceItem[]>("bece:invoice:items", [{ id: "1", name: "Sample Service", qty: 1, price: 500000 }]);
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = Math.max(0, subtotal - discount);
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card title="Invoice Editor"><div className="space-y-4"><Label text="Nomor invoice"><Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></Label><Label text="Nama klien"><Input value={client} onChange={(e) => setClient(e.target.value)} /></Label>{items.map((item) => <div key={item.id} className="grid grid-cols-[1fr_90px_140px_42px] gap-2"><Input value={item.name} onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, name: e.target.value } : x))} /><Input type="number" value={item.qty} onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, qty: Number(e.target.value) } : x))} /><Input type="number" value={item.price} onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, price: Number(e.target.value) } : x))} /><button onClick={() => setItems(items.filter((x) => x.id !== item.id))} className="rounded-xl bg-rose-50 text-rose-600"><Trash2 size={16} className="mx-auto" /></button></div>)}<button onClick={() => setItems([...items, { id: crypto.randomUUID(), name: "New item", qty: 1, price: 0 }])} className="inline-flex items-center gap-2 rounded-2xl bg-teal px-4 py-3 text-sm font-black text-white"><Plus size={16} /> Tambah item</button><Label text="Diskon"><Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /></Label></div></Card><Card title="Preview Invoice"><div className="rounded-3xl border border-slate-200 p-6"><div className="flex justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal">BECE BUSINESS TOOLS</p><h3 className="mt-2 text-3xl font-black text-navy">Invoice</h3><p className="mt-4 text-sm text-slate-500">Ditagihkan kepada</p><p className="font-black">{client}</p></div><div className="text-right"><p className="font-black">{invoiceNo}</p><p className="text-sm text-slate-500">{new Date().toLocaleDateString("id-ID")}</p></div></div><div className="mt-8 space-y-3">{items.map((item) => <div key={item.id} className="flex justify-between border-b border-slate-100 pb-3"><span>{item.name} × {item.qty}</span><b>{money(item.qty * item.price)}</b></div>)}</div><div className="mt-5 flex justify-between"><span>Diskon</span><b>{money(discount)}</b></div><div className="mt-5 flex justify-between border-t-2 border-navy pt-5 text-2xl font-black"><span>Total</span><span>{money(total)}</span></div><button onClick={() => window.print()} className="mt-6 w-full rounded-2xl bg-navy px-5 py-3 font-black text-white">Cetak Invoice</button></div></Card></div>;
}

function PosTool() {
  const [products, setProducts] = useLocalState<PosProduct[]>("bece:pos:products", [{ id: "1", name: "Sample Product", price: 25000, stock: 10 }]);
  const [cart, setCart] = useLocalState<Record<string, number>>("bece:pos:cart", {});
  const [sales, setSales] = useLocalState("bece:pos:sales", 0);
  const total = products.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);
  function checkout() { if (!total) return; setProducts(products.map((p) => ({ ...p, stock: Math.max(0, p.stock - (cart[p.id] || 0)) }))); setSales(sales + total); setCart({}); }
  return <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><Card title="Produk"><div className="grid gap-3 md:grid-cols-2">{products.map((p) => <button key={p.id} onClick={() => p.stock > 0 && setCart({ ...cart, [p.id]: (cart[p.id] || 0) + 1 })} className="rounded-2xl border border-slate-200 p-4 text-left"><p className="font-black text-navy">{p.name}</p><p className="mt-1 text-sm text-slate-500">{money(p.price)} · stok {p.stock}</p></button>)}</div><div className="mt-4 grid grid-cols-[1fr_140px_100px_42px] gap-2"><Input id="new-pos-name" placeholder="Nama produk" /><Input id="new-pos-price" type="number" placeholder="Harga" /><Input id="new-pos-stock" type="number" placeholder="Stok" /><button onClick={() => { const n = document.getElementById("new-pos-name") as HTMLInputElement; const p = document.getElementById("new-pos-price") as HTMLInputElement; const s = document.getElementById("new-pos-stock") as HTMLInputElement; if (n.value) { setProducts([...products, { id: crypto.randomUUID(), name: n.value, price: Number(p.value), stock: Number(s.value) }]); n.value=""; p.value=""; s.value=""; } }} className="rounded-xl bg-teal text-white"><Plus size={16} className="mx-auto" /></button></div></Card><Card title="Kasir"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Omzet tercatat</p><p className="mt-2 text-3xl font-black text-navy">{money(sales)}</p></div><div className="mt-4 space-y-3">{products.filter((p) => cart[p.id]).map((p) => <div key={p.id} className="flex justify-between"><span>{p.name} × {cart[p.id]}</span><b>{money(p.price * cart[p.id])}</b></div>)}</div><div className="mt-6 flex justify-between border-t-2 border-navy pt-4 text-xl font-black"><span>Total</span><span>{money(total)}</span></div><button onClick={checkout} className="mt-4 w-full rounded-2xl bg-navy px-5 py-3 font-black text-white">Checkout</button></Card></div>;
}

function BookingTool() {
  const [items, setItems] = useLocalState<Booking[]>("bece:booking", []);
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card title="Tambah Booking"><form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); setItems([{ id: crypto.randomUUID(), customer: String(f.get("customer")), service: String(f.get("service")), date: String(f.get("date")), time: String(f.get("time")), status: "Booked" }, ...items]); e.currentTarget.reset(); }} className="space-y-4"><Label text="Pelanggan"><Input name="customer" required /></Label><Label text="Layanan"><Input name="service" required /></Label><div className="grid grid-cols-2 gap-3"><Label text="Tanggal"><Input name="date" type="date" required /></Label><Label text="Jam"><Input name="time" type="time" required /></Label></div><button className="w-full rounded-2xl bg-navy px-5 py-3 font-black text-white">Simpan Booking</button></form></Card><Card title="Jadwal Booking"><div className="space-y-3">{items.length === 0 ? <p className="text-slate-500">Belum ada booking.</p> : items.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex justify-between gap-4"><div><p className="font-black text-navy">{item.customer}</p><p className="text-sm text-slate-500">{item.service} · {item.date} {item.time}</p></div><Select value={item.status} onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, status: e.target.value } : x))}><option>Booked</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></Select></div></div>)}</div></Card></div>;
}

function TaskTool() {
  const [items, setItems] = useLocalState<Task[]>("bece:tasks", []);
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card title="Tambah Tugas"><form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); setItems([{ id: crypto.randomUUID(), title: String(f.get("title")), owner: String(f.get("owner")), due: String(f.get("due")), priority: String(f.get("priority")), status: "To Do" }, ...items]); e.currentTarget.reset(); }} className="space-y-4"><Label text="Tugas"><Input name="title" required /></Label><Label text="PIC"><Input name="owner" /></Label><Label text="Deadline"><Input name="due" type="date" /></Label><Label text="Prioritas"><Select name="priority"><option>Low</option><option>Normal</option><option>High</option><option>Critical</option></Select></Label><button className="w-full rounded-2xl bg-navy px-5 py-3 font-black text-white">Tambah Tugas</button></form></Card><Card title="Task Board"><div className="space-y-3">{items.length === 0 ? <p className="text-slate-500">Belum ada tugas.</p> : items.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-navy">{item.title}</p><p className="text-sm text-slate-500">{item.owner || "No PIC"} · {item.due || "No deadline"} · {item.priority}</p></div><Select value={item.status} onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, status: e.target.value } : x))}><option>To Do</option><option>In Progress</option><option>Review</option><option>Done</option></Select></div></div>)}</div></Card></div>;
}

function ProfileTool() {
  const [data, setData] = useLocalState("bece:profile", { name: "Sample Business", field: "Creative services", audience: "General customers", strengths: "Fast, clear, and practical", services: "Consulting, design, implementation", contact: "contact@example.com" });
  const profile = useMemo(() => `${data.name} adalah usaha di bidang ${data.field} yang melayani ${data.audience}. Keunggulan utama kami adalah ${data.strengths}. Layanan yang tersedia meliputi ${data.services}. Untuk informasi lebih lanjut, hubungi ${data.contact}.`, [data]);
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card title="Data Usaha"><div className="space-y-4">{Object.entries(data).map(([key, value]) => <Label key={key} text={key}><Input value={value} onChange={(e) => setData({ ...data, [key]: e.target.value })} /></Label>)}</div></Card><Card title="Generated Profile"><div className="rounded-3xl bg-slate-50 p-6"><h3 className="text-3xl font-black text-navy">{data.name}</h3><p className="mt-4 leading-8 text-slate-700">{profile}</p><button onClick={() => navigator.clipboard.writeText(profile)} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-navy px-5 py-3 font-black text-white"><CheckCircle2 size={17} /> Salin Profil</button></div></Card></div>;
}

function QuoteTool() {
  const [base, setBase] = useLocalState("bece:quote:base", 500000);
  const [complexity, setComplexity] = useLocalState("bece:quote:complexity", 1);
  const [revisions, setRevisions] = useLocalState("bece:quote:revisions", 1);
  const [rush, setRush] = useLocalState("bece:quote:rush", false);
  const total = Math.round(base * complexity + revisions * 100000 + (rush ? base * 0.35 : 0));
  const days = Math.max(1, Math.round(7 * complexity - (rush ? 2 : 0)));
  return <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card title="Parameter Harga"><div className="space-y-4"><Label text="Harga dasar"><Input type="number" value={base} onChange={(e) => setBase(Number(e.target.value))} /></Label><Label text="Kompleksitas"><Select value={complexity} onChange={(e) => setComplexity(Number(e.target.value))}><option value={1}>Standard</option><option value={1.5}>Medium</option><option value={2}>Advanced</option><option value={3}>Premium</option></Select></Label><Label text="Jumlah revisi"><Input type="number" value={revisions} onChange={(e) => setRevisions(Number(e.target.value))} /></Label><label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4"><input type="checkbox" checked={rush} onChange={(e) => setRush(e.target.checked)} /><span className="font-semibold">Pengerjaan prioritas</span></label></div></Card><Card title="Estimasi Penawaran"><div className="rounded-3xl bg-gradient-to-br from-navy to-slate-900 p-8 text-white"><p className="text-sm uppercase tracking-[0.2em] text-teal">Estimated Quote</p><p className="mt-3 text-5xl font-black">{money(total)}</p><p className="mt-4 text-slate-300">Estimasi durasi: {days} hari kerja</p><div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6">Harga bersifat simulasi. Sesuaikan kembali dengan ruang lingkup, risiko, kebutuhan sumber daya, dan kesepakatan pengguna jasa.</div></div></Card></div>;
}
