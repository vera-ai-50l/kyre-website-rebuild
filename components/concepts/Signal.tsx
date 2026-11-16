"use client";

import { useEffect, useRef, useState } from "react";
import { calAttrs } from "../cal";
import { Arrow } from "../chrome";
import s from "./concepts.module.css";
import type { Field } from "./field";

const SHAPES = [
  { label: "Rows", line: "Every row, the same weight. This is the dashboard you have." },
  { label: "Ranked", line: "Same rows, same data. Ranked by what they cost you." },
  { label: "Decided", line: "The one that needs somebody today." },
];

export function Signal() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<Field | null>(null);
  const latest = useRef(0);
  const touched = useRef(false);
  const [shape, setShape] = useState(0);

  useEffect(() => {
    let dead = false;
    import("./field")
      .then((m) => m.mountField(canvas.current!))
      .then((f) => {
        if (dead) return f.dispose();
        field.current = f;
        f.to(latest.current);
      })
      .catch(() => {});

    /* It runs itself until somebody takes the control, then it is theirs. */
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(() => {
      if (!still && !touched.current && !document.hidden) setShape((n) => (n + 1) % SHAPES.length);
    }, 5600);
    return () => {
      dead = true;
      clearInterval(id);
      field.current?.dispose();
      field.current = null;
    };
  }, []);

  useEffect(() => {
    latest.current = shape;
    field.current?.to(shape);
  }, [shape]);

  const pick = (i: number) => {
    touched.current = true;
    setShape(i);
  };

  return (
    <section className={`${s.hero} ${s.signal}`}>
      <span className={s.sigGrid} aria-hidden />
      <canvas ref={canvas} className={s.gl} aria-hidden />

      <p className={s.sigMeta} aria-hidden>
        <span>0{shape + 1} / 03</span>
        <span>{SHAPES[shape].label}</span>
        <span>28,000 marks, one dataset</span>
      </p>

      <div className={s.sigIn}>
        <p className={s.tag}>Dashboard Sprint · 2 weeks · $6,000 to $9,000</p>
        <h1 className={s.sigH}>
          <span className={s.line}>
            <span>Four hundred rows.</span>
          </span>
          <span className={s.line}>
            <span>
              <em>One</em> decision.
            </span>
          </span>
        </h1>
        <div className={s.sigRow}>
          <div>
            <p className={s.sub}>
              Your data is fine. The dashboard just plays all of it at the same
              volume. In two weeks we rebuild your most-used dashboard around
              the decision it exists for, and leave the component kit it is
              made of in your repo.
            </p>
            <div className={s.ctas}>
              <button type="button" {...calAttrs} className={`cta ${s.ctaAcc}`}>
                Book a sprint call
                <Arrow />
              </button>
              <a href="#offer" className="cta cta-ghost">
                See what ships
                <Arrow down />
              </a>
            </div>
          </div>

          <div className={s.sigPanel}>
            <p key={shape} className={s.sigCaption}>
              {SHAPES[shape].line}
            </p>
            <div className={s.seg} role="tablist" aria-label="Arrangement" style={{ ["--i" as string]: shape }}>
              {SHAPES.map((sh, i) => (
                <button key={sh.label} type="button" role="tab" aria-selected={shape === i} onClick={() => pick(i)}>
                  {sh.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
