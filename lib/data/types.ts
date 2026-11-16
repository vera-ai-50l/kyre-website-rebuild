/* THE CONTRACT.
   ---------------------------------------------------------------------------
   This file is the deliverable. Everything else in lib/data is implementation.

   Seven functions. That is the entire integration surface between these screens
   and a real backend — implement AgnostAdapter against your API, flip
   NEXT_PUBLIC_DATA_SOURCE, and the console runs on live data with no changes to
   any screen.

   Conventions that hold across every method:
   - All timestamps are ISO 8601 strings with an explicit offset ("Z" is fine).
     They are parsed with `new Date(...)`, so anything Date accepts will work,
     but an offset is required — a bare "2026-08-13T09:41:22" is read as local
     time on the client and will drift between users in different zones.
   - Money is a number of whole US dollars (0.34 means 34 cents), never a
     preformatted string. `null` means "we did not price this call", which the
     UI renders as an em dash — it does not mean zero.
   - Durations are integer milliseconds.
   - `from`/`to` are inclusive-exclusive: from <= t < to.
   - Any method may reject. The hooks surface the rejection as an error state;
     nothing swallows it. */

export type EventStatus = "success" | "failure";

export interface Event {
  id: string;
  /** ISO 8601 with offset. */
  timestamp: string;
  /** Tool or function the agent invoked, e.g. "export_download_link". */
  tool: string;
  status: EventStatus;
  latencyMs: number;
  /** Cost of THIS call in whole dollars — not the user's running total, so
      summing a window gives that window's spend. null = not priced, rendered as
      "—", never as $0.00. */
  costUsd: number | null;
  userId: string;
  conversationId: string;
  /** Slug of the violation this event triggered, if any. See getViolations(). */
  violation?: string;
}

export interface User {
  id: string;
  /** Display handle. The console shows this in the User column. */
  email: string;
  messages: number;
  costUsd: number | null;
  /** Intent slugs seen for this user. The Users table renders these as text,
      not as a count — "1" tells the reader nothing they can act on. */
  intents: string[];
  /** Violation slugs this user hit. Same reason: text, not a tally. */
  violations: string[];
  lastActive: string;
  /** Most recent conversation, used to open the transcript panel. */
  conversationId: string;
}

export interface Message {
  role: "user" | "agent";
  timestamp: string;
  text: string;
  /** Agent turns only. */
  latencyMs?: number;
  intent?: string;
  violation?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  startedAt: string;
  messages: Message[];
}

export interface Intent {
  /** URL-safe. Used as the route segment: /intents/{slug}. */
  slug: string;
  name: string;
  description: string;
  messages: number;
  conversations: number;
  /** Percent change vs the prior equivalent window. -100..+inf. */
  deltaPct: number;
  lastSeen: string;
  /** true = discovered by the model, awaiting human approval. */
  suggested: boolean;
  /** Sparkline series, oldest first. Any length; the UI does not assume 7.
      Should sum to `messages` — the Intents chart sums these across every row
      and prints the total in its header, so a decorative shape that does not
      add up makes the chart contradict its own title. */
  trend: number[];
  /** Interval labels for `trend`, same length. Without them a bare number[] is
      not plottable and the x-axis has to be invented by the UI. */
  trendLabels?: string[];
}

export interface IntentDetail extends Intent {
  themes: { name: string; count: number }[];
  /** Per-interval counts. Should sum to `messages`. */
  series: { label: string; value: number }[];
}

export interface Violation {
  slug: string;
  name: string;
  description: string;
  count: number;
  deltaPct: number;
}

export interface ToolStat {
  name: string;
  calls: number;
  failures: number;
  /** 0..1. The UI formats it as a percentage. */
  successRate: number;
  p50Ms: number;
  p99Ms: number;
}

export interface Insight {
  id: string;
  userId: string;
  conversationId: string;
  timestamp: string;
  /** One sentence. The UI truncates to a single line. */
  summary: string;
  intents: string[];
  violations: string[];
}

/** Inclusive-exclusive time window, ISO 8601 with offset. */
export interface Range {
  from: string;
  to: string;
}

export interface AgnostAdapter {
  getEvents(q: Range & { status?: EventStatus }): Promise<Event[]>;
  getUsers(q: Range): Promise<User[]>;
  getConversation(id: string): Promise<Conversation>;
  getIntents(q: Range): Promise<Intent[]>;
  getIntent(slug: string): Promise<IntentDetail>;
  getViolations(q: Range): Promise<Violation[]>;
  getToolStats(q: Range): Promise<ToolStat[]>;
  /** Optional: the AI Insights feed on Home. Omit and the panel hides itself. */
  getInsights?(q: Range): Promise<Insight[]>;
}
