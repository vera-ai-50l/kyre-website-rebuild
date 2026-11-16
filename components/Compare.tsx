"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { OriginalShot, Reveal } from "./bits";

export type View = "data" | "loading" | "empty" | "error";

/* The header and footer live in ./chrome now; re-exported so the teardown pages
   that import them from here keep working. */
import { SiteFooter, SiteHeader } from "./chrome";
export { SiteFooter, SiteHeader };

const VIEWS: { id: View; label: string }[] = [
  { id: "data", label: "Data" },
  { id: "loading", label: "Loading" },
  { id: "empty", label: "Empty" },
  { id: "error", label: "Error" },
];

export default function Compare({
  tool,
  screen,
  line,
  accent,
  originalImg,
  annotations,
  real,
  rebuilt,
}: {
  tool: string;
  screen: string;
  line: string;
  accent?: string;
  originalImg?: string;
  annotations: { title: string; why: string }[];
  real: ReactNode;
  rebuilt: (view: View) => ReactNode;
}) {
  const [mode, setMode] = useState<"real" | "rebuilt">("rebuilt");
  const [view, setView] = useState<View>("data");
  const accentStyle = (
    accent ? { "--color-accent": accent } : {}
  ) as CSSProperties;

  const original = originalImg ? (
    <OriginalShot
      src={originalImg}
      alt={`${tool} — original interface`}
      fallback={real}
    />
  ) : (
    real
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main
        className="mx-auto w-full max-w-6xl flex-1 px-5"
        style={accentStyle}
      >
        <div className="pt-8">
          <div className="anim-rise">
            <Link
              href="/"
              className="text-sm text-[#7a736c] transition-colors duration-200 hover:text-hi"
            >
              ← All teardowns
            </Link>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {tool}{" "}
              <span className="font-normal text-[#7a736c]">· {screen}</span>
            </h1>
          </div>
          <p
            className="anim-rise mt-2 max-w-2xl text-muted"
            style={{ animationDelay: "120ms" }}
          >
            {line}
          </p>
        </div>

        <div
          className="anim-rise mt-6 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "200ms" }}
        >
          <div className="inline-flex overflow-hidden rounded-lg border border-edge">
            {(["real", "rebuilt"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.96] ${
                  mode === m
                    ? "bg-accent text-hi"
                    : "text-muted hover:text-hi"
                }`}
              >
                {m === "real" ? "Original" : "Rebuilt"}
              </button>
            ))}
          </div>
          {mode === "rebuilt" && (
            <div className="anim-fade inline-flex gap-1">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.96] ${
                    view === v.id
                      ? "bg-card2 text-hi ring-1 ring-edge"
                      : "text-[#7a736c] hover:text-hi"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="anim-rise mt-4 overflow-hidden rounded-xl border border-edge"
          style={{ animationDelay: "260ms" }}
        >
          <div key={`${mode}-${view}`} className="anim-fade overflow-x-auto">
            {mode === "real" ? original : rebuilt(view)}
          </div>
        </div>
        <p className="mt-2 text-xs text-[#6a635c]">
          {mode === "real"
            ? `Original — ${tool}'s interface, shown fairly for comparison.`
            : "Rebuilt by Kyre — same layout, same data, same information architecture. Only the execution changed."}
        </p>

        <section className="mt-14">
          <Reveal>
            <h2 className="text-lg font-semibold">
              What changed — and why it matters
            </h2>
          </Reveal>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {annotations.map((a, i) => (
              <Reveal key={a.title} delay={i * 80} className="h-full">
                <div className="group h-full rounded-xl border border-edge bg-card p-5 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-accent/40">
                  <div className="font-mono text-xs text-accent/70 transition-colors duration-200 group-hover:text-accent">
                    0{i + 1}
                  </div>
                  <div className="mt-2 font-medium text-hi">{a.title}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {a.why}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
