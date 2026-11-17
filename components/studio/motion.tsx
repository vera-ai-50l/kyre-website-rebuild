"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation, m, useMotionValue, useSpring } from "motion/react";
import s from "./hero.module.css";

/* Motion (Framer Motion) for the parts of the page a person touches: the hero's
   entrance, the buttons that lean toward the pointer, the Before/After pill.
   The scroll scene stays on its own CSS and WebGL clock — springs there would
   lag the scrollbar.

   LazyMotion with the DOM features only, and `m` rather than `motion`, keeps
   what this adds to the bundle to the animation core. "user" means a visitor
   who asked for less motion gets every element at its end state, no travel. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

/* One long, soft settle, the same for everything that enters. */
export const SETTLE = { type: "spring", stiffness: 120, damping: 20, mass: 0.9 } as const;

/* Enters once, rising and clearing, after `delay` seconds. The server renders
   it at its start state, so .enter in hero.module.css carries a failsafe that
   puts it in place after a few seconds should the script never run. */
export function Enter({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <m.span
      className={`${s.enter} ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SETTLE, delay }}
    >
      {children}
    </m.span>
  );
}

/* A link that leans toward the pointer while it is over it and springs back
   when it leaves; presses in on click. Mouse only: a finger has no "near". */
export function Magnetic({
  href,
  className,
  children,
  pull = 0.14,
}: {
  href: string;
  className: string;
  children: ReactNode;
  pull?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.5 });

  return (
    <m.a
      href={href}
      className={className}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * pull);
        y.set((e.clientY - (r.top + r.height / 2)) * pull * 1.3 - 2);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </m.a>
  );
}

export { m };
