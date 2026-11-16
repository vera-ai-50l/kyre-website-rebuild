"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calAttrs } from "./cal";

/* A hairline arrow in its own disc. The trailing icon never sits naked beside
   a label — it is a button inside the button, and it is the part that moves. */
export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <span className="cta-icon" aria-hidden>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        {down ? <path d="M8 3.5v9M4.2 8.8 8 12.5l3.8-3.7" /> : <path d="M4.5 11.5l7-7M5.8 4.5h5.7v5.7" />}
      </svg>
    </span>
  );
}

const LINKS = [
  { href: "/#how", label: "Process" },
  { href: "/#teardowns", label: "Work" },
  { href: "mailto:aditya@trykyre.com", label: "Contact" },
];

/* An island, not a bar. It floats clear of the top edge over whatever is under
   it, leaves on the way down the page — the hero is a scene, and a scene does
   not want a toolbar across it — and is back the moment the reader turns round. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [away, setAway] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      /* A few pixels of slack, so a resting trackpad does not flicker it. */
      if (Math.abs(y - last) < 8) return;
      setAway(y > last && y > 160);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The menu covers the page; the page should not scroll underneath it. */
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5">
      <div
        className="island pointer-events-auto flex h-[3.25rem] w-full items-center rounded-full pl-5 pr-1.5 sm:w-auto"
        data-away={away && !open}
      >
        <Link href="/" className="group mr-3 text-[15px] font-[540] tracking-[-0.02em] text-hi sm:mr-6">
          Kyre
          <span className="inline-block text-accent transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5">
            .
          </span>
        </Link>

        <nav className="hidden items-center text-[13px] sm:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-muted transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.045] hover:text-hi"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button type="button" {...calAttrs} className="cta cta-sm cta-solid ml-3 hidden sm:inline-flex">
          Book a call
          <Arrow />
        </button>

        <button
          type="button"
          className="burger ml-auto cursor-pointer rounded-full sm:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className="menu pointer-events-auto sm:hidden" data-open={open} aria-hidden={!open}>
        {LINKS.map((l, i) => (
          <div key={l.label} className="menu-row" style={{ ["--i" as string]: i }}>
            <a href={l.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          </div>
        ))}
        <div className="menu-row mt-8" style={{ ["--i" as string]: LINKS.length }}>
          <div>
            <button
              type="button"
              {...calAttrs}
              tabIndex={open ? 0 : -1}
              className="cta cta-solid"
              onClick={() => setOpen(false)}
            >
              Book a call
              <Arrow />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* The page ends on the offer, in the largest type below the hero, inside the
   one panel that is lit from within. Then two lines of housekeeping. */
export function SiteFooter() {
  return (
    <footer className="px-4 pb-10 pt-8 sm:px-6">
      <div className="bezel mx-auto max-w-[76rem]">
        <div className="bezel-core px-6 py-24 text-center sm:px-12 sm:py-32">
          <span className="outro-glow" aria-hidden />
          <div className="relative">
            <p className="eyebrow">The free teardown</p>
            <h2 className="display mx-auto mt-8 max-w-[18ch]">
              Send us the screen you&apos;ve stopped <span className="serif">seeing</span>.
            </h2>
            <p className="lede mx-auto mt-7 max-w-[30rem]">
              We record a new user meeting it cold and time how long the thing
              that matters stays invisible. You keep the recording whether or
              not you hire us.
            </p>
            <div className="mt-11 flex flex-wrap justify-center gap-3">
              <button type="button" {...calAttrs} className="cta cta-solid">
                Book a 15-min call
                <Arrow />
              </button>
              <a href="mailto:aditya@trykyre.com" className="cta cta-ghost">
                aditya@trykyre.com
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-9 flex max-w-[76rem] flex-col gap-3 px-2 text-[13px] text-[#7a736c] sm:flex-row sm:items-center sm:justify-between">
        {/* No year. This is a static export, so a build-time year and a
            client-time year disagree the moment January arrives, and the price
            of that is a hydration mismatch in exchange for nothing. */}
        <p>
          <span className="font-[540] text-hi">
            Kyre<span className="text-accent">.</span>
          </span>{" "}
          Interface rebuilds, deployed in five days.
        </p>
        <nav className="flex items-center gap-5">
          <Link href="/terms" className="transition-colors duration-500 hover:text-hi">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors duration-500 hover:text-hi">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
