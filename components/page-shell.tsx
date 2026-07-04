import type { ReactNode } from "react";
import type { Locale } from "@/data/apps";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function PageShell({ locale, currentPath, children }: { locale: Locale; currentPath: string; children: ReactNode }) {
  return (
    <>
      <Navbar locale={locale} currentPath={currentPath} />
      <main>{children}</main>
      <Footer locale={locale} />
    </>
  );
}
