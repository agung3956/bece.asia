import { ShieldCheck } from "lucide-react";

export function CommunityAppFrame({ title, app }: { title: string; app: string; sourceRepo?: string }) {
  const src = `/api/community-source/${app}`;
  return (
    <section className="min-h-screen bg-[#eef3f8] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal">Community App</p>
            <h1 className="mt-1 text-2xl font-black text-navy">{title}</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-2 text-xs font-bold text-teal">
            <ShieldCheck size={15} /> Data contoh telah disanitasi
          </span>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <iframe title={title} src={src} className="h-[calc(100vh-150px)] min-h-[720px] w-full border-0" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads allow-same-origin" />
        </div>
      </div>
    </section>
  );
}
