"use client";

import { useEffect, useRef } from "react";
import { animate, AnimatePresence, m } from "motion/react";
import ui from "./site.module.css";

/* The way in, as a flow: a band of visitors that narrows at every screen
   nobody designed, the ones it loses running off it in thin streams, and a
   switch that shows the same band after the rebuild.

   Everything is drawn in one 600×260 SVG box. The band is one path whose
   shape comes from four widths, so Motion can morph between the leaking and
   the fixed widths; the visitors are SVG circles moved by SMIL along fixed
   paths, which costs no JavaScript per frame. An illustration, labelled as
   one: the numbers are the picture's, not anyone's data. */

const C = 112; // the band's centre line
const B = [150, 300, 450]; // where one screen ends and the next begins
const STAGES = ["Landing", "Sign-up", "First screen", "Paying"];

type Shape = { h: number[]; pct: number[]; leak: number[] };
const LEAKING: Shape = { h: [54, 24, 11, 4], pct: [100, 41, 18, 4], leak: [18, 8, 4.5] };
const FIXED: Shape = { h: [54, 47, 40, 33], pct: [100, 84, 70, 58], leak: [3, 3, 3] };

const WHY = ["Looked generic", "Too many fields", "No clear answer"];
const FIX = ["Reads as yours", "One field", "The answer first"];

function band([a, b, c, d]: number[]) {
  const t = (h: number) => (C - h).toFixed(1);
  const u = (h: number) => (C + h).toFixed(1);
  return (
    `M0 ${t(a)} L118 ${t(a)} C150 ${t(a)} 150 ${t(b)} 182 ${t(b)} L268 ${t(b)} C300 ${t(b)} 300 ${t(c)} 332 ${t(c)} ` +
    `L418 ${t(c)} C450 ${t(c)} 450 ${t(d)} 482 ${t(d)} L600 ${t(d)} L600 ${u(d)} L482 ${u(d)} C450 ${u(d)} 450 ${u(c)} ` +
    `418 ${u(c)} L332 ${u(c)} C300 ${u(c)} 300 ${u(b)} 268 ${u(b)} L182 ${u(b)} C150 ${u(b)} 150 ${u(a)} 118 ${u(a)} L0 ${u(a)} Z`
  );
}

/* A stream leaves the underside of the band just before each boundary and
   falls away, bending forward with the flow. */
const stream = (b: number, from: number) => `M${b - 10} ${C + from - 2} C${b - 2} ${C + 60} ${b + 12} ${C + 100} ${b + 24} 262`;

/* Sixteen visitors on a six-second loop: 0 reaches Paying, 1–3 leave at that
   boundary. Fixed, so every pass is the same picture. */
const FATE_LEAKING = [0, 1, 2, 1, 3, 1, 0, 2, 1, 3, 1, 2, 1, 2, 3, 1];
const FATE_FIXED = [0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0];
const LOOP = 6;

function Visitors({ fates, fixed }: { fates: number[]; fixed: boolean }) {
  return (
    <g>
      {fates.map((f, i) => {
        const begin = `${(-(i * LOOP) / fates.length).toFixed(2)}s`;
        const lane = C + ((i * 7) % 5 - 2) * 3.2;
        if (f === 0) {
          return (
            <circle key={i} r="3.2" className={fixed ? ui.fvOk : ui.fvIn} opacity="0">
              <animateMotion dur={`${LOOP}s`} begin={begin} repeatCount="indefinite" path={`M-10 ${lane} L610 ${lane}`} />
              <animate attributeName="opacity" dur={`${LOOP}s`} begin={begin} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.05;0.94;1" />
            </circle>
          );
        }
        const b = B[f - 1];
        /* The share of the loop spent getting there: the straight run plus the fall. */
        const share = Math.min(0.92, (b + 30) / 640);
        return (
          <circle key={i} r="3.2" className={ui.fvOut} opacity="0">
            <animateMotion
              dur={`${LOOP}s`}
              begin={begin}
              repeatCount="indefinite"
              path={`M-10 ${lane} L${b - 14} ${lane} C${b - 4} ${lane} ${b + 10} ${C + 70} ${b + 22} 262`}
              keyPoints="0;1;1"
              keyTimes={`0;${share.toFixed(3)};1`}
              calcMode="linear"
            />
            <animate
              attributeName="opacity"
              dur={`${LOOP}s`}
              begin={begin}
              repeatCount="indefinite"
              values="0;1;1;0;0"
              keyTimes={`0;0.05;${(share - 0.06).toFixed(3)};${share.toFixed(3)};1`}
            />
          </circle>
        );
      })}
    </g>
  );
}

/* A percentage that counts to its new value rather than jumping. */
function Pct({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(to);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const c = animate(from.current, to, {
      duration: 1.1,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (n) => {
        el.textContent = `${Math.round(n)}%`;
      },
    });
    from.current = to;
    return () => c.stop();
  }, [to]);
  return <span ref={ref}>{to}%</span>;
}

const MORPH = { duration: 1.2, ease: [0.32, 0.72, 0, 1] } as const;

export function Funnel({ fixed, onToggle }: { fixed: boolean; onToggle: () => void }) {
  const s = fixed ? FIXED : LEAKING;
  const svg = useRef<SVGSVGElement>(null);

  /* SMIL keeps its clock running whether or not anything can see it, and every
     tick re-lays the SVG out. Off screen it stops; on screen it runs. */
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    el.pauseAnimations();
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.unpauseAnimations() : el.pauseAnimations()));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={ui.funnel} data-fixed={fixed || undefined}>
      <div className={ui.fStages} aria-hidden>
        {STAGES.map((st, i) => (
          <span key={st} data-end={i === 3 || undefined}>
            <b>{st}</b>
            <Pct to={s.pct[i]} />
          </span>
        ))}
      </div>

      <svg ref={svg} className={ui.fSvg} viewBox="0 0 600 262" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="fBand" x1="0" x2="1" y1="0" y2="0">
            <m.stop offset="0" initial={false} animate={{ stopColor: fixed ? "#1f7a55" : "#17191e" }} transition={MORPH} />
            <m.stop offset="0.6" initial={false} animate={{ stopColor: fixed ? "#1f7cf2" : "#3a3d45" }} transition={MORPH} />
            <m.stop offset="1" initial={false} animate={{ stopColor: fixed ? "#0fb5b0" : "#6b6f78" }} transition={MORPH} />
          </linearGradient>
          <linearGradient id="fStream" x1="0" x2="0" y1={C} y2="262" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#c2412d" stopOpacity="0.85" />
            <stop offset="1" stopColor="#c2412d" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fSheen" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {B.map((b) => (
          <line key={b} x1={b} x2={b} y1="0" y2="262" className={ui.fRule} vectorEffect="non-scaling-stroke" />
        ))}

        {B.map((b, i) => (
          <m.path
            key={b}
            className={ui.fStream}
            initial={false}
            animate={{ d: stream(b, s.h[i + 1]), strokeWidth: s.leak[i], opacity: fixed ? 0.35 : 1 }}
            transition={MORPH}
          />
        ))}

        {/* A soft shadow of the band, then the band, then light along its top. */}
        <m.path className={ui.fGlow} initial={false} animate={{ d: band(s.h) }} transition={MORPH} />
        <m.path fill="url(#fBand)" initial={false} animate={{ d: band(s.h) }} transition={MORPH} />
        <m.path fill="url(#fSheen)" initial={false} animate={{ d: band(s.h) }} transition={MORPH} />

        <Visitors key={fixed ? "fixed" : "leaking"} fates={fixed ? FATE_FIXED : FATE_LEAKING} fixed={fixed} />
      </svg>

      <div className={ui.fWhy} aria-hidden>
        {B.map((b, i) => (
          <span key={b} style={{ left: `${(b / 600) * 100}%` }}>
            <AnimatePresence mode="wait" initial={false}>
              <m.em
                key={fixed ? "fix" : "why"}
                data-fix={fixed || undefined}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, delay: fixed ? 0.25 + i * 0.12 : 0 }}
              >
                <i />
                {fixed ? FIX[i] : WHY[i]}
              </m.em>
            </AnimatePresence>
          </span>
        ))}
      </div>

      <m.button
        type="button"
        className={`${ui.btn} ${ui.btnSm} ${fixed ? ui.btnGhost : ""} ${ui.fBtn}`}
        aria-pressed={fixed}
        onClick={onToggle}
        whileTap={{ scale: 0.96 }}
      >
        {fixed ? "Show the original" : "Rebuild with Kyre"}
        <span className={ui.btnIcon} aria-hidden>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            {fixed ? <path d="M12 8H4m3.5-3.5L4 8l3.5 3.5" /> : <path d="M4.5 11.5l7-7M5.8 4.5h5.7v5.7" />}
          </svg>
        </span>
      </m.button>
    </div>
  );
}

/* The card copy that goes with it. */
export const FUNNEL_COPY = {
  leaking: {
    h: "The product works. The way in leaks.",
    p: "Landing, sign-up, the first screen with data. People leave at the screens nobody designed, long before they reach the part you built well.",
  },
  fixed: {
    h: "Same product. The way in holds.",
    p: "The same three screens, rebuilt: one that reads as yours, a sign-up with one field, a first screen that answers before it asks. More of the people you already win reach the part you built.",
  },
};
