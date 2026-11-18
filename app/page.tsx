import type { Metadata } from "next";
import { Geist_Mono, Inter_Tight, Mona_Sans } from "next/font/google";
import { Site } from "@/components/studio/Site";
import { STUDIO } from "@/components/studio/brand";

/* A different pair from the rest of the repo, scoped to this route. Mona Sans
   carries a width axis, so one file is both the wide, tight display cut and the
   normal-width text; Geist Mono is the label and the code. */
const mona = Mona_Sans({ variable: "--font-mona", subsets: ["latin"], axes: ["wdth"] });
const gmono = Geist_Mono({ variable: "--font-gmono", subsets: ["latin"] });
/* Only for the wordmark, which is what the first site's logo was set in. */
const logo = Inter_Tight({ variable: "--font-logo", subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: `${STUDIO} — the first real redesign after AI built your product`,
  description:
    "We redesign the products AI built: delivered as a pull request in your own code, measured on the one number that matters, at a fixed price.",
};

export default function Page() {
  return (
    <div className={`${mona.variable} ${gmono.variable} ${logo.variable}`}>
      <Site />
    </div>
  );
}
