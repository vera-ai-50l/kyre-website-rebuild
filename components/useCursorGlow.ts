"use client";

import { useEffect, useRef } from "react";

/* Writes the pointer position to CSS custom properties, throttled to one write
   per animation frame:

     --mx / --my   pixels inside the element, for positioning a gradient
     --px / --py   the same thing normalised to -1..1, for parallax, since
                   `calc()` cannot divide by an element's own width

   Never useState on pointermove. It re-renders the subtree sixty times a second
   and would make a 107-row table unusable — which is the whole reason this
   writes to style directly and keeps React out of the loop entirely. */
export function useCursorGlow<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* A touch device has no hover position to track, and reduced motion means
       the visitor asked for none of this. */
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    let raf = 0;
    let x = 0;
    let y = 0;
    let w = 1;
    let h = 1;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      w = r.width || 1;
      h = r.height || 1;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.setProperty("--mx", `${x}px`);
          el.style.setProperty("--my", `${y}px`);
          el.style.setProperty("--px", `${(x / w) * 2 - 1}`);
          el.style.setProperty("--py", `${(y / h) * 2 - 1}`);
          raf = 0;
        });
      }
    };

    /* Parallax settles back to neutral on the way out; the spotlight is faded
       by :hover instead, so its last position can stay where it was. */
    const onLeave = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
