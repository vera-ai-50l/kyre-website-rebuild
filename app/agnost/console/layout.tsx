import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClipForge AI — Agnost console (Kyre demonstration rebuild)",
  description:
    "A demonstration rebuild of the Agnost AI console, built by Kyre with mock data. Not affiliated with Agnost AI.",
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <div className="ag-scope h-dvh bg-ag-base p-0 sm:p-3">{children}</div>;
}
