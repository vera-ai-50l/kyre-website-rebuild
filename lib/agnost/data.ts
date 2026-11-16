/* ClipForge AI — fixture data for the Agnost rebuild.
   Demonstration only. No connection to Agnost AI's API or data.

   Everything downstream is derived from these arrays, so the numbers on Home
   are the numbers in the tables. The one rule that shapes the whole file:
   it must be deterministic. This app is a static export, so the markup is
   generated at build time and hydrated in a browser somewhere else — a
   Math.random() or a live Date.now() here is a hydration mismatch. Hence a
   seeded PRNG and a frozen clock. */

/** Frozen clock: 13 Aug 2026, 10:00 UTC. All times are UTC everywhere so the
    build machine and the visitor's browser render the same string. */
export const NOW = Date.UTC(2026, 7, 13, 10, 0, 0);
export const DAY = 86_400_000;
export const WINDOW_START = NOW - DAY;

/* Stable 4-hex-digit conversation id, so `clip-conv-d51c` reads like the real
   thing and every screen derives the same id from the same user. */
export function convId(email: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < email.length; i++) h = Math.imul(h ^ email.charCodeAt(i), 0x01000193);
  return `clip-conv-${((h >>> 0) % 0xffff).toString(16).padStart(4, "0")}`;
}

/* mulberry32 — 4 lines, uniform enough for jitter, identical on every run. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- users

export type User = {
  id: string;
  email: string;
  messages: number;
  cost: number;
  intents: string[];
  violations: number;
  lastActive: number;
  conversationId: string;
};

/* Costs are hand-set rather than generated: the spread is the point (B5), and
   a generator that happens to produce a flat spread produces a dashboard with
   nothing to show. Ratio top:bottom is ~10x, total is asserted below. */
const USER_SEED: [email: string, messages: number, cost: number, violations: number, minsAgo: number][] = [
  ["luis@reelpilot.studio", 14, 1.84, 1, 40],
  ["priya@creatorstudio.in", 11, 1.17, 1, 11],
  ["mei@podwave.sg", 11, 1.19, 0, 96],
  ["omar@mediaops.team", 9, 0.94, 1, 152],
  ["elena@brandframe.co", 9, 0.88, 0, 208],
  ["maya@launchcut.co", 8, 0.81, 1, 63],
  ["hana@framecraft.jp", 8, 0.76, 0, 274],
  ["ryan@founderclips.co", 7, 0.62, 1, 331],
  ["tessa@homecatalog.ai", 7, 0.58, 0, 187],
  ["jules@studiojules.tv", 6, 0.54, 0, 419],
  ["arjun@reelforge.in", 6, 0.49, 0, 502],
  ["dev@shortstack.tv", 6, 0.44, 0, 596],
  ["kai@loopmotion.co", 5, 0.38, 0, 668],
  ["yuki@kirinmedia.jp", 5, 0.35, 0, 744],
  ["ana@pixelops.es", 5, 0.31, 1, 812],
  ["nina@cutroom.io", 4, 0.28, 0, 903],
  ["tom@dailyreels.uk", 4, 0.24, 0, 1010],
  ["sofia@vertigoedit.com", 3, 0.21, 0, 1116],
  ["bea@stitchcut.nl", 3, 0.19, 0, 1244],
  ["clara@postbox.studio", 2, 0.18, 0, 1382],
];

// --------------------------------------------------------------- intents

export type Intent = {
  id: string;
  name: string;
  description: string;
  messages: number;
  conversations: number;
  delta: number; // vs prior 1 day, percent
  lastSeen: number;
  suggested: boolean;
  trend: number[];
  themes: { name: string; count: number }[];
};

const INTENT_SEED: [
  id: string,
  name: string,
  description: string,
  messages: number,
  conversations: number,
  delta: number,
  minsAgo: number,
  suggested: boolean,
][] = [
  ["burned-in-captions", "Burned-in captions, not a transcript",
    "A user asks for captions rendered into the video itself and is offered a transcript file instead.",
    9, 5, 100, 8, false],
  ["rage-background-replacement", "Rage after incorrect background replacement",
    "A user repeatedly corrects a background replacement after the edit removes part of the subject.",
    7, 3, 33, 5, true],
  ["broken-export-link", "Broken export link after render",
    "A render completes, the agent shares a download link, and the link does not resolve.",
    6, 4, 50, 21, false],
  ["exact-time-title", "Correct a title at an exact timestamp",
    "A user gives a timecode and asks for the on-screen title at that exact moment to change.",
    5, 3, 25, 34, false],
  ["vertical-crop", "Vertical 9:16 crop for shorts",
    "A user asks for a landscape edit to be reframed for vertical short-form placement.",
    4, 3, 0, 52, false],
  ["remove-filler-words", "Remove filler words automatically",
    "A user wants ums, likes and false starts stripped without cutting the take by hand.",
    4, 2, 33, 77, false],
  ["speaker-labels", "Auto-detect speakers for lower thirds",
    "A user expects the agent to identify who is speaking and name the lower third accordingly.",
    3, 2, 100, 30, false],
  ["transcript-without-export", "Transcript without an export step",
    "A user wants the transcript directly in the chat rather than as a downloadable artifact.",
    3, 2, -100, 22, true],
  ["batch-folder", "Batch process a whole folder",
    "A user asks to run the same edit across every clip in a folder in one instruction.",
    3, 2, 0, 118, false],
  ["brand-font", "Brand font in burned captions",
    "A user asks for captions in their own typeface rather than the agent's default.",
    3, 2, 50, 164, false],
  ["trim-silence", "Trim silence between takes",
    "A user asks for dead air between takes removed before the edit is assembled.",
    3, 3, -25, 203, false],
  ["plan-limit-at-export", "Plan limit discovered only at export",
    "A user hits a plan restriction at the end of the job rather than before work started.",
    2, 2, -100, 60, false],
  ["retry-render", "Retry a render without re-uploading",
    "A user asks to re-run a failed render against the media already in the project.",
    2, 2, 0, 18, true],
  ["transcript-speaker-labels", "Transcript with speaker labels",
    "A user wants the exported transcript attributed per speaker rather than as one block.",
    2, 2, -100, 61, false],
];

/* The intents chart's x-axis, transcribed from the original: eight 15-minute
   interval labels from 08:04 to 09:49. */
export const INTERVAL_LABELS = [
  "08:04", "08:19", "08:34", "08:49", "09:04", "09:19", "09:34", "09:49",
];

/* The shape of the original's "56 Matches" chart — 0, 6, 5, 8, 8, 11, 14, 4.
   Every intent's messages are distributed along this shape, so the per-intent
   sparklines and the aggregate chart are the same data at two resolutions and
   the total always lands on the number in the panel header.

   This replaces hand-drawn sparkline arrays that summed to 131 while the header
   claimed 56 — the chart and its own title disagreed. */
const SHAPE = [0, 6, 5, 8, 8, 11, 14, 4];

/** Split `total` across the intervals, shaped like SHAPE, jittered per intent so
    no two sparklines are identical, and guaranteed to sum to `total`. */
function distribute(total: number, seed: number): number[] {
  const r = rng(seed);
  const weights = SHAPE.map((w) => w + r() * 2.2);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * total);
  const out = raw.map(Math.floor);
  // Largest remainder, so the parts add up to the whole.
  let left = total - out.reduce((a, b) => a + b, 0);
  for (const [, i] of raw
    .map((v, i) => [v - out[i], i] as const)
    .sort((a, b) => b[0] - a[0])) {
    if (left-- <= 0) break;
    out[i]++;
  }
  return out;
}

const DETAIL_LABELS = INTERVAL_LABELS;

/* Themes split deterministically. Their design shows the same three buckets on
   every intent, so the shape is fixed and only the counts move. */
function themesFor(messages: number): { name: string; count: number }[] {
  const initial = Math.max(1, Math.round(messages * 0.55));
  const repeat = Math.max(1, Math.round(messages * 0.29));
  return [
    { name: "Initial request", count: initial },
    { name: "Repeated correction", count: repeat },
    { name: "Failure or frustration", count: Math.max(0, messages - initial - repeat) },
  ];
}

export const INTENTS: Intent[] = INTENT_SEED.map(
  ([id, name, description, messages, conversations, delta, minsAgo, suggested], i) => ({
    id,
    name,
    description,
    messages,
    conversations,
    delta,
    lastSeen: NOW - minsAgo * 60_000,
    suggested,
    /* Derived, not drawn: sums to `messages` by construction. */
    trend: distribute(messages, 1000 + i * 37),
    themes: themesFor(messages),
  }),
);

/** Matches per 15-minute interval, summed across every intent. The panel header
    states this total, so it is computed from the same arrays the rows show. */
export const INTENT_SERIES = INTERVAL_LABELS.map((label, i) => ({
  label,
  value: INTENTS.reduce((n, intent) => n + (intent.trend[i] ?? 0), 0),
}));


/** Per-interval message counts for one intent, shaped like its sparkline and
    summing to its message count — the chart and the sparkline are then the same
    data at two sizes, rather than two numbers that disagree. */
export function intentSeries(intent: Intent): { label: string; value: number }[] {
  const total = intent.trend.reduce((a, b) => a + b, 0) || 1;
  const raw = intent.trend.map((v) => (v / total) * intent.messages);
  const values = raw.map(Math.floor);
  // Largest-remainder, so the bars still add up to the stated total.
  let remainder = intent.messages - values.reduce((a, b) => a + b, 0);
  for (const [, i] of raw
    .map((v, i) => [v - values[i], i] as const)
    .sort((a, b) => b[0] - a[0])) {
    if (remainder-- <= 0) break;
    values[i]++;
  }
  return values.map((value, i) => ({ label: DETAIL_LABELS[i], value }));
}


// ------------------------------------------------------------ violations

export type Violation = {
  id: string;
  name: string;
  description: string;
  count: number;
  delta: number;
};

export const VIOLATIONS: Violation[] = [
  { id: "nonexistent-export-link", name: "Nonexistent export link shared",
    description: "The agent sent a download URL for a render that was never produced.", count: 4, delta: 33 },
  { id: "pricing-promise", name: "Pricing promise made by agent",
    description: "The agent quoted a plan price or discount that is not on the pricing page.", count: 3, delta: 0 },
  { id: "broken-export", name: "Broken export after render",
    description: "A render reported success and the resulting file could not be opened.", count: 2, delta: -33 },
  { id: "unavailable-workflow", name: "Unavailable workflow promised",
    description: "The agent described a one-click flow the product does not implement.", count: 1, delta: 100 },
];

// ----------------------------------------------------------------- tools

/* Tool call counts sum to the event count: one event is one tool call, so the
   Tools table is an aggregate of EVENTS rather than a second source of truth.
   Latency profiles per tool; export_download_link is the outlier the page is
   supposed to surface — its failures are slow timeouts, its successes are a
   cached link, which is exactly why p50 and p99 both have to be shown. */
const TOOL_SEED: [name: string, calls: number, failures: number, lo: number, hi: number][] = [
  ["fetch_project", 20, 0, 90, 210],
  ["render_video", 20, 3, 1010, 1300],
  ["burn_captions", 16, 0, 480, 860],
  ["transcribe_audio", 14, 1, 700, 1080],
  ["detect_scenes", 12, 0, 340, 620],
  ["export_download_link", 9, 2, 300, 520],
  ["upload_asset", 9, 0, 820, 1180],
  ["estimate_price", 7, 0, 150, 320],
];

/** Failure latencies, slowest first — assigned to the failing calls in order. */
const FAILURE_LATENCY: Record<string, number[]> = {
  export_download_link: [2960, 2870],
  render_video: [2140, 1980, 1610],
  transcribe_audio: [1420],
};

/** The violation each failing call produces. A broken download link has to come
    from the download tool, not from whichever violation was next in the list. */
const FAILURE_VIOLATION: Record<string, string[]> = {
  export_download_link: ["nonexistent-export-link", "broken-export"],
  render_video: ["broken-export", "unavailable-workflow", "pricing-promise"],
  transcribe_audio: ["pricing-promise"],
};

// ---------------------------------------------------------------- events

export type AgnostEvent = {
  id: string;
  ts: number;
  userId: string;
  conversationId: string;
  tool: string;
  latency: number;
  status: "ok" | "fail";
  violationId?: string;
};

/* Failures cluster in time rather than spreading evenly — otherwise the events
   strip has no density to show, which is the whole point of promoting it. */
/* Transcribed from the original: 09:51, 09:43, 09:26, 09:09, 03:48, 03:44.
   Clustered rather than evenly spread — evenly spaced failures produce a
   uniform strip with nothing to notice. */
const FAILURE_OFFSETS_MIN = [9, 17, 34, 51, 372, 376];

function buildEvents(): AgnostEvent[] {
  const r = rng(20260813);
  const users = USER_SEED.map(([email]) => email);
  const slots: {
    tool: string;
    status: "ok" | "fail";
    latency: number;
    violationId?: string;
  }[] = [];

  for (const [tool, calls, failures, lo, hi] of TOOL_SEED) {
    for (let i = 0; i < calls - failures; i++) {
      slots.push({ tool, status: "ok", latency: Math.round(lo + r() * (hi - lo)) });
    }
    for (let i = 0; i < failures; i++) {
      slots.push({
        tool,
        status: "fail",
        latency: FAILURE_LATENCY[tool][i],
        violationId: FAILURE_VIOLATION[tool][i],
      });
    }
  }

  const failing = slots.filter((s) => s.status === "fail");
  const passing = slots.filter((s) => s.status === "ok");
  // Deterministic shuffle so tools interleave instead of arriving in blocks.
  for (let i = passing.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [passing[i], passing[j]] = [passing[j], passing[i]];
  }

  const events: AgnostEvent[] = [];
  // Successes spread across the 24h window. The first pass gives every user one
  // event so nobody is missing from the 24h totals; the rest are weighted by
  // message count, which is what makes the cost column spread ~10x.
  const weighted = USER_SEED.flatMap(([email, messages]) =>
    Array<string>(messages).fill(email),
  );
  passing.forEach((s, i) => {
    const frac = (i + r() * 0.8) / passing.length;
    const email =
      i < users.length ? users[i] : weighted[Math.floor(r() * weighted.length)];
    events.push({
      id: `evt-${(i + 1).toString().padStart(3, "0")}`,
      ts: WINDOW_START + Math.round(frac * DAY),
      userId: email,
      conversationId: convId(email),
      tool: s.tool,
      latency: s.latency,
      status: "ok",
    });
  });
  // Failures land on the clustered offsets, newest first.
  failing.forEach((s, i) => {
    const email = users[i % 6];
    events.push({
      id: `evt-f${i + 1}`,
      ts: NOW - FAILURE_OFFSETS_MIN[i] * 60_000,
      userId: email,
      conversationId: convId(email),
      tool: s.tool,
      latency: s.latency,
      status: "fail",
      violationId: s.violationId,
    });
  });

  return events.sort((a, b) => a.ts - b.ts);
}

export const EVENTS = buildEvents();

// --------------------------------------------------------- conversations

export type Message = {
  role: "user" | "agent";
  ts: number;
  text: string;
  latency?: number;
  intentId?: string;
  violationId?: string;
};

export type Conversation = {
  id: string;
  userId: string;
  started: number;
  messages: Message[];
};

/* Six scripts, rotated across the twenty users. Each is a real diagnosis path:
   a request, an agent answer that misses it, a correction, and where relevant
   the violation at the exact turn it fired. */
type Script = [role: "user" | "agent", text: string, intentId?: string, violationId?: string][];

const SCRIPTS: Script[] = [
  [
    ["user", "can you burn captions into this video automatically?", "burned-in-captions"],
    ["agent", "Automatic caption rendering is not enabled here. I can return a transcript, but I cannot burn it into the video."],
    ["user", "I need captions on the final video, not a transcript file", "burned-in-captions"],
    ["agent", "Understood — burning captions is available on the Studio plan and I can enable it for this project right now, no extra charge.", undefined, "pricing-promise"],
    ["user", "then export? Descript already does this in one click", "burned-in-captions"],
    ["agent", "I've queued the render. Your file will be at clipforge.app/d/9f21c — give it about a minute.", undefined, "nonexistent-export-link"],
    ["user", "that link 404s", "broken-export-link"],
  ],
  [
    ["user", "replace the background with the studio one from last week", "rage-background-replacement"],
    ["agent", "Done — background replaced across all 4 clips."],
    ["user", "it cut off half my shoulder on clip 2", "rage-background-replacement"],
    ["agent", "Re-running the matte on clip 2 with a wider subject margin."],
    ["user", "still wrong. same shoulder, same edge", "rage-background-replacement"],
    ["agent", "I can re-run it once more, or you can mask it manually in the editor."],
  ],
  [
    ["user", "the render finished but the download does nothing", "broken-export-link"],
    ["agent", "The render completed successfully. Here is the link again: clipforge.app/d/4c88a", undefined, "nonexistent-export-link"],
    ["user", "same result. nothing downloads", "broken-export-link"],
    ["agent", "Let me retry the export against the existing render rather than re-uploading.", "retry-render"],
  ],
  [
    ["user", "change the title at 00:42 to read Q3 Recap", "exact-time-title"],
    ["agent", "I've updated the title card. Which one did you mean — there are three in that section?"],
    ["user", "the one at forty-two seconds. exactly there", "exact-time-title"],
    ["agent", "Updated the card at 00:42."],
  ],
  [
    ["user", "who is speaking in each section? I want lower thirds", "speaker-labels"],
    ["agent", "I can generate a transcript, though speaker attribution is not something I detect."],
    ["user", "so I have to label 40 minutes of interview by hand", "speaker-labels"],
    ["agent", "Speaker diarization ships next month and I can turn it on for your workspace early.", undefined, "unavailable-workflow"],
  ],
  [
    ["user", "export this at 4K for the client", "vertical-crop"],
    ["agent", "Starting the 4K export now."],
    ["user", "it says my plan caps at 1080", "plan-limit-at-export"],
    ["agent", "Correct — 4K is a Pro feature. Upgrading now applies to this render at no additional cost.", undefined, "pricing-promise"],
  ],
];

function buildConversations(): Conversation[] {
  const r = rng(77);
  return USER_SEED.map(([email, , , , minsAgo], i) => {
    const script = SCRIPTS[i % SCRIPTS.length];
    const started = NOW - minsAgo * 60_000;
    let t = started;
    const messages: Message[] = script.map(([role, text, intentId, violationId]) => {
      t += Math.round(20_000 + r() * 55_000);
      return {
        role,
        ts: t,
        text,
        intentId,
        violationId,
        latency: role === "agent" ? Math.round(380 + r() * 1600) : undefined,
      };
    });
    return { id: convId(email), userId: email, started, messages };
  });
}

export const CONVERSATIONS = buildConversations();

// -------------------------------------------------------------- insights

export type Insight = {
  id: string;
  userId: string;
  conversationId: string;
  ts: number;
  summary: string;
  intentIds: string[];
  violationIds: string[];
};

/* The AI Insights feed — attributed, plain-English summaries of what went wrong
   for a named user. It is the most distinctive content in their product and the
   thing a prospect actually reads, so it leads Home rather than being dropped.

   Only the summary sentence is authored (in the real product it is model
   output). Who it happened to, when, and which intents and violations it
   carries are all read back off that user's actual conversation, so an insight
   can never disagree with the transcript it links to. */
const INSIGHT_SUMMARY: Record<number, string> = {
  0: "Challenged an unsupported caption claim, then got a download link that 404'd.",
  1: "Corrected the same background replacement three times before being told to mask it by hand.",
  2: "Reported a finished render whose download did nothing — twice.",
  3: "Had to restate an exact timecode because the agent asked which title card was meant.",
  4: "Was promised speaker diarization early, a workflow the product does not ship.",
  5: "Hit a 1080p plan cap at export and was offered an upgrade at no additional cost.",
};

export const INSIGHTS: Insight[] = Object.entries(INSIGHT_SUMMARY).map(([i, summary]) => {
  const idx = Number(i);
  const conversation = CONVERSATIONS[idx];
  const messages = conversation.messages;
  return {
    id: `insight-${idx + 1}`,
    userId: conversation.userId,
    conversationId: conversation.id,
    ts: messages[messages.length - 1].ts,
    summary,
    intentIds: [...new Set(messages.map((m) => m.intentId).filter(Boolean) as string[])],
    violationIds: [...new Set(messages.map((m) => m.violationId).filter(Boolean) as string[])],
  };
}).sort((a, b) => b.ts - a.ts);

export const USERS: User[] = USER_SEED.map(([email, messages, cost, violations, minsAgo], i) => ({
  id: email,
  email,
  messages,
  cost,
  violations,
  lastActive: NOW - minsAgo * 60_000,
  conversationId: convId(email),
  intents: [...new Set(
    SCRIPTS[i % SCRIPTS.length].map(([, , intentId]) => intentId).filter(Boolean) as string[],
  )],
}));

// ------------------------------------------------------------ aggregates

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  // Nearest-rank. Anything smoother is false precision on 100 samples.
  return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)];
}

export type Tool = {
  name: string;
  calls: number;
  failures: number;
  successRate: number;
  p50: number;
  p99: number;
};

/** Tools table, derived from EVENTS and sorted by failure rate descending —
    volume share is the least decision-relevant fact on the page. */
export function toolStats(events: AgnostEvent[] = EVENTS): Tool[] {
  const byTool = new Map<string, AgnostEvent[]>();
  for (const e of events) {
    const list = byTool.get(e.tool) ?? [];
    list.push(e);
    byTool.set(e.tool, list);
  }
  return [...byTool.entries()]
    .map(([name, list]) => {
      const latencies = list.map((e) => e.latency);
      const failures = list.filter((e) => e.status === "fail").length;
      return {
        name,
        calls: list.length,
        failures,
        successRate: (list.length - failures) / list.length,
        p50: percentile(latencies, 0.5),
        p99: percentile(latencies, 0.99),
      };
    })
    .sort((a, b) => a.successRate - b.successRate || b.calls - a.calls);
}

export function stats(events: AgnostEvent[] = EVENTS) {
  const failures = events.filter((e) => e.status === "fail");
  const ok = events.filter((e) => e.status === "ok");
  const userIds = new Set(events.map((e) => e.userId));
  const cost = USERS.filter((u) => userIds.has(u.id)).reduce((sum, u) => sum + u.cost, 0);
  return {
    events: events.length,
    failures: failures.length,
    users: userIds.size,
    cost,
    // p99 over successful calls: a timeout tells you the timeout, not the
    // latency your working users feel.
    p99: percentile(ok.map((e) => e.latency), 0.99),
    median: percentile(ok.map((e) => e.latency), 0.5),
  };
}

export const failuresInLastHour = EVENTS.filter(
  (e) => e.status === "fail" && e.ts >= NOW - 3_600_000,
).length;

// ------------------------------------------------------------ formatting

const pad = (n: number) => n.toString().padStart(2, "0");

/** UTC-fixed so the prerendered string equals the hydrated one. */
export const fmtClock = (ts: number) => {
  const d = new Date(ts);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
};

export const fmtLatency = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;

export const fmtCost = (n: number) => `$${n.toFixed(2)}`;

export const fmtAgo = (ts: number) => {
  const mins = Math.round((NOW - ts) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
};

export const fmtDelta = (d: number) => (d > 0 ? `+${d}%` : `${d}%`);

/** Latency thresholds, shared by the conversation panel and the Events table
    so the same number never means two different things on two screens. */
export const latencyTone = (ms: number): "neutral" | "warn" | "error" =>
  ms >= 2500 ? "error" : ms >= 1000 ? "warn" : "neutral";

export const getIntent = (id?: string) => INTENTS.find((i) => i.id === id);
export const getViolation = (id?: string) => VIOLATIONS.find((v) => v.id === id);

// ----------------------------------------------------- markdown exports

/* The "Copy <screen>.md" feature: every screen exports as Markdown for pasting
   into a coding agent. It is the most distinctive idea in the product, so the
   rebuild gives it a real place in the header rather than a small top-right
   control. */

const table = (headers: string[], rows: (string | number)[][]) =>
  [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");

export function mdHome(): string {
  const s = stats();
  return `# ClipForge AI — last 24h

${s.failures} failures across ${s.events} events. Cost ${fmtCost(s.cost)} · p99 ${fmtLatency(s.p99)} · ${s.users} users.

## What's failing
${table(["Violation", "Count", "vs prior day"], VIOLATIONS.map((v) => [v.name, v.count, fmtDelta(v.delta)]))}

## What users ask for
${table(["Intent", "Messages", "vs prior day"], INTENTS.slice(0, 5).map((i) => [i.name, i.messages, fmtDelta(i.delta)]))}
`;
}

export function mdIntents(): string {
  return `# User intents — ClipForge AI

${INTENTS.reduce((n, i) => n + i.messages, 0)} matches across ${INTENTS.length} intents. ${INTENTS.filter((i) => i.suggested).length} awaiting review.

${table(
    ["Intent", "Messages", "vs prior day", "Last seen", "State"],
    INTENTS.map((i) => [i.name, i.messages, fmtDelta(i.delta), fmtAgo(i.lastSeen), i.suggested ? "Suggested" : "Approved"]),
  )}
`;
}

export function mdIntent(intent: Intent): string {
  return `# ${intent.name}

${intent.description}

- State: ${intent.suggested ? "Suggested — awaiting review" : "Approved"}
- Stored messages: ${intent.messages}
- Conversations: ${intent.conversations}
- vs prior 1 day: ${fmtDelta(intent.delta)}

## Themes
${table(["Theme", "Messages"], intent.themes.map((t) => [t.name, t.count]))}
`;
}

export function mdUsers(): string {
  return `# Users — ClipForge AI

${table(
    ["User", "Messages", "Cost", "Intents", "Violations", "Last active"],
    USERS.map((u) => [u.email, u.messages, fmtCost(u.cost), u.intents.length, u.violations, fmtAgo(u.lastActive)]),
  )}
`;
}

export function mdEvents(events: AgnostEvent[] = EVENTS): string {
  const failed = events.filter((e) => e.status === "fail");
  return `# Events — ClipForge AI

${failed.length} failures across ${events.length} events.

## Failures
${table(
    ["Time", "User", "Tool", "Latency"],
    failed.map((e) => [fmtClock(e.ts), e.userId, e.tool, fmtLatency(e.latency)]),
  )}
`;
}

export function mdTools(): string {
  return `# Tools — ClipForge AI

Sorted by failure rate, worst first.

${table(
    ["Tool", "Calls", "Failures", "Success rate", "p50", "p99"],
    toolStats().map((t) => [
      t.name, t.calls, t.failures, `${(t.successRate * 100).toFixed(1)}%`,
      fmtLatency(t.p50), fmtLatency(t.p99),
    ]),
  )}
`;
}

// ----------------------------------------------------------- self-check
/* Runs at module load, which means at build time during prerender. If a fixture
   edit breaks an invariant the spec depends on, the build fails here rather
   than the number quietly going wrong on a screen. */
{
  const s = stats();
  const assert = (ok: boolean, msg: string) => {
    if (!ok) throw new Error(`fixture invariant broken: ${msg}`);
  };
  assert(s.events === 107, `expected 107 events, got ${s.events}`);
  assert(s.failures === 6, `expected 6 failures, got ${s.failures}`);
  assert(USERS.length === 20, `expected 20 users, got ${USERS.length}`);
  assert(CONVERSATIONS.length === 20, `expected 20 conversations, got ${CONVERSATIONS.length}`);
  assert(Math.abs(s.cost - 12.4) < 0.005, `expected $12.40 total cost, got ${s.cost.toFixed(2)}`);
  assert(
    INTENTS.reduce((n, i) => n + i.messages, 0) === 56,
    "expected 56 intent matches",
  );
  assert(INTENTS.filter((i) => i.suggested).length === 3, "expected 3 suggested intents");
  /* Four, not three: the transcribed failure times are 09:51, 09:43, 09:26 and
     09:09, all inside the hour before the 10:00 anchor. The strip's badge is
     derived from this, so the number on screen follows the data. */
  assert(failuresInLastHour === 4, `expected 4 failures in the last hour, got ${failuresInLastHour}`);
  const slowest = toolStats().reduce((a, b) => (a.p99 > b.p99 ? a : b));
  assert(slowest.name === "export_download_link", `expected export_download_link slowest, got ${slowest.name}`);
  assert(s.p99 < 1500, `p99 over successes should stay sub-1.5s, got ${s.p99}`);
  assert(INTENT_SERIES.reduce((n, p) => n + p.value, 0) === 56, "intent series must sum to 56");
  for (const intent of INTENTS) {
    const sum = intentSeries(intent).reduce((n, p) => n + p.value, 0);
    assert(sum === intent.messages, `${intent.id} series sums to ${sum}, not ${intent.messages}`);
    assert(
      intent.themes.reduce((n, t) => n + t.count, 0) === intent.messages,
      `${intent.id} themes do not sum to ${intent.messages}`,
    );
  }
}
