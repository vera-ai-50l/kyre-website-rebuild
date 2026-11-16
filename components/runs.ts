/* One run table, used by both states of the hero reel.

   The point of the whole sequence is that nothing is added between the broken
   dashboard and the rebuilt one — same eight calls, same latencies, same
   costs. So there is exactly one array, and both renders read from it. Two
   arrays would let them drift, and the drift would be the thing a visitor
   noticed. */

export type Kind = "ok" | "bad" | "warn";

export type Run = {
  prefix: string;
  fn: string;
  seconds: number;
  /* Monthly burn attributable to the call: wasted compute, the retries it
     forces, and the support load behind it. */
  usd: number;
  raw: string;
  kind: Kind;
  label: string;
  /* Week-on-week change in p95 for this call, and how many of the eighteen
     users it touched. Both states render both numbers — the broken one as two
     more grey columns nobody reads, the rebuilt one ranked and toned. That is
     the entire argument: the data was always there. */
  deltaPct: number;
  users: number;
  /* Position in the broken order, then in the rebuilt order. The reorder is
     data, not choreography — the row that travels furthest is the row that was
     always the problem. */
  at: [before: number, after: number];
};

export const RUNS: Run[] = [
  { prefix: "agent.run ·", fn: "summarize_ticket", seconds: 1.24, usd: 12, raw: "success", kind: "ok", label: "Success", deltaPct: -3, users: 14, at: [0, 5] },
  { prefix: "agent.run ·", fn: "classify_intent", seconds: 0.89, usd: 8, raw: "success", kind: "ok", label: "Success", deltaPct: 1, users: 16, at: [1, 6] },
  { prefix: "tool.call ·", fn: "vector_search", seconds: 12.4, usd: 1840, raw: "error", kind: "bad", label: "Timeout", deltaPct: 212, users: 18, at: [2, 0] },
  { prefix: "agent.run ·", fn: "draft_reply", seconds: 3.88, usd: 31, raw: "success", kind: "ok", label: "Success", deltaPct: 6, users: 12, at: [3, 3] },
  { prefix: "tool.call ·", fn: "send_email", seconds: 0.42, usd: 4, raw: "retry", kind: "warn", label: "Retried", deltaPct: 18, users: 9, at: [4, 2] },
  { prefix: "tool.call ·", fn: "fetch_context", seconds: 2.1, usd: 19, raw: "success", kind: "ok", label: "Success", deltaPct: -2, users: 15, at: [5, 4] },
  { prefix: "agent.run ·", fn: "rank_results", seconds: 0.67, usd: 6, raw: "success", kind: "ok", label: "Success", deltaPct: 0, users: 11, at: [6, 7] },
  { prefix: "tool.call ·", fn: "embed_query", seconds: 5.2, usd: 47, raw: "retry", kind: "warn", label: "Retried", deltaPct: 41, users: 7, at: [7, 1] },
];

/* Signed, with the arrow the Agnost console uses. A rise in latency is bad news
   however the number is spelled, so the tone follows the size rather than the
   sign. */
export const trend = (n: number) => `${n > 0 ? "+" : ""}${n}%`;
export const arrow = (n: number) => (n > 0 ? "↗" : n < 0 ? "↘" : "→");
export const trendKind = (n: number): Kind | null =>
  n >= 100 ? "bad" : n >= 15 ? "warn" : null;

/* The hourly burn this agent is supposed to stay under. Drawn on the rebuilt
   chart, because a number is only alarming next to the number it was supposed
   to be — and the curve has to be seen crossing it, which means it has to sit
   inside the plotted range. Declared below PEAK for that reason; the assertion
   is at the bottom of this file. */
export const BUDGET = 120;

export const TONE: Record<Kind, { fg: string; wash: string }> = {
  ok: { fg: "#5da572", wash: "rgba(93, 165, 114, 0.12)" },
  bad: { fg: "#ef5a4c", wash: "rgba(239, 90, 76, 0.12)" },
  warn: { fg: "#cc9440", wash: "rgba(204, 148, 64, 0.12)" },
};

export const BURN = RUNS.reduce((n, r) => n + r.usd, 0);
export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/* Square root, not linear. Against a 12.4s outlier a linear scale collapses
   every healthy call into a 3px sliver, and the column stops carrying
   information for seven of the eight rows. */
const SLOWEST = Math.max(...RUNS.map((r) => r.seconds));
export const scaleOf = (seconds: number) => Math.sqrt(seconds / SLOWEST).toFixed(3);

/* ---- burn chart --------------------------------------------------------- */
/* SHAPE is the silhouette; the plotted values are that silhouette scaled to
   BURN by largest-remainder rounding, so the chart total and the footer total
   are the same number by construction rather than by my arithmetic. */
const SHAPE = [3, 2, 2, 3, 4, 3, 5, 4, 6, 5, 7, 6, 9, 8, 12, 22, 46, 78, 120, 155, 132, 96, 58, 29];

function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const exact = weights.map((w) => (w * total) / sum);
  const out = exact.map((v) => Math.floor(v));
  const order = exact
    .map((v, i) => [v - Math.floor(v), i] as const)
    .sort((a, b) => b[0] - a[0]);
  let left = total - out.reduce((a, b) => a + b, 0);
  for (let k = 0; left > 0; k++, left--) out[order[k % order.length][1]] += 1;
  return out;
}

export const SERIES = distribute(BURN, SHAPE);
export const PEAK = Math.max(...SERIES);
export const PEAK_AT = SERIES.indexOf(PEAK);

/* Plot geometry resolved once at module scope. None of it depends on state, so
   none of it belongs in a render. */
export const CHART = { w: 232, base: 100, top: 10 };
export const cx = (i: number) => 3 + (i / (SERIES.length - 1)) * (CHART.w - 6);
export const cy = (v: number) => CHART.base - (v / PEAK) * (CHART.base - CHART.top);
export const LINE = SERIES.map((v, i) => `${i ? "L" : "M"}${cx(i).toFixed(1)} ${cy(v).toFixed(1)}`).join("");
/* The line, reopened at the baseline and closed back down to it.
   `replace`, not `slice(1)`: dropping the leading M welds the base ordinate to
   the first x — 100 and 3.0 become 1003.0 — and the browser rejects the whole
   path, which is why this fill silently never drew. */
export const AREA = `M${cx(0).toFixed(1)} ${CHART.base}${LINE.replace("M", "L")}L${cx(SERIES.length - 1).toFixed(1)} ${CHART.base}Z`;

/* The budget line is plotted with the same cy() as the curve, so a budget above
   PEAK lands above the top of the viewBox and silently does not render — which
   is exactly what happened the first time, at 900 against a peak near 374.
   PEAK moves whenever BURN or SHAPE do, so this is checked rather than
   remembered. */
if (BUDGET >= PEAK) {
  throw new Error(`BUDGET (${BUDGET}) must sit below PEAK (${PEAK}) or it plots off-chart`);
}
