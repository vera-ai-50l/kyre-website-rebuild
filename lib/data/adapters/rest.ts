/* The skeleton you fill in.
   ---------------------------------------------------------------------------
   Point NEXT_PUBLIC_API_BASE_URL at your API, map each response to the shapes
   in ../types.ts, and set NEXT_PUBLIC_DATA_SOURCE=rest.

   Nothing else in the app changes. Every screen already reads through these
   seven functions, so when they return your data the console runs on it.

   The one worked example below (getEvents) shows the whole pattern: build the
   query, call the endpoint, map field-by-field into the contract. The rest
   deliberately throw rather than returning empty arrays — an unimplemented
   method should surface as a visible error state, not as a screen that looks
   like you have no data. */

import type {
  AgnostAdapter,
  Conversation,
  Event,
  Intent,
  IntentDetail,
  Range,
  ToolStat,
  User,
  Violation,
} from "../types.ts";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function api<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  if (!BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Set it, or run with NEXT_PUBLIC_DATA_SOURCE=mock.",
    );
  }
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined) url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`${path} responded ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

const notImplemented = (name: string) => (): never => {
  throw new Error(
    `rest adapter: ${name}() is not implemented yet. See lib/data/adapters/rest.ts and INTEGRATION.md.`,
  );
};

/* ---- worked example -------------------------------------------------------
   Assumes GET /events?from=&to=&status= returning:
     { data: [{ event_id, ts, tool_name, ok, duration_ms,
                cost_cents, user_email, conversation_id, violation_slug }] }
   Adjust the mapping to your field names; the shape on the left is fixed. */
type RawEvent = {
  event_id: string;
  ts: string;
  tool_name: string;
  ok: boolean;
  duration_ms: number;
  cost_cents: number | null;
  user_email: string;
  conversation_id: string;
  violation_slug?: string;
};

export const restAdapter: AgnostAdapter = {
  async getEvents(q: Range & { status?: "success" | "failure" }): Promise<Event[]> {
    const body = await api<{ data: RawEvent[] }>("/events", {
      from: q.from,
      to: q.to,
      status: q.status,
    });
    return body.data.map((r) => ({
      id: r.event_id,
      timestamp: r.ts,
      tool: r.tool_name,
      status: r.ok ? "success" : "failure",
      latencyMs: r.duration_ms,
      // The contract is whole dollars; null stays null rather than becoming 0.
      costUsd: r.cost_cents === null ? null : r.cost_cents / 100,
      userId: r.user_email,
      conversationId: r.conversation_id,
      violation: r.violation_slug,
    }));
  },

  getUsers: notImplemented("getUsers") as unknown as (q: Range) => Promise<User[]>,
  getConversation: notImplemented("getConversation") as unknown as (
    id: string,
  ) => Promise<Conversation>,
  getIntents: notImplemented("getIntents") as unknown as (q: Range) => Promise<Intent[]>,
  getIntent: notImplemented("getIntent") as unknown as (slug: string) => Promise<IntentDetail>,
  getViolations: notImplemented("getViolations") as unknown as (
    q: Range,
  ) => Promise<Violation[]>,
  getToolStats: notImplemented("getToolStats") as unknown as (
    q: Range,
  ) => Promise<ToolStat[]>,
};
