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

type Req = {
  time: string;
  id: string;
  endpoint: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latency: number;
  code: 200 | 400 | 429 | 500;
};

const REQS: Req[] = [
  { time: "09:42:18", id: "req_9f2c81ab04d1", endpoint: "/v1/chat/completions", model: "gpt-5", tokensIn: 2814, tokensOut: 912, latency: 3420, code: 200 },
  { time: "09:42:11", id: "req_9f2c7d55e2b8", endpoint: "/v1/chat/completions", model: "gpt-5-mini", tokensIn: 640, tokensOut: 188, latency: 780, code: 200 },
  { time: "09:41:57", id: "req_9f2c76c9aa03", endpoint: "/v1/embeddings", model: "text-embedding-3-large", tokensIn: 5120, tokensOut: 0, latency: 240, code: 200 },
  { time: "09:41:44", id: "req_9f2c71124f77", endpoint: "/v1/chat/completions", model: "gpt-5", tokensIn: 3902, tokensOut: 0, latency: 60, code: 429 },
  { time: "09:41:31", id: "req_9f2c6b8d31c5", endpoint: "/v1/chat/completions", model: "o3-mini", tokensIn: 1204, tokensOut: 2048, latency: 5910, code: 200 },
  { time: "09:41:02", id: "req_9f2c64f0b9e2", endpoint: "/v1/chat/completions", model: "gpt-5-mini", tokensIn: 512, tokensOut: 96, latency: 610, code: 200 },
  { time: "09:40:48", id: "req_9f2c5fa7d044", endpoint: "/v1/responses", model: "gpt-5", tokensIn: 8110, tokensOut: 1744, latency: 7280, code: 200 },
  { time: "09:40:20", id: "req_9f2c58c2e6a9", endpoint: "/v1/chat/completions", model: "gpt-4.1", tokensIn: 990, tokensOut: 0, latency: 130, code: 400 },
  { time: "09:39:55", id: "req_9f2c52091bd7", endpoint: "/v1/chat/completions", model: "gpt-5", tokensIn: 2201, tokensOut: 0, latency: 45, code: 500 },
];

const fmtLatency = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;

const codeMeta = (code: Req["code"]) =>
  code === 200
    ? { kind: "ok" as const, label: "200 OK" }
    : code === 429
      ? { kind: "warn" as const, label: "429 Rate limit" }
      : { kind: "bad" as const, label: `${code} Error` };

function Real() {
  return (
    <div className="bg-white text-[12px] text-gray-600">
      <div className="flex items-center gap-4 border-b border-gray-200 px-3 py-2">
        <span className="text-gray-800">Logs</span>
        <span className="text-gray-400">Usage</span>
        <span className="text-gray-400">API keys</span>
        <span className="ml-auto rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-400">
          Last 24 hours ▾
        </span>
      </div>
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            {["Time", "Request ID", "Endpoint", "Model", "Input", "Output", "Latency", "Status"].map((h) => (
              <th key={h} className="px-3 py-1.5 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REQS.map((r) => (
            <tr key={r.id} className="border-b border-gray-100">
              <td className="px-3 py-1.5">{r.time}</td>
              <td className="px-3 py-1.5">{r.id}</td>
              <td className="px-3 py-1.5">{r.endpoint}</td>
              <td className="px-3 py-1.5">{r.model}</td>
              <td className="px-3 py-1.5">{r.tokensIn.toLocaleString()}</td>
              <td className="px-3 py-1.5">{r.tokensOut === 0 ? "—" : r.tokensOut.toLocaleString()}</td>
              <td className="px-3 py-1.5">{fmtLatency(r.latency)}</td>
              <td className="px-3 py-1.5">{r.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-[11px] text-gray-400">Showing 9 of 18,340 requests</div>
    </div>
  );
}

function Rebuilt({ view }: { view: View }) {
  if (view === "loading") return <SkeletonTable />;
  if (view === "empty")
    return (
      <EmptyState
        title="No requests in this window"
        hint="This key hasn't made any calls in the last 24 hours."
        action="Widen time range"
      />
    );
  if (view === "error")
    return <ErrorState message="Couldn't load request logs — usage API timed out." />;

  const errors = REQS.filter((r) => r.code >= 400).length;
  return (
    <div className="bg-ink">
      <Toolbar
        left={
          <>
            <span className="mr-1 font-mono text-sm text-[#6b7079]">
              <span className="text-accent">$</span> tail -f requests{" "}
              <span className="text-[#5c616a]">--window 24h</span>
            </span>
            <Chip active>Live</Chip>
            <Chip>All models</Chip>
            <Chip>Errors only</Chip>
          </>
        }
        right={
          <span className="font-mono text-xs text-[#6b7079]">
            18,340 requests · <span className="text-bad">{errors} errors</span>
          </span>
        }
      />
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-edge text-left font-mono text-[11px] uppercase tracking-wider text-[#6b7079]">
            {["Time", "Request", "Model", "Tokens in", "Tokens out", "Latency", "Status"].map((h) => (
              <th key={h} className="px-4 py-2.5 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REQS.map((r) => (
            <tr
              key={r.id}
              className={`border-b border-edge/60 transition-colors hover:bg-card ${
                r.code >= 400 && r.code !== 429 ? "bg-bad/[0.04]" : ""
              }`}
            >
              <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-[#6b7079]">{r.time}</td>
              <td className="px-4 py-2.5">
                <div className="font-mono text-xs text-[#c9ccd1]">{r.id}</div>
                <div className="font-mono text-[11px] text-[#5c616a]">{r.endpoint}</div>
              </td>
              <td className="px-4 py-2.5">
                <span className="rounded-md bg-card2 px-2 py-0.5 font-mono text-xs text-hi ring-1 ring-edge">
                  {r.model}
                </span>
              </td>
              <td className="px-4 py-2.5 font-mono text-[13px] font-semibold text-hi">
                {r.tokensIn.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 font-mono text-[13px] text-[#c9ccd1]">
                {r.tokensOut === 0 ? "—" : r.tokensOut.toLocaleString()}
              </td>
              <td
                className={`px-4 py-2.5 font-mono text-[13px] font-semibold ${
                  r.latency > 5000 ? "text-warn" : "text-hi"
                }`}
              >
                {fmtLatency(r.latency)}
              </td>
              <td className="px-4 py-2.5">
                <StatusPill kind={codeMeta(r.code).kind} label={codeMeta(r.code).label} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-4 px-4 py-2.5 font-mono text-xs text-[#6b7079]">
        <span>Showing 9 of 18,340</span>
        <span className="text-warn">1 rate-limited</span>
        <span className="text-bad">2 failed</span>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Compare
      tool="OpenAI Platform"
      screen="Request logs"
      line="OpenAI put frontier models behind one clean API. This rebuild keeps the log's exact structure — and makes a 429 at 9:41 impossible to miss."
      originalImg="/originals/openai.png"
      annotations={[
        {
          title: "A 429 is not an error like the others",
          why: "A rate limit isn't a bug — it's capacity you're paying for and not getting. I split it from real failures: amber, not red. An engineer logs both as 4xx/5xx; knowing they're triaged differently is the judgment.",
        },
        {
          title: "Tokens lead because cost leads",
          why: "This log answers two questions: what failed, and what's expensive. Token counts lead the row because the cost question comes back every week — the request ID is context, not the story. That's a call about which number gets read first.",
        },
        {
          title: "The footer counts what you can't see",
          why: "Nine visible rows can hide 18,000 requests of trouble. The footer totals failures and rate limits across the whole window — so a clean first page never lies to you. Deciding what the page must admit is the design.",
        },
      ]}
      real={<Real />}
      rebuilt={(view) => <Rebuilt view={view} />}
    />
  );
}
