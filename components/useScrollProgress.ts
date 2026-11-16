"use client";

import { useEffect, useRef } from "react";

/* Publishes how far the page has scrolled through an element's runway as a
   single 0→1 number on that element, as `--p`.

   Everything downstream is CSS. There is no animation library here on purpose:
   a scroll scene assembled from a library's defaults reads as that library, and
   the whole brief was to not look assembled. What a library would actually buy
   is spring physics, and the sequence below wants deliberate camera moves
   rather than bounce.

   State is never involved. Scroll fires far faster than React can reconcile,
   and re-rendering a fifty-node subtree per frame is how these sections end up
   janky. One rAF-throttled style write per frame, and CSS does the rest off the
   compositor. */
export function useScrollProgress<T extends HTMLElement>(
  /* Called with the same progress on the same frame. For the things that are
     not a function of scroll position but of *crossing* one — a jolt when the
     glass gives, a rebuild that plays itself once it is reached. Those cannot
     be scrubbed: a scrubbed shake stops dead wherever the reader stops
     scrolling and sits there vibrating. */
  onProgress?: (p: number, el: T) => void,
  /* "pinned" — the element is a tall runway with a sticky child, so progress is
     the scroll past its own height: 0 when its top hits the top of the viewport,
     1 when its bottom does.

     "through" — nothing is pinned and the element simply travels up the screen.
     The pinned formula is wrong here and quietly so: a 1434px section in a
     900px window has a "runway" of 534px, so it reports 1 after half a screen
     of scrolling while the reader is still on the first of three steps. This
     one runs from the element entering low in the viewport to its bottom
     clearing the reading line. */
  mode: "pinned" | "through" = "pinned",
  /* Time constant, in ms, of an exponential ease between the scrollbar and the
     number published. 0 publishes the raw position.

     A mouse wheel moves the page in 100px steps, and anything scrubbed straight
     off scrollY inherits those steps — the scene advances in jerks however
     cheap each frame is. Easing toward the target instead gives every step a
     short glide, which is the difference between a scene that is scrubbed and
     one that is filmed. A trackpad is already continuous and barely notices. */
  smooth = 0,
) {
  const ref = useRef<T>(null);
  /* Held in a ref so a caller passing an inline arrow does not tear the scroll
     listener down and rebuild it on every render. Refreshed in its own effect
     rather than during render, which is not a safe place to write one. */
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced motion gets the finished frame and no listener at all — and no
       milestones either. Announcing p=1 here would fire every crossing at once
       on load, which for the reel means playing the camera jolt at a reader who
       asked for no motion. What that state should look like is a question for
       the stylesheet's own reduced-motion block. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "1");
      return;
    }

    let raf = 0;
    let top = 0;
    let travel = 0;
    let last = "";

    /* Measured when the viewport changes, never inside the frame.
       getBoundingClientRect() in a scroll handler asks for geometry, and asking
       for geometry flushes whatever style and layout is pending — every frame,
       across a section carrying about a thousand nodes behind a sticky child.
       scrollY is a number the compositor already has.

       Safe to cache because the runway is a viewport multiple: this element's
       height and offset only move when the window does. */
    let start = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      top = r.top + window.scrollY;
      if (mode === "through") {
        /* Opens as the element rises past four fifths of the window and closes
           when its bottom reaches the reading line, so the value tracks what
           has actually been read rather than what has merely scrolled. */
        start = top - vh * 0.8;
        travel = r.height + vh * 0.2;
      } else {
        start = top;
        /* Everything past the first viewport: a 400vh section pinned for 100vh
           has 300vh of travel. */
        travel = r.height - vh;
      }
    };

    /* The eased value and the clock it was last advanced on. -1 means "not
       started": the first write lands on the target outright, so a page loaded
       halfway down does not open by gliding there from zero. */
    let cur = -1;
    let prev = 0;

    const write = (now: number) => {
      raf = 0;
      const target = travel <= 0 ? 0 : Math.min(1, Math.max(0, (window.scrollY - start) / travel));
      if (!smooth || cur < 0) {
        cur = target;
      } else {
        /* Frame-rate independent: the same glide at 60Hz and at 144Hz. Capped
           so a tab coming back from the background does not teleport. */
        const dt = Math.min(now - prev, 64);
        cur += (target - cur) * (1 - Math.exp(-dt / smooth));
        if (Math.abs(target - cur) < 0.00012) cur = target;
      }
      prev = now;
      /* Still gliding: keep the loop alive until it lands. */
      if (cur !== target) raf = requestAnimationFrame(write);

      const v = cur.toFixed(4);
      /* Parked at either end — or moved by less than the four decimals anyone
         downstream can see — the write would dirty the whole subtree for a
         frame that renders identically. */
      if (v === last) return;
      last = v;
      el.style.setProperty("--p", v);
      cb.current?.(cur, el);
    };

    const onScroll = () => {
      if (!raf) {
        prev = performance.now();
        raf = requestAnimationFrame(write);
      }
    };
    const onResize = () => {
      measure();
      last = "";
      onScroll();
    };

    measure();
    write(performance.now());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    /* Caching the geometry is what makes the scroll handler free, and it is also
       what makes it wrong the moment anything reflows — a late font, an image
       settling, a section above this one growing. The observer costs nothing
       until something actually changes size, and it watches the document as well
       as the element because this element's *offset* moves when its neighbours
       do, without its own box changing at all. */
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mode, smooth]);

  return ref;
}
