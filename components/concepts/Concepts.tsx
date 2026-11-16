"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { Reveal } from "../bits";
import { CalLoader, calAttrs } from "../cal";
import { Arrow } from "../chrome";
import { Blind } from "./Blind";
import { GlowUp } from "./GlowUp";
import { Signal } from "./Signal";
import s from "./concepts.module.css";

/* Three heroes for three buyers, on one page so they can be judged against
   each other. Each is one idea, one interaction and its own art direction:
   they share a nav, an offer block and nothing else.

   Which one is showing lives in the URL hash, so a link to /concepts#blind
   opens on that hero and the back button walks between them. */

type Id = "glow" | "signal" | "blind";

const HEROES: {
  id: Id;
  label: string;
  offer: string;
  price: string;
  priceNote: string;
  time: string;
  items: [string, string][];
  hook: string;
  cta: string;
}[] = [
  {
    id: "glow",
    label: "Glow-Up",
    offer: "AI App Glow-Up",
    price: "$1,500",
    priceNote: "fixed",
    time: "7 days",
    items: [
      ["Five screens", "The ones your paying users open most, redesigned in your codebase."],
      ["Accessibility fixes", "Contrast, focus states, labels and keyboard paths on those screens."],
      ["A security check", "A pass over the app for the obvious holes, written up plainly."],
      ["One pull request", "Reviewable, in your stack. Merge it or argue with it."],
    ],
    hook: "Start free: send the app, get a 3-minute video teardown back.",
    cta: "Get the free teardown",
  },
  {
    id: "signal",
    label: "Signal",
    offer: "Dashboard Sprint",
    price: "$6,000 to $9,000",
    priceNote: "by scope",
    time: "2 weeks",
    items: [
      ["One dashboard", "Your most-used one, rebuilt around the decision it exists for."],
      ["The component kit", "The tables, charts, filters and states it is made of. Yours to reuse."],
      ["In your repo", "A pull request against your codebase, not a file of mockups."],
      ["Every state", "Loading, empty, error and dense, designed instead of left to chance."],
    ],
    hook: "Start with a 15-minute call and the screen you like least.",
    cta: "Book a sprint call",
  },
  {
    id: "blind",
    label: "Shop it blind",
    offer: "Accessibility + Conversion Fix",
    price: "$2,500 to $4,000",
    priceNote: "fixed",
    time: "+ $300 a month monitoring",
    items: [
      ["An audit you can read", "What is blocking shoppers, ranked by how many it blocks."],
      ["Fixes in your theme", "Contrast, labels, focus, alt text and keyboard paths, shipped."],
      ["The checkout path", "Product page to payment, walked with a keyboard and a screen reader."],
      ["Monitoring", "Monthly re-checks, because themes and apps drift."],
    ],
    hook: "Not legal advice. We fix the store; your counsel covers the law.",
    cta: "Book a 15-min call",
  },
];

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => window.location.hash.slice(1);

function go(id: Id) {
  history.replaceState(null, "", `#${id}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  window.scrollTo({ top: 0 });
}

export function Concepts() {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const hero = HEROES.find((h) => h.id === hash) ?? HEROES[0];

  /* 1, 2, 3 switch heroes, for flicking between them in a review. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as Element).closest("input, textarea, [contenteditable]")) return;
      const h = HEROES[Number(e.key) - 1];
      if (h) go(h.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={s.page} data-hero={hero.id}>
      <CalLoader />
      <header className={s.nav}>
        <div className={s.island}>
          <Link href="/" className={s.brand}>
            Kyre<span>.</span>
          </Link>
          <div className={s.tabs} role="tablist" aria-label="Hero concept">
            {HEROES.map((h, i) => (
              <button
                key={h.id}
                type="button"
                role="tab"
                aria-selected={hero.id === h.id}
                className={s.tab}
                onClick={() => go(h.id)}
              >
                <b>0{i + 1}</b>
                <span>{h.label}</span>
              </button>
            ))}
          </div>
          <button type="button" {...calAttrs} className={`cta cta-sm ${s.ctaAcc} ${s.navCta}`}>
            Book a call
            <Arrow />
          </button>
        </div>
      </header>

      <main>
        {hero.id === "glow" && <GlowUp key="glow" />}
        {hero.id === "signal" && <Signal key="signal" />}
        {hero.id === "blind" && <Blind key="blind" />}

        <section id="offer" key={`offer-${hero.id}`} className={s.offer}>
          <div className={s.offerIn}>
            <Reveal>
              <p className={s.tag}>The offer</p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className={s.offerH}>{hero.offer}</h2>
            </Reveal>

            <div className={s.bento}>
              <Reveal delay={140} className={s.cellWide}>
                <div className={s.shell}>
                  <ol className={s.core}>
                    {hero.items.map(([head, body], i) => (
                      <li key={head} className={s.item}>
                        <span>0{i + 1}</span>
                        <div>
                          <h3>{head}</h3>
                          <p>{body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
              <Reveal delay={230} className={s.cellNarrow}>
                <div className={s.shell}>
                  <div className={`${s.core} ${s.priceCard}`}>
                    <span className={s.priceGlow} aria-hidden />
                    <p className={s.priceLabel}>{hero.priceNote}</p>
                    <p className={s.priceBig}>{hero.price}</p>
                    <p className={s.priceTime}>{hero.time}</p>
                    <p className={s.priceHook}>{hero.hook}</p>
                    <button type="button" {...calAttrs} className={`cta ${s.ctaAcc}`}>
                      {hero.cta}
                      <Arrow />
                    </button>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className={s.foot}>
        <p>
          <b>
            Kyre<span>.</span>
          </b>{" "}
          Three hero directions, one per audience. Press 1, 2 or 3 to switch.
        </p>
        <Link href="/">Back to the main site</Link>
      </footer>
    </div>
  );
}
