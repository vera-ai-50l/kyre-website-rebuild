"use client";

import { useEffect, useRef, useState } from "react";
import { calAttrs } from "../cal";
import { Arrow } from "../chrome";
import { useCursorGlow } from "../useCursorGlow";
import s from "./concepts.module.css";

/* Hero 03. The same product page, met five different ways.

   Nothing here is simulated with a picture. It is one small real store card,
   and each mode changes the conditions it is being used under: out of focus,
   without red and green, with no mouse, with no screen at all. The switch
   beside it is the offer — the same card, after the fixes. */

type Mode = "see" | "low" | "cvd" | "keys" | "sr";

const MODES: { id: Mode; label: string }[] = [
  { id: "see", label: "As designed" },
  { id: "low", label: "Low vision" },
  { id: "cvd", label: "Colour-blind" },
  { id: "keys", label: "Keyboard only" },
  { id: "sr", label: "Screen reader" },
];

const VERDICT: Record<Mode, [string, string]> = {
  see: ["Looks fine. That is the problem.", "Looks the same. Works for everyone."],
  low: ["The price and the button are gone.", "The price and the button survive the blur."],
  cvd: ["Sale and sold-out were only ever a colour.", "Now they are words and shapes too."],
  keys: ["Eleven tabs to the button. No idea where you are.", "Three tabs, and you can see every one."],
  sr: ["Eleven things on the page. None of them has a name.", "It says what it is, in the order you need it."],
};

/* What a screen reader has to work with: before, the element types and
   nothing else; after, names, state and price. */
const SPOKEN: [string[], string[]] = [
  ["Link.", "Link.", "Link.", "Link.", "Button.", "Button.", "Image.", "Button.", "Button.", "Button.", "Button."],
  [
    "Skip to product. Link.",
    "Stoneware pour-over set. Heading, level 1.",
    "Dripper and glass carafe on a linen cloth. Image.",
    "Now 148 dollars, was 185.",
    "Colour: Oat, selected. 1 of 3.",
    "Size: 4 cup. 6 cup is sold out.",
    "Add to bag. Button.",
  ],
];

/* How many stops Tab makes on the way to the button, before and after. */
const STOPS = [11, 3];
/* 430ms a tick: eleven stops fit inside one mode's turn with a beat to spare. */
const TICK = 430;
const TURN = 13;

export function Blind() {
  const tilt = useCursorGlow<HTMLDivElement>();
  const touched = useRef(false);
  const [tick, setTick] = useState(0);
  /* Once somebody takes the controls: what they chose, and when. */
  const [manual, setManual] = useState<{ mode: Mode; fixed: boolean; t0: number } | null>(null);

  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(() => {
      if (document.hidden || (still && !touched.current)) return;
      setTick((t) => t + 1);
    }, TICK);
    return () => clearInterval(id);
  }, []);

  /* Left alone it tours: each mode as the store is today, then fixed. */
  const turn = Math.floor(tick / TURN);
  const mode = manual ? manual.mode : MODES[Math.floor(turn / 2) % MODES.length].id;
  const fixed = manual ? manual.fixed : turn % 2 === 1;
  const t0 = manual ? manual.t0 : turn * TURN;

  const set = (next: Partial<{ mode: Mode; fixed: boolean }>) => {
    touched.current = true;
    setManual({ mode, fixed, ...next, t0: tick });
  };

  const stops = STOPS[fixed ? 1 : 0];
  /* Walks the stops, rests on the button for two beats, starts again. */
  const focus = mode === "keys" ? Math.min((tick - t0) % (stops + 3), stops - 1) : -1;
  const at = (today: number, after: number) => focus >= 0 && focus === (fixed ? after : today);

  return (
    <section className={`${s.hero} ${s.blind}`}>
      <svg width="0" height="0" className={s.srOnly} aria-hidden>
        <filter id="kyre-deut">
          <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
        </filter>
      </svg>

      <div className={s.blindIn}>
        <div className={s.copy}>
          <p className={s.tag}>Accessibility + Conversion Fix · for Shopify</p>
          <h1 className={s.blindH}>
            <span className={s.line}>
              <span>Close your eyes.</span>
            </span>
            <span className={s.line}>
              <span>
                <em>Now check out.</em>
              </span>
            </span>
          </h1>
          <p className={s.sub}>
            More than one in four US adults lives with a disability (CDC). Most
            stores were only ever tested by someone with good eyes and a mouse.
            We find what is turning those shoppers away, fix it in your theme,
            and keep watching it.
          </p>
          <div className={s.ctas}>
            <button type="button" {...calAttrs} className={`cta ${s.ctaAcc}`}>
              Book a 15-min call
              <Arrow />
            </button>
            <a href="#offer" className={`cta ${s.ctaLine}`}>
              See the fix list
              <Arrow down />
            </a>
          </div>
          <p className={s.fine}>Fixed scope, $2,500 to $4,000. Monitoring $300 a month. Not legal advice.</p>
        </div>

        <div className={s.stage}>
          <div ref={tilt} className={s.shopShell}>
            <div className={s.shop} data-mode={mode} data-fixed={fixed} aria-hidden>
              <div className={s.shopInner}>
                <div className={s.shopNav}>
                  <b data-focus={at(0, -1)}>Hearth &amp; Co</b>
                  <span data-focus={at(1, -1)}>Shop</span>
                  <span data-focus={at(2, -1)}>About</span>
                  <span data-focus={at(3, -1)}>Journal</span>
                  <i data-focus={at(4, -1)}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
                      <circle cx="7" cy="7" r="4.2" />
                      <path d="M10.2 10.2 13.5 13.5" />
                    </svg>
                  </i>
                  <i data-focus={at(5, -1)}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
                      <path d="M3.5 5.5h9l-.7 8h-7.6zM5.8 5.5V4.6a2.2 2.2 0 0 1 4.4 0v.9" />
                    </svg>
                  </i>
                </div>
                <span className={s.skip} data-focus={at(-1, 0)}>
                  Skip to product
                </span>

                <div className={s.shopBody}>
                  <div className={s.art} data-focus={at(6, -1)}>
                    <svg viewBox="0 0 240 280">
                      <defs>
                        <linearGradient id="kyre-glass" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
                          <stop offset="0.45" stopColor="#fff" stopOpacity="0.25" />
                          <stop offset="1" stopColor="#fff" stopOpacity="0.55" />
                        </linearGradient>
                        <linearGradient id="kyre-clay" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0" stopColor="#e9dfcc" />
                          <stop offset="1" stopColor="#c9bba2" />
                        </linearGradient>
                      </defs>
                      <path d="M30 280V124a90 90 0 0 1 180 0v156z" fill="#e6decf" />
                      <ellipse cx="120" cy="254" rx="74" ry="9" fill="rgba(70,48,24,0.18)" />
                      <path
                        d="M88 152 80 238q0 14 14 14h52q14 0 14-14l-8-86z"
                        fill="url(#kyre-glass)"
                        stroke="#b9ae9c"
                        strokeWidth="1.2"
                      />
                      <path d="M83.4 204 80 238q0 14 14 14h52q14 0 14-14l-3.4-34z" fill="#3a281d" />
                      <path d="M168 118q24 4 10 26" fill="none" stroke="#cfc2ab" strokeWidth="7" strokeLinecap="round" />
                      <path d="M76 112h88l-24 40h-40z" fill="url(#kyre-clay)" />
                      <rect x="70" y="103" width="100" height="13" rx="6.5" fill="#efe7d7" />
                      <rect x="92" y="150" width="56" height="7" rx="3.5" fill="#cfc2ab" />
                      <g className={s.steam} fill="none" stroke="#b9ae9c" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M106 92q-8-10 0-20t0-20" />
                        <path d="M132 94q8-10 0-20t0-20" />
                      </g>
                    </svg>
                  </div>

                  <div className={s.info}>
                    <p className={s.kicker}>Stoneware</p>
                    <h3>Pour-over set</h3>
                    <div className={s.price}>
                      <b>$148</b>
                      <s>$185</s>
                      <em>{fixed ? "Save $37" : "Sale"}</em>
                    </div>

                    <p className={s.optLabel}>Colour: Oat</p>
                    <div className={s.swatches} data-focus={at(-1, 1)}>
                      {["#d9cdb8", "#a9b39a", "#c98a6b"].map((c, i) => (
                        <span key={c} data-on={i === 0} data-focus={at(7 + i, -1)} style={{ background: c }}>
                          <svg viewBox="0 0 12 12" fill="none" stroke="#1c1a17" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.8 6.3 5 8.4l4.3-4.8" />
                          </svg>
                        </span>
                      ))}
                    </div>

                    <div className={s.sizes}>
                      <span>2 cup</span>
                      <span data-on>4 cup</span>
                      <span data-out>
                        6 cup<small>Sold out</small>
                      </span>
                    </div>

                    <span className={s.add} data-focus={at(10, 2)}>
                      Add to bag
                    </span>
                  </div>
                </div>
              </div>

              {mode === "sr" && (
                <div key={String(fixed)} className={s.srPane}>
                  <p className={s.srHead}>
                    <span className={s.wave}>
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    Screen reader · what it announces
                  </p>
                  <div className={s.srLines}>
                    {SPOKEN[fixed ? 1 : 0].map((l, i) => (
                      <p key={i} className={s.srLine} style={{ ["--i" as string]: i }}>
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {mode === "keys" && (
                <p className={s.tabChip}>
                  <kbd>Tab</kbd> {focus + 1} of {stops}
                  {!fixed && <span>focus not visible</span>}
                </p>
              )}
            </div>
          </div>

          <p key={`${mode}${fixed}`} className={s.verdict} aria-live="polite">
            {VERDICT[mode][fixed ? 1 : 0]}
          </p>

          <div className={s.controls}>
            <div className={s.modes} role="tablist" aria-label="Shop this page as">
              {MODES.map((m) => (
                <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} onClick={() => set({ mode: m.id })}>
                  {m.label}
                </button>
              ))}
            </div>
            <div className={s.seg} role="tablist" aria-label="Version" style={{ ["--i" as string]: fixed ? 1 : 0, ["--n" as string]: 2 }}>
              <button type="button" role="tab" aria-selected={!fixed} onClick={() => set({ fixed: false })}>
                Your store today
              </button>
              <button type="button" role="tab" aria-selected={fixed} onClick={() => set({ fixed: true })}>
                After the fix
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
