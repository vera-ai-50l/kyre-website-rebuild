"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Arrow, Logo } from "./bits";
import { Hero } from "./Hero";
import { Concept } from "./Concept";
import { Approach, Faq, How, Offers, Paths, Rebuilds, Sample, Team, Teardown, Trust, Why } from "./Sections";
import { MotionRoot } from "./motion";
import { THEME_EVENT, useLite } from "./useLite";
import ui from "./site.module.css";

const LINKS = [
  ["#rebuilds", "Rebuilds"],
  ["#team", "Team"],
  ["#how", "How it works"],
  ["#offers", "Offers"],
  ["#approach", "Approach"],
  ["#sample", "Sample"],
  ["#concept", "Concept"],
  ["#faq", "FAQ"],
];

/* Dark or light. The page starts dark (app/layout.tsx sets data-theme before
   first paint); the choice is remembered for the next visit. */
const onTheme = (cb: () => void) => {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
};
function ThemeButton() {
  const dark = useSyncExternalStore(
    onTheme,
    () => document.documentElement.dataset.theme !== "light",
    () => true,
  );
  const flip = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("kyre-theme", next);
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT));
  };
  return (
    <button
      type="button"
      className={ui.themeBtn}
      onClick={flip}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      {dark ? (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
          <circle cx="10" cy="10" r="3.6" />
          <path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
          <path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7z" />
        </svg>
      )}
    </button>
  );
}

/* An island, not a bar: it floats clear of the top edge, leaves on the way down
   the page so the scene has the whole frame, and is back the moment the reader
   turns round. */
function Nav() {
  const [open, setOpen] = useState(false);
  const [away, setAway] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setAway(y > last && y > 160);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={ui.nav}>
      <div className={ui.island} data-away={(away && !open) || undefined}>
        <a href="#" className={ui.mark} aria-label="Kyre, back to top">
          <Logo />
        </a>
        <nav className={ui.links} aria-label="Sections">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a href="#teardown" className={`${ui.btn} ${ui.btnSm} ${ui.navCta}`}>
          Free teardown
          <Arrow />
        </a>
        <button
          type="button"
          className={ui.burger}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
        <ThemeButton />
      </div>

      <div className={ui.menu} data-open={open || undefined} inert={!open}>
        {LINKS.map(([href, label], i) => (
          <a key={href} href={href} style={{ "--i": i } as CSSProperties} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <a
          href="#teardown"
          className={ui.btn}
          style={{ "--i": LINKS.length } as CSSProperties}
          onClick={() => setOpen(false)}
        >
          Get a free teardown
          <Arrow />
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className={ui.footer}>
      <div className={ui.wrap}>
        <div className={ui.footTop}>
          <p className={ui.footMark}>
            <Logo />
          </p>
          <p className={ui.footLine}>The first real redesign after AI built your product.</p>
        </div>
        <div className={ui.footRow}>
          <nav aria-label="Footer">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
          <p>
            Marlo is a fictional product. The sample screens and the sample teardown on this page are illustrative, not
            client work.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Site() {
  useLite();
  return (
    <MotionRoot>
    <div className={ui.root}>
      <Nav />
      <Hero />
      <main>
        <Rebuilds />
        <Paths />
        <Team />
        <Why />
        <How />
        <Offers />
        <Approach />
        <Trust />
        <Sample />
        <Concept />
        <Faq />
        <Teardown />
      </main>
      <Footer />
    </div>
    </MotionRoot>
  );
}
