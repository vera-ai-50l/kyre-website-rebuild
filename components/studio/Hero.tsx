"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useScrollProgress } from "../useScrollProgress";
import { Arrow, Logo } from "./bits";
import { isLite } from "./useLite";
import { Enter, m, Magnetic, SETTLE } from "./motion";
import { STUDIO } from "./brand";
import { After, Before, EMOJI } from "./Screen";
import s from "./hero.module.css";
import ui from "./site.module.css";

/* The hero is a teardown on a cutting mat. Scrolling takes the sample app's
   screen apart, labels each part with what is wrong with it, clears it off the
   mat and puts the redesign together in its place. Everything that moves is a
   function of one number, --p, which useScrollProgress writes on the section;
   the stylesheet turns it into how far each screen is apart. The stages below
   are only the things that switch rather than slide. */
type Stage = "intro" | "apart" | "swap" | "together" | "live";
const stageAt = (p: number): Stage =>
  p < 0.07 ? "intro" : p < 0.56 ? "apart" : p < 0.62 ? "swap" : p < 0.86 ? "together" : "live";

/* Which pieces wear their numbers. */
const PINS: Record<Stage, string> = { intro: "", apart: "b", swap: "", together: "a", live: "a" };

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const HEAD = [
  ["Your", "product", "works."],
  ["The", "interface", "is", "holding", "it", "back."],
];

/* What the old screen gets wrong, one line per numbered part. */
const FINDINGS = [
  ["The template.", "Gradient logo, gradient upsell: it reads as every other AI-built app."],
  ["A greeting, not an answer.", "“Welcome back” takes the top of the screen."],
  ["Four tiles, one weight.", "Nothing says where to look first."],
  ["Five lines, no answer.", "A chart that decides nothing."],
  ["Every status shouts.", "Four colours of pill, none of them ranked."],
  ["Twelve emoji", "standing in for an icon set."],
];
/* What the new one does instead. */
const FIXES = [
  ["One number, first.", "The one the support team is judged on."],
  ["Ranked by what hurts.", "Where the agent hands off, worst first."],
  ["One next step.", "Three conversations waiting, and the button for them."],
  ["The old tiles, demoted.", "A strip at the foot, each with its week behind it."],
];

function List({ items, heading, id }: { items: string[][]; heading: string; id: string }) {
  return (
    <div className={s.list} data-list={id}>
      <h2 className={s.listHead}>{heading}</h2>
      <ol>
        {items.map(([h, b], i) => (
          <li key={h} style={{ "--n": i } as CSSProperties}>
            <b className={s.dot} aria-hidden>
              {i + 1}
            </b>
            <span>
              <strong>{h}</strong> <span className={s.body}>{b}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Hero() {
  /* The switch under the screen. The scroll decides which face is up until
     someone uses it, and crossing the next stage hands it back. */
  const [picked, setPicked] = useState<"before" | "after" | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  const onProgress = useCallback((p: number, el: HTMLElement) => {
    const next = stageAt(p);
    if (el.dataset.stage === next) return;
    el.dataset.stage = next;
    el.dataset.pins = PINS[next];
    el.dataset.live = next === "live" ? "on" : "";
    setStage(next);
    setPicked(null);
  }, []);

  const ref = useScrollProgress<HTMLElement>(onProgress, "pinned", 110);

  /* Reduced motion lands on the finished screen with nothing taken apart and
     the opening words still on the left. */
  useEffect(() => {
    const el = ref.current;
    if (!el || !reduced) return;
    el.dataset.stage = "live";
    el.dataset.pins = "a";
    el.dataset.live = "on";
    el.dataset.rm = "";
  }, [ref, reduced]);

  /* A face picked with the switch sits assembled, so only the new one keeps
     its numbers. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.pins = picked === "before" ? "" : picked === "after" ? "a" : PINS[(el.dataset.stage as Stage) ?? "intro"];
  }, [ref, picked]);

  /* Once the new screen is together it leans a few degrees toward the
     pointer, on a slow clock so it turns a beat behind the hand. Small
     machines and reduced motion keep it flat. */
  useEffect(() => {
    const reel = ref.current;
    if (!reel || window.matchMedia(REDUCED).matches || isLite()) return;
    const tilt = reel.querySelector<HTMLElement>("[data-tilt]");
    if (!tilt) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = 0;
      const e = 1 - Math.exp(-Math.min(now - last, 64) / 650);
      last = now;
      x += (tx - x) * e;
      y += (ty - y) * e;
      const on = reel.dataset.stage === "live";
      tilt.style.transform = on ? `rotateX(${(-y * 2.5).toFixed(2)}deg) rotateY(${(x * 3.5).toFixed(2)}deg)` : "";
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.002) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);

  const showing = picked ?? (stage === "intro" || stage === "apart" ? "before" : "after");
  let w = 0;

  return (
    <section ref={ref} className={s.reel} data-reel data-stage="intro" data-pick={picked ?? undefined}>
      <div className={s.viewport}>
        <div className={s.rulerTop} aria-hidden>
          {Array.from({ length: 41 }, (_, i) => (
            <i key={i}>{i}</i>
          ))}
        </div>
        <div className={s.rulerSide} aria-hidden>
          {Array.from({ length: 25 }, (_, i) => (
            <i key={i}>{i}</i>
          ))}
        </div>

        <div className={s.side}>
          <div className={s.intro}>
            <h1 className={s.headline}>
              {HEAD.map((line, li) => (
                <span key={li} className={s.line}>
                  {line.map((word) => {
                    const i = w++;
                    return (
                      <span key={word} className={s.mask}>
                        <m.span
                          className={s.wordIn}
                          initial={{ y: "112%" }}
                          animate={{ y: "0%" }}
                          transition={{ ...SETTLE, delay: 0.15 + i * 0.05 }}
                        >
                          {word}
                        </m.span>
                      </span>
                    );
                  })}
                </span>
              ))}
            </h1>
            <p className={s.sub}>
              <Enter delay={0.55}>
                {STUDIO} redesigns apps and dashboards built in the AI era, delivered as a pull request in your own
                code, in days, and judged on the one number that matters.
              </Enter>
            </p>
          </div>

          <List id="findings" heading="Taken apart: six things holding it back." items={FINDINGS} />
          <List id="fixes" heading="Put back together: same data, decided." items={FIXES} />

          <div className={s.actions}>
            <Enter delay={0.7}>
              <Magnetic href="#teardown" className={ui.btn}>
                Get a free teardown
                <Arrow />
              </Magnetic>
            </Enter>
            <Enter delay={0.78}>
              <Magnetic href="#how" className={`${ui.btn} ${ui.btnGhost}`}>
                How it works
                <Arrow down />
              </Magnetic>
            </Enter>
          </div>
          <p className={s.micro}>
            <Enter delay={0.9}>Free, no call. Your biggest wins and a before/after of one screen.</Enter>
          </p>
        </div>

        <div className={s.bench}>
          <figure className={s.figure}>
            <div className={s.tiltWrap}>
              <div className={s.housing} data-tilt>
                <div className={s.rail} aria-hidden>
                  <i />
                  <i />
                  <i />
                  <span>marlo.example/overview</span>
                </div>
                <div className={s.face}>
                  <div
                    className={s.layer}
                    data-layer="b"
                    role="img"
                    aria-label="Sample dashboard for a fictional product, Marlo, as an AI builder made it"
                    aria-hidden={showing !== "before"}
                  >
                    <Before />
                  </div>
                  <div
                    className={s.layer}
                    data-layer="a"
                    role="img"
                    aria-label="The same dashboard redesigned: one number first, the reason second, the next step third"
                    aria-hidden={showing !== "after"}
                  >
                    <After />
                  </div>
                </div>
              </div>
            </div>

            <div className={s.tray} aria-hidden>
              <b className={s.dot}>6</b>
              {EMOJI.map((e, i) => (
                <span key={i} style={{ "--n": i } as CSSProperties}>
                  {e}
                </span>
              ))}
            </div>

            <figcaption className={s.caption}>
              <span data-cap="b">Sample app, as the AI builder left it.</span>
              <span data-cap="a">
                Sample redesign, same product and data. Rebuilt with <Logo />
              </span>
            </figcaption>
            <div className={s.toggle} role="group" aria-label="Show the screen before or after">
              {(["before", "after"] as const).map((x) => (
                <button
                  key={x}
                  type="button"
                  className={s.tgBtn}
                  aria-pressed={showing === x}
                  onClick={() => setPicked(x)}
                >
                  {x === "before" ? "Before" : "After"}
                </button>
              ))}
            </div>
          </figure>

        </div>

        <span className={s.hint} aria-hidden>
          Scroll to take it apart
          <i />
        </span>
      </div>
    </section>
  );
}
