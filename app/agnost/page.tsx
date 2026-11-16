"use client";

import Link from "next/link";
import { Home } from "@/components/agnost/screens/Home";
import { BASE, Shell } from "@/components/agnost/Shell";
import { CopyMd, Icon } from "@/components/agnost/ui";
import { adapter, currentRange } from "@/lib/data";
import { mdHome } from "@/lib/data/markdown";

/* B8 — their marketing page is a light background with a serif display face,
   and the product inside it is near-black with a sans stack, with the switch
   happening inside a single scroll. The demo reads as an embedded third-party
   widget rather than as the thing the page is selling. One system here: the
   product's palette carries the whole page, the serif display face survives as
   the marketing voice, and the demo section steps down to the product surface
   so the console sits in the page rather than on it. */

// --------------------------------------------------------------- particles

/* Their hero cluster, rebuilt as deterministic SVG — a static export
   prerenders on one machine and hydrates on another, so a random scatter would
   be a hydration mismatch. Coordinates are rounded to a tenth for the same
   reason: Math.sin and Math.sqrt are only specified to within an ulp, so the
   16th digit can differ between the build's engine and the visitor's. */
const round = (n: number) => Math.round(n * 10) / 10;

function scatter(seed: number, count: number, fn: (r: () => number, i: number) => [number, number]) {
  let s = seed;
  const r = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return Array.from({ length: count }, (_, i) => {
    const [x, y] = fn(r, i);
    return [round(x), round(y)] as [number, number];
  });
}

const CORE = scatter(7, 340, (r) => {
  const angle = r() * Math.PI * 2;
  // sqrt keeps the cluster evenly dense instead of piling up at the centre
  const radius = Math.sqrt(r()) * 128;
  return [300 + Math.cos(angle) * radius, 210 + Math.sin(angle) * radius];
});

const STREAMS: { label: string; tone: "accent" | "error"; at: [number, number]; seed: number }[] = [
  { label: "RAGE PROMPTS", tone: "accent", at: [96, 92], seed: 11 },
  { label: "HIDDEN REQUESTS", tone: "accent", at: [468, 66], seed: 23 },
  { label: "HALLUCINATED LINKS", tone: "error", at: [66, 316], seed: 37 },
  { label: "FRUSTRATED USERS", tone: "error", at: [470, 330], seed: 53 },
];

function Cluster() {
  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      {/* bracket framing — kept, it is the page's one ornament */}
      {(["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t",
        "left-0 bottom-0 border-l border-b", "right-0 bottom-0 border-r border-b"] as const).map(
        (pos) => (
          <span key={pos} className={`absolute h-6 w-6 border-ag-strong ${pos}`} />
        ),
      )}
      <svg viewBox="0 0 600 420" className="h-auto w-full" role="img"
        aria-label="A cluster of live agent conversations, with streams of failures peeling away from it">
        {CORE.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.4} fill="var(--color-ag-low)" opacity={0.55} />
        ))}
        {STREAMS.map((stream) => {
          const [tx, ty] = stream.at;
          const dots = scatter(stream.seed, 46, (r, i) => {
            const t = i / 46;
            const jitter = 26 * (0.3 + t);
            return [
              300 + (tx - 300) * t + (r() - 0.5) * jitter,
              210 + (ty - 210) * t + (r() - 0.5) * jitter,
            ];
          });
          const color = stream.tone === "error" ? "var(--color-ag-err)" : "var(--color-ag-accent)";
          return (
            <g key={stream.label}>
              {dots.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={1.5} fill={color} opacity={0.25 + (i / 46) * 0.6} />
              ))}
            </g>
          );
        })}
      </svg>
      {STREAMS.map((stream) => (
        <span
          key={stream.label}
          style={{ left: `${(stream.at[0] / 600) * 100}%`, top: `${(stream.at[1] / 420) * 100}%` }}
          className={`ag-data absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] tracking-[0.08em] ${
            stream.tone === "error"
              ? "border-ag-err/40 bg-ag-err/10 text-ag-err"
              : "border-ag-accent/40 bg-ag-accent-wash text-ag-accent-text"
          }`}
        >
          ◆ {stream.label}
        </span>
      ))}
      <span className="ag-data absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-ag-subtle bg-ag-raised px-1.5 py-0.5 text-[10px] tracking-[0.08em] text-ag-mid">
        ◆ LIVE AGENT CONVERSATIONS
      </span>
    </div>
  );
}

// -------------------------------------------------------------------- page

export default function AgnostMarketing() {

  return (
    <div className="ag-scope min-h-dvh bg-ag-base text-ag-mid">
      <header className="sticky top-0 z-50 border-b border-ag-subtle bg-ag-base/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-5">
          <Link href="/agnost" className="flex items-center gap-2">
            <span className="grid h-5 w-5 rotate-45 place-items-center rounded-[3px] border border-ag-accent bg-ag-accent-wash" />
            <span className="text-[15px] font-medium tracking-[-0.01em] text-ag-hi">Agnost AI</span>
          </Link>
          <nav className="ag-data ml-auto hidden items-center gap-5 text-[12px] text-ag-mid sm:flex">
            <a href="#demo" className="hover:text-ag-hi">[Demo]</a>
            <Link href="/" className="hover:text-ag-hi">[Kyre]</Link>
          </nav>
          <Link
            href={BASE}
            className="ag-data ml-auto rounded-md bg-ag-hi px-3 py-1.5 text-[12px] font-medium tracking-[0.06em] text-ag-base transition-transform duration-150 ease-out hover:-translate-y-px sm:ml-0"
          >
            TRY NOW
          </Link>
        </div>
      </header>

      <main>
        {/* ---- hero ---- */}
        <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-16 text-center sm:pt-24">
          <p className="ag-data inline-flex items-center gap-2 text-[11px] tracking-[0.06em] text-ag-mid">
            <span className="grid h-4 w-4 place-items-center rounded-[3px] bg-[#ff6a1f] text-[10px] font-bold text-white">
              Y
            </span>
            Backed by Y Combinator
          </p>
          {/* Good copy, kept verbatim. */}
          <h1 className="serif mx-auto mt-5 max-w-3xl text-[clamp(2.5rem,7vw,3.5rem)] leading-[1.05] text-ag-hi not-italic">
            Catch what evals miss.
          </h1>
          <p className="ag-body mx-auto mt-3 max-w-xl text-ag-mid">
            Find silent failures in your chat and voice agents.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:aditya@trykyre.com"
              className="ag-data rounded-md border border-ag-strong px-4 py-2 text-[12px] tracking-[0.06em] text-ag-hi transition-colors duration-150 ease-out hover:bg-ag-overlay"
            >
              BOOK A CALL
            </a>
            <Link
              href={BASE}
              className="ag-data rounded-md bg-ag-accent-dim px-4 py-2 text-[12px] tracking-[0.06em] text-white transition-colors duration-150 ease-out hover:bg-[#5f38c9]"
            >
              START FREE
            </Link>
          </div>
          <div className="mt-14">
            <Cluster />
          </div>
        </section>

        {/* ---- demo ----
            B1: their demo renders in a ~720x350 container while the product
            inside it is designed for 1400px, so body text lands near 9px and a
            prospect reads unreadable tables on the primary conversion surface.
            Here it breaks out to the full 1400px column at its real size, with
            the section stepping to the product surface so it is continuous with
            the page instead of pasted onto it. */}
        <section
          id="demo"
          className="scroll-mt-16 border-y border-ag-subtle bg-ag-raised/40 py-14"
        >
          <div className="mx-auto max-w-[1400px] px-5">
            <div className="text-center">
              <h2 className="serif text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-ag-hi not-italic">
                See Agnost AI in action.
              </h2>
              <p className="ag-body mt-2 text-ag-mid">
                Click around the live demo. No signup needed.
              </p>
            </div>
            {/* Real size, not a shrunken iframe. */}
            <div className="mt-8 h-[760px] max-h-[85vh] min-h-[560px]">
              <Shell
                title="Home"
                activeOverride={BASE}
                actions={<CopyMd label="home.md" build={() => mdHome(adapter, currentRange())} />}
              >
                <Home />
              </Shell>
            </div>
            <p className="ag-body-sm mt-3 text-center text-ag-low">
              Mock data · 107 events, 6 failures, 20 users ·{" "}
              <Link href={BASE} className="text-ag-accent-text hover:underline">
                open the full console
              </Link>
            </p>
          </div>
        </section>

        {/* ---- features ---- */}
        <section className="mx-auto max-w-[1400px] px-5 py-16">
          <h2 className="serif text-center text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-ag-hi not-italic">
            Ship what users want.
          </h2>
          <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              {
                icon: "intents",
                title: "Surface proactive intents",
                body: "Patterns are discovered from conversation text and queued for review, so what users keep asking for arrives as a decision rather than a hunch.",
              },
              {
                icon: "warn",
                title: "Catch violations",
                body: "Every promise the agent makes that the product cannot keep is tagged at the message where it fired, not in a separate log you have to correlate.",
              },
              {
                icon: "copy",
                title: "Export any screen",
                body: "Every screen copies as Markdown for pasting straight into a coding agent. The analysis leaves the dashboard and becomes a change.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-[10px] border border-ag-subtle bg-ag-raised p-5"
              >
                <span className="text-ag-accent-text">
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <h3 className="ag-body mt-3 font-medium text-ag-hi">{f.title}</h3>
                <p className="ag-body-sm mt-1.5 text-ag-mid">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-ag-subtle">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="ag-body-sm text-ag-mid">
            <Link href="/" className="font-medium text-ag-hi hover:text-ag-accent-text">
              Kyre
            </Link>{" "}
            rebuilds screens and deploys them live.
          </p>
          {/* Stated plainly, on every surface of the rebuild. */}
          <p className="ag-body-sm text-ag-low">
            Demonstration rebuild, not affiliated with Agnost AI. Mock data throughout.
          </p>
        </div>
      </footer>
    </div>
  );
}
