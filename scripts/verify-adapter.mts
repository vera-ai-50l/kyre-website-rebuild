/* npm run verify:adapter
   ---------------------------------------------------------------------------
   Calls every function on the configured adapter and checks the shape of what
   comes back against the contract in lib/data/types.ts.

   Run it against your implementation before wiring the screens up. A green run
   means the console will render; a red one names the field that is wrong, which
   is faster than finding out from a blank panel. */

import { adapter, currentRange, DATA_SOURCE } from "../lib/data/adapter.ts";

type Check = { field: string; ok: boolean; got: string };

const t = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

const isIso = (v: unknown) =>
  typeof v === "string" && !Number.isNaN(Date.parse(v)) && /T/.test(v) &&
  /(Z|[+-]\d{2}:?\d{2})$/.test(v);

function check(obj: Record<string, unknown>, spec: Record<string, (v: unknown) => boolean>): Check[] {
  return Object.entries(spec).map(([field, pred]) => ({
    field,
    ok: pred(obj[field]),
    got: t(obj[field]),
  }));
}

const str = (v: unknown) => typeof v === "string" && v.length > 0;
const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const nullableNum = (v: unknown) => v === null || num(v);
const bool = (v: unknown) => typeof v === "boolean";
const arr = (v: unknown) => Array.isArray(v);
const optStr = (v: unknown) => v === undefined || typeof v === "string";

let failures = 0;

function report(name: string, checks: Check[], sampleCount: number) {
  const bad = checks.filter((c) => !c.ok);
  if (bad.length === 0) {
    console.log(`  \x1b[32mPASS\x1b[0m ${name} — ${sampleCount} row(s), shape OK`);
    return;
  }
  failures++;
  console.log(`  \x1b[31mFAIL\x1b[0m ${name}`);
  for (const b of bad) {
    console.log(`       ${b.field}: got ${b.got}, which does not satisfy the contract`);
  }
}

async function run<T>(name: string, fn: () => Promise<T>, verify: (v: T) => void) {
  try {
    verify(await fn());
  } catch (e) {
    failures++;
    console.log(`  \x1b[31mFAIL\x1b[0m ${name} — threw: ${(e as Error).message}`);
  }
}

const range = currentRange();

console.log(`\nVerifying adapter: \x1b[1m${DATA_SOURCE}\x1b[0m`);
console.log(`Window: ${range.from} → ${range.to}\n`);

await run("getEvents", () => adapter.getEvents(range), (rows) => {
  if (!rows.length) return report("getEvents", [{ field: "(rows)", ok: false, got: "empty" }], 0);
  report("getEvents", check(rows[0] as unknown as Record<string, unknown>, {
    id: str, timestamp: isIso, tool: str,
    status: (v) => v === "success" || v === "failure",
    latencyMs: num, costUsd: nullableNum, userId: str, conversationId: str,
    violation: optStr,
  }), rows.length);
});

await run("getUsers", () => adapter.getUsers(range), (rows) => {
  if (!rows.length) return report("getUsers", [{ field: "(rows)", ok: false, got: "empty" }], 0);
  report("getUsers", check(rows[0] as unknown as Record<string, unknown>, {
    id: str, email: str, messages: num, costUsd: nullableNum,
    intents: arr, violations: arr, lastActive: isIso, conversationId: str,
  }), rows.length);
});

await run("getIntents", () => adapter.getIntents(range), (rows) => {
  if (!rows.length) return report("getIntents", [{ field: "(rows)", ok: false, got: "empty" }], 0);
  report("getIntents", check(rows[0] as unknown as Record<string, unknown>, {
    slug: str, name: str, description: str, messages: num, conversations: num,
    deltaPct: num, lastSeen: isIso, suggested: bool, trend: arr,
  }), rows.length);
});

await run("getIntent", async () => {
  const list = await adapter.getIntents(range);
  return adapter.getIntent(list[0].slug);
}, (row) => {
  const checks = check(row as unknown as Record<string, unknown>, {
    slug: str, name: str, themes: arr, series: arr,
  });
  // The chart labels its total from `messages`, so the series has to add up.
  const sum = row.series.reduce((n, p) => n + p.value, 0);
  checks.push({
    field: "series sums to messages",
    ok: sum === row.messages,
    got: `${sum} vs messages ${row.messages}`,
  });
  report("getIntent", checks, 1);
});

await run("getConversation", async () => {
  const users = await adapter.getUsers(range);
  return adapter.getConversation(users[0].conversationId);
}, (row) => {
  const checks = check(row as unknown as Record<string, unknown>, {
    id: str, userId: str, startedAt: isIso, messages: arr,
  });
  const m = row.messages[0] as unknown as Record<string, unknown> | undefined;
  if (m) {
    checks.push(
      { field: "messages[].role", ok: m.role === "user" || m.role === "agent", got: t(m.role) },
      { field: "messages[].timestamp", ok: isIso(m.timestamp), got: t(m.timestamp) },
      { field: "messages[].text", ok: str(m.text), got: t(m.text) },
    );
  }
  report("getConversation", checks, row.messages.length);
});

await run("getViolations", () => adapter.getViolations(range), (rows) => {
  if (!rows.length) return report("getViolations", [{ field: "(rows)", ok: false, got: "empty" }], 0);
  report("getViolations", check(rows[0] as unknown as Record<string, unknown>, {
    slug: str, name: str, description: str, count: num, deltaPct: num,
  }), rows.length);
});

await run("getToolStats", () => adapter.getToolStats(range), (rows) => {
  if (!rows.length) return report("getToolStats", [{ field: "(rows)", ok: false, got: "empty" }], 0);
  const r = rows[0];
  const checks = check(r as unknown as Record<string, unknown>, {
    name: str, calls: num, failures: num, successRate: num, p50Ms: num, p99Ms: num,
  });
  checks.push({
    field: "successRate is a 0..1 fraction",
    ok: r.successRate >= 0 && r.successRate <= 1,
    got: String(r.successRate),
  });
  report("getToolStats", checks, rows.length);
});

if (adapter.getInsights) {
  await run("getInsights (optional)", () => adapter.getInsights!(range), (rows) => {
    if (!rows.length) return console.log("  \x1b[33mSKIP\x1b[0m getInsights — returned no rows");
    report("getInsights", check(rows[0] as unknown as Record<string, unknown>, {
      id: str, userId: str, conversationId: str, timestamp: isIso,
      summary: str, intents: arr, violations: arr,
    }), rows.length);
  });
} else {
  console.log("  \x1b[33mSKIP\x1b[0m getInsights — not implemented (the Home panel hides itself)");
}

console.log(
  failures === 0
    ? "\n\x1b[32mAll checks passed.\x1b[0m The console will render against this adapter.\n"
    : `\n\x1b[31m${failures} check(s) failed.\x1b[0m Fix the fields above and re-run.\n`,
);
process.exit(failures === 0 ? 0 : 1);
