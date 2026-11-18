"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useScrollProgress } from "../useScrollProgress";
import { Arrow, Logo } from "./bits";
import { DotField } from "./DotField";
import { isLite } from "./useLite";
import { Enter, m, Magnetic, SETTLE } from "./motion";
import { STUDIO } from "./brand";
import { PLATES } from "./glass/plates";
import type { Shatter } from "./glass/scene";
import { Screen, type Side } from "./Screen";
import s from "./hero.module.css";
import ui from "./site.module.css";

/* Marks along the scroll that are events rather than positions. Crossing one
   sets an attribute and whatever it starts runs on its own clock. */
const CRACK_AT = 0.198;
const FIX_AT = 0.6;
const LIVE_AT = 0.76;

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
/* Where each word goes when the headline leaves: sideways by its place in the
   line, up or down by turns, so the lens passes through a gap in the middle. */
const DRIFT_Y = [-9, 7, -5, 9, -7, 5, -8, 10, -4];
const DRIFT_R = [-5, 3, -2, 4, -3, 2, -4, 5, -2];

type Note = { x: number; y: number; head: string; body: string; left?: boolean };

/* Percent of the pane. On the old screen: what is wrong with it. */
const BREAKS: Note[] = [
  { x: 60.5, y: 31, head: "Four tiles, one weight", body: "Nothing says where to look." },
  { x: 43, y: 73, head: "Five lines, no answer", body: "A chart that decides nothing." },
  { x: 16.2, y: 86, head: "The template", body: "Reads as every other AI-built app.", left: false },
];
/* On the new one: what changed. */
const FIXES: Note[] = [
  { x: 37.5, y: 24, head: "One number, first", body: "The one the business runs on." },
  { x: 72.4, y: 16.4, head: "Ranked by what hurts", body: "The reason, not a legend." },
  { x: 76.5, y: 88.5, head: "One next step", body: "What to do about it." },
];

function Notes({ list, className }: { list: Note[]; className: string }) {
  return (
    <div className={className}>
      {list.map((n, i) => (
        <div
          key={n.head}
          className={`${s.note} ${n.left ? s.noteL : ""}`}
          style={{ left: `${n.x}%`, top: `${n.y}%`, "--n": i } as CSSProperties}
        >
          <i className={s.noteDot} />
          <i className={s.noteLine} />
          <span className={s.noteBox}>
            <b>{n.head}</b>
            {n.body}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const shatter = useRef<Shatter | null>(null);
  const progress = useRef(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  /* Which face the pane shows: the scroll decides until someone uses the
     switch, and deciding again by scroll hands it back. */
  const [fixed, setFixed] = useState(false);
  const [picked, setPicked] = useState<Side | null>(null);
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  const side: Side = picked ?? (fixed || reduced ? "after" : "before");

  const milestones = useCallback((p: number, el: HTMLElement) => {
    progress.current = p;
    shatter.current?.set(p);
    const mark = (k: string, v: string) => {
      if (el.dataset[k] !== v) el.dataset[k] = v;
    };
    mark("jolt", p >= CRACK_AT ? "break" : "");
    mark("live", p >= LIVE_AT ? "on" : "");
    /* The capture script photographs the old face on the standing pane. */
    const fix = p >= FIX_AT && !("capture" in document.documentElement.dataset) ? "on" : "";
    if (el.dataset.fix !== fix) {
      el.dataset.fix = fix;
      setFixed(fix === "on");
      setPicked(null);
    }
  }, []);

  const ref = useScrollProgress<HTMLElement>(milestones, "pinned", 110);

  useEffect(() => {
    const reel = ref.current;
    if (!reel || !canvas.current || !stage.current) return;
    /* Reduced motion parks on the new screen and never shows the break. */
    if (window.matchMedia(REDUCED).matches) return;

    let live = true;
    let scene: Shatter | null = null;
    const narrow = window.matchMedia("(max-width: 900px)");

    /* three.js is most of this page's JavaScript and none of it is needed to
       read the headline, so it arrives after first paint in its own chunk. */
    import("./glass/scene")
      .then(({ mountShatter }) => {
        if (!live || !canvas.current || !stage.current) return;
        scene = mountShatter(
          canvas.current,
          stage.current,
          () => (narrow.matches ? PLATES.narrow : PLATES.wide),
          () => {
            reel.dataset.gl = "on";
          },
        );
        scene.set(progress.current);
        shatter.current = scene;
      })
      /* No WebGL, or the chunk never came: the flat picture already in the
         markup takes over without being asked. */
      .catch(() => {});

    return () => {
      live = false;
      scene?.dispose();
      shatter.current = null;
      delete reel.dataset.gl;
    };
  }, [ref]);

  /* The lights lean after the pointer, each by its own share of the distance
     from the centre (data-glow) and on a slow clock, so the room turns a beat
     behind the hand. Transforms only, and the loop stops when they settle. */
  useEffect(() => {
    const reel = ref.current;
    if (!reel || window.matchMedia(REDUCED).matches) return;
    /* Each light is a layer wider than the window. Moving them is free on a GPU
       and a full-window blend per frame on a CPU (measured: 59fps -> 32fps
       with the mouse moving), so small machines keep them where they drift. */
    if (isLite()) return;
    const glows = [...reel.querySelectorAll<HTMLElement>("[data-glow]")].map((el) => ({
      el,
      k: Number(el.dataset.glow),
    }));
    const tilt = reel.querySelector<HTMLElement>("[data-tilt]");
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
      for (const g of glows) g.el.style.transform = `translate3d(${(x * g.k).toFixed(1)}px, ${(y * g.k).toFixed(1)}px, 0)`;
      /* The risen pane leans toward the hand, a few degrees at most, and only
         once it has stood up: tied to how far the rise has come. */
      if (tilt) {
        const rise = Math.min(1, Math.max(0, (progress.current - 0.64) / 0.2));
        const nx = x / (window.innerWidth / 2);
        const ny = y / (window.innerHeight / 2);
        tilt.style.transform = rise
          ? `rotateX(${(-ny * 3 * rise).toFixed(2)}deg) rotateY(${(nx * 4 * rise).toFixed(2)}deg)`
          : "";
      }
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || "off" in reel.dataset) return;
      tx = e.clientX - window.innerWidth / 2;
      ty = e.clientY - window.innerHeight / 2;
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

  /* The room's light drifts on a loop; once the reel is scrolled past there
     is nothing to see it, so it stops rather than repainting off screen. */
  useEffect(() => {
    const reel = ref.current;
    if (!reel) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) delete reel.dataset.off;
      else reel.dataset.off = "";
    });
    io.observe(reel);
    return () => io.disconnect();
  }, [ref]);

  let w = 0;
  return (
    <section ref={ref} className={s.reel} data-reel data-live={reduced ? "on" : undefined}>
      <div className={s.viewport}>
        <div className={s.field} aria-hidden>
          <span className={s.glow} data-glow="0.05">
            <span className={s.wash1} />
          </span>
          <span className={s.glow} data-glow="-0.045">
            <span className={s.wash2} />
          </span>
          <span className={s.glow} data-glow="0.03">
            <span className={s.wash3} />
          </span>
          <DotField />
          <span className={s.veil} />
        </div>
        <span className={s.ticks} aria-hidden />

        <div className={s.camera}>
          <span className={s.shadow} aria-hidden />
          <canvas ref={canvas} className={s.gl} aria-hidden />

          <div ref={stage} className={s.stage}>
            <picture>
              <source media="(max-width: 900px)" srcSet={PLATES.narrow.src} />
              <img className={s.paneImg} src={PLATES.wide.src} alt="A sample dashboard as an AI builder made it" />
            </picture>
            <Notes list={BREAKS} className={s.notes} />
          </div>

          <div className={s.glassWrap}>
            <div className={s.glassTilt} data-tilt>
              <span className={s.slab} aria-hidden />
              <div className={s.glass} data-side={side} data-shot="glass">
                <div className={s.rail} aria-hidden>
                  <i />
                  <i />
                  <i />
                  <span>marlo.example/overview</span>
                  <em>Sample</em>
                </div>
                <div className={s.face}>
                  <Screen side={side} />
                </div>
                {side === "after" && <Notes list={FIXES} className={s.notesFix} />}
              </div>
              <span className={s.reflect} aria-hidden />
            </div>
          </div>
        </div>
        <div className={s.floor} aria-hidden />

        <div className={s.copy}>
          <div className={s.copyInner}>
            <p className={`${ui.eyebrow} ${s.eyebrow}`}>
              <i />
              Interface redesign for products AI built
            </p>
            <h1 className={s.headline}>
              {HEAD.map((line, li) => (
                <span key={li} className={s.line}>
                  {line.map((word) => {
                    const i = w++;
                    return (
                      <span
                        key={word}
                        className={s.word}
                        style={
                          {
                            "--wi": i,
                            "--wx": `${((i - 4) * 5.5).toFixed(1)}vw`,
                            "--wy": `${DRIFT_Y[i]}vh`,
                            "--wr": `${DRIFT_R[i]}deg`,
                          } as CSSProperties
                        }
                      >
                        {/* The mask the word rises out of on load. Motion owns
                            the inner span; the outer one belongs to the scroll. */}
                        <span className={s.mask}>
                          <m.span
                            className={s.wordIn}
                            initial={{ y: "118%", rotate: 5 }}
                            animate={{ y: "0%", rotate: 0 }}
                            transition={{ ...SETTLE, delay: 0.18 + i * 0.06 }}
                          >
                            {word}
                          </m.span>
                        </span>
                      </span>
                    );
                  })}
                </span>
              ))}
            </h1>
            <p className={s.sub}>
              <Enter delay={0.62}>
                {STUDIO} redesigns apps and dashboards built in the AI era — delivered as a pull request in your own
                code, in days, measured on the number that matters.
              </Enter>
            </p>
            <div className={s.actions}>
              <Enter delay={0.74}>
                <Magnetic href="#teardown" className={ui.btn}>
                  Get a free teardown
                  <Arrow />
                </Magnetic>
              </Enter>
              <Enter delay={0.82}>
                <Magnetic href="#how" className={`${ui.btn} ${ui.btnGhost}`}>
                  See how it works
                  <Arrow down />
                </Magnetic>
              </Enter>
            </div>
            <p className={s.micro}>
              <Enter delay={0.95}>No call, no pitch. Your biggest wins and a before/after of one screen.</Enter>
            </p>
          </div>
        </div>

        <p className={s.tag} data-when="now">
          <i />
          Sample app, as the AI builder left it
        </p>
        <p className={s.tag} data-when="then">
          <i />
          Sample redesign. Same product, same data
        </p>

        <p className={s.card}>
          <span className={s.cardBadge}>
            <em>Rebuilt with</em>
            <Logo />
          </span>
          <span className={s.cardText}>
            Same product. <span>New interface.</span>
          </span>
          <span className={s.cardMeta}>
            <i />
            pull request merged into your repo
          </span>
        </p>

        <div className={s.toggle} data-side={side} role="group" aria-label="Compare the screen before and after">
          <m.span
            className={s.tgPill}
            aria-hidden
            initial={false}
            animate={{ x: side === "after" ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
          {(["before", "after"] as const).map((x) => (
            <button key={x} type="button" className={s.tgBtn} aria-pressed={side === x} onClick={() => setPicked(x)}>
              {x === "before" ? "Before" : "After"}
            </button>
          ))}
        </div>

        <span className={s.hint} aria-hidden>
          Scroll
          <i />
        </span>
      </div>
    </section>
  );
}
