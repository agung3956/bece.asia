"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-6 text-center">
          <div className="max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-teal">bece.asia</p>
            <h1 className="mt-4 text-4xl font-black text-navy">Something went wrong</h1>
            <p className="mt-4 text-slate-600">Unexpected error occurred.</p>
            <button onClick={reset} className="mt-7 rounded-2xl bg-navy px-5 py-3 text-sm font-black text-white">Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
