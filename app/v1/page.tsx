import Link from "next/link";
import { Arrow, SiteFooter, SiteHeader } from "@/components/chrome";
/* Two heroes live in this repo. HeroReel is the scroll cinematic; Hero is the
   earlier tap-to-rebuild panel, kept whole and working in components/Hero.tsx.
   Swapping between them is this one import and the one tag below — see
   components/HERO-VARIANTS.md. */
import HeroReel from "@/components/HeroReel";
import { HowItWorks } from "@/components/HowItWorks";
import { FounderCard, Lit, Reveal } from "@/components/bits";

/* The shipped one. Everything below it is still a preview. */
const FEATURED = {
  tool: "Agnost AI",
  screen: "Marketing page + full console",
  line: "Agnost built product analytics for conversational agents. Here's the whole surface rebuilt: seven screens, a live events timeline you can scrub, and a demo that isn't 720px wide.",
  tags: ["analytics", "agents", "live"],
  href: "/agnost",
};

/* Teardown pages are parked in app/_teardowns (private folder = no route)
   until they're ready. Cards below are previews, not links. */
const REST = [
  {
    tool: "LangSmith",
    screen: "Traces view",
    line: "LangSmith solved the hardest problems in LLM observability. Here's how the trace table could match the depth of the tooling.",
    tags: ["observability", "traces", "latency"],
    wire: [72, 44, 58, 36],
    span: "md:col-span-5",
  },
  {
    tool: "OpenAI Platform",
    screen: "Request logs",
    line: "OpenAI put frontier models behind one clean API. Here's a request log that surfaces failures as fast as the API responds.",
    tags: ["logs", "usage", "errors"],
    wire: [52, 80, 40, 64],
    span: "md:col-span-7",
  },
  {
    tool: "Replicate",
    screen: "Predictions dashboard",
    line: "Replicate made running open models one line of code. Here's a predictions list with the same clarity as their CLI.",
    tags: ["predictions", "models", "runs"],
    wire: [64, 38, 76, 48],
    span: "md:col-span-7",
  },
];

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-edge px-2.5 py-1 font-mono text-[10px] tracking-[0.04em] text-[#8a837c]">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <HeroReel />

      <main className="relative flex-1">
        <div className="px-5 sm:px-6">
          <div className="mx-auto max-w-[76rem]">
            <HowItWorks />
          </div>
        </div>

        {/* ---- work ---------------------------------------------------------
            A bento, not a row of three. The shipped rebuild takes the whole
            first band and shows itself — two real captures, stacked and
            leaning — and the three in progress sit under it at uneven widths
            with the method note filling the last cell, so no two neighbours
            are the same size. */}
        <section id="teardowns" className="scroll-mt-28 px-5 py-28 sm:px-6 sm:py-40">
          <div className="mx-auto max-w-[76rem]">
            <Reveal>
              <p className="eyebrow">Selected work</p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="display mt-8 max-w-[16ch]">
                The same product, <span className="serif">executed</span>.
              </h2>
            </Reveal>
            <Reveal delay={170}>
              <p className="lede mt-7 max-w-[34rem]">
                Each teardown keeps the original layout, columns and information
                architecture. The rebuild changes execution only.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-12">
              <Reveal className="md:col-span-12">
                <Link href={FEATURED.href} className="bezel group block">
                  <div className="bezel-core grid items-center gap-10 p-7 sm:p-10 md:grid-cols-12 md:gap-6 md:p-14">
                    <div className="md:col-span-5">
                      <div className="flex items-center gap-2.5">
                        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-ok" />
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent/80">
                          Live · {FEATURED.screen}
                        </span>
                      </div>
                      <h3 className="mt-6 text-[clamp(2rem,3.6vw,3rem)] font-[540] tracking-[-0.035em]">
                        {FEATURED.tool}
                      </h3>
                      <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-muted">
                        {FEATURED.line}
                      </p>
                      <div className="mt-7 flex flex-wrap gap-1.5">
                        {FEATURED.tags.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                      <span className="cta cta-ghost mt-9">
                        View the rebuild
                        <Arrow />
                      </span>
                    </div>

                    <Lit className="stack md:col-span-7">
                      <div className="stack-tilt">
                        <div className="shot shot-back">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/work/agnost-events.jpg" alt="" loading="lazy" decoding="async" />
                        </div>
                        <div className="shot shot-front">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/work/agnost-console.jpg"
                            alt="The rebuilt Agnost console: intents ranked by failure, with cost and trend beside each"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>
                    </Lit>
                  </div>
                </Link>
              </Reveal>

              {REST.map((t, i) => (
                <Reveal key={t.tool} delay={(i % 2) * 90} className={t.span}>
                  <div className="bezel h-full">
                    <div className="bezel-core flex h-full flex-col p-7 sm:p-9">
                      <div className="wire" aria-hidden>
                        {t.wire.map((w, n) => (
                          <span key={n} style={{ ["--w" as string]: `${w}%` }} />
                        ))}
                      </div>
                      <div className="mt-7 flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8a837c]">
                          In progress · {t.screen}
                        </span>
                      </div>
                      <h3 className="mt-5 text-[1.75rem] font-[540] tracking-[-0.03em]">{t.tool}</h3>
                      <p className="mt-3 max-w-md flex-1 leading-relaxed text-muted">{t.line}</p>
                      <div className="mt-7 flex flex-wrap gap-1.5">
                        {t.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}

              {/* The rule every teardown is held to, in the cell a fourth card
                  would have gone in. */}
              <Reveal delay={90} className="md:col-span-5">
                <div className="flex h-full flex-col justify-end rounded-[2rem] border border-dashed border-edge2 p-8 sm:p-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent/80">
                    The rule
                  </p>
                  <p className="mt-5 text-[1.375rem] leading-[1.35] tracking-[-0.02em] text-hi">
                    Nothing is added. Hierarchy, status colour, real loading and
                    empty states — <span className="serif">only</span> the
                    execution moves.
                  </p>
                  <p className="mt-5 text-sm leading-relaxed text-muted">
                    Respect to the teams who built these tools; they solved the
                    hard problems first.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---- founders -----------------------------------------------------
            Split down the middle: the claim on the left at display size, the
            reasoning on the right at reading size. */}
        <section className="px-5 py-28 sm:px-6 sm:py-40">
          <div className="mx-auto grid max-w-[76rem] gap-14 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-6">
              <Reveal>
                <p className="eyebrow">From the founders</p>
              </Reveal>
              <Reveal delay={90}>
                <h2 className="display mt-8 max-w-[14ch]">
                  Brilliant models. Interfaces that look like{" "}
                  <span className="serif">internal tools</span>.
                </h2>
              </Reveal>
            </div>

            <div className="md:col-span-5 md:col-start-8 md:pt-16">
              <Reveal delay={120}>
                <div className="space-y-5 text-[1.0625rem] leading-[1.7] text-muted">
                  <p>
                    Same story at every AI startup we looked at. It&apos;s not a
                    taste problem. It&apos;s that the founders are engineers
                    who&apos;ve stared at the same screen for six months. You
                    stop seeing what a new user sees in five seconds. And
                    you&apos;re too deep in shipping to stop and fix the
                    surface.
                  </p>
                  <p>
                    That&apos;s where Kyre works. No Figma files rotting in a
                    backlog. We rebuild the actual screen, deployed, in five
                    days. The product ends up looking as considered as the
                    engineering under it.
                  </p>
                  <p>
                    Your engineers could build the color-coding and the states.
                    What we bring is different: the outside eye that knows what
                    matters on each screen, and the taste to make it feel like
                    the company you&apos;re becoming.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="mt-11 flex flex-col gap-6 border-t border-edge pt-9 sm:flex-row sm:gap-12">
                  <FounderCard
                    name="Aditya Bhagat"
                    role="Founder"
                    href="https://www.linkedin.com/in/aditya-bhagat-3949073b1/"
                    img="/founders/aditya.jpg"
                    initials="AB"
                  />
                  <FounderCard
                    name="Tithi Saxena"
                    role="Co-founder"
                    href="https://www.linkedin.com/in/tithi-saxena-31690b245/"
                    img="/founders/tithi.jpg"
                    initials="TS"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
