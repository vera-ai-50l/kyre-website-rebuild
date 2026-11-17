"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { Arrow, Logo } from "./bits";
import { Hero } from "./Hero";
import { Approach, Faq, How, Offers, Paths, Sample, Team, Teardown, Trust, Why } from "./Sections";
import { useLite } from "./useLite";
import ui from "./site.module.css";

const LINKS = [
  ["#how", "How it works"],
  ["#offers", "Offers"],
  ["#approach", "Approach"],
  ["#sample", "Sample"],
  ["#team", "Team"],
  ["#faq", "FAQ"],
];

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
    <div className={ui.root}>
      <Nav />
      <Hero />
      <main>
        <Paths />
        <Why />
        <How />
        <Offers />
        <Approach />
        <Trust />
        <Sample />
        <Team />
        <Faq />
        <Teardown />
      </main>
      <Footer />
    </div>
  );
}
