"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Reveal } from "../bits";
import { Arrow } from "./bits";
import ui from "./site.module.css";

/* A concept, said as one. Agnost AI did not hire us: these are two screens from
   their public demo, redesigned the way we would, with the source and the date
   of every "before" stated under the comparison. */

type Screen = {
  id: string;
  label: string;
  before: string;
  after: string;
  notes: string[];
};

const SCREENS: Screen[] = [
  {
    id: "home",
    label: "Home",
    before: "/work/agnost-before-home.webp",
    after: "/work/agnost-after-home.webp",
    notes: [
      "Opens on one sentence: how many conversations failed, out of how many, in what window",
      "Each complaint carries the intent behind it and the rule the agent broke, one click from the conversation",
      "Three ranked lists sized by what they hold, instead of six panels of equal weight",
    ],
  },
  {
    id: "events",
    label: "Events",
    before: "/work/agnost-before-events.webp",
    after: "/work/agnost-after-events.webp",
    notes: [
      "A failed event names what went wrong next to the tool that ran it",
      "Red means failed and nothing else: one status, one count, no tinted rows",
      "A 24-hour strip of every event along the bottom; drag across it and the screen narrows to that moment",
    ],
  },
];

/* Before on the left, after on the right. The after image sits on top and is
   clipped from its left edge, so dragging moves one inset and nothing reflows. */
function Compare({ screen }: { screen: Screen }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);

  const from = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    from(e.clientX);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) from(e.clientX);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - step));
    else if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + step));
    else if (e.key === "Home") setPos(0);
    else if (e.key === "End") setPos(100);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={box}
      className={ui.cxBox}
      onPointerDown={onDown}
      onPointerMove={onMove}
      style={{ "--pos": `${pos}%` } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, sized webp */}
      <img
        src={screen.before}
        alt={`Agnost's ${screen.label} screen as it is in their public demo`}
        width={2880}
        height={1800}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, sized webp */}
      <img
        className={ui.cxAfter}
        src={screen.after}
        alt={`Kyre's concept redesign of the ${screen.label} screen`}
        width={2880}
        height={1800}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <div
        className={ui.cxHandle}
        role="slider"
        tabIndex={0}
        aria-label={`Compare the ${screen.label} screen before and after`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(100 - pos)}% of the redesign showing`}
        onKeyDown={onKey}
      >
        <i aria-hidden />
      </div>
    </div>
  );
}

export function Concept() {
  const [tab, setTab] = useState(0);
  const screen = SCREENS[tab];

  return (
    <section className={ui.section} id="concept">
      <div className={ui.wrap}>
        <Reveal className={ui.head}>
          <p className={ui.eyebrow}>
            <i />
            Concept, not client work
          </p>
          <h2 className={ui.h2}>
            Agnost AI, redesigned the way we would. <span>They did not ask us to.</span>
          </h2>
          <p className={ui.lede}>
            Agnost monitors AI agents in production. We took two screens from their public demo and rebuilt them as if
            they had hired us, to show how we work on a real product rather than a made-up one.
          </p>
        </Reveal>

        <Reveal className={ui.shell}>
          <div className={`${ui.core} ${ui.cxCore}`}>
            <div className={ui.cxBar}>
              <div className={ui.cxTabs} role="tablist" aria-label="Screen">
                {SCREENS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === tab}
                    className={ui.cxTab}
                    onClick={() => setTab(i)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <span className={ui.cxHint}>Drag to compare</span>
            </div>

            <Compare key={screen.id} screen={screen} />
            {/* Named outside the picture, so neither label sits on either product. */}
            <div className={ui.cxLegend} aria-hidden>
              <span>Before · Agnost today</span>
              <span>After · Kyre concept</span>
            </div>

            <div className={ui.cxFoot}>
              <ul className={ui.cxNotes}>
                {screen.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <div className={ui.cxActions}>
                <a href="/agnost/console" className={ui.btn}>
                  Open the working rebuild
                  <Arrow />
                </a>
                <a href="https://agnost.ai" target="_blank" rel="noopener noreferrer" className={`${ui.btn} ${ui.btnGhost}`}>
                  Agnost&apos;s real product
                  <Arrow />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <p className={ui.cxSource}>
          Before: screenshots of Agnost&apos;s public demo at app.agnost.ai, taken 17 November 2026. After: Kyre&apos;s
          rebuild in code, filled with made-up sample data for a fictional customer. Agnost AI has not reviewed or
          endorsed this work and is not affiliated with Kyre. Agnost and its marks belong to Agnost AI.
        </p>
      </div>
    </section>
  );
}
