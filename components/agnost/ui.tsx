"use client";

import { useState, type ReactNode } from "react";
import { useCursorGlow } from "../useCursorGlow";

/* Small shared parts for the Agnost rebuild. Nothing here is a component
   library — each piece exists because two or more screens needed it. */

// ------------------------------------------------------------------ icons

/* A dozen 16px glyphs instead of an icon package. Same stroke weight and cap
   style throughout, which is the only thing an icon set really buys you. */
const PATHS: Record<string, string> = {
  home: "M3 8.5 8 4l5 4.5V13a.5.5 0 0 1-.5.5h-3v-4h-3v4h-3A.5.5 0 0 1 3 13z",
  users: "M6 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4M2.5 13c0-2 1.6-3 3.5-3s3.5 1 3.5 3M10.5 4a2 2 0 0 1 0 3.9M11 10c1.6.2 2.5 1.1 2.5 3",
  intents: "M8 13.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3",
  events: "M1.5 8h3l2-4.5L9.5 12l2-4h3",
  tools: "M10.6 2.4a3 3 0 0 0-3.9 3.8L2.4 10.5a1.4 1.4 0 0 0 2 2l4.3-4.3a3 3 0 0 0 3.8-3.9L10.6 4.4 9.2 3z",
  alerts: "M4.5 6.5a3.5 3.5 0 1 1 7 0c0 3 1 4 1 4h-9s1-1 1-4M6.5 13a1.6 1.6 0 0 0 3 0",
  chat: "M2.5 4.5A1.5 1.5 0 0 1 4 3h8a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 12 11H6l-3.5 2.5z",
  copy: "M5.5 5.5V3.8c0-.7.6-1.3 1.3-1.3h5.4c.7 0 1.3.6 1.3 1.3v5.4c0 .7-.6 1.3-1.3 1.3h-1.7M3.8 5.5h5.4c.7 0 1.3.6 1.3 1.3v5.4c0 .7-.6 1.3-1.3 1.3H3.8c-.7 0-1.3-.6-1.3-1.3V6.8c0-.7.6-1.3 1.3-1.3",
  /* Theirs, kept. A sparkle on an AI button is a cliché everywhere else, but
     here it is Agnost's own iconography and swapping it would be rebranding
     them rather than rebuilding them. */
  spark: "M8 2.5 9.3 6 13 7.3 9.3 8.6 8 12.2 6.7 8.6 3 7.3 6.7 6zM12.5 11.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z",
  search: "M7.2 11.9a4.7 4.7 0 1 0 0-9.4 4.7 4.7 0 0 0 0 9.4M10.7 10.7 14 14",
  filter: "M2.5 4h11M4.5 8h7M6.5 12h3",
  arrow: "M3 8h10M9.5 4.5 13 8l-3.5 3.5",
  chevron: "M6 3.5 10.5 8 6 12.5",
  check: "M3 8.5 6.5 12 13 4.5",
  x: "M4 4l8 8M12 4l-8 8",
  refresh: "M13 8a5 5 0 1 1-1.5-3.6M13.5 2.5V5h-2.5",
  warn: "M8 2.5 14.5 13.5h-13zM8 6.5v3.5M8 11.8v.2",
};

export function Icon({
  name,
  className = "",
}: {
  name: keyof typeof PATHS | string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-4 w-4 shrink-0 ${className}`}
    >
      <path d={PATHS[name] ?? PATHS.intents} />
    </svg>
  );
}

// ----------------------------------------------------------------- panels

export function Panel({
  title,
  icon,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  icon?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    /* ag-surface carries the depth: a top-down gradient, an inset highlight on
       the top edge, and a brighter top border. No drop shadow behind the panel
       — on a near-black surface that reads as blur, not elevation.

       Deliberately no glow. The panel is full of costs and latencies, and the
       moment a number sits inside a moving gradient the reader cannot tell
       whether the colour means something. */
    <section
      className={`ag-surface flex min-w-0 flex-col rounded-[10px] ${className}`}
    >
      {title !== undefined && (
        <header className="flex items-center gap-2 border-b border-ag-subtle px-4 py-3">
          {icon && <span className="text-ag-low"><Icon name={icon} /></span>}
          <h2 className="ag-body min-w-0 truncate font-medium text-ag-hi">{title}</h2>
          {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ag-label">{children}</p>;
}

// ------------------------------------------------------------ small parts

const TONE = {
  neutral: "text-ag-mid",
  warn: "text-ag-warn",
  error: "text-ag-err",
  ok: "text-ag-ok",
} as const;

export function Latency({ ms, label }: { ms: number; label: string }) {
  const tone = ms >= 2500 ? "error" : ms >= 1000 ? "warn" : "neutral";
  return <span className={`ag-data ${TONE[tone]}`}>{label}</span>;
}

/** Trend direction. Replaces the sparkline where there is no width for one. */
export function Delta({ value }: { value: number }) {
  const arrow = value > 0 ? "↗" : value < 0 ? "↘" : "→";
  return (
    <span className="ag-data whitespace-nowrap text-ag-mid">
      {value > 0 ? "+" : ""}
      {value}% <span aria-hidden className="text-ag-low">{arrow}</span>
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "error" | "warn" | "ok";
}) {
  const styles = {
    neutral: "border-ag-subtle bg-ag-overlay text-ag-mid",
    accent: "border-ag-accent/35 bg-ag-accent-wash text-ag-accent-text",
    error: "border-ag-err/35 bg-ag-err/10 text-ag-err",
    warn: "border-ag-warn/35 bg-ag-warn/10 text-ag-warn",
    ok: "border-ag-ok/35 bg-ag-ok/10 text-ag-ok",
  }[tone];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] leading-4 ${styles}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  href,
  variant = "ghost",
  icon,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "ghost" | "primary" | "outline";
  icon?: string;
  title?: string;
}) {
  const glowRef = useCursorGlow<HTMLElement>();
  const styles = {
    ghost: "text-ag-mid hover:bg-ag-overlay hover:text-ag-hi",
    outline: "ag-surface ag-glow text-ag-mid hover:text-ag-hi",
    /* White on the raw accent is 4.2:1 — under AA at this size. The pressed
       tone carries the fill (6.1:1) and hover goes deeper still, so the button
       stays their purple without the label falling below the floor. */
    primary: "ag-glow bg-ag-accent-dim text-white hover:bg-[#5f38c9]",
  }[variant];
  const cls = `ag-press inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150 ease-out ${styles}`;
  const inner = (
    <>
      {icon && <Icon name={icon} />}
      {children}
    </>
  );
  return href ? (
    <a
      ref={glowRef as React.Ref<HTMLAnchorElement>}
      href={href}
      className={cls}
      title={title}
    >
      {inner}
    </a>
  ) : (
    <button
      ref={glowRef as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      className={cls}
      title={title}
    >
      {inner}
    </button>
  );
}

/* Every screen exports as Markdown for pasting into a coding agent. Their
   version is a small top-right control; here it sits in the header at the same
   weight as the screen title, because it is the most distinctive idea they have. */
export function CopyMd({
  label,
  build,
}: {
  label: string;
  /* Reads through the adapter at click time, so the export always matches what
     is on screen and costs nothing on load. */
  build: () => Promise<string>;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const icon = { idle: "copy", busy: "refresh", done: "check", failed: "warn" }[state];
  const text = {
    idle: `Copy ${label}`,
    busy: "Copying…",
    done: "Copied",
    failed: "Copy failed",
  }[state];
  return (
    <Button
      variant="outline"
      icon={icon}
      onClick={async () => {
        setState("busy");
        try {
          await navigator.clipboard.writeText(await build());
          setState("done");
        } catch {
          setState("failed");
        }
        setTimeout(() => setState("idle"), 1600);
      }}
      title="Copy this screen as Markdown"
    >
      <span
        className={
          state === "done" ? "text-ag-ok" : state === "failed" ? "text-ag-err" : undefined
        }
      >
        {text}
      </span>
    </Button>
  );
}

/** Empty states say what to do next. "No data" is not a sentence. */
export function Empty({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <p className="ag-body font-medium text-ag-hi">{title}</p>
      <p className="ag-body-sm max-w-sm text-ag-mid">{hint}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Proportional bar behind a count — used for intent themes and tool volume. */
export function Bar({ value, max }: { value: number; max: number }) {
  return (
    <span className="block h-1 w-full overflow-hidden rounded-full bg-ag-overlay">
      <span
        className="block h-full rounded-full bg-ag-accent/60"
        style={{ width: `${max ? Math.max(3, (value / max) * 100) : 0}%` }}
      />
    </span>
  );
}

/** Trend sparkline. Neutral ramp, not signal color — it is not a failure. */
export function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points, 1);
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 56},${14 - (p / max) * 12}`)
    .join(" ");
  return (
    <svg viewBox="0 0 56 16" className="h-4 w-14 shrink-0" aria-hidden>
      <polyline
        points={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ag-low"
      />
    </svg>
  );
}
