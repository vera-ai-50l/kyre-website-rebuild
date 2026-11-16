"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./howitworks.module.css";
import { useCursorGlow } from "./useCursorGlow";
import { useScrollProgress } from "./useScrollProgress";

/* Plays once, the first time the card is on screen. Deliberately not :hover —
   the drawing is the explanation, and a phone would never see it. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, seen };
}

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;
const HAIR = "rgba(245,238,230,0.10)";

/* Shared chrome so all three drawings read as the same product, not three
   stock illustrations that happened to land on one page. */
function Frame({ children }: { children: ReactNode }) {
  return (
    <>
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.055" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.012" />
        </linearGradient>
      </defs>
      <rect x="18" y="14" width="204" height="122" rx="10" fill="url(#glass)" stroke={HAIR} />
      {children}
    </>
  );
}

/* ---- 1. Teardown ------------------------------------------------------- */
/* Not a crosshair on a wireframe. The actual finding is that a new user hunts:
   they enter, sweep the wrong column, double back, and only then land on the
   thing they came for. Drawing that path — and timing it — is the teardown. */
const TRAIL =
  "M46 50C86 46 104 70 78 82C56 92 44 106 70 114C104 124 138 118 152 106C160 99 162 96 169 96";

function ArtTeardown() {
  return (
    <svg viewBox="0 0 240 150" role="img" aria-label="A new user's cursor hunting across a screen for 41 seconds">
      <Frame>
        <path d="M18 38h204" stroke={HAIR} />
        {[30, 40, 50].map((cx) => (
          <circle key={cx} cx={cx} cy="26" r="2.2" fill="rgba(245,238,230,0.16)" />
        ))}
        <text x="206" y="29.5" textAnchor="end" fontSize="9" fill="#e7ddcd" style={MONO} className={styles.timer}>
          0:41
        </text>

        {/* the screen they are lost in — weighted, not a uniform grid of bars */}
        <rect x="32" y="52" width="84" height="7" rx="3.5" fill="rgba(245,238,230,0.20)" />
        <rect x="32" y="68" width="60" height="5" rx="2.5" fill="rgba(245,238,230,0.09)" />
        <rect x="32" y="80" width="72" height="5" rx="2.5" fill="rgba(245,238,230,0.09)" />
        <rect x="32" y="92" width="50" height="5" rx="2.5" fill="rgba(245,238,230,0.09)" />
        <rect x="32" y="108" width="96" height="5" rx="2.5" fill="rgba(245,238,230,0.09)" />
        <rect x="130" y="52" width="78" height="30" rx="4" fill="rgba(245,238,230,0.05)" stroke={HAIR} />

        {/* what they were actually looking for */}
        <rect x="138" y="92" width="62" height="7" rx="3.5" fill="rgba(245,238,230,0.22)" />
        <path
          className={styles.mark}
          pathLength={1}
          d="M138 104h62"
          stroke="#ef5a4c"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <path className={styles.trail} pathLength={1} d={TRAIL} fill="none" stroke="rgba(231,221,205,0.55)" strokeWidth="1.4" strokeLinecap="round" />
        {/* a short dash travelling the same path reads as the cursor itself,
            and needs no offset-path support to do it */}
        <path className={styles.comet} pathLength={1} d={TRAIL} fill="none" stroke="#f0e8da" strokeWidth="2.4" strokeLinecap="round" />

        <circle className={styles.landing} cx="169" cy="96" r="11" fill="none" stroke="#e7ddcd" strokeWidth="1.3" />
      </Frame>
    </svg>
  );
}

/* ---- 2. Rebuild -------------------------------------------------------- */
/* The same row three times, each pass more decided than the last. This is the
   literal job: nothing is added to the record, the execution resolves. */
function ArtRebuild() {
  return (
    <svg viewBox="0 0 240 150" role="img" aria-label="One row resolving through three passes">
      <path className={styles.rail} pathLength={1} d="M34 30v90" stroke="rgba(231,221,205,0.35)" strokeWidth="1.4" strokeLinecap="round" />

      {[38, 76, 114].map((cy, i) => (
        <g key={cy} className={styles.node} style={{ transitionDelay: `${i * 230}ms` }}>
          <circle cx="34" cy={cy} r="8" fill="#0e0d0c" stroke="rgba(231,221,205,0.5)" strokeWidth="1.2" />
          <text x="34" y={cy + 3} textAnchor="middle" fontSize="8" fill="#f0e8da" style={MONO}>
            {i + 1}
          </text>
        </g>
      ))}

      {/* pass 1 — everything the same weight */}
      <g className={styles.pass} style={{ transitionDelay: "60ms" }}>
        <rect x="56" y="34" width="8" height="8" rx="2" fill="rgba(245,238,230,0.14)" />
        <rect x="72" y="35" width="76" height="6" rx="3" fill="rgba(245,238,230,0.14)" />
        <rect x="166" y="35" width="40" height="6" rx="3" fill="rgba(245,238,230,0.14)" />
      </g>

      {/* pass 2 — hierarchy: one line becomes primary, one becomes support */}
      <g className={styles.pass} style={{ transitionDelay: "290ms" }}>
        <rect x="56" y="72" width="8" height="8" rx="2" fill="rgba(245,238,230,0.22)" />
        <rect x="72" y="69" width="82" height="8" rx="4" fill="rgba(245,238,230,0.55)" />
        <rect x="72" y="81" width="46" height="4" rx="2" fill="rgba(245,238,230,0.14)" />
        <rect x="166" y="72" width="40" height="5" rx="2.5" fill="rgba(245,238,230,0.20)" />
      </g>

      {/* pass 3 — state and the number that decides anything */}
      <g className={styles.pass} style={{ transitionDelay: "520ms" }}>
        <circle cx="60" cy="114" r="4.5" fill="#ef5a4c" />
        <rect x="72" y="110" width="82" height="8" rx="4" fill="rgba(245,238,230,0.85)" />
        <rect x="72" y="122" width="46" height="4" rx="2" fill="rgba(245,238,230,0.16)" />
        <rect x="160" y="107" width="46" height="15" rx="4" fill="rgba(239,90,76,0.16)" />
        <text x="183" y="117.5" textAnchor="middle" fontSize="8.5" fill="#ff8b7d" style={MONO}>
          $1,840
        </text>
      </g>
    </svg>
  );
}

/* ---- 3. Ship ----------------------------------------------------------- */
/* A diff, not a git graph. The claim is deployed code in your repo, and a diff
   is the only picture that cannot be mistaken for a mockup of one. */
const DIFF: { y: number; w: number; add: boolean; n: number }[] = [
  { y: 36, w: 104, add: false, n: 18 },
  { y: 50, w: 78, add: false, n: 19 },
  { y: 64, w: 118, add: true, n: 20 },
  { y: 78, w: 92, add: true, n: 21 },
  { y: 92, w: 66, add: true, n: 22 },
];

function ArtShip() {
  return (
    <svg viewBox="0 0 240 150" role="img" aria-label="A diff with two lines removed and three added, merged into main">
      <Frame>
        {DIFF.map((d, i) => (
          <g
            key={d.n}
            className={d.add ? styles.add : styles.del}
            style={{ transitionDelay: `${(d.add ? 420 : 0) + i * 110}ms` }}
          >
            <rect
              x="19"
              y={d.y - 4}
              width="202"
              height="14"
              fill={d.add ? "rgba(93,165,114,0.07)" : "rgba(239,90,76,0.07)"}
            />
            <text x="40" y={d.y + 6} textAnchor="end" fontSize="7.5" fill="rgba(245,238,230,0.22)" style={MONO}>
              {d.n}
            </text>
            <text x="48" y={d.y + 6} fontSize="9" fill={d.add ? "#5da572" : "#ef5a4c"} style={MONO}>
              {d.add ? "+" : "−"}
            </text>
            <rect
              className={d.add ? styles.addBar : undefined}
              x="60"
              y={d.y}
              width={d.w}
              height="6"
              rx="3"
              fill={d.add ? "rgba(93,165,114,0.42)" : "rgba(239,90,76,0.34)"}
            />
          </g>
        ))}

        <path d="M18 110h204" stroke={HAIR} />
        <g className={styles.mergeRow}>
          <circle cx="34" cy="123" r="8" fill="rgba(93,165,114,0.16)" />
          <path
            d="M30.4 123l2.6 2.6 5-5.6"
            fill="none"
            stroke="#5da572"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="48" y="126.5" fontSize="8.5" fill="#5da572" style={MONO}>
            merged into main
          </text>
          <text x="206" y="126.5" textAnchor="end" fontSize="7.5" fill="rgba(245,238,230,0.24)" style={MONO}>
            a91f3c2
          </text>
        </g>
      </Frame>
    </svg>
  );
}

function Step({
  n,
  when,
  title,
  children,
  art,
}: {
  n: string;
  when: string;
  title: string;
  children: ReactNode;
  art: ReactNode;
}) {
  const { ref, seen } = useInView<HTMLLIElement>();
  const glowRef = useCursorGlow<HTMLDivElement>();

  return (
    <li ref={ref} className={styles.row}>
      <div className={styles.text}>
        <span className={styles.num}>{n}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.body}>{children}</p>
        <span className={styles.when}>{when}</span>
      </div>
      {/* Two refs, two jobs: the row watches the viewport, this one publishes
          the pointer. Nesting them is cheaper than merging them. */}
      <div ref={glowRef} className={styles.card} data-play={seen}>
        <div className={styles.core}>
          <span className={styles.spot} aria-hidden />
          <div className={styles.art}>{art}</div>
        </div>
      </div>
    </li>
  );
}

/* The thread through all three steps.

   It is one path, drawn by scroll rather than by time: the visitor's own
   progress down the section is the progress along the line, so it can never run
   ahead of what they have read. Curves rather than a straight rule, because the
   steps alternate sides and the line has to visibly go and fetch each one.

   pathLength="1" normalises it, so the dash maths is the same three numbers
   regardless of how tall the section renders at any breakpoint. */
function Thread() {
  return (
    <svg
      className={styles.thread}
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        className={styles.threadTrack}
        d="M45.5 0C45.5 120 88 180 88 300C88 420 12 470 12 600C12 730 50 780 50 1000"
        fill="none"
        stroke="rgba(245,238,230,0.07)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className={styles.threadLive}
        pathLength={1}
        d="M45.5 0C45.5 120 88 180 88 300C88 420 12 470 12 600C12 730 50 780 50 1000"
        fill="none"
        stroke="#e7ddcd"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function HowItWorks() {
  /* "through", not the pinned default: nothing here sticks. On the pinned
     formula this element's runway came out at 534px against 1434px of content,
     so the thread finished drawing while the reader was still on step one.

     Measured on the list rather than on the section, because the thread belongs
     to the steps. Anchored to the section it also had to cross the heading and
     the lede first, and ran a quarter of the list ahead of the reader the whole
     way down. */
  const ref = useScrollProgress<HTMLOListElement>(undefined, "through");

  return (
    <section id="how" className={`${styles.section} scroll-mt-24`}>
      <p className="eyebrow">How it works</p>
      <h2 className={`display ${styles.heading}`}>
        Five days, teardown to <span className="serif">deployed</span>.
      </h2>
      <p className={`lede ${styles.lede}`}>
        No discovery phase. No design system project. No Figma file that rots in
        a backlog. One screen, rebuilt in your stack, merged.
      </p>

      <ol ref={ref} className={styles.steps}>
        <Thread />
        <Step n="01" when="Day 0" title="Teardown" art={<ArtTeardown />}>
          We record a new user meeting your product cold, and time how long the
          thing that matters stays invisible. You keep that recording whether or
          not you hire us.
        </Step>
        <Step n="02" when="Days 1–3" title="Rebuild" art={<ArtRebuild />}>
          Same rows, same columns, same data. Three passes over the execution:
          hierarchy first, then real loading and empty states, then the one
          number that lets you decide something.
        </Step>
        <Step n="03" when="Days 4–5" title="Ship" art={<ArtShip />}>
          A pull request against your repo, in your framework, reviewed by your
          engineers. Deployed code, with the branch still open for you to argue
          with.
        </Step>
      </ol>
    </section>
  );
}
