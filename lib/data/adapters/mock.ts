/* The placeholder adapter. It is not a shortcut — it implements the same
   interface as a real one and behaves like it, because a mock that resolves
   synchronously means loading states are never exercised during development
   and break the first time real latency arrives.

   This is the only file in the app permitted to import from lib/agnost. */

import {
  CONVERSATIONS,
  EVENTS,
  INSIGHTS,
  INTENTS,
  INTERVAL_LABELS,
  USERS,
  VIOLATIONS,
  intentSeries,
  toolStats,
  type AgnostEvent,
} from "../../agnost/data.ts";
import type {
  AgnostAdapter,
  Conversation,
  Event,
  Insight,
  Intent,
  IntentDetail,
  Range,
  ToolStat,
  User,
  Violation,
} from "../types.ts";

/* A real API does not answer instantly, so neither does this — without a delay
   the skeletons never render in development and break the first time real
   latency arrives.

   The duration walks a fixed list rather than being randomised: two identical
   loads must settle at the same moment, or screenshots differ and every visual
   regression becomes unprovable. */
let tick = 0;
const DELAYS_MS = [180, 240, 300, 210, 270, 330, 195, 255];
const delay = () => new Promise((r) => setTimeout(r, DELAYS_MS[tick++ % DELAYS_MS.length]));

/* Error states need exercising too. ?fail=1 makes every call reject. */
function maybeFail() {
  if (typeof window === "undefined") return;
  if (new URLSearchParams(window.location.search).get("fail") === "1") {
    throw new Error("Mock adapter: forced failure via ?fail=1");
  }
}

async function resolve<T>(value: T): Promise<T> {
  await delay();
  maybeFail();
  return value;
}

const iso = (ms: number) => new Date(ms).toISOString();
const within = (ts: number, q: Range) =>
  ts >= Date.parse(q.from) && ts < Date.parse(q.to);

/* Each user's total spend, spread evenly across the calls they made, so summing
   any window gives that window's cost instead of counting a user's lifetime
   total once per event. */
const eventsPerUser = EVENTS.reduce<Map<string, number>>(
  (m, e) => m.set(e.userId, (m.get(e.userId) ?? 0) + 1),
  new Map(),
);

const toEvent = (e: AgnostEvent): Event => {
  const total = USERS.find((u) => u.id === e.userId)?.cost;
  const share = eventsPerUser.get(e.userId) ?? 1;
  return {
    id: e.id,
    timestamp: iso(e.ts),
    tool: e.tool,
    status: e.status === "fail" ? "failure" : "success",
    latencyMs: e.latency,
    costUsd: total === undefined ? null : total / share,
    userId: e.userId,
    conversationId: e.conversationId,
    violation: e.violationId,
  };
};

export const mockAdapter: AgnostAdapter = {
  async getEvents(q) {
    const rows = EVENTS.filter((e) => within(e.ts, q)).map(toEvent);
    return resolve(q.status ? rows.filter((r) => r.status === q.status) : rows);
  },

  async getUsers(q) {
    const active = new Set(
      EVENTS.filter((e) => within(e.ts, q)).map((e) => e.userId),
    );
    const rows: User[] = USERS.filter((u) => active.has(u.id)).map((u) => ({
      id: u.id,
      email: u.email,
      messages: u.messages,
      costUsd: u.cost,
      intents: u.intents,
      /* Read off the transcript rather than stored as a number, so the pills in
         the table are the same violations the conversation panel shows. */
      violations: [
        ...new Set(
          (CONVERSATIONS.find((c) => c.id === u.conversationId)?.messages ?? [])
            .map((m) => m.violationId)
            .filter(Boolean) as string[],
        ),
      ],
      lastActive: iso(u.lastActive),
      conversationId: u.conversationId,
    }));
    return resolve(rows);
  },

  async getConversation(id) {
    const c = CONVERSATIONS.find((x) => x.id === id);
    if (!c) throw new Error(`No conversation ${id}`);
    const out: Conversation = {
      id: c.id,
      userId: c.userId,
      startedAt: iso(c.started),
      messages: c.messages.map((m) => ({
        role: m.role,
        timestamp: iso(m.ts),
        text: m.text,
        latencyMs: m.latency,
        intent: m.intentId,
        violation: m.violationId,
      })),
    };
    return resolve(out);
  },

  async getIntents() {
    const rows: Intent[] = INTENTS.map((i) => ({
      slug: i.id,
      name: i.name,
      description: i.description,
      messages: i.messages,
      conversations: i.conversations,
      deltaPct: i.delta,
      lastSeen: iso(i.lastSeen),
      suggested: i.suggested,
      trend: i.trend,
      trendLabels: INTERVAL_LABELS,
    }));
    return resolve(rows);
  },

  async getIntent(slug) {
    const i = INTENTS.find((x) => x.id === slug);
    if (!i) throw new Error(`No intent ${slug}`);
    const out: IntentDetail = {
      slug: i.id,
      name: i.name,
      description: i.description,
      messages: i.messages,
      conversations: i.conversations,
      deltaPct: i.delta,
      lastSeen: iso(i.lastSeen),
      suggested: i.suggested,
      trend: i.trend,
      themes: i.themes,
      series: intentSeries(i),
    };
    return resolve(out);
  },

  async getViolations() {
    const rows: Violation[] = VIOLATIONS.map((v) => ({
      slug: v.id,
      name: v.name,
      description: v.description,
      count: v.count,
      deltaPct: v.delta,
    }));
    return resolve(rows);
  },

  async getToolStats(q) {
    const scoped = EVENTS.filter((e) => within(e.ts, q));
    const rows: ToolStat[] = toolStats(scoped).map((t) => ({
      name: t.name,
      calls: t.calls,
      failures: t.failures,
      successRate: t.successRate,
      p50Ms: t.p50,
      p99Ms: t.p99,
    }));
    return resolve(rows);
  },

  async getInsights(q) {
    const rows: Insight[] = INSIGHTS.filter((i) => within(i.ts, q)).map((i) => ({
      id: i.id,
      userId: i.userId,
      conversationId: i.conversationId,
      timestamp: iso(i.ts),
      summary: i.summary,
      intents: i.intentIds,
      violations: i.violationIds,
    }));
    return resolve(rows);
  },
};
