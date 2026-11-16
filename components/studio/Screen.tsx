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

const QUEUE = [
  ["Refund over $200", "Dana K.", "14 min"],
  ["Annual plan downgrade", "M. Osei", "9 min"],
  ["Refund, duplicate charge", "R. Vale", "4 min"],
];

function After() {
  return (
    <div className={s.a}>
      <div className={s.aTop} style={{ "--i": 0 } as React.CSSProperties}>
        <span className={s.aMark}>marlo</span>
        <span className={s.aNav}>
          <b>Overview</b>
          <i>Conversations</i>
          <i>Agents</i>
          <i>Customers</i>
        </span>
        <span className={s.aRange}>Last 7 days</span>
      </div>

      <div className={s.aBody}>
        <div className={s.aLead}>
          <p className={s.aLabel} style={{ "--i": 1 } as React.CSSProperties}>
            Resolved without a human
          </p>
          <p className={s.aNum} style={{ "--i": 2 } as React.CSSProperties}>
            94.2<i>%</i>
          </p>
          <p className={s.aDelta} style={{ "--i": 3 } as React.CSSProperties}>
            <b>+2.1 pts</b> on last week
          </p>
          <p className={s.aSay} style={{ "--i": 4 } as React.CSSProperties}>
            Refund requests are behind four in ten handoffs.
          </p>
          <div className={s.aChart} style={{ "--i": 5 } as React.CSSProperties}>
            <svg viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden>
              <line x1="0" x2="600" y1="96" y2="96" className={s.aBase} vectorEffect="non-scaling-stroke" />
              <path d="M0 84 L100 78 L200 88 L300 60 L400 52 L500 40 L596 22 L596 96 L0 96 Z" className={s.aArea} />
              <path
                d="M0 84 L100 78 L200 88 L300 60 L400 52 L500 40 L596 22"
                pathLength={1}
                className={s.aLine}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className={s.aDot} />
            <svg className={s.aDefs} aria-hidden>
              <defs>
                <linearGradient id="aFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#0b0c0f" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#0b0c0f" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <span className={s.aDays}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <i key={d}>{d}</i>
              ))}
            </span>
          </div>
        </div>

        <div className={s.aCol}>
          <p className={s.aLabel} style={{ "--i": 3 } as React.CSSProperties}>
            Where the agent hands off
          </p>
          <ol className={s.aRank}>
            {HANDOFFS.map(([l, v], i) => (
              <li key={l} style={{ "--i": 4 + i, "--v": v / 41 } as React.CSSProperties}>
                <span>{l}</span>
                <b>{v}%</b>
                <i />
              </li>
            ))}
          </ol>
          <p className={s.aLabel} style={{ "--i": 8 } as React.CSSProperties}>
            Waiting on you
          </p>
          <ul className={s.aQueue}>
            {QUEUE.map(([t, who, age], i) => (
              <li key={t} style={{ "--i": 9 + i } as React.CSSProperties}>
                <span>{t}</span>
                <i>{who}</i>
                <b>{age}</b>
              </li>
            ))}
          </ul>
          <span className={s.aCta} style={{ "--i": 12 } as React.CSSProperties}>
            Review 3 handoffs
            <i>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 8h9M8.8 4.2 12.5 8l-3.7 3.8" />
              </svg>
            </i>
          </span>
        </div>
      </div>

      <div className={s.aFoot} style={{ "--i": 13 } as React.CSSProperties}>
        <span>
          <b>12,847</b> conversations
        </span>
        <span>
          <b>1.2s</b> median reply
        </span>
        <span>
          <b>3,429</b> active customers
        </span>
      </div>
    </div>
  );
}

/* Keyed, so going back and forth replays the new screen's entrance from its
   first frame instead of dissolving between two finished layouts. */
export function Screen({ side }: { side: Side }) {
  return side === "before" ? <Before key="before" /> : <After key="after" />;
}
