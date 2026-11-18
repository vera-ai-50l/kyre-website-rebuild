"use client";

import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Reveal } from "../bits";
import { useScrollProgress } from "../useScrollProgress";
import { Arrow } from "./bits";
import { CONTACT, STUDIO } from "./brand";
import { Funnel, FUNNEL_COPY } from "./Funnel";
import ui from "./site.module.css";

/* Everything under the hero. Each section carries one small moving figure of
   the thing it describes; all of them are CSS on a loop, so nothing here costs
   a frame of JavaScript after the reveal that brings it in. */

const v = (o: Record<string, string | number>) => o as CSSProperties;

function Check() {
  return (
    <svg className={ui.check} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 8.4l2.9 2.9 6.1-6.6" />
    </svg>
  );
}

function Head({ tag, children, lede, light }: { tag: string; children: ReactNode; lede?: string; light?: boolean }) {
  return (
    <Reveal className={ui.head}>
      <p className={`${ui.eyebrow} ${light ? ui.eyebrowInk : ""}`}>
        <i />
        {tag}
      </p>
      <h2 className={ui.h2}>{children}</h2>
      {lede && <p className={ui.lede}>{lede}</p>}
    </Reveal>
  );
}

/* ---- 1. two ways in --------------------------------------------------------- */

const SCREENS = ["Landing", "Sign-up", "Onboarding", "Dashboard", "Pricing"];

export function Paths() {
  return (
    <section className={ui.section} id="paths">
      <div className={ui.wrap}>
        <Head tag="Two ways in">
          Pick the one that <span>sounds like you.</span>
        </Head>
        <div className={ui.paths}>
          <Reveal className={ui.shell}>
            <article className={`${ui.core} ${ui.path}`}>
              <div className={ui.pathFig} aria-hidden>
                <div className={ui.flip}>
                  {SCREENS.map((n, i) => (
                    <div key={n} className={ui.flipItem} style={v({ "--i": i })}>
                      <div className={ui.flipCard}>
                        <span className={ui.flipOld}>
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className={ui.flipNew}>
                          <i />
                          <i />
                          <i />
                        </span>
                      </div>
                      <em>{n}</em>
                    </div>
                  ))}
                </div>
              </div>
              <div className={ui.pathBody}>
                <p className={ui.kicker}>AI-built app</p>
                <h3 className={ui.pathTitle}>&ldquo;I built my app with AI.&rdquo;</h3>
                <p className={ui.pathText}>
                  5 key screens redesigned in your brand, accessibility and a security check, shipped as a pull request
                  in 7 days.
                </p>
                <p className={ui.pathMeta}>Lovable · Bolt · v0 · Replit · Base44</p>
                <a href="#teardown" className={ui.btn}>
                  Get my free app teardown
                  <Arrow />
                </a>
              </div>
            </article>
          </Reveal>

          <Reveal className={`${ui.shell} ${ui.shellInk}`} delay={120}>
            <article className={`${ui.core} ${ui.coreInk} ${ui.path}`}>
              <div className={ui.pathFig} aria-hidden>
                <div className={ui.kit}>
                  <div className={ui.kitChart} style={v({ "--dx": "-2.4rem", "--dy": "-1.2rem", "--dr": "-7deg", "--i": 0 })}>
                    <em>Chart</em>
                    <span>
                      {[0.42, 0.66, 0.5, 0.82, 0.7, 1].map((h, i) => (
                        <i key={i} style={v({ "--h": h, "--b": i })} />
                      ))}
                    </span>
                  </div>
                  <div className={ui.kitTable} style={v({ "--dx": "2.6rem", "--dy": "-1.6rem", "--dr": "6deg", "--i": 1 })}>
                    <em>Table</em>
                    {[0, 1, 2, 3].map((r) => (
                      <span key={r}>
                        <i />
                        <i />
                        <i />
                      </span>
                    ))}
                  </div>
                  <div className={ui.kitEmpty} style={v({ "--dx": "0.6rem", "--dy": "2.2rem", "--dr": "-4deg", "--i": 2 })}>
                    <em>Empty state</em>
                    <span>
                      <i />
                      <b />
                      <b />
                    </span>
                  </div>
                </div>
              </div>
              <div className={ui.pathBody}>
                <p className={ui.kicker}>Funded AI SaaS</p>
                <h3 className={ui.pathTitle}>&ldquo;We raised, and our dashboard is the bottleneck.&rdquo;</h3>
                <p className={ui.pathText}>
                  One core dashboard plus a reusable chart and table kit, shipped to your repo in about 2 weeks.
                </p>
                <p className={ui.pathMeta}>Seed · Series A</p>
                <a href="#teardown" className={`${ui.btn} ${ui.btnLight}`}>
                  Get my free dashboard teardown
                  <Arrow />
                </a>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---- 2. why the interface is the bottleneck ---------------------------------- */

const SAY =
  "AI got you a working product in a weekend. It also gave you the same interface it gave everyone else. People decide whether to trust it before they find out what it does.".split(
    " ",
  );

const SIGNS_A = ["Users say it looks generic", "Churn after the first session", "About to raise", "A security scare"];
const SIGNS_B = ["Just raised", "Activation has plateaued", "Demos stall at the dashboard", "An open product designer role"];

function Marquee({ items, back }: { items: string[]; back?: boolean }) {
  return (
    <div className={ui.mq} data-back={back || undefined}>
      {[0, 1, 2].map((k) => (
        <div key={k} className={ui.mqRow} aria-hidden={k > 0 || undefined}>
          {items.map((t) => (
            <span key={t} className={ui.sign}>
              <i />
              {t}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Why() {
  const say = useScrollProgress<HTMLParagraphElement>(undefined, "through");
  const [fixed, setFixed] = useState(false);
  const copy = fixed ? FUNNEL_COPY.fixed : FUNNEL_COPY.leaking;
  return (
    <section className={ui.section} id="why">
      <div className={ui.wrap}>
        <Reveal>
          <p className={ui.eyebrow}>
            <i />
            Why your interface is the bottleneck
          </p>
        </Reveal>
        <p ref={say} className={ui.say} style={v({ "--n": SAY.length })}>
          {SAY.map((w, i) => (
            <span key={i} style={v({ "--i": i })}>
              {w}{" "}
            </span>
          ))}
        </p>

        <div className={ui.bento}>
          <Reveal className={`${ui.shell} ${ui.bentoBig}`}>
            <article className={`${ui.core} ${ui.cell}`}>
              <Funnel fixed={fixed} onToggle={() => setFixed((f) => !f)} />
              <div className={ui.cellText} aria-live="polite">
                <h3>{copy.h}</h3>
                <p>{copy.p}</p>
                <span className={ui.fine}>Illustration, not data</span>
              </div>
            </article>
          </Reveal>

          <Reveal className={ui.shell} delay={100}>
            <article className={`${ui.core} ${ui.cell}`}>
              <div className={ui.same} aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={v({ "--i": i })}>
                    <i />
                    <b />
                    <b />
                    <b />
                    <u />
                    <em>same</em>
                  </span>
                ))}
              </div>
              <div className={ui.cellText}>
                <h3>It reads as a template.</h3>
                <p>Same gradient, same four tiles, same greeting. Users say it looks generic because it is.</p>
              </div>
            </article>
          </Reveal>

          <Reveal className={ui.shell} delay={200}>
            <article className={`${ui.core} ${ui.cell}`}>
              <div className={ui.gaze} aria-hidden>
                {["12,847", "94.2%", "1.2s", "3,429"].map((n) => (
                  <span key={n}>
                    <i />
                    {n}
                  </span>
                ))}
                <b />
              </div>
              <div className={ui.cellText}>
                <h3>Nothing says where to look.</h3>
                <p>Every number carries the same weight, so the one that matters hides in plain sight.</p>
              </div>
            </article>
          </Reveal>
        </div>

        <Reveal className={ui.signs}>
          <p className={ui.signsLabel}>When it usually comes up</p>
          <Marquee items={SIGNS_A} />
          <Marquee items={SIGNS_B} back />
        </Reveal>
      </div>
    </section>
  );
}

/* ---- 3. how it works ---------------------------------------------------------- */

function FigTeardown() {
  return (
    <div className={ui.fig} aria-hidden>
      <div className={ui.sheet}>
        <p className={ui.sheetHead}>
          <span>Teardown</span>
          <em>your-product.com</em>
        </p>
        <div className={ui.shot}>
          <i />
          <span />
          <span />
          <span />
          {[0, 1, 2].map((i) => (
            <b key={i} className={ui.pin} style={v({ "--i": i + 1 })}>
              {i + 1}
            </b>
          ))}
        </div>
        <p className={ui.sheetRow} style={v({ "--i": 0 })}>
          <Check />
          <span style={v({ "--w": "58%" })} />
        </p>
        {[72, 64, 80].map((w, i) => (
          <p key={w} className={ui.sheetRow} style={v({ "--i": i + 1 })}>
            <b>{i + 1}</b>
            <span style={v({ "--w": `${w}%` })} />
          </p>
        ))}
      </div>
    </div>
  );
}

function FigScope() {
  return (
    <div className={ui.fig} aria-hidden>
      <div className={ui.sheet}>
        <p className={ui.sheetHead}>
          <span>Scope</span>
          <em>agreed before work starts</em>
        </p>
        <div className={ui.chips}>
          {SCREENS.map((n, i) => (
            <span key={n} className={ui.chip} style={v({ "--i": i })}>
              <Check />
              {n}
            </span>
          ))}
        </div>
        <div className={ui.price}>
          <span>Price</span>
          <b>$1,500</b>
          <em>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden>
              <rect x="3.5" y="7" width="9" height="6.5" rx="1.6" />
              <path d="M5.6 7V5.2a2.4 2.4 0 0 1 4.8 0V7" />
            </svg>
            fixed
          </em>
        </div>
        <div className={ui.days}>
          <span className={ui.daysFill} />
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <i key={d}>D{d}</i>
          ))}
        </div>
      </div>
    </div>
  );
}

const DIFF = [
  ["-", "bg-gradient-to-r from-purple-500"],
  ["+", "<Metric lead value={resolved} />"],
  ["+", "<RankedList items={handoffs} />"],
  ["-", "<StatCard /> <StatCard /> <StatCard />"],
  ["+", "expect(signup).toHaveNoViolations()"],
];

function FigPull() {
  return (
    <div className={ui.fig} aria-hidden>
      <div className={`${ui.sheet} ${ui.pr}`}>
        <p className={ui.sheetHead}>
          <span>Redesign: five key screens</span>
          <em>redesign/key-screens → main</em>
        </p>
        <div className={ui.diff}>
          {DIFF.map(([s, t], i) => (
            <p key={t} data-s={s} style={v({ "--i": i })}>
              <b>{s}</b>
              {t}
            </p>
          ))}
        </div>
        <div className={ui.checks}>
          {["tests", "accessibility", "security check"].map((c, i) => (
            <span key={c} style={v({ "--i": i })}>
              <i>
                <Check />
              </i>
              {c}
            </span>
          ))}
        </div>
        <div className={ui.merge}>
          <span>Merge pull request</span>
          <b>
            <Check />
            Merged
          </b>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "A free teardown",
    text: "Send your URL. You get back a genuine strength, three fixable wins and a before/after mock of one screen.",
    meta: "Free. No call.",
    fig: <FigTeardown />,
  },
  {
    n: "02",
    title: "A fixed-price redesign",
    text: "If the teardown is useful, pick a package. Scope and price are set before any work starts. Nothing is billed by the hour.",
    meta: "One scope. One price.",
    fig: <FigScope />,
  },
  {
    n: "03",
    title: "A pull request in your repo",
    text: "The redesign arrives as code in your own stack, with tests. Review it, merge it, ship it. Then watch the number it was built to move.",
    meta: "7 days, or about 2 weeks.",
    fig: <FigPull />,
  },
];

export function How() {
  return (
    <section className={`${ui.section} ${ui.dark}`} id="how">
      <div className={ui.wrap}>
        <Head tag="How it works" light>
          Teardown. Fixed price.
          <br />
          <span>Pull request.</span>
        </Head>
        <div className={ui.steps}>
          {STEPS.map((s, i) => (
            <div key={s.n} className={ui.step} style={v({ "--i": i })}>
              <Reveal className={`${ui.shell} ${ui.shellDark}`}>
                <article className={`${ui.core} ${ui.coreDark} ${ui.stepCore}`}>
                  <div className={ui.stepText}>
                    <span className={ui.stepN}>{s.n}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    <em>{s.meta}</em>
                  </div>
                  {s.fig}
                </article>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- 4. the two offers --------------------------------------------------------- */

const OFFERS = [
  {
    name: "AI App Glow-Up",
    who: "For AI-built apps with paying users",
    price: "$1,500",
    when: "Pull request in 7 days",
    scope: [
      "5 key screens: landing, sign-up, onboarding, main dashboard, pricing",
      "Redesigned in your brand",
      "Accessibility pass and a security check",
      "Shipped as a pull request, with tests",
    ],
    judged: ["Sign-up conversion", "Trial-to-paid conversion"],
    ticks: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    cta: "Get my free app teardown",
  },
  {
    name: "Dashboard Sprint",
    who: "For seed and Series A AI SaaS",
    price: "$6,000–9,000",
    when: "Pull request in about 2 weeks",
    scope: [
      "One core dashboard, redesigned",
      "A reusable kit: charts, tables, empty states",
      "Shipped to your repo, with tests",
    ],
    judged: ["Time-to-answer", "Demo-to-close", "Weekly active use"],
    ticks: ["Week 1", "Week 2"],
    cta: "Get my free dashboard teardown",
  },
];

export function Offers() {
  return (
    <section className={ui.section} id="offers">
      <div className={ui.wrap}>
        <Head
          tag="Two fixed packages"
          lede="No hourly billing and no open-ended retainers. You know the scope, the price and the number it is judged on before any work starts."
        >
          One scope. One price.
          <br />
          <span>One number to move.</span>
        </Head>
        <div className={ui.offers}>
          {OFFERS.map((o, i) => (
            <Reveal key={o.name} className={ui.shell} delay={i * 120}>
              <article className={`${ui.core} ${ui.offer}`}>
                <header>
                  <p className={ui.kicker}>{o.who}</p>
                  <h3>{o.name}</h3>
                </header>
                <div className={ui.offerPrice}>
                  <b>{o.price}</b>
                  <span>fixed</span>
                </div>
                <div className={ui.tl}>
                  <span className={ui.tlFill} />
                  {o.ticks.map((t) => (
                    <i key={t}>{t}</i>
                  ))}
                  <em>
                    <Check />
                    PR
                  </em>
                </div>
                <p className={ui.offerWhen}>{o.when}</p>
                <ul className={ui.scope}>
                  {o.scope.map((t) => (
                    <li key={t}>
                      <Check />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className={ui.judged}>
                  <span>Judged on</span>
                  {o.judged.map((j) => (
                    <b key={j}>{j}</b>
                  ))}
                </div>
                <a href="#teardown" className={`${ui.btn} ${i ? ui.btnGhost : ""}`}>
                  {o.cta}
                  <Arrow />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className={ui.context}>
            For context: rescue builds in this market run $13,000–25,000+, and agencies sit near $25,000.
            <span>Market ranges from a November 2026 scan of public pricing.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---- 5. why not a design agency -------------------------------------------------- */

const COLS = ["Design agency", "Code-rescue shop", "AI builder", STUDIO];
const ROWS: [string, string[]][] = [
  ["Sells", ["Taste, brand, mockups", "Security, refactoring, “production-ready”", "The first version", "A measured redesign, in code"]],
  ["Pricing", ["Hourly, bespoke", "$1,000 audit to $120,000+ rebuild", "Subscription", "Fixed per package"]],
  ["Speed", ["Months", "Weeks to months", "Minutes", "7 days, or about 2 weeks"]],
  ["Hands over", ["A Figma file", "Fixed backend and security", "A running app that looks generic", "A pull request in your repo"]],
  ["Judged on", ["How it looks", "Does it break", "Did it build", "Does the number move"]],
];

export function Approach() {
  return (
    <section className={ui.section} id="approach">
      <div className={ui.wrap}>
        <Head tag="Why not a design agency">
          Four ways to fix it.
          <br />
          <span>One is judged on the number.</span>
        </Head>
        <span className={ui.swipe} aria-hidden>
          Swipe to compare
        </span>
        <Reveal className={ui.shell}>
          <div className={`${ui.core} ${ui.tableWrap}`} tabIndex={0} role="region" aria-label="Comparison table">
            <table className={ui.table}>
              <thead>
                <tr>
                  <td />
                  {COLS.map((c, i) => (
                    <th key={c} scope="col" data-us={i === 3 || undefined}>
                      {c}
                      {i === 2 && <small>Lovable, Bolt</small>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, cells]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {cells.map((c, i) => (
                      <td key={c} data-us={i === 3 || undefined}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <p className={ui.footnote}>
          Agency, rescue-shop and builder rows describe the market as a whole, from a November 2026 scan of public
          pricing. They are not quotes from any named firm.
        </p>
      </div>
    </section>
  );
}

/* ---- 6. accessibility and security ------------------------------------------------ */

const SECURITY = [
  "Secrets kept out of client code",
  "Auth on the routes that need it",
  "Access rules on your data",
  "Dependencies with known issues",
];

export function Trust() {
  return (
    <section className={ui.section} id="trust">
      <div className={ui.wrap}>
        <Head tag="Accessibility and security">
          Checked <span>before it ships.</span>
        </Head>
        <div className={ui.trust}>
          <Reveal className={ui.shell}>
            <article className={`${ui.core} ${ui.cell}`}>
              <div className={ui.a11y} aria-hidden>
                <div className={ui.a11yForm}>
                  <span />
                  <span />
                  <b>Continue</b>
                  <i />
                </div>
                <div className={ui.ratio}>
                  <span>
                    <b>Aa</b>
                    <em>2.1:1</em>
                  </span>
                  <span>
                    <b>Aa</b>
                    <em>7.4:1</em>
                  </span>
                </div>
              </div>
              <div className={ui.cellText}>
                <h3>Accessible by default.</h3>
                <p>
                  Contrast, focus states, keyboard paths and labels are part of the redesign, not a line item added
                  later.
                </p>
                <span className={ui.fine}>Illustrative values</span>
              </div>
            </article>
          </Reveal>
          <Reveal className={`${ui.shell} ${ui.shellInk}`} delay={120}>
            <article className={`${ui.core} ${ui.coreInk} ${ui.cell}`}>
              <ul className={ui.sec}>
                {SECURITY.map((t, i) => (
                  <li key={t} style={v({ "--i": i })}>
                    <i>
                      <Check />
                    </i>
                    {t}
                  </li>
                ))}
              </ul>
              <div className={ui.cellText}>
                <h3>A security check on what AI left open.</h3>
                <p>
                  AI builders ship fast and leave doors open. The common ones are checked, and what is found is written
                  up in the pull request.
                </p>
                <span className={ui.fine}>A check, not a penetration test</span>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---- 7. sample teardown ------------------------------------------------------------- */

const WINS = [
  ["Ask for one thing first.", "Sign-up wants seven fields before it shows anything. Ask for an email, show the product, collect the rest later."],
  ["Lead with one number.", "The dashboard gives four numbers equal weight. Put the one the business runs on first."],
  ["Say who each plan is for.", "Pricing lists features in three columns. Name the customer for each plan, then the difference."],
];

function SignupBefore() {
  return (
    <div className={ui.suOld}>
      <p>Create Your Account ✨</p>
      <small>Join thousands of teams supercharging their support!</small>
      {["Full Name", "Work Email", "Company", "Team Size", "Role", "Password", "Confirm Password"].map((f) => (
        <span key={f}>{f}</span>
      ))}
      <b>Get Started Free 🚀</b>
    </div>
  );
}

function SignupAfter() {
  return (
    <div className={ui.suNew}>
      <em>marlo</em>
      <p>See what your agent resolves on its own.</p>
      <small>Start with your work email. No card.</small>
      <span>you@company.com</span>
      <b>Continue</b>
      <u>Or look around with sample data</u>
    </div>
  );
}

export function Sample() {
  return (
    <section className={ui.section} id="sample">
      <div className={ui.wrap}>
        <Head
          tag="Sample teardown"
          lede="This is the shape of what you get back. Marlo is a fictional product, used here so nothing is passed off as client work."
        >
          What lands <span>in your inbox.</span>
        </Head>
        <Reveal className={ui.shell}>
          <article className={`${ui.core} ${ui.td}`}>
            <header className={ui.tdHead}>
              <span>Teardown · marlo.example</span>
              <b>Sample. Fictional product, not a client.</b>
            </header>
            <div className={ui.tdBody}>
              <div className={ui.tdNotes}>
                <p className={ui.kicker}>Already working</p>
                <p className={ui.tdGood}>
                  The product does one thing and says so. The value is clear in the first sentence of the landing page.
                </p>
                <p className={ui.kicker}>Three wins</p>
                <ol className={ui.wins}>
                  {WINS.map(([h, t], i) => (
                    <li key={h}>
                      <i>{i + 1}</i>
                      <span>
                        <b>{h}</b> {t}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className={ui.tdShot}>
                <p className={ui.kicker}>Before and after, one screen: sign-up</p>
                <div className={ui.cmp} style={v({ "--x": 50 })}>
                  <div className={ui.cmpSide}>
                    <SignupAfter />
                  </div>
                  <div className={`${ui.cmpSide} ${ui.cmpTop}`}>
                    <SignupBefore />
                  </div>
                  <span className={ui.cmpTag}>Before</span>
                  <span className={`${ui.cmpTag} ${ui.cmpTagR}`}>After</span>
                  <span className={ui.cmpBar}>
                    <i />
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={50}
                    aria-label="Drag to compare the sign-up screen before and after"
                    onInput={(e) => e.currentTarget.parentElement?.style.setProperty("--x", e.currentTarget.value)}
                  />
                </div>
                <span className={ui.fine}>Drag to compare</span>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

/* ---- the team --------------------------------------------------------------------------- */

/* Carried over from the first site: the same three people, photos and links. */
const TEAM = [
  { name: "Rishiraj Nath", school: "IIM Calcutta", photo: "/team/rishiraj-nath.webp", href: "https://www.linkedin.com/in/rishiraj-nath-964a29292/" },
  { name: "Shivam Vatkar", school: "IIM Calcutta", photo: "/team/shivam-vatkar.webp", href: "https://www.linkedin.com/in/shivam-vatkar-a29405281/" },
  { name: "Aditya Bhagat", school: "IIM Indore", photo: "/team/aditya-bhagat.webp", href: "https://www.linkedin.com/in/aditya-bhagat-3949073b1/" },
];

function LinkedIn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

export function Team() {
  return (
    <section className={ui.section} id="team">
      <div className={ui.wrap}>
        <Head tag="The team">
          Meet the team. <span>Kyre is run by its founders.</span>
        </Head>
        <div className={ui.people}>
          {TEAM.map((p, i) => (
            <Reveal key={p.name} delay={i * 90} className={ui.shell}>
              <div className={ui.core}>
                <a
                  className={ui.person}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.name} on LinkedIn (opens in a new tab)`}
                >
                  <span className={ui.photo}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- static export: next/image cannot optimise here, and these are already sized webp */}
                    <img src={p.photo} alt={p.name} width={512} height={640} loading="lazy" decoding="async" />
                    <span className={ui.liBadge}>
                      <LinkedIn />
                    </span>
                  </span>
                  <span className={ui.who}>
                    <b>{p.name}</b>
                    <span>{p.school}</span>
                  </span>
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- 8. FAQ --------------------------------------------------------------------------- */

const FAQ = [
  [
    "Is this automated?",
    "No. A person does the teardown and the redesign, and decides what to change and why. Tools speed up the production work; they do not make the calls.",
  ],
  [
    "Do you touch our backend?",
    "No. The work is the interface: screens, components and styles. Your data model, API and business logic stay as they are. If the security check finds a backend issue, it is flagged in the pull request for you to decide on.",
  ],
  [
    "What if we use Lovable or Bolt?",
    "That is who this is for. If the project is connected to a Git repository, the redesign lands there as a pull request, and you can keep building with your AI tool afterwards.",
  ],
  ["Do we own the code?", "Yes. It is in your repository, in your stack, and it is yours."],
];

export function Faq() {
  return (
    <section className={ui.section} id="faq">
      <div className={`${ui.wrap} ${ui.faq}`}>
        <Head tag="Questions">
          Asked <span>before the first email.</span>
        </Head>
        <div className={ui.faqList}>
          {FAQ.map(([q, a], i) => (
            <Reveal key={q} delay={i * 70}>
              <details className={ui.q} name="faq">
                <summary>
                  {q}
                  <i aria-hidden />
                </summary>
                <p>{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- 9. the teardown request ------------------------------------------------------------ */

const SHARDS = [
  "8,4 34,0 40,26 12,36",
  "2,6 30,0 22,40",
  "0,10 26,0 44,18 18,34",
  "6,0 36,8 28,38 0,26",
  "4,2 28,0 38,22 10,30",
];

export function Teardown() {
  /* ponytail: mailto, because a static export has no server to post to. Swap
     for a form endpoint when there is one; the fields are already named. */
  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = `Product: ${f.get("url")}\nType: ${f.get("kind")}\nReply to: ${f.get("email")}`;
    window.location.href = `mailto:${CONTACT}?subject=${encodeURIComponent("Free teardown request")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className={`${ui.section} ${ui.last}`} id="teardown">
      <div className={ui.wrap}>
        <Reveal className={`${ui.shell} ${ui.shellInk}`}>
          <div className={`${ui.core} ${ui.coreInk} ${ui.cta}`}>
            <div className={ui.ctaField} aria-hidden>
              {SHARDS.map((p, i) => (
                <svg key={p} viewBox="0 0 44 40" style={v({ "--i": i })}>
                  <polygon points={p} />
                </svg>
              ))}
            </div>
            <div className={ui.ctaText}>
              <p className={`${ui.eyebrow} ${ui.eyebrowInk}`}>
                <i />
                Free teardown
              </p>
              <h2 className={ui.h2}>
                See what a redesign would change. <span>Before you pay for one.</span>
              </h2>
              <p className={ui.lede}>
                Send your URL. You get a genuine strength, three fixable wins and a before/after of one screen.
              </p>
            </div>
            <form className={ui.form} onSubmit={send}>
              <label className={ui.field}>
                <span>Product URL</span>
                <input name="url" type="text" inputMode="url" autoComplete="url" placeholder="your-product.com" required />
              </label>
              <fieldset className={ui.seg}>
                <legend>What is it</legend>
                <label>
                  <input type="radio" name="kind" value="AI-built app" defaultChecked />
                  <span>An AI-built app</span>
                </label>
                <label>
                  <input type="radio" name="kind" value="SaaS dashboard" />
                  <span>A SaaS dashboard</span>
                </label>
              </fieldset>
              <label className={ui.field}>
                <span>Where to send it</span>
                <input name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
              </label>
              <button type="submit" className={`${ui.btn} ${ui.btnLight} ${ui.formBtn}`}>
                Get a free teardown
                <Arrow />
              </button>
              <p className={ui.formNote}>No call, no pitch. This opens your email app with the request filled in.</p>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
