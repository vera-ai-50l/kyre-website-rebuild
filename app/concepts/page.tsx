import type { Metadata } from "next";
import { Bricolage_Grotesque, Fraunces } from "next/font/google";
import { Concepts } from "@/components/concepts/Concepts";

/* Two faces the main site does not use, because these heroes are meant to look
   like three different studios pitched them. Bricolage carries a width axis,
   so one file is both the condensed black of the first hero and the wide light
   of the second; Fraunces is the editorial serif of the third. Scoped to this
   route, so the home page does not pay for either. */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bric",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Kyre — three hero concepts",
  description: "Three immersive hero directions for three audiences: AI-built apps, AI SaaS dashboards and Shopify brands.",
};

export default function Page() {
  return (
    <div className={`${bricolage.variable} ${fraunces.variable}`}>
      <Concepts />
    </div>
  );
}
