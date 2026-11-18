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

/* Decides, before the first paint, whether this machine gets the lighter page.
   Sets <html data-lite>:
     "nogpu"  the browser is drawing with the CPU (no GPU, or GPU acceleration
              switched off).
     "low"    a GPU, but a small machine (≤4 GB memory or ≤4 threads).
   Both keep the WebGL glass, drawn at 1x without antialiasing, and drop the
   always-running decoration that costs a full-window blend per frame on a CPU:
   backdrop blur, drifting light, the paper grain, blur on reveals. Measured on
   two CPU cores with no GPU, that is the difference between ~23fps and 60fps
   through the hero. components/studio/useLite.ts can still switch to "low"
   later if scrolling turns out slow. ?fx=full, ?fx=low and ?fx=nogpu force a
   tier. */
/* Dark unless the visitor picked light before (the switch in the nav keeps
   the choice in localStorage). Set before first paint, so there is no flash
   of the other theme. */
const THEME = `(function(){try{var t=localStorage.getItem("kyre-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(x){document.documentElement.dataset.theme="dark"}})()`;

const LITE = `(function(){try{
var d=document.documentElement,f=new URLSearchParams(location.search).get("fx");
if(f==="full")return;if(f==="low"||f==="nogpu"){d.dataset.lite=f;return}
var c=document.createElement("canvas"),g=c.getContext("webgl",{failIfMajorPerformanceCaveat:true});
if(!g){d.dataset.lite="nogpu";return}
var e=g.getExtension("WEBGL_debug_renderer_info"),r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):"";
var l=g.getExtension("WEBGL_lose_context");if(l)l.loseContext();
if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){d.dataset.lite="nogpu";return}
var m=navigator.deviceMemory,h=navigator.hardwareConcurrency;
if((m&&m<=4)||(h&&h<=4))d.dataset.lite="low";
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
