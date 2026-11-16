"use client";

import { Fragment, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import styles from "./reel.module.css";
import { CalLoader, calAttrs } from "./cal";
import { PLATES } from "./shatter/plates";
import type { Shatter } from "./shatter/scene";
import { useCursorGlow } from "./useCursorGlow";
import { useScrollProgress } from "./useScrollProgress";
import {
  AREA,
  BUDGET,
  BURN,
  CHART,
  LINE,
  PEAK,
  PEAK_AT,
  RUNS,
  TONE,
  arrow,
  cx,
  cy,
  scaleOf,
  trend,
  trendKind,
  usd,
  type Kind,
} from "./runs";

/* The hero is one camera move, cut into beats that do not overlap.

   Rest: the headline, and under it the dashboard lying back like a floor, only
   its far end in frame. Scroll and the copy leaves on its own, growing toward
   the lens, while the dashboard stands up and squares to the camera. Then it is
   struck — on the failing row — the cracks run outward and three callouts write
   themselves onto the exact places it fails, and it holds long enough to read
   them. Then it lets go, the camera goes through it, and the card lands.

   What arrives after is the rebuilt console, on glass, stood up from under the
   frame: rows sliding into their new order, bars growing out, glyphs drawing
   themselves, the chart line writing itself in.

   The old screen is the one WebGL object on the page (./shatter). Everything
   else — the copy, the callouts, the console that replaces it — is markup,
   driven by the same number. */

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;

/* ---- the annotations -----------------------------------------------------
   Anchors are percentages of the window's content area — the box below the
   title rail — and they are derived from the layout above, not eyeballed.

   The content area is a fixed column: app bar 11%, stat row 15%, table 58%,
   bottom panel 16%. So the table always runs 26%→84% however tall the window
   is, and a row's centre is arithmetic rather than a number that happened to
   look right at 1440px.

   The two states do not share that arithmetic, which is what had the callouts
   pointing at the wrong rows: broken has a column header eating 5% of the
   table, rebuilt has none. */
const BAR_H = 11;
const STATS_H = 15;
const TABLE_TOP = BAR_H + STATS_H; // 26
const TABLE_H = 58; // the remaining band above the 16% footer
const HEADER = TABLE_H * 0.05;

const STATS_MID = BAR_H + STATS_H / 2; // 18.5
const FOOT_MID = TABLE_TOP + TABLE_H + 8; // 92
const brokenRow = (n: number) => TABLE_TOP + HEADER + (n + 0.5) * ((TABLE_H - HEADER) / 8);
const fixedRow = (n: number) => TABLE_TOP + (n + 0.5) * (TABLE_H / 8);

type Note = { x: number; y: number; side: "l" | "r"; head: string; body?: string };

/* Broken keeps the raw RUNS order, so vector_search — the 12.4s timeout — is
   the third row, index 2. */
const BREAKS: Note[] = [
  { x: 25, y: STATS_MID, side: "r", head: "Four numbers", body: "None of them the one you act on." },
  { x: 58, y: brokenRow(2), side: "r", head: "12.4s", body: "Third row down, same grey as the rest." },
  { x: 46, y: FOOT_MID, side: "l", head: "$1,840/mo", body: "Burning here. 3 of 18 users left." },
];

/* Rebuilt sorts worst-first, so the same call is now row 0. That the second
   callout moves up the screen between the two states is the argument, not a
   coincidence — it is the row changing place. */
const FIXES: Note[] = [
  { x: 17.4, y: STATS_MID, side: "l", head: "Cost, first" },
  { x: 17.4, y: fixedRow(0) + 2.4, side: "l", head: "Worst call, top" },
  /* The chart occupies 32–50% of the side panel; below it is the one region of
     the rebuilt layout with nothing to cover. */
  { x: 97, y: 62, side: "l", head: "Since when" },
];

function Notes({ notes, className }: { notes: Note[]; className: string }) {
  return (
    <div className={className} aria-hidden>
      {notes.map((n, i) => (
        <div
          key={n.head}
          className={`${styles.note} ${n.side === "l" ? styles.noteL : ""}`}
          style={{ left: `${n.x}%`, top: `${n.y}%`, ["--n" as string]: i }}
        >
          <span className={styles.noteDot} />
          <span className={styles.noteLine} />
          <span className={styles.noteBox}>
            <span className={styles.noteHead}>{n.head}</span>
            {n.body && <span className={styles.noteBody}>{n.body}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---- the window frame ---------------------------------------------------- */
/* Grey pips, not traffic lights. Red-amber-green would make this a screenshot
   of a Mac instead of a window. */
function Rail() {
  return (
    <div className={styles.rail}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={styles.dot} />
      ))}
      <span className={styles.railName}>prod-agent-v2 — runs</span>
      {/* Comes on with the rebuild, because that is when it becomes true. */}
      <span className={styles.railLive}>
        <span className={styles.liveDot} />
        Live
      </span>
    </div>
  );
}

/* The furniture every dashboard has: a search field nobody uses, two filter
   chips. Identical in both states, because the claim is not that the toolbar
   was wrong — it is that everything under it was. */
function AppBar({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.appBar}>
      {children}
      <span className={styles.search}>
        <svg viewBox="0 0 16 16" className={styles.searchIcon} aria-hidden>
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.4 10.4 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Search runs
      </span>
      <span className={styles.chip}>Filters</span>
      <span className={styles.chip}>Last 24h</span>
    </div>
  );
}

const SIDEBAR = ["Overview", "Runs", "Tools", "Traces", "Usage", "Settings"];

function Sidebar() {
  return (
    <aside className={styles.nav}>
      <span className={styles.navBrand}>prod-agent-v2</span>
      {SIDEBAR.map((n, i) => (
        <span key={n} className={`${styles.navItem} ${i === 1 ? styles.navOn : ""}`}>
          {n}
        </span>
      ))}
    </aside>
  );
}

/* ---- the console --------------------------------------------------------
   One component, one table, two states.

   It used to be two components that swapped, and swapping is exactly what it
   looked like: a slide change. But the claim the whole page is making is that
   nothing is added between the two screens — the same eight calls, reorganised
   — and you cannot see a reorganisation happen unless the rows are the same
   rows and they move.

   So every row is mounted once, in the source order, and positioned by its rank
   in whichever state is current. Ranks come from `at`, which is data. The row
   that travels furthest is the row that was always the problem.

   Everything a row gains in the rebuilt state — the glyph, the latency bar, the
   cost, the pill — is mounted in both states too, and grows or fades in place
   rather than arriving with new markup. `flat` drops those from the nine copies
   inside the plates, which only ever show the broken state and are the reason
   this component's node count is multiplied by ten. */
function Glyph({ kind }: { kind: Kind }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    pathLength: 1,
    className: styles.draw,
  } as const;
  return (
    <svg viewBox="0 0 24 24" className={styles.glyph} style={{ color: TONE[kind].fg }} aria-hidden>
      {kind === "ok" && (
        <>
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path d="M8.2 12.4l2.6 2.6 5-5.4" {...stroke} />
        </>
      )}
      {kind === "bad" && (
        <>
          {/* A clock, not a warning triangle. The failure is a timeout and the
              glyph may as well say which failure it is. */}
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path d="M12 7.2V12l3.4 2.1" {...stroke} />
        </>
      )}
      {kind === "warn" && (
        <>
          <path d="M20 11.5a8 8 0 1 1-2.3-5.6" {...stroke} />
          <path d="M20 3.4v4.2h-4.2" {...stroke} />
        </>
      )}
    </svg>
  );
}

/* Four slots, two readings. Both mounted and cross-faded, because a tile whose
   text is replaced cannot animate — but a tile whose two readings sit on top of
   each other can. */
const STATS = [
  { dead: ["Total runs", "642"], live: ["Burning", `${usd(BURN)}/mo`], lead: true, note: "+212% in 7d", tone: "bad" },
  { dead: ["Success rate", "87%"], live: ["Failing", "1 call"], kind: "bad", note: "of 8 · was 0", tone: "bad" },
  { dead: ["Avg latency", "3.2s"], live: ["p95 latency", "12.4s"], kind: "warn", note: "budget 0.9s", tone: "warn" },
  { dead: ["Errors", "41"], live: ["Users hit", "18"], note: "3 churned", tone: "bad" },
] as const;

function Console({ side }: { side: "before" | "after" }) {
  return (
    <div className={styles.app} data-side={side}>
      <Sidebar />
      <div className={styles.appMain}>
        <AppBar>
          <span className={styles.barSwap}>
            <span className={styles.barPath}>runs / all</span>
            <span className={styles.barTitle}>
              <span className={styles.barHead}>Runs</span>
              <span className={styles.barSub}>eight calls, last hour</span>
            </span>
          </span>
        </AppBar>

        <div className={styles.stats}>
          {STATS.map((s, n) => (
            <div
              key={s.dead[0]}
              className={styles.stat}
              data-kind={"kind" in s ? s.kind : undefined}
              data-lead={"lead" in s ? "" : undefined}
              style={{ ["--r" as string]: n }}
            >
              <span className={styles.statFace} data-when="before">
                <span className={styles.statLabel}>{s.dead[0]}</span>
                <span className={styles.statVal}>{s.dead[1]}</span>
              </span>
              <span className={styles.statFace} data-when="after">
                <span className={styles.statLabel}>{s.live[0]}</span>
                <span className={styles.statVal}>{s.live[1]}</span>
                {/* Every tile says what its number is measured against. A
                    figure with nothing beside it is the thing the broken
                    screen already had four of. */}
                <span className={styles.statNote} data-tone={s.tone}>
                  {s.note}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className={styles.split}>
          <div className={styles.table}>
            {/* One header for both states, so the eight rows below occupy the
                same eight slots either way and a row's arithmetic — which the
                callout anchors depend on — does not change under the toggle. */}
            <div className={`${styles.tr} ${styles.th}`}>
              <span className={styles.glyph} />
              <span className={styles.cName}>name</span>
              <span className={styles.cBar} />
              <span className={styles.cNum}>duration</span>
              <span className={styles.cTrend}>7d</span>
              <span className={styles.cUsers}>users</span>
              <span className={styles.cCost}>cost</span>
              <span className={styles.cStatus}>status</span>
            </div>

            {/* Absolutely positioned and placed by rank, so changing the rank is
                a transform the browser can interpolate. In document flow the
                same reorder is a relayout, which cannot be animated at all —
                the rows would teleport, which is what "the screen refreshing"
                looked like. */}
            <div className={styles.rows}>
              {RUNS.map((r) => (
                <div
                  key={r.fn}
                  className={styles.tr}
                  data-kind={r.kind}
                  style={{
                    ["--before" as string]: r.at[0],
                    ["--after" as string]: r.at[1],
                    ["--w" as string]: scaleOf(r.seconds),
                    ["--u" as string]: (r.users / 18).toFixed(3),
                  }}
                >
                  <span className={styles.railMark} />
                  <Glyph kind={r.kind} />
                  <span className={styles.cName}>
                    <span className={styles.prefix}>{r.prefix}</span>
                    <span className={styles.fn}>{r.fn}</span>
                  </span>
                  <span className={styles.cBar}>
                    <span className={styles.barTrack}>
                      <span
                        className={styles.barFill}
                        style={{ background: `linear-gradient(90deg, ${TONE[r.kind].wash}, ${TONE[r.kind].fg})` }}
                      />
                    </span>
                  </span>
                  <span className={styles.cNum} data-kind={r.kind}>
                    {r.seconds.toFixed(2)}s
                  </span>
                  {/* Direction, not just level. A call at 5.2s is a question; a
                      call at 5.2s and rising 41% a week is an answer. Toned by
                      size rather than by sign, because latency going up is bad
                      news however the number is spelled. */}
                  <span className={styles.cTrend} data-kind={trendKind(r.deltaPct) ?? undefined}>
                    {trend(r.deltaPct)}
                    <span className={styles.arrow} aria-hidden>
                      {arrow(r.deltaPct)}
                    </span>
                  </span>
                  {/* How many of the eighteen it reached. Cost says what it is
                      worth fixing; this says who is waiting. */}
                  <span className={styles.cUsers}>
                    <span className={styles.usersBar}>
                      <span className={styles.usersFill} />
                    </span>
                    {r.users}
                  </span>
                  <span className={styles.cCost}>
                    <span className={styles.costVal}>{usd(r.usd)}/mo</span>
                  </span>
                  {/* The same fact twice. "error" is what the log said; the pill
                      is what it meant. Cross-faded in place rather than swapped,
                      so the column reads as one cell changing its mind. */}
                  <span className={styles.cStatus}>
                    <span className={styles.rawStatus}>{r.raw}</span>
                    <span className={styles.pill} style={{ background: TONE[r.kind].wash, color: TONE[r.kind].fg }}>
                      <span className={styles.pillDot} />
                      {r.label}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* The panel that was empty. It answers "since when", which is the
              question a founder asks second and no row in a table can carry.

              Its width does not change between states — only its contents fade.
              Animating the width would relayout the table under the rows on
              every frame of the reorder, and the one thing a reorder needs is
              for the columns to hold still while the rows move through them.

              pathLength="1" on the line so the draw-in is one unit long
              whatever the window is. Flat fill on the area rather than a
              gradient, because a <defs> id would be duplicated across every
              copy of this markup. */}
          <aside className={styles.side}>
            <div className={styles.sideHead}>
              <span>Burn per hour</span>
              <span className={styles.sideWin}>24h</span>
            </div>
            <svg viewBox={`0 0 ${CHART.w} 116`} className={styles.chart} aria-hidden>
              <path d={`M3 ${CHART.base}h${CHART.w - 6}`} stroke="rgba(245,238,230,0.10)" />
              {/* The line it was not supposed to cross, and the label saying
                  so. A curve climbing off the top of a panel is a shape; a
                  curve climbing past a marked budget is a number someone
                  owns. */}
              <g className={styles.chartBudget}>
                <path
                  d={`M3 ${cy(BUDGET).toFixed(1)}h${CHART.w - 6}`}
                  stroke="rgba(204,148,64,0.5)"
                  strokeDasharray="3 3"
                />
                <text
                  x={CHART.w - 3}
                  y={cy(BUDGET) - 4}
                  fontSize="7.5"
                  textAnchor="end"
                  fill="rgba(204,148,64,0.8)"
                  style={MONO}
                >
                  budget {usd(BUDGET)}/h
                </text>
              </g>
              <path d={AREA} fill="rgba(239,90,76,0.16)" className={styles.chartArea} />
              <path
                d={LINE}
                pathLength={1}
                fill="none"
                stroke="#ef5a4c"
                strokeWidth="1.7"
                strokeLinejoin="round"
                strokeLinecap="round"
                className={styles.chartLine}
              />
              <g className={styles.chartPeak}>
                <path
                  d={`M${cx(PEAK_AT).toFixed(1)} ${cy(PEAK).toFixed(1)}V${CHART.base}`}
                  stroke="rgba(239,90,76,0.45)"
                  strokeDasharray="2 2"
                />
                <circle cx={cx(PEAK_AT)} cy={cy(PEAK)} r="3.2" fill="#ef5a4c" />
                <circle cx={cx(PEAK_AT)} cy={cy(PEAK)} r="6.5" fill="none" stroke="rgba(239,90,76,0.3)" />
              </g>
              <text x="3" y="113" fontSize="7.5" fill="rgba(245,238,230,0.28)" style={MONO}>
                24h ago
              </text>
              <text x={CHART.w - 3} y="113" fontSize="7.5" textAnchor="end" fill="rgba(245,238,230,0.28)" style={MONO}>
                now
              </text>
            </svg>
            <div className={styles.sideFoot}>
              <span className={styles.sideTotal}>{usd(BURN)}</span>
              <span className={styles.sideNote}>and still climbing</span>
            </div>
          </aside>
        </div>

        {/* One slot at the foot, two things to put in it: the panel that should
            have been telling them it costs money, and the sentence that does. */}
        <div className={styles.foot}>
          <div className={styles.deadPanel}>
            <span className={styles.deadLabel}>usage</span>
            <span className={styles.deadEmpty}>no data for this range</span>
          </div>
          <div className={styles.verdict}>
            <span className={styles.verdictNum}>{usd(BURN)}/mo</span>
            <span className={styles.verdictText}>burned on slow and failed calls</span>
            <span className={styles.verdictMeta}>18 users hit this · 3 stopped using the product</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- the reel ------------------------------------------------------------ */
/* One word per span so the headline comes apart instead of sliding away as a
   block. `screen` keeps its serif; everything else is plain. */
const HEAD = ["They", "judge", "the", "model", "by", "the", "screen", "it", "arrives", "on."];

/* The rail under the call to action. Three figures, ruled apart, small — the
   one device every dark developer-platform hero worth looking at has in common.

   Every number here is earned somewhere else on this page rather than invented
   for the hero: 41 seconds is the clock in the teardown drawing below, five days
   is the engagement, and the seven screens are the Agnost rebuild the first card
   links to. A hero that makes up its own statistics is the reason nobody reads
   the ones that are true. */
const PROOF = [
  { n: "41", unit: "s", label: "before a new user found the number that mattered" },
  { n: "5", unit: "days", label: "teardown to a merged pull request, no retainer" },
  { n: "7", unit: "screens", label: "rebuilt in the last engagement, deployed" },
];

/* Two things in the reel are not functions of scroll position but of crossing
   one, and they get written as attributes rather than as more --p arithmetic.

   The jolt has to be a jolt. Scrubbed off --p it never ends: stop scrolling in
   the middle of the break and the camera sits there shaking until you move
   again. As a one-shot animation it fires when the glass gives and is over
   640ms later whether or not anybody keeps scrolling.

   One jolt, and it belongs to the cracking rather than to the scattering. It
   fires at 0.198, just ahead of --diag opening at 0.21, and runs 980ms — long
   enough to still be decaying while the fissures are drawing themselves. The
   impact is the moment the glass fractures; by the time the pieces are drifting
   apart the event is over and a camera still shaking is a camera with a fault.

   And the rebuild plays itself. Scrubbing it meant the rows, the bars and the
   chart all advanced at whatever rate the wheel happened to turn, which is the
   one thing that cannot look like software working. Reaching the mark starts
   it; from there it runs on its own clock. */
const CRACK_AT = 0.198;
const FIX_AT = 0.87;

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const motionNow = () => window.matchMedia(REDUCED).matches;

/* A hairline arrow in its own disc — the trailing icon never sits naked beside
   the label. 1.25 stroke: any heavier and it reads as an icon set. */
function Arrow({ down = false }: { down?: boolean }) {
  return (
    <span className={styles.btnIcon} aria-hidden>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        {down ? <path d="M8 3.5v9M4.2 8.8 8 12.5l3.8-3.7" /> : <path d="M4.5 11.5l7-7M5.8 4.5h5.7v5.7" />}
      </svg>
    </span>
  );
}

export default function HeroReel() {
  /* The one piece of state in the reel, and it is a click rather than a frame.
     The rule everywhere else — no React in the scroll path — is about
     re-rendering a fifty-node subtree sixty times a second, which this does
     not do. */
  const [side, setSide] = useState<"before" | "after">("before");

  /* Reduced motion never crosses the mark — the hook reports no milestones
     there — so on its own the console would rise carrying the old screen and
     stay on it. Subscribed rather than read once in an effect: the setting is
     external state that can change while the page is open, and the server
     render has to be told what to assume (false) rather than guess. */
  const reduced = useSyncExternalStore(subscribeMotion, motionNow, () => false);
  const shown = reduced ? "after" : side;

  /* The glass. Held in refs because it is fed sixty times a second and none of
     it is anything React should hear about. */
  const shatter = useRef<Shatter | null>(null);
  const progress = useRef(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const milestones = useCallback((p: number, el: HTMLElement) => {
    progress.current = p;
    shatter.current?.set(p);

    const jolt = p >= CRACK_AT ? "break" : "";
    const fix = p >= FIX_AT ? "on" : "";
    /* Written only on change: assigning the same value would restart the
       animation on every frame, which is a shake again by another route. */
    if (el.dataset.jolt !== jolt) el.dataset.jolt = jolt;
    if (el.dataset.fix !== fix) {
      el.dataset.fix = fix;
      /* The mark *is* the rebuild. The console rises carrying the old screen,
         and crossing 0.87 flips it to the new one — the same flip the button
         makes, through the same transitions, so there is one mechanism here
         rather than a scroll-triggered animation and a separate click-triggered
         one that have to be kept looking alike.

         It also settles what happens on the way back: leaving the rebuild
         returns the console to "before", so scrolling up and coming down again
         always plays the change rather than arriving at a screen that is
         already finished — or at whichever side the reader left the toggle on.

         Guarded by the change check above, so this is a click's worth of
         setState, not a frame's. */
      setSide(fix ? "after" : "before");
    }
  }, []);

  /* Eased, 110ms. The whole scene hangs off this one number, so smoothing it
     here smooths the markup and the canvas together and they cannot drift. */
  const ref = useScrollProgress<HTMLElement>(milestones, "pinned", 110);
  const glow = useCursorGlow<HTMLDivElement>();

  useEffect(() => {
    const reel = ref.current;
    if (!reel || !canvas.current || !stage.current) return;
    /* Reduced motion parks on the rebuilt console and never shows this. */
    if (window.matchMedia(REDUCED).matches) return;

    let live = true;
    let scene: Shatter | null = null;
    const narrow = window.matchMedia("(max-width: 900px)");

    /* three.js is most of this page's JavaScript and none of it is needed to
       read the headline, so it arrives after first paint in its own chunk. */
    import("./shatter/scene")
      .then(({ mountShatter }) => {
        if (!live || !canvas.current || !stage.current) return;
        scene = mountShatter(
          canvas.current,
          stage.current,
          () => (narrow.matches ? PLATES.narrow : PLATES.wide),
          () => {
            reel.dataset.gl = "on";
          },
        );
        scene.set(progress.current);
        shatter.current = scene;
      })
      /* No WebGL, or the chunk never came. The flat picture of the old screen
         is already in the markup and takes over without being asked. */
      .catch(() => {});

    return () => {
      live = false;
      scene?.dispose();
      shatter.current = null;
      delete reel.dataset.gl;
    };
  }, [ref]);

  return (
    <section ref={ref} className={styles.reel} data-reel>
      <div ref={glow} className={styles.viewport}>
        {/* Two washes wider than the viewport. Each sits on a track that leans
            with the pointer — opposite directions and different distances, so
            moving the mouse parts them rather than dragging a light around
            behind the cursor. A spotlight that follows the pointer is the
            cheapest trick there is; two planes of light at different depths is
            parallax. */}
        <div className={styles.field} aria-hidden>
          {/* First, so the light falls across it rather than under it. A ruled
              ground is what stops an empty dark frame reading as an empty dark
              frame: it gives the eye a scale and the washes something to be
              light *on*. Masked to nothing well before the edges, because a
              grid that reaches the frame is a background image. */}
          <span className={styles.mesh} />
          <span className={styles.track1}>
            <span className={styles.wash1} />
          </span>
          <span className={styles.track2}>
            <span className={styles.wash2} />
          </span>
          <span className={styles.wash3} />
          {/* A shaft down from above the frame. The washes are ambient and have
              no source; this one is aimed, and it puts the headline in a lit
              place instead of a uniformly grey one. */}
          <span className={styles.beam} />
        </div>
        <div className={styles.grain} aria-hidden />
        <span className={styles.ticks} aria-hidden />

        <div className={styles.camera}>
          {/* The old screen, in glass. One canvas the size of the frame; the
              pane inside it is measured off the stage below, so the markup's
              callouts and the canvas's rows agree to the pixel. */}
          <canvas ref={canvas} className={styles.gl} aria-hidden />

          {/* Everything that is said about the old screen, and — until the
              canvas is ready, or for good where there is no WebGL — a flat
              picture of it. */}
          <div ref={stage} className={styles.stage} aria-hidden>
            <picture>
              <source media="(max-width: 900px)" srcSet={PLATES.narrow.src} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.paneImg} src={PLATES.wide.src} alt="" decoding="async" />
            </picture>
            <Notes notes={BREAKS} className={styles.notes} />
          </div>

          {/* The rebuilt console, on glass. It comes up from under the frame
              hinged on its own bottom edge, so it is edge-on at first and
              square to the lens by the end — a screen being stood up rather
              than a screen fading in. Scrubbed. */}
          <div className={styles.glassWrap}>
            {/* And this leans with the pointer once it is standing. A second
                element because the lean is eased on its own clock, and a
                transition on the scrubbed wrapper would drag the rise. */}
            <div className={styles.glassTilt}>
              {/* The slab. Two outlines behind the face, which are invisible
                  square-on and are the whole reason it reads as a thickness of
                  glass while it is still lying back. */}
              <span className={styles.slab} aria-hidden />
              <span className={styles.slab} aria-hidden />
              <div className={styles.glass} data-side={shown} data-shot="glass">
                <div className={styles.glassRail}>
                  <Rail />
                </div>
                {/* One console, never remounted. Every difference between the
                    two states is a CSS transition off `data-side` — which is
                    the only way the rows can be *seen* to move. Remounting
                    swapped one finished layout for another, which is what read
                    as the screen refreshing.

                    The rebuild and the toggle are the same mechanism: crossing
                    the mark sets the side, and so does the button. */}
                <div className={styles.face} data-side={shown} aria-hidden>
                  <Console side={shown} />
                </div>
                <Notes notes={FIXES} className={styles.notesFix} />
                {/* The room, reflected in the face. Slides as the slab levels
                    and again as it leans. */}
                <span className={styles.sheen} aria-hidden />
              </div>
              {/* The floor it is standing on. */}
              <span className={styles.reflect} aria-hidden />
            </div>
          </div>
        </div>

        {/* Where the floor runs out. The pane at rest is cut off by the bottom
            of the frame, and a lit object cropped by a hard edge reads as a
            screenshot; faded into the dark it reads as distance. */}
        <div className={styles.floor} aria-hidden />

        {/* Its own perspective, outside the camera, so the headline's paint
            order against the canvas is settled by z-index rather than depth. */}
        <div className={styles.copy}>
          <div className={styles.copyInner}>
            <p className={styles.eyebrow}>
              <span className={styles.pulse} aria-hidden />
              Interface rebuilds for AI infrastructure
            </p>
            <h1 className={styles.headline}>
              {HEAD.map((w, i) => (
                <Fragment key={i}>
                  <span
                    className={styles.word}
                    style={
                      {
                        /* 0–2 belong to the actions, sub and eyebrow, which
                           clear out ahead of the headline. */
                        "--wi": i + 3,
                        "--wx": `${((i - 4.5) * 5).toFixed(1)}vw`,
                        "--wy": `${((i % 3) - 1) * 7}vh`,
                        "--wr": `${(i % 2 ? 1 : -1) * (3 + i)}deg`,
                      } as React.CSSProperties
                    }
                  >
                    {w === "screen" ? <span className="serif">screen</span> : w}
                  </span>
                  {/* Broken by hand after "model". Left to the browser the last
                      word lands alone on a third line, and one orphaned "on."
                      under a headline is the first thing anyone sees. */}
                  {i === 3 && <br className={styles.headBreak} />}
                </Fragment>
              ))}
            </h1>
            <p className={styles.sub}>
              Six months of looking at your own dashboard and you can&apos;t see
              it anymore. Kyre rebuilds it — as deployed code, in five days.
            </p>
            <div className={styles.actions}>
              <button type="button" {...calAttrs} className={styles.primary}>
                Get a free teardown
                <Arrow />
              </button>
              <a href="#how" className={styles.secondary}>
                See how it works
                <Arrow down />
              </a>
            </div>
            {/* Three numbers under the call to action — hard figures, ruled
                apart, small.

                All three are already earned elsewhere on this page: the 41
                seconds is the teardown clock in the "How it works" drawing,
                five days is the engagement, and the seven screens are the
                Agnost rebuild linked below. A hero that invents its own
                statistics is the reason nobody reads them. */}
            <dl className={styles.proof}>
              {PROOF.map((p) => (
                <div key={p.n} className={styles.proofCell}>
                  <dt className={styles.proofN}>
                    {p.n}
                    <span className={styles.proofU}>{p.unit}</span>
                  </dt>
                  <dd className={styles.proofL}>{p.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Names what is on screen and what it costs, so the three red callouts
            land on something already established as theirs rather than reading
            as annotations on a stock screenshot. */}
        <div className={styles.tag} data-when="now" aria-hidden>
          <span className={styles.tagDot} />
          <span className={styles.tagKey}>Your dashboard today</span>
          <span className={styles.tagVal}>3 of 18 users stopped coming back</span>
        </div>

        <div className={styles.card} aria-hidden>
          <span className={styles.cardMark} />
          <span className={styles.cardText}>
            Rebuilt with <span className="serif">Kyre</span>
          </span>
        </div>

        {/* The one thing on this page a reader can operate. It arrives with the
            rebuild and holds the two states against each other in place — which
            is the claim the whole reel has been making, finally checkable
            rather than merely watched.

            Real buttons, outside every aria-hidden container above, because
            unlike the rest of the scene this is a control. */}
        <div className={styles.toggle} data-side={shown}>
          <span className={styles.tgPill} aria-hidden />
          <button
            type="button"
            className={styles.tgBtn}
            aria-pressed={shown === "before"}
            onClick={() => setSide("before")}
          >
            Before
          </button>
          <button
            type="button"
            className={styles.tgBtn}
            aria-pressed={shown === "after"}
            onClick={() => setSide("after")}
          >
            After
          </button>
        </div>

        <span className={styles.hint} aria-hidden>
          <span className={styles.hintLine} />
          scroll
        </span>
      </div>

      <CalLoader />
    </section>
  );
}
