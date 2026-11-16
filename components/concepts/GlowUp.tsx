"use client";

import { useEffect, useRef, useState } from "react";
import { calAttrs } from "../cal";
import { Arrow } from "../chrome";
import s from "./concepts.module.css";
import type { Wall } from "./wall";

/* What the pass changes, in the order the hold reaches them. */
const CHIPS = ["Hierarchy", "Contrast", "Spacing", "Focus states", "One primary action"];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
/* Seconds of holding to go all the way; a release before that falls back
   faster than it rose, so letting go early reads as a refusal, not a pause. */
const RISE = 1.25;
const FALL = 0.6;

export function GlowUp() {
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const device = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);
  const flip = useRef<() => void>(() => {});

  useEffect(() => {
    const el = host.current!;
    const dev = device.current!;
    let wall: Wall | undefined;
    let dead = false;
    import("./wall")
      .then(({ mountWall }) => {
        if (dead) return;
        wall = mountWall(canvas.current!);
        el.dataset.gl = "on";
      })
      /* No WebGL: the hero still works, on a plain ground. */
      .catch(() => {});

    let g = 0;
    let latched = false;
    let holding = false;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const target = holding ? (latched ? 0 : 1) : latched ? 1 : 0;
      if (g !== target) {
        g = clamp01(g + Math.sign(target - g) * (dt / (holding ? RISE : FALL)));
        /* Held all the way: it stays, and the next hold undoes it. */
        if (holding && g === target) {
          latched = target === 1;
          holding = false;
          setDone(latched);
        }
      }
      el.style.setProperty("--g", g.toFixed(4));
      wall?.hold(g);
      if (holding || g !== (latched ? 1 : 0)) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    /* The pass spreads from where the finger is, so the reveal needs that
       point in the device's own box, and a radius that reaches its far corner
       from anywhere inside it. */
    const aim = (x: number, y: number) => {
      const r = dev.getBoundingClientRect();
      dev.style.setProperty("--hx", `${(clamp01((x - r.left) / r.width) * 100).toFixed(1)}%`);
      dev.style.setProperty("--hy", `${(clamp01((y - r.top) / r.height) * 100).toFixed(1)}%`);
      dev.style.setProperty("--diag", `${Math.ceil(Math.hypot(r.width, r.height) * 1.04)}px`);
    };

    const down = (e: PointerEvent) => {
      const t = e.target as Element;
      if (e.button !== 0 || t.closest("a, button")) return;
      /* A finger anywhere else on the page is a scroll. */
      if (e.pointerType === "touch" && !dev.contains(t)) return;
      aim(e.clientX, e.clientY);
      holding = true;
      el.dataset.holding = "true";
      kick();
    };
    const up = () => {
      holding = false;
      delete el.dataset.holding;
      kick();
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty("--px", ((x / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--py", ((y / r.height) * 2 - 1).toFixed(3));
      ring.current!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.dataset.cur = (e.target as Element).closest("a, button") ? "off" : "on";
    };
    const leave = () => {
      el.dataset.cur = "off";
    };
    const noMenu = (e: Event) => e.preventDefault();

    /* The button does the same thing without a hold: a keyboard has no
       "press and keep pressing" that a screen reader will announce. */
    flip.current = () => {
      const r = dev.getBoundingClientRect();
      aim(r.left + r.width / 2, r.top + r.height / 2);
      latched = !latched;
      setDone(latched);
      kick();
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    dev.addEventListener("contextmenu", noMenu);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      wall?.dispose();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      dev.removeEventListener("contextmenu", noMenu);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section ref={host} className={`${s.hero} ${s.glow}`} data-done={done}>
      <canvas ref={canvas} className={s.gl} aria-hidden />
      <span className={s.glowShade} aria-hidden />

      <div className={s.glowIn}>
        <div className={s.copy}>
          <p className={s.tag}>AI App Glow-Up · 7 days · $1,500 fixed</p>
          <h1 className={s.glowH}>
            <span className={s.line}>
              <span>You shipped it</span>
            </span>
            <span className={s.line}>
              <span>in a weekend.</span>
            </span>
            <span className={s.line}>
              <span>
                <em>It shows.</em>
              </span>
            </span>
          </h1>
          <p className={s.sub}>
            Lovable, Bolt, v0, Cursor: they all hand back the same app. We take
            the five screens your paying users live in and make them look like
            yours. Design pass, accessibility fixes, a security check. One pull
            request, seven days.
          </p>
          <div className={s.ctas}>
            <button type="button" {...calAttrs} className={`cta ${s.ctaAcc}`}>
              Get a free 3-minute teardown
              <Arrow />
            </button>
            <a href="#offer" className="cta cta-ghost">
              What&apos;s in the PR
              <Arrow down />
            </a>
          </div>
          <div className={s.chips} aria-hidden>
            {CHIPS.map((c, i) => (
              <span key={c} className={s.chip} style={{ ["--at" as string]: 0.08 + i * 0.17 }}>
                <i />
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className={s.deviceWrap}>
          <div ref={device} className={s.device} aria-hidden>
            <div className={s.deviceCore}>
              {/* Before: what the builder gave you. System font on purpose. */}
              <div className={s.bf}>
                <div className={s.bfHero}>
                  <b>✨ Welcome to TaskFlow AI</b>
                  <span>Your all-in-one productivity solution 🚀</span>
                  <i>Get Started</i>
                </div>
                <div className={s.bfCards}>
                  {[
                    ["🎯", "Goals"],
                    ["📊", "Analytics"],
                    ["⚡", "Automations"],
                  ].map(([icon, t]) => (
                    <div key={t}>
                      <em>{icon}</em>
                      <b>{t}</b>
                      <span>Lorem ipsum dolor sit amet consectetur</span>
                    </div>
                  ))}
                </div>
                <div className={s.bfList}>
                  {["Finish onboarding flow", "Reply to Dana re: invoice", "Fix Stripe webhook"].map((t) => (
                    <div key={t}>
                      <span>{t}</span>
                      <u>View</u>
                    </div>
                  ))}
                </div>
                <div className={s.bfCta}>Upgrade to Pro 🚀</div>
              </div>

              {/* After: the same app and the same three tasks, in the order
                  they matter. */}
              <div className={s.af}>
                <div className={s.afTop}>
                  <b>TaskFlow</b>
                  <span>Tuesday</span>
                </div>
                <h3>3 things need you today</h3>
                <ul>
                  <li data-late>
                    <span />
                    <div>
                      <b>Fix Stripe webhook</b>
                      <small>Payments failing since 09:12</small>
                    </div>
                    <em>Overdue</em>
                  </li>
                  <li>
                    <span />
                    <div>
                      <b>Reply to Dana re: invoice</b>
                      <small>Waiting two days</small>
                    </div>
                    <em>Today</em>
                  </li>
                  <li>
                    <span />
                    <div>
                      <b>Finish onboarding flow</b>
                      <small>4 of 6 steps</small>
                    </div>
                    <em>Today</em>
                  </li>
                </ul>
                <div className={s.afStats}>
                  <div>
                    <b>12</b>
                    <small>Goals on track</small>
                  </div>
                  <div>
                    <b>86%</b>
                    <small>Done this week</small>
                  </div>
                  <div>
                    <b>4</b>
                    <small>Automations live</small>
                  </div>
                </div>
                <div className={s.afFoot}>
                  <b>Add task</b>
                  <span>Upgrade</span>
                </div>
              </div>
              <span className={s.rim} />
            </div>
          </div>
          <p className={s.srOnly}>
            A demo app screen. Before: a generic template with a gradient banner
            and three equal cards. After: the same content with a clear order,
            readable contrast and one primary action.
          </p>
        </div>
      </div>

      <button type="button" className={s.hold} onClick={() => flip.current()} aria-pressed={done}>
        <span className={s.holdFill} aria-hidden />
        <span className={s.holdText}>{done ? "Glowed up. Hold again to undo" : "Press and hold to glow it up"}</span>
      </button>
      <span ref={ring} className={s.ring} aria-hidden>
        <span>{done ? "Undo" : "Hold"}</span>
      </span>
    </section>
  );
}
