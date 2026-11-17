import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ClipForge AI — Agnost console (Kyre demonstration rebuild)",
  description:
    "A demonstration rebuild of the Agnost AI console, built by Kyre with mock data. Not affiliated with Agnost AI.",
};

/* Anyone can land here from a link without having read the Kyre page first, so
   the console says on screen, not only in its metadata, that it is a concept. */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ag-scope flex h-dvh flex-col bg-ag-base">
      <p data-concept-strip className="flex shrink-0 flex-wrap items-center gap-x-2 px-3 py-2 text-[12px] text-ag-mid sm:px-4">
        <span className="text-ag-hi">Concept by Kyre</span>
        <span>· Not Agnost&apos;s product, not client work · Sample data for a fictional company</span>
        <Link href="/#concept" className="ml-auto text-ag-hi underline decoration-ag-strong underline-offset-4 hover:decoration-ag-hi">
          Back to Kyre
        </Link>
      </p>
      <div className="min-h-0 flex-1 p-0 sm:px-3 sm:pb-3">{children}</div>
    </div>
  );
}
