import type { Metadata } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import { Site } from "@/components/studio/Site";
import { STUDIO } from "@/components/studio/brand";

/* Two faces, scoped to this route. Archivo is a grotesque with a width axis,
   so one file is the wide display cut, the text and the wordmark. Martian Mono
   only measures: part numbers, rulers, counts and prices. */
const kyre = Archivo({ variable: "--font-kyre", subsets: ["latin"], axes: ["wdth"] });
const kmono = Martian_Mono({ variable: "--font-kmono", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: `${STUDIO} — the first real redesign after AI built your product`,
  description:
    "We redesign the products AI built: delivered as a pull request in your own code, measured on the one number that matters, at a fixed price.",
};

export default function Page() {
  return (
    <div className={`${kyre.variable} ${kmono.variable}`}>
      <Site />
    </div>
  );
}
