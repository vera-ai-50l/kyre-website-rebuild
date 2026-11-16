"use client";

import Compare, { type View } from "@/components/Compare";
import {
  Chip,
  EmptyState,
  ErrorState,
  SkeletonTable,
  StatusPill,
  Toolbar,
} from "@/components/rebuilt";

type Run = {
  name: string;
  id: string;
  input: string;
  start: string;
  latency: number;
  tokens: number;
  cost: string;
  status: "success" | "error" | "pending";
};

const RUNS: Run[] = [
  { name: "agent_executor", id: "1f0a-8c21", input: "Find Q1 churn drivers across enterprise accounts", start: "2026-07-19T09:41:22", latency: 8412, tokens: 14382, cost: "$0.0861", status: "success" },
  { name: "retrieval_qa", id: "1f0a-8b9e", input: "What does clause 7.2 say about SLA credits?", start: "2026-07-19T09:40:51", latency: 1240, tokens: 3210, cost: "$0.0192", status: "success" },
  { name: "extract_entities", id: "1f0a-8b41", input: "Parse vendor invoices from the shared inbox", start: "2026-07-19T09:39:37", latency: 620, tokens: 1847, cost: "$0.0110", status: "error" },
  { name: "ChatAnthropic", id: "1f0a-8ad2", input: "Summarize the incident postmortem for exec readout", start: "2026-07-19T09:38:04", latency: 2130, tokens: 5904, cost: "$0.0354", status: "success" },
  { name: "rerank_documents", id: "1f0a-8a67", input: "Top 20 support tickets mentioning latency", start: "2026-07-19T09:37:48", latency: 0, tokens: 0, cost: "—", status: "pending" },
  { name: "agent_executor", id: "1f0a-89f3", input: "Draft renewal email for at-risk accounts", start: "2026-07-19T09:35:12", latency: 6871, tokens: 11205, cost: "$0.0673", status: "success" },
  { name: "sql_generator", id: "1f0a-8988", input: "Weekly active teams by plan tier, last 90 days", start: "2026-07-19T09:33:40", latency: 940, tokens: 2418, cost: "$0.0145", status: "success" },
  { name: "retrieval_qa", id: "1f0a-8901", input: "Which regions are covered by the EU data addendum?", start: "2026-07-19T09:31:09", latency: 1580, tokens: 3877, cost: "$0.0233", status: "error" },
  { name: "classify_intent", id: "1f0a-88b7", input: "Route inbound: 'need SSO enabled before Friday'", start: "2026-07-19T09:29:55", latency: 310, tokens: 692, cost: "$0.0041", status: "success" },
];

const fmtLatency = (ms: number) =>
  ms === 0 ? "—" : ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;

const STATUS_META = {
  success: { kind: "ok" as const, label: "Success" },
  error: { kind: "bad" as const, label: "Error" },
  pending: { kind: "warn" as const, label: "Pending" },
};

function Real() {
  return (
    <div className="bg-white text-[12px] text-gray-600">
      <div className="flex items-center gap-3 border-b border-gray-200 px-3 py-2">
        <span className="text-gray-800">prod-agent-v2</span>
        <span className="text-gray-400">Runs</span>
        <span className="text-gray-400">Threads</span>
        <span className="text-gray-400">Monitor</span>
        <input
          readOnly
          placeholder="Filter runs..."
          className="ml-auto w-40 rounded border border-gray-300 px-2 py-1 text-[11px]"
        />
      </div>
      <table className="w-full min-w-[820px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            {["Name", "Input", "Start Time", "Latency", "Tokens", "Total Cost", "Status"].map((h) => (
              <th key={h} className="px-3 py-1.5 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RUNS.map((r) => (
            <tr key={r.id} className="border-b border-gray-100">
              <td className="px-3 py-1.5 text-blue-600 underline decoration-blue-200">{r.name}</td>
              <td className="max-w-[260px] truncate px-3 py-1.5">{r.input}</td>
              <td className="px-3 py-1.5">{r.start.replace("T", " ")}</td>
              <td className="px-3 py-1.5">{fmtLatency(r.latency)}</td>
              <td className="px-3 py-1.5">{r.tokens === 0 ? "—" : r.tokens.toLocaleString()}</td>
              <td className="px-3 py-1.5">{r.cost}</td>
              <td className="px-3 py-1.5">{STATUS_META[r.status].label.toLowerCase()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-[11px] text-gray-400">1–9 of 1,204 runs</div>
    </div>
  );
}

function Rebuilt({ view }: { view: View }) {
  if (view === "loading") return <SkeletonTable />;
  if (view === "empty")
    return (
      <EmptyState
        title="No runs match these filters"
        hint="Try widening the time range or clearing the error filter."
        action="Clear filters"
      />
    );
  if (view === "error")
    return <ErrorState message="Couldn't load runs — the trace API returned 500." />;

  const failed = RUNS.filter((r) => r.status === "error").length;
  return (
    <div className="bg-ink">
      <Toolbar
        left={
          <>
            <span className="mr-1 font-medium text-hi">prod-agent-v2</span>
            <Chip active>Last 24h</Chip>
            <Chip>All runs</Chip>
            <Chip>LLM calls</Chip>
          </>
        }
        right={
          <input
            readOnly
            placeholder="⌘K  Filter runs…"
            className="w-44 rounded-md border border-edge bg-card2 px-2.5 py-1.5 font-mono text-xs text-[#c9ccd1] placeholder:text-[#5c616a]"
          />
        }
      />
      <table className="w-full min-w-[880px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-edge text-left font-mono text-[11px] uppercase tracking-wider text-[#6b7079]">
            {["Run", "Input", "Start", "Latency", "Tokens", "Cost", "Status"].map((h) => (
              <th key={h} className="px-4 py-2.5 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RUNS.map((r) => (
            <tr
              key={r.id}
              className={`border-b border-edge/60 transition-colors hover:bg-card ${
                r.status === "error" ? "bg-bad/[0.04]" : ""
              }`}
            >
              <td className="px-4 py-2.5">
                <div className="font-medium text-hi">{r.name}</div>
                <div className="font-mono text-[11px] text-[#5c616a]">{r.id}</div>
              </td>
              <td className="max-w-[260px] truncate px-4 py-2.5 text-muted">{r.input}</td>
              <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-[#6b7079]">
                {r.start.slice(11)}
              </td>
              <td
                className={`px-4 py-2.5 font-mono text-[13px] font-semibold ${
                  r.latency > 5000 ? "text-warn" : "text-hi"
                }`}
              >
                {fmtLatency(r.latency)}
                {r.latency > 0 && (
                  <div className="mt-1 h-0.5 w-16 overflow-hidden rounded-full bg-card2">
                    <div
                      className={`h-full ${r.latency > 5000 ? "bg-warn/80" : "bg-accent/60"}`}
                      style={{ width: `${Math.max(6, (r.latency / 8412) * 100)}%` }}
                    />
                  </div>
                )}
              </td>
              <td className="px-4 py-2.5 font-mono text-[13px] text-hi">
                {r.tokens === 0 ? "—" : r.tokens.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-[#6b7079]">{r.cost}</td>
              <td className="px-4 py-2.5">
                <StatusPill kind={STATUS_META[r.status].kind} label={STATUS_META[r.status].label} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-4 px-4 py-2.5 font-mono text-xs text-[#6b7079]">
        <span>1–9 of 1,204 runs</span>
        <span className="text-bad">{failed} failed</span>
        <span className="text-warn">p95 8.41s</span>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Compare
      tool="LangSmith"
      screen="Traces view"
      line="LangSmith solved the hardest problems in LLM observability. This rebuild keeps the exact columns and layout — and elevates the surface to match the depth of the tooling."
      originalImg="/originals/langsmith.png"
      annotations={[
        {
          title: "Failures come to you",
          why: "Two runs out of 1,204 failed, and they were buried in uniform gray. I made them the first thing you see — because during an incident, finding the failure is the job. That's a decision about what matters, not a color choice.",
        },
        {
          title: "Latency wins the row",
          why: "Latency and tokens compete for attention in every row. I decided latency wins — it's what predicts a bad user experience. Showing both equally is data; knowing which one you act on is judgment. The inline bar makes the slow run visible from across the room.",
        },
        {
          title: "States are part of the product",
          why: "Loading, empty, error — most dashboards treat these as edge cases. They're a third of what users actually see. Each state now says what happened and what to do next, so a blank filter result never reads as a broken page.",
        },
      ]}
      real={<Real />}
      rebuilt={(view) => <Rebuilt view={view} />}
    />
  );
}
