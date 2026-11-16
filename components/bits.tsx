"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Chip, StatusPill } from "./rebuilt";
import { useCursorGlow } from "./useCursorGlow";

/* Cursor-follow ambient glow. Transform-only, rAF-throttled, GPU-friendly.
   Disabled on touch + reduced-motion. Mount inside a `position: relative` parent. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      matchMedia("(pointer: coarse)").matches
    )
      return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      el.style.opacity = "1";
      if (!raf)
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
          raf = 0;
        });
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} aria-hidden className="cursor-glow" />;
}

type MockRow = {
  name: string;
  latency: string;
  kind: "ok" | "bad" | "warn";
  label: string;
};

/* The signature "actual deliverable" — rows stagger in, Live badge breathes,
   and the pending row resolves after a beat to imply real-time. */
export function HeroMock({ rows }: { rows: MockRow[] }) {
  const [live, setLive] = useState(rows);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      setLive((rs) =>
        rs.map((r) =>
          r.kind === "warn"
            ? { ...r, kind: "ok", label: "Success", latency: "3.88s" }
            : r
        )
      );
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="anim-slide-right relative" style={{ animationDelay: "380ms" }}>
      <div className="hero-float rounded-xl border border-edge bg-card shadow-[0_28px_90px_-24px_rgba(231,221,205,0.32)]">
        <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5">
          <span className="font-mono text-xs text-muted">prod-agent-v2</span>
          <Chip active>
            <span className="pulse-dot mr-1 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
            Live
          </Chip>
          <span className="ml-auto font-mono text-[10px] text-[#6a635c]">
            rebuilt by Kyre
          </span>
        </div>
        <div className="divide-y divide-edge">
          {live.map((r, i) => (
            <div
              key={r.name}
              className={`anim-rise flex items-center gap-3 px-4 py-2.5 transition-colors duration-500 ${
                r.kind === "bad" ? "bg-bad/[0.06]" : ""
              }`}
              style={{ animationDelay: `${500 + i * 90}ms` }}
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-hi">
                {r.name}
              </span>
              <span className="font-mono text-[13px] font-semibold text-hi">
                {r.latency}
              </span>
              <StatusPill kind={r.kind} label={r.label} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 px-4 py-2 font-mono text-[11px] text-[#7a736c]">
          <span>642 runs</span>
          <span className="text-bad">1 timeout</span>
          <span className="text-accent">p95 3.9s</span>
        </div>
      </div>
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${seen ? "reveal-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* onError misses failures that happen before hydration — check after mount too. */
function useImgOk() {
  const ref = useRef<HTMLImageElement>(null);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setOk(false);
  }, []);
  return { ref, ok, fail: () => setOk(false) };
}

/* Real screenshot if public/originals/<file> exists; otherwise the in-code recreation. */
export function OriginalShot({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: ReactNode;
}) {
  const { ref, ok, fail } = useImgOk();
  if (!ok) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      onError={fail}
      className="w-full bg-white"
    />
  );
}

/* Photo drops in at public/founders/<img>; initials shown until then. */
export function FounderCard({
  name,
  role,
  href,
  img,
  initials,
}: {
  name: string;
  role: string;
  href: string;
  img: string;
  initials: string;
}) {
  const { ref, ok, fail } = useImgOk();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${name} on LinkedIn`}
      className="group flex cursor-pointer items-center gap-4"
    >
      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-edge transition-shadow duration-200 group-hover:ring-accent">
        {ok ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={ref}
            src={img}
            alt=""
            onError={fail}
            className="h-full w-full object-cover transition-[transform,filter] duration-200 ease-out group-hover:scale-[1.03] group-hover:brightness-[0.8]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-card2 font-mono text-sm text-muted">
            {initials}
          </span>
        )}
        {/* hover overlay: dim + LinkedIn cue */}
        <span className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/0 pb-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-[4px] bg-accent px-1.5 font-mono text-[10px] font-semibold text-hi">
            in
          </span>
        </span>
      </span>
      <span>
        <span className="font-medium text-hi transition-colors duration-200 group-hover:text-accent">
          {name}
        </span>
        <span className="block text-sm text-[#7a736c] transition-opacity duration-200 group-hover:opacity-0">
          {role}
        </span>
        {/* on hover, role gives way to the call-to-action */}
        <span className="-mt-5 block text-sm font-medium text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          View on LinkedIn →
        </span>
      </span>
    </a>
  );
}

/* A box that knows where the pointer is inside it — published as --px / --py
   (-1…1) for the stylesheet to lean things with. Exists so a server-rendered
   section can have one interactive leaf without becoming a client component. */
export function Lit({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useCursorGlow<HTMLDivElement>();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
