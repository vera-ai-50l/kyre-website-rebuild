import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/Compare";

/* Shared shell for /terms and /privacy. Both are prose on a narrow measure and
   nothing else, so they share one layout rather than each growing their own. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5">
        <div className="mx-auto max-w-2xl pb-16 pt-32">
          <Link
            href="/"
            className="font-mono text-[13px] text-[#7a736c] transition-colors duration-200 hover:text-hi"
          >
            ← Kyre
          </Link>
          <h1 className="mt-4 text-3xl">{title}</h1>
          <p className="mt-2 font-mono text-[13px] text-[#6a635c]">
            Last updated {updated}
          </p>
          <div className="legal mt-10">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
