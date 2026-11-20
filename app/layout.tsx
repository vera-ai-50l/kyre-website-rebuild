import type { Metadata } from "next";
import {
  Instrument_Sans,
  Instrument_Serif,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

/* Three faces, and two of them are the same family.

   Inter and Geist Mono are the defaults every generated site reaches for, so
   the site wore the tell in its first paint before a single pixel of layout
   loaded. Instrument Sans pairs with the serif already here, which makes the
   pairing a decision rather than a coincidence, and it holds up at 510 — the
   weight this whole type system is tuned around. */
const sans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

/* The same family's serif, used for exactly one italic phrase per page. It is
   the only place the site raises its voice. */
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

/* One mono for both surfaces. Machine output — ids, timestamps, latencies,
   currency — needs tabular figures, and Plex has real ones. Two mono faces for
   one job was a font more than the site had a reason for. */
const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Kyre — AI-infra interface teardowns",
  description:
    "I rebuild AI-infra dashboards into interfaces that look like products. Deployed live, in 5 days.",
};

/* Dark unless the visitor picked light before (the switch in the nav keeps
   the choice in localStorage). Set before first paint, so there is no flash
   of the other theme. */
const THEME = `(function(){try{var t=localStorage.getItem("kyre-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(x){document.documentElement.dataset.theme="dark"}})()`;

/* Every machine gets the same page, with or without a GPU: the glass, the
   drifting light, the blur, the grain and the click rings all run everywhere.
   The lighter tiers still exist for testing and can be forced with ?fx=low or
   ?fx=nogpu (sets <html data-lite>); nothing sets them on its own any more. */
const LITE = `(function(){try{
var f=new URLSearchParams(location.search).get("fx");
if(f==="low"||f==="nogpu")document.documentElement.dataset.lite=f;
}catch(x){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${instrument.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME }} />
        <script dangerouslySetInnerHTML={{ __html: LITE }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
