/* "Copy <screen>.md" — every screen exports as Markdown for pasting into a
   coding agent. It is the most distinctive idea in the product.

   These read through the adapter at click time rather than from a snapshot, so
   the export always matches what is on screen, and they cost nothing on load. */

import type { AgnostAdapter, Range } from "./types";
import { fmtCost, fmtDelta, fmtLatency, summarise } from "./format";

const table = (headers: string[], rows: (string | number)[][]) =>
  [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");

const ago = (iso: string, now: number) => {
  const mins = Math.round((now - Date.parse(iso)) / 60_000);
  return mins < 60 ? `${mins} mins ago` : `${Math.round(mins / 60)} hours ago`;
};

export async function mdHome(a: AgnostAdapter, range: Range): Promise<string> {
  const [events, violations, intents] = await Promise.all([
    a.getEvents(range),
    a.getViolations(range),
    a.getIntents(range),
  ]);
  const s = summarise(events);
  return `# ClipForge AI — last 24h

${s.failures} failures across ${s.events} events. Cost ${fmtCost(s.cost)} · p99 ${fmtLatency(s.p99)} · ${s.users} users.

## What's failing
${table(["Violation", "Count", "vs prior day"], violations.map((v) => [v.name, v.count, fmtDelta(v.deltaPct)]))}

## What users ask for
${table(
    ["Intent", "Messages", "vs prior day"],
    intents.filter((i) => !i.suggested).slice(0, 5).map((i) => [i.name, i.messages, fmtDelta(i.deltaPct)]),
  )}
`;
}

export async function mdIntents(a: AgnostAdapter, range: Range): Promise<string> {
  const intents = await a.getIntents(range);
  const now = Date.parse(range.to);
  return `# User intents — ClipForge AI

${intents.reduce((n, i) => n + i.messages, 0)} matches across ${intents.length} intents. ${intents.filter((i) => i.suggested).length} awaiting review.

${table(
    ["Intent", "Messages", "vs prior day", "Last seen", "State"],
    intents.map((i) => [
      i.name, i.messages, fmtDelta(i.deltaPct), ago(i.lastSeen, now),
      i.suggested ? "Suggested" : "Approved",
    ]),
  )}
`;
}

export async function mdIntent(a: AgnostAdapter, slug: string): Promise<string> {
  const i = await a.getIntent(slug);
  return `# ${i.name}

${i.description}

- State: ${i.suggested ? "Suggested — awaiting review" : "Approved"}
- Stored messages: ${i.messages}
- Conversations: ${i.conversations}
- vs prior 1 day: ${fmtDelta(i.deltaPct)}

## Themes
${table(["Theme", "Messages"], i.themes.map((t) => [t.name, t.count]))}
`;
}

export async function mdUsers(a: AgnostAdapter, range: Range): Promise<string> {
  const users = await a.getUsers(range);
  const now = Date.parse(range.to);
  return `# Users — ClipForge AI

${table(
    ["User", "Messages", "Cost", "Intents", "Violations", "Last active"],
    users.map((u) => [
      u.email, u.messages, fmtCost(u.costUsd), u.intents.length, u.violations.length,
      ago(u.lastActive, now),
    ]),
  )}
`;
}

export async function mdEvents(a: AgnostAdapter, range: Range): Promise<string> {
  const events = await a.getEvents(range);
  const failed = events.filter((e) => e.status === "failure");
  return `# Events — ClipForge AI

${failed.length} failures across ${events.length} events.

## Failures
${table(
    ["Time", "User", "Tool", "Latency"],
    failed.map((e) => [e.timestamp, e.userId, e.tool, fmtLatency(e.latencyMs)]),
  )}
`;
}

export async function mdTools(a: AgnostAdapter, range: Range): Promise<string> {
  const tools = await a.getToolStats(range);
  return `# Tools — ClipForge AI

Sorted by failure rate, worst first.

${table(
    ["Tool", "Calls", "Failures", "Success rate", "p50", "p99"],
    tools.map((t) => [
      t.name, t.calls, t.failures, `${(t.successRate * 100).toFixed(1)}%`,
      fmtLatency(t.p50Ms), fmtLatency(t.p99Ms),
    ]),
  )}
`;
}

export async function mdViolations(a: AgnostAdapter, range: Range): Promise<string> {
  const [violations, events] = await Promise.all([a.getViolations(range), a.getEvents(range)]);
  const users = (slug: string) =>
    new Set(events.filter((e) => e.violation === slug).map((e) => e.userId)).size;
  return `# Agent violations — ClipForge AI

${violations.reduce((n, v) => n + v.count, 0)} violations across ${
    new Set(events.filter((e) => e.violation).map((e) => e.userId)).size
  } users.

${table(
    ["Violation", "Count", "Users", "vs prior day"],
    violations.map((v) => [v.name, v.count, users(v.slug), fmtDelta(v.deltaPct)]),
  )}
`;
}
