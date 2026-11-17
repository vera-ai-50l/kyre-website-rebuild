import s from "./screen.module.css";

/* One fictional product, twice.

   "Marlo" is a made-up AI support agent. The first face is what a prompt gives
   you: a greeting with a wave, four tiles of equal weight, a chart in five
   colours, a gradient on everything that can hold one. Nothing on it is wrong.
   Nothing on it tells you where to look either.

   The second face is the same data, decided: one number first, the reason for
   it second, what to do about it third.

   Sized in em off the container's width, so the copy that is photographed for
   the glass and the copy that is live in the page are the same picture. */

export type Side = "before" | "after";

const NAV = [
  ["🏠", "Dashboard"],
  ["💬", "Conversations"],
  ["📊", "Analytics"],
  ["🤖", "Agents"],
  ["👥", "Customers"],
  ["⚙️", "Settings"],
];

const TILES = [
  ["💬", "Total Conversations", "12,847", "↑ 12.5%"],
  ["✅", "Resolution Rate", "94.2%", "↑ 2.1%"],
  ["⚡", "Avg Response Time", "1.2s", "↓ 0.3s"],
  ["👥", "Active Users", "3,429", "↑ 8.2%"],
];

const LINES = [
  ["#a78bfa", "M0 96 C40 70 70 104 110 82 S180 40 220 64 300 30 340 52 420 18 460 34"],
  ["#f472b6", "M0 70 C40 88 80 50 120 66 S190 96 230 74 300 86 340 60 410 70 460 48"],
  ["#38bdf8", "M0 110 C50 100 80 116 120 98 S200 80 240 96 310 60 350 78 420 50 460 66"],
  ["#34d399", "M0 50 C40 40 90 72 130 56 S200 30 240 50 300 44 350 30 420 40 460 22"],
  ["#fbbf24", "M0 84 C40 104 90 86 130 100 S200 60 240 84 310 100 350 90 420 96 460 84"],
];

const FEED = [
  ["Refund request #4821", "Escalated", "bad"],
  ["Password reset — Dana K.", "Resolved", "ok"],
  ["Billing change #4819", "Pending", "warn"],
  ["Shipping status #4816", "Resolved", "ok"],
  ["Refund request #4812", "Escalated", "bad"],
  ["Login trouble — M. Osei", "In Progress", "info"],
];

function Before() {
  return (
    <div className={s.b}>
      <aside className={s.bSide}>
        <div className={s.bLogo}>
          <i />
          Marlo AI
        </div>
        {NAV.map(([e, l], i) => (
          <div key={l} className={s.bNav} data-on={i === 0 || undefined}>
            <span>{e}</span>
            {l}
          </div>
        ))}
        <div className={s.bUp}>
          <b>Upgrade to Pro ✨</b>
          <span>Unlock unlimited agents and advanced analytics!</span>
          <em>Upgrade Now</em>
        </div>
      </aside>
      <div className={s.bMain}>
        <div className={s.bHead}>
          <div>
            <p className={s.bHello}>Welcome back, Alex! 👋</p>
            <p className={s.bSub}>Here&apos;s what&apos;s happening with your AI agent today.</p>
          </div>
          <span className={s.bBtn}>+ New Agent</span>
        </div>
        <div className={s.bTiles}>
          {TILES.map(([e, l, v, d]) => (
            <div key={l} className={s.bTile}>
              <span className={s.bIcon}>{e}</span>
              <p>{l}</p>
              <b>{v}</b>
              <em>{d} from last month</em>
            </div>
          ))}
        </div>
        <div className={s.bGrid}>
          <div className={s.bCard}>
            <div className={s.bCardHead}>
              <b>Analytics Overview</b>
              <span>
                {["Chats", "Tickets", "Users", "CSAT", "Cost"].map((l, i) => (
                  <i key={l} style={{ color: LINES[i][0] }}>
                    ● {l}
                  </i>
                ))}
              </span>
            </div>
            <svg viewBox="0 0 460 130" preserveAspectRatio="none" className={s.bChart} aria-hidden>
              {[26, 52, 78, 104].map((y) => (
                <line key={y} x1="0" x2="460" y1={y} y2={y} stroke="rgba(148,163,184,.14)" strokeWidth="1" />
              ))}
              {LINES.map(([c, d]) => (
                <path key={c} d={d} fill="none" stroke={c} strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          </div>
          <div className={s.bCard}>
            <div className={s.bCardHead}>
              <b>Recent Activity</b>
              <span>
                <i>View All →</i>
              </span>
            </div>
            {FEED.map(([t, st, tone]) => (
              <div key={t} className={s.bRow}>
                <span>{t}</span>
                <em data-tone={tone}>{st}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const HANDOFFS = [
  ["Refund requests", 41],
  ["Billing changes", 22],
  ["Login trouble", 17],
  ["Shipping status", 12],
  ["Everything else", 8],
] as const;

/* Title, who, initials, how long, how urgent. */
const QUEUE = [
  ["Refund over $200", "Dana K.", "DK", "14 min", "hot"],
  ["Annual plan downgrade", "M. Osei", "MO", "9 min", "warm"],
  ["Refund, duplicate charge", "R. Vale", "RV", "4 min", "calm"],
] as const;

/* The three numbers the old screen led with, demoted to a strip, each with the
   week behind it. Sparklines are 60×16. */
const STATS = [
  ["12,847", "conversations", "M0 13 L10 11 L20 12 L30 8 L40 9 L50 5 L60 3"],
  ["1.2s", "median reply", "M0 4 L10 6 L20 5 L30 8 L40 9 L50 11 L60 12"],
  ["3,429", "active customers", "M0 12 L10 10 L20 11 L30 9 L40 7 L50 7 L60 4"],
] as const;

/* Resolution rate over the week, in the chart's 600×120 box; 96 is the floor
   line, 22 is Sunday's 96.1%, and the goal of 95% sits at 33. */
const CURVE = "M0 84 C40 82 64 76 100 78 S166 92 200 88 S262 66 300 60 S366 55 400 52 S466 45 500 40 S566 27 596 22";

const v = (o: Record<string, string | number>) => o as React.CSSProperties;

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8h9M8.8 4.2 12.5 8l-3.7 3.8" />
    </svg>
  );
}

function After() {
  return (
    <div className={s.a}>
      <span className={s.aAura} aria-hidden />

      <div className={s.aTop} style={v({ "--i": 0 })}>
        <span className={s.aBrand}>
          <i className={s.aGlyph} aria-hidden />
          marlo
        </span>
        <span className={s.aNav}>
          <b>Overview</b>
          <i>Conversations</i>
          <i>Agents</i>
          <i>Customers</i>
        </span>
        <span className={s.aTools}>
          <span className={s.aLive}>
            <i aria-hidden />
            Live
          </span>
          <span className={s.aRange}>Last 7 days</span>
          <span className={s.aMe} aria-hidden>
            AK
          </span>
        </span>
      </div>

      <div className={s.aBody}>
        <section className={`${s.aCard} ${s.aLead}`} style={v({ "--i": 1 })}>
          <div className={s.aHead}>
            <p className={s.aLabel}>Resolved without a human</p>
            <span className={s.aTag}>AI agent</span>
          </div>
          <div className={s.aHero}>
            <p className={s.aNum} style={v({ "--i": 2 })}>
              94.2<i>%</i>
            </p>
            <div className={s.aMeta} style={v({ "--i": 3 })}>
              <span className={s.aUp}>
                <b>+2.1 pts</b> on last week
              </span>
              <span className={s.aGoal}>
                <span>
                  Goal <b>95%</b>
                </span>
                <i aria-hidden>
                  <i />
                </i>
                <em>0.8 pts to go</em>
              </span>
            </div>
          </div>
          <p className={s.aSay} style={v({ "--i": 4 })}>
            <span className={s.aSpark} aria-hidden>
              <svg viewBox="0 0 16 16">
                <path d="M8 1.5c.5 3.4 1.6 4.6 5 5.1-3.4.5-4.5 1.6-5 5-.5-3.4-1.6-4.5-5-5 3.4-.5 4.5-1.7 5-5.1z" fill="currentColor" />
              </svg>
            </span>
            Refund requests are behind four in ten handoffs.
          </p>
          <div className={s.aChart} style={v({ "--i": 5 })}>
            <svg viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="aFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#ff4a1f" stopOpacity="0.26" />
                  <stop offset="0.7" stopColor="#ff4a1f" stopOpacity="0.04" />
                  <stop offset="1" stopColor="#ff4a1f" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="aStroke" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#0b0c0f" stopOpacity="0.55" />
                  <stop offset="0.55" stopColor="#0b0c0f" />
                  <stop offset="1" stopColor="#ff4a1f" />
                </linearGradient>
              </defs>
              {[60, 78].map((y) => (
                <line key={y} x1="0" x2="600" y1={y} y2={y} className={s.aGrid} vectorEffect="non-scaling-stroke" />
              ))}
              <line x1="0" x2="600" y1="96" y2="96" className={s.aBase} vectorEffect="non-scaling-stroke" />
              <line x1="0" x2="600" y1="33" y2="33" className={s.aGoalLine} vectorEffect="non-scaling-stroke" />
              <path d={`${CURVE} L596 96 L0 96 Z`} className={s.aArea} />
              <path d={CURVE} pathLength={1} className={s.aLine} vectorEffect="non-scaling-stroke" />
            </svg>
            <span className={s.aGoalTag}>Goal 95%</span>
            <span className={s.aDot} />
            <span className={s.aTip}>
              <b>96.1%</b> Sun
            </span>
            <span className={s.aDays}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <i key={d}>{d}</i>
              ))}
            </span>
          </div>
        </section>

        <div className={s.aCol}>
          <section className={`${s.aCard} ${s.aRankCard}`} style={v({ "--i": 3 })}>
            <div className={s.aHead}>
              <p className={s.aLabel}>Where the agent hands off</p>
            </div>
            <ol className={s.aRank}>
              {HANDOFFS.map(([l, n], i) => (
                <li key={l} style={v({ "--i": 4 + i, "--v": n / 41 })}>
                  <span>{l}</span>
                  <b>{n}%</b>
                  <i aria-hidden>
                    <i />
                  </i>
                </li>
              ))}
            </ol>
          </section>

          <section className={`${s.aCard} ${s.aQueueCard}`} style={v({ "--i": 8 })}>
            <div className={s.aHead}>
              <p className={s.aLabel}>Waiting on you</p>
              <span className={s.aCount}>3</span>
            </div>
            <ul className={s.aQueue}>
              {QUEUE.map(([t, who, ini, age, tone], i) => (
                <li key={t} style={v({ "--i": 9 + i })} data-tone={tone}>
                  <span className={s.aAv} aria-hidden>
                    {ini}
                  </span>
                  <span className={s.aWho}>
                    <span>{t}</span>
                    <i>{who}</i>
                  </span>
                  <b>{age}</b>
                </li>
              ))}
            </ul>
            <span className={s.aCta} style={v({ "--i": 12 })}>
              Review 3 handoffs
              <i>
                <Arrow />
              </i>
            </span>
          </section>
        </div>
      </div>

      <div className={s.aFoot} style={v({ "--i": 13 })}>
        {STATS.map(([n, l, d]) => (
          <span key={l}>
            <b>{n}</b> {l}
            <svg viewBox="0 0 60 16" aria-hidden>
              <path d={d} vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

/* Keyed, so going back and forth replays the new screen's entrance from its
   first frame instead of dissolving between two finished layouts. */
export function Screen({ side }: { side: Side }) {
  return side === "before" ? <Before key="before" /> : <After key="after" />;
}
