import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agnost AI — interface rebuild by Kyre",
  description:
    "A demonstration rebuild of the Agnost AI marketing page and console, with mock data. Built by Kyre. Not affiliated with Agnost AI.",
};

export default function AgnostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
