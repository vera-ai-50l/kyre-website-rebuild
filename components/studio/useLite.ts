"use client";

import { useEffect } from "react";

/* The second half of the low-power check in app/layout.tsx. That one can only
   look at the hardware; this one watches the page actually scroll. If the first
   stretch of scrolling runs well under 45fps, the page drops to the "low" tier
   (no blur, no drifting light, WebGL at 1x) and tells the glass scene so it can
   resize its canvas. It only ever steps down, once, and never on a page that
   was asked for the full version with ?fx=full. */
export const LITE_EVENT = "kyre:lite";
/* Fired by the theme switch in the nav, for the canvases that draw colour. */
export const THEME_EVENT = "kyre:theme";

export function isLite() {
  return typeof document !== "undefined" && "lite" in document.documentElement.dataset;
}

export function useLite() {
  useEffect(() => {
    const root = document.documentElement;
    if ("lite" in root.dataset) return;
    if (new URLSearchParams(location.search).get("fx") === "full") return;

    const frames: number[] = [];
    let raf = 0;
    let last = 0;
    let scrolling = 0;

    const tick = (now: number) => {
      raf = 0;
      if (last) frames.push(now - last);
      last = now;
      if (frames.length >= 90) {
        const sorted = [...frames].sort((a, b) => a - b);
        const median = sorted[sorted.length >> 1];
        if (median > 22) {
          root.dataset.lite = "low";
          window.dispatchEvent(new Event(LITE_EVENT));
          stop();
          return;
        }
        frames.length = 0;
      }
      if (performance.now() < scrolling) raf = requestAnimationFrame(tick);
      else last = 0;
    };

    const onScroll = () => {
      scrolling = performance.now() + 250;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* Two screens of samples are enough to know; after that the check costs
       nothing for the rest of the visit. */
    let checks = 0;
    const onScrollCounted = () => {
      if (++checks > 600) return stop();
      onScroll();
    };
    const stop = () => {
      window.removeEventListener("scroll", onScrollCounted);
      if (raf) cancelAnimationFrame(raf);
    };

    window.addEventListener("scroll", onScrollCounted, { passive: true });
    return stop;
  }, []);
}
