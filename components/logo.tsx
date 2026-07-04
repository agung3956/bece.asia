import Link from "next/link";
import type { Locale } from "@/data/apps";
import { localePath } from "@/lib/routes";

export function Logo({ locale }: { locale: Locale }) {
  return (
    <Link href={localePath(locale)} className="flex items-center gap-3" aria-label="bece.asia home">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-navy text-lg font-black tracking-tight text-white shadow-soft">
        bc
      </span>
      <span className="text-xl font-bold tracking-tight text-navy dark:text-white">
        bece<span className="text-teal">.</span>asia
      </span>
    </Link>
  );
}
