"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./rebuild.module.css";

/* Same rows, same columns, same data — executed twice.

   "Before" is what ships when nobody owns the surface: one weight, one colour,
   status as a bare lowercase string, and a 12-second timeout sitting third with
   nothing to mark it. "After" is the same five records with the decisions made:
   the failure sorted to the top, latency drawn, states named.

   `at` is the position each row holds in each state, so the reorder is data and
   not choreography — the row that goes from 2 to 0 is the row that was always
   the problem. */
type Kind = "ok" | "bad" | "warn";

/* `usd` is the monthly burn attributable to each call — wasted compute, the
   retries it forces, and the support load behind it. It is the only column on
   this panel a founder can act on, and the only one their real dashboard does
   not have: p95 is a number you file, $1,840 is a number you fix. Four healthy
   rows cost less than a lunch and one row costs a salary, which is the entire
   argument made without a sentence of copy. */
const RUNS: {
  prefix: string;
  fn: string;
  seconds: number;
  usd: number;
  raw: string;
  kind: Kind;
  label: string;
  at: [before: number, after: number];
}[] = [
  { prefix: "agent.run ·", fn: "summarize_ticket", seconds: 1.24, usd: 12, raw: "success", kind: "ok", label: "Success", at: [0, 3] },
  { prefix: "agent.run ·", fn: "classify_intent", seconds: 0.89, usd: 8, raw: "success", kind: "ok", label: "Success", at: [1, 4] },
  { prefix: "tool.call ·", fn: "vector_search", seconds: 12.4, usd: 1840, raw: "error", kind: "bad", label: "Timeout", at: [2, 0] },
  { prefix: "agent.run ·", fn: "draft_reply", seconds: 3.88, usd: 31, raw: "success", kind: "ok", label: "Success", at: [3, 2] },
  { prefix: "tool.call ·", fn: "send_email", seconds: 0.42, usd: 4, raw: "retry", kind: "warn", label: "Retried", at: [4, 1] },
];

/* Derived, so the footer total can never drift from the column above it. */
const BURN = RUNS.reduce((n, r) => n + r.usd, 0);
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/* ---- the burn chart ----------------------------------------------------- */
/* The table answers "which call". This answers "since when", which is the
   question a founder asks second and no row in a table can carry: the timeout
   did not start today, and it is still climbing.

   SHAPE is the silhouette; the plotted values are that silhouette scaled to
   BURN by largest-remainder rounding, so the chart's total and the footer's
   total are the same number by construction rather than by my arithmetic. */
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

const SERIES = distribute(BURN, SHAPE);
const PEAK = Math.max(...SERIES);
const PEAK_AT = SERIES.indexOf(PEAK);

/* Plot geometry, resolved once at module scope — none of it depends on state,
   so none of it belongs in a render. */
const VW = 232;
const BASE = 100;
const TOP = 10;
const px = (i: number) => 3 + (i / (SERIES.length - 1)) * (VW - 6);
const py = (v: number) => BASE - (v / PEAK) * (BASE - TOP);
const LINE = SERIES.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join("");
/* `replace`, not `slice(1)`: dropping the leading M welds the base ordinate to
   the first x — 100 and 3.0 become 1003.0 — and the browser rejects the path. */
const AREA = `M${px(0).toFixed(1)} ${BASE}${LINE.replace("M", "L")}L${px(SERIES.length - 1).toFixed(1)} ${BASE}Z`;

/* Counts the total up when the panel flips. Writes straight to the node rather
   than through state: this is one number changing sixty times a second, and it
   has no business re-rendering a five-row table to do it. The rendered child is
   the settled value, so the prerendered HTML is already correct. */
function CountUp({ to, active }: { to: number; active: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active) {
      el.textContent = "—";
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = usd(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1100);
      el.textContent = usd(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, active]);

  return <span ref={ref}>{active ? usd(to) : "—"}</span>;
}

function BurnChart({ after }: { after: boolean }) {
  return (
    <aside className={styles.side}>
      <div className={styles.sideHead}>
        <span className={styles.sideLabel}>Burn per hour</span>
        <span className={styles.sideWin}>24h</span>
      </div>

      <svg viewBox={`0 0 ${VW} 116`} className={styles.chart} aria-hidden>
        <defs>
          <linearGradient id="burnFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef5a4c" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#ef5a4c" stopOpacity="0" />
          </linearGradient>
          {/* A clipped rect that scales, not a dash offset. Dash maths breaks
              the moment the SVG is drawn at any scale other than 1x; a clip
              rect is scale-independent and reveals the fill as well as the
              stroke. */}
          <clipPath id="burnReveal">
            <rect className={styles.reveal} x="0" y="0" width={VW} height="116" />
          </clipPath>
        </defs>

        <path d={`M3 ${BASE}h${VW - 6}`} stroke="rgba(245,238,230,0.10)" strokeWidth="1" />
        <path
          d={`M3 ${((BASE + TOP) / 2).toFixed(0)}h${VW - 6}`}
          stroke="rgba(245,238,230,0.05)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* before: the flat line of a console that never tracked this */}
        <path
          className={styles.flat}
          d={`M3 ${BASE}h${VW - 6}`}
          stroke="rgba(245,238,230,0.22)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <g clipPath="url(#burnReveal)">
          <path d={AREA} fill="url(#burnFill)" />
          <path
            d={LINE}
            fill="none"
            stroke="#ef5a4c"
            strokeWidth="1.7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        <g className={styles.peak}>
          <path
            d={`M${px(PEAK_AT).toFixed(1)} ${py(PEAK).toFixed(1)}V${BASE}`}
            stroke="rgba(239,90,76,0.45)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <circle cx={px(PEAK_AT)} cy={py(PEAK)} r="3.2" fill="#ef5a4c" />
          <circle cx={px(PEAK_AT)} cy={py(PEAK)} r="6.5" fill="none" stroke="rgba(239,90,76,0.3)" />
        </g>

        <text x="3" y="113" fontSize="7.5" fill="rgba(245,238,230,0.28)" className={styles.axis}>
          24h ago
        </text>
        <text
          x={VW - 3}
          y="113"
          fontSize="7.5"
          textAnchor="end"
          fill="rgba(245,238,230,0.28)"
          className={styles.axis}
        >
          now
        </text>
      </svg>

      <div className={styles.sideFoot}>
        <span className={styles.sideTotal}>
          <CountUp to={BURN} active={after} />
        </span>
        <span className={styles.sideNote}>
          {after ? "and still climbing" : "not tracked today"}
        </span>
      </div>
    </aside>
  );
}

const TONE: Record<Kind, { fg: string; wash: string }> = {
  ok: { fg: "#5da572", wash: "rgba(93, 165, 114, 0.12)" },
  bad: { fg: "#ef5a4c", wash: "rgba(239, 90, 76, 0.12)" },
  warn: { fg: "#cc9440", wash: "rgba(204, 148, 64, 0.12)" },
};

/* Square root rather than linear. On a linear scale against a 12.4s outlier,
   every healthy call collapses into a 3px sliver and the column stops carrying
   information for four of the five rows. */
const SLOWEST = Math.max(...RUNS.map((r) => r.seconds));
const scaleOf = (seconds: number) => Math.sqrt(seconds / SLOWEST).toFixed(3);

/* pathLength="1" normalises every stroke, so one dashoffset value draws any of
   these regardless of its real length, and no measurement runs at runtime. */
const draw = { pathLength: 1, className: styles.draw } as const;

function Glyph({ kind }: { kind: Kind }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  return (
    <span className={styles.glyph} aria-hidden>
      {/* Before: every row wears the same anonymous mark. Being unable to tell
          them apart at a glance is the problem being demonstrated. */}
      <svg viewBox="0 0 24 24" className={styles.gOut} style={{ color: "rgba(245,238,230,0.22)" }}>
        <rect x="6.5" y="6.5" width="11" height="11" rx="3" {...stroke} />
      </svg>

      <svg viewBox="0 0 24 24" className={styles.gIn} style={{ color: TONE[kind].fg }}>
        {kind === "ok" && (
          <>
            <circle cx="12" cy="12" r="9" {...stroke} {...draw} />
            <path d="M8.2 12.4l2.6 2.6 5-5.4" {...stroke} {...draw} />
          </>
        )}
        {kind === "bad" && (
          <>
            {/* A clock, not a warning triangle — the failure is a timeout, and
                the glyph may as well say which failure it is. */}
            <circle cx="12" cy="12" r="9" {...stroke} {...draw} />
            <path d="M12 7.2V12l3.4 2.1" {...stroke} {...draw} />
          </>
        )}
        {kind === "warn" && (
          <>
            <path d="M20 11.5a8 8 0 1 1-2.3-5.6" {...stroke} {...draw} />
            <path d="M20 3.4v4.2h-4.2" {...stroke} {...draw} />
          </>
        )}
      </svg>
    </span>
  );
}

export function RebuildScene() {
  const [after, setAfter] = useState(false);
  const [touched, setTouched] = useState(false);

  return (
    <>
      <div className={styles.scene} data-state={after ? "after" : "before"}>
        <span className={styles.depth} aria-hidden />

        <div className={styles.bar}>
          <span className={styles.project}>prod-agent-v2</span>
          <span className={styles.swap}>
            <span className={styles.swapOut} aria-hidden={after}>
              / runs
            </span>
            <span className={`${styles.swapIn} ${styles.live}`} aria-hidden={!after}>
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Live
            </span>
          </span>
          <span className={`${styles.swap} ${styles.swapRight} ml-auto`}>
            <span className={styles.swapOut} aria-hidden={after}>
              642
            </span>
            <span
              className={styles.swapIn}
              aria-hidden={!after}
              style={{ color: "#6a635c" }}
            >
              rebuilt by Kyre
            </span>
          </span>
        </div>

        <div className={styles.main}>
          <div className={styles.rows}>
            {RUNS.map((r) => (
            <div
              key={r.fn}
              className={styles.row}
              data-kind={r.kind}
              style={
                {
                  "--i0": r.at[0],
                  "--i1": r.at[1],
                  /* Staggered by where the row lands, so the eye is led down
                     the new order rather than the old one. */
                  "--d": `${r.at[1] * 70}ms`,
                  "--w": scaleOf(r.seconds),
                } as React.CSSProperties
              }
            >
              {r.kind === "bad" && (
                <>
                  <span className={styles.glow} aria-hidden />
                  <span className={styles.rail} aria-hidden />
                </>
              )}
              <span className={styles.rule} aria-hidden />

              <Glyph kind={r.kind} />

              <span className={styles.name}>
                <span className={styles.prefix}>{r.prefix}</span>
                <span className={styles.fn}>{r.fn}</span>
              </span>

              <span className={styles.barCell} aria-hidden>
                <span className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{
                      background: `linear-gradient(90deg, ${TONE[r.kind].wash}, ${TONE[r.kind].fg})`,
                    }}
                  />
                </span>
              </span>

              <span className={styles.ms}>{r.seconds.toFixed(2)}s</span>

              <span className={styles.cost}>
                <span className={styles.costVal}>{usd(r.usd)}/mo</span>
              </span>

              {/* Both halves of every cross-fade stay in the DOM so the column
                  never reflows, which means the hidden half has to be taken out
                  of the accessibility tree by hand — otherwise every row is
                  announced twice, once as "error" and once as "Timeout". */}
              <span className={styles.status}>
                <span className={styles.raw} aria-hidden={after}>
                  {r.raw}
                </span>
                <span
                  className={styles.pill}
                  aria-hidden={!after}
                  style={{ background: TONE[r.kind].wash, color: TONE[r.kind].fg }}
                >
                  <span className={styles.dot} />
                  {r.label}
                </span>
              </span>
            </div>
            ))}
          </div>

          <BurnChart after={after} />
        </div>

        <div className={styles.foot}>
          <span className={styles.footRaw} aria-hidden={after}>
            <span>642 runs</span>
            <span>1 error</span>
            <span>p95 3.9s</span>
          </span>
          {/* The same strip of pixels, twice. Today it spends itself on three
              numbers a founder cannot act on. It could be leading with the
              money and the churn — which is the entire pitch, made without a
              sentence of marketing copy. */}
          <span className={styles.verdict} aria-hidden={!after}>
            <span className={styles.verdictNum} style={{ transitionDelay: "240ms" }}>
              {usd(BURN)}/mo
            </span>
            <span className={styles.verdictText} style={{ transitionDelay: "310ms" }}>
              burned on slow and failed calls
            </span>
            <span className={styles.verdictMeta} style={{ transitionDelay: "380ms" }}>
              18 users hit this · 3 stopped using the product
            </span>
          </span>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.cta}
          aria-pressed={after}
          onClick={() => {
            setAfter((v) => !v);
            setTouched(true);
          }}
        >
          {!touched && <span className={styles.halo} aria-hidden />}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            className={styles.ctaIcon}
            aria-hidden
          >
            <path
              d="M20 11.5a8 8 0 1 1-2.3-5.6M20 3.4v4.2h-4.2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {after ? "Show the original" : "Rebuild it with Kyre"}
        </button>

        {/* Announced politely so the change is available to a screen reader,
            which cannot see five rows move. */}
        <p className={styles.caption} aria-live="polite">
          <span style={{ opacity: after ? 0 : 1 }} aria-hidden={after}>
            Five runs, one weight, one colour. Nothing here says what it costs
            you.
          </span>
          <span style={{ opacity: after ? 1 : 0 }} aria-hidden={!after}>
            Same data, re-executed. One row is burning {usd(RUNS[2].usd)} a month.
          </span>
        </p>
      </div>
    </>
  );
}
