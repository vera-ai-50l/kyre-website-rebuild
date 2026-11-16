/* Presentation helpers. These operate on the contract types — ISO strings,
   whole dollars, integer milliseconds — so they work identically whether the
   data came from the mock adapter or a real backend. */

import type { Event } from "./types";

const pad = (n: number) => n.toString().padStart(2, "0");

/* Rendered in UTC on purpose. This app is statically exported: the HTML is
   generated on a build machine and hydrated in a browser somewhere else, so
   formatting in local time produces a server/client mismatch. */
export const fmtClock = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
};

export const fmtLatency = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;

/** null means "not priced" and renders as an em dash — never as $0.00. */
export const fmtCost = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `$${n.toFixed(2)}`;

export const fmtDelta = (d: number) => (d > 0 ? `+${d}%` : `${d}%`);

export function fmtAgo(iso: string, now: number) {
  const mins = Math.round((now - Date.parse(iso)) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

/** Shared by the conversation panel and the Events table, so the same number
    never means two different things on two screens. */
export const latencyTone = (ms: number): "neutral" | "warn" | "error" =>
  ms >= 2500 ? "error" : ms >= 1000 ? "warn" : "neutral";

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  // Nearest-rank. Anything smoother is false precision on 100 samples.
  return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)];
}

/** Headline numbers, derived rather than reported, so they always agree with
    the rows underneath them. */
export function summarise(events: Event[]) {
  const failures = events.filter((e) => e.status === "failure");
  const ok = events.filter((e) => e.status === "success");
  const userIds = new Set(events.map((e) => e.userId));
  const cost = events.reduce((sum, e) => sum + (e.costUsd ?? 0), 0);
  return {
    events: events.length,
    failures: failures.length,
    users: userIds.size,
    cost,
    /* p99 over successful calls only: a timeout tells you about the timeout,
       not about the latency your working users actually feel. */
    p99: percentile(ok.map((e) => e.latencyMs), 0.99),
    median: percentile(ok.map((e) => e.latencyMs), 0.5),
  };
}
