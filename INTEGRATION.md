# Integration guide

How to run this console against your backend.

There are **seven functions**. Implement them and every screen works — there are
no other integration points, and no screen file needs editing.

---

## 1. The switch

```
NEXT_PUBLIC_DATA_SOURCE = mock | rest     # defaults to mock
NEXT_PUBLIC_API_BASE_URL = https://api.yourdomain.com
```

`mock` serves the bundled ClipForge fixtures. `rest` uses
`lib/data/adapters/rest.ts`, which is the file you fill in.

---

## 2. The contract

`lib/data/types.ts` is the deliverable. Everything else is implementation.

```ts
interface AgnostAdapter {
  getEvents(q: { from: string; to: string; status?: EventStatus }): Promise<Event[]>;
  getUsers(q: { from: string; to: string }): Promise<User[]>;
  getConversation(id: string): Promise<Conversation>;
  getIntents(q: { from: string; to: string }): Promise<Intent[]>;
  getIntent(slug: string): Promise<IntentDetail>;
  getViolations(q: { from: string; to: string }): Promise<Violation[]>;
  getToolStats(q: { from: string; to: string }): Promise<ToolStat[]>;
  getInsights?(q: { from: string; to: string }): Promise<Insight[]>;  // optional
}
```

`getInsights` is optional. Leave it off and the "What users are saying" panel on
Home hides itself; everything else is unaffected.

---

## 3. A worked example

`getEvents` is already implemented in `rest.ts` against a hypothetical endpoint.
It shows the whole pattern — build the query, call the endpoint, map field by
field into the contract:

```ts
async getEvents(q) {
  const body = await api<{ data: RawEvent[] }>("/events", {
    from: q.from, to: q.to, status: q.status,
  });
  return body.data.map((r) => ({
    id: r.event_id,
    timestamp: r.ts,
    tool: r.tool_name,
    status: r.ok ? "success" : "failure",
    latencyMs: r.duration_ms,
    costUsd: r.cost_cents === null ? null : r.cost_cents / 100,
    userId: r.user_email,
    conversationId: r.conversation_id,
    violation: r.violation_slug,
  }));
}
```

Change the names on the right to match your API. The shape on the left is fixed.

---

## 4. Field-by-field notes

These are the details that cause silent breakage, so they are worth reading
before you start rather than after the first blank panel.

**Timestamps** — ISO 8601 with an explicit offset. `Z` is fine. A bare
`2026-08-13T09:41:22` is interpreted as *local time on the client*, so the
console will show different times to users in different zones. Always include
the offset.

**`costUsd: null` does not mean zero.** It means "this call was not priced", and
renders as an em dash. Returning `0` claims the call was free, which is a
different and usually wrong statement. Costs are whole dollars (`0.34`), not
cents, and not preformatted strings.

**`Event.costUsd` is the cost of that one call**, not the user's running total.
The Home headline sums it across the visible window, so a running total would
multiply the spend by the number of events.

**`successRate` is a 0..1 fraction**, not a percentage. The UI multiplies by 100.

**Durations are integer milliseconds.** `latencyMs`, `p50Ms`, `p99Ms`.

**`IntentDetail.series` should sum to `messages`.** The panel header states the
total and the chart plots the series; if they disagree, the screen contradicts
itself. `verify:adapter` checks this explicitly.

**`from`/`to` are inclusive-exclusive**: `from <= t < to`.

**Pagination** — the console currently requests a 24-hour window and renders
what it gets. If your endpoints paginate, page inside your adapter method and
return the full array; do not return the first page only, or the totals on Home
will disagree with the tables under them.

**Errors** — throw. Do not return an empty array to signal failure. Every screen
distinguishes "loaded, nothing there" (an empty state that tells the user what
to do) from "could not load" (an error state with the message and a retry). An
empty array on failure collapses the two and tells the user their agent had a
quiet day when in fact the API is down.

---

## 5. Verify before you wire

```bash
npm run verify:adapter
```

Calls every function against the configured adapter and checks the shape of what
comes back. Against the mock:

```
Verifying adapter: mock

  PASS getEvents — 107 row(s), shape OK
  PASS getUsers — 20 row(s), shape OK
  ...
  All checks passed. The console will render against this adapter.
```

Against a partly-built `rest` adapter it names what is missing:

```
  FAIL getUsers — threw: rest adapter: getUsers() is not implemented yet.
```

Run it with your env set:

```bash
NEXT_PUBLIC_DATA_SOURCE=rest NEXT_PUBLIC_API_BASE_URL=https://api.example.com npm run verify:adapter
```

A green run means the screens will render. It is much faster than finding out
from a blank panel which field was misspelled.

---

## 6. Exercising the states

Loading and error states are a third of what users actually see, so they are
built rather than left to fall out of the happy path.

- **Loading** — the mock adapter waits 150–400ms on purpose. Without that delay
  skeletons never appear in development and break the first time real latency
  arrives.
- **Errors** — append `?fail=1` to any console URL. The mock adapter throws on
  every call and every panel shows its error state with a working retry.
- **Empty** — click a sparse region of the events strip to scrub to a
  ten-minute window with nothing in it.

---

## 7. What is mock-only

Two behaviours exist because this is a demo and should be replaced:

- `currentRange()` in `lib/data/adapter.ts` returns a **fixed** 24-hour window
  ending 2026-08-13T10:00Z, so the fixtures always land inside it. Against a
  real backend, change the default to `Date.now()`.
- The events strip assumes the whole window fits in memory (107 events). At
  production volume, have `getEvents` return pre-bucketed counts for the strip
  and page the table separately.
