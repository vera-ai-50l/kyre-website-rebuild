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

type Prediction = {
  model: string;
  id: string;
  status: "succeeded" | "failed" | "processing" | "canceled";
  source: "API" | "Web";
  hardware: string;
  created: string;
  duration: string;
};

const PREDICTIONS: Prediction[] = [
  { model: "black-forest-labs/flux-1.1-pro", id: "xk2p9qerhn", status: "succeeded", source: "API", hardware: "A100 80GB", created: "2026-07-19T09:41:50Z", duration: "8.2s" },
  { model: "meta/llama-3-70b-instruct", id: "d4m1vz0wqr", status: "succeeded", source: "API", hardware: "A100 80GB", created: "2026-07-19T09:41:12Z", duration: "12.4s" },
  { model: "stability-ai/sdxl", id: "p8c3nx5jte", status: "failed", source: "API", hardware: "A40", created: "2026-07-19T09:40:38Z", duration: "2.1s" },
  { model: "openai/whisper", id: "w7f2kd9mbs", status: "succeeded", source: "Web", hardware: "T4", created: "2026-07-19T09:39:47Z", duration: "34.8s" },
  { model: "black-forest-labs/flux-schnell", id: "r5h8qa2vcn", status: "processing", source: "API", hardware: "H100", created: "2026-07-19T09:39:21Z", duration: "—" },
  { model: "meta/llama-3-70b-instruct", id: "t9j4ye6zlp", status: "succeeded", source: "API", hardware: "A100 80GB", created: "2026-07-19T09:38:02Z", duration: "9.7s" },
  { model: "mistralai/mixtral-8x7b-instruct-v0.1", id: "g2b7mw4xdf", status: "canceled", source: "Web", hardware: "CPU", created: "2026-07-19T09:36:44Z", duration: "1.0s" },
  { model: "stability-ai/sdxl", id: "k6n1rc8uah", status: "succeeded", source: "API", hardware: "A40", created: "2026-07-19T09:35:19Z", duration: "6.6s" },
  { model: "openai/whisper", id: "z3v5ps7qek", status: "failed", source: "API", hardware: "T4", created: "2026-07-19T09:33:58Z", duration: "0.4s" },
];

const STATUS_META = {
  succeeded: { kind: "ok" as const, label: "Succeeded" },
  failed: { kind: "bad" as const, label: "Failed" },
  processing: { kind: "warn" as const, label: "Processing" },
  canceled: { kind: "warn" as const, label: "Canceled" },
};

function Real() {
  return (
    <div className="bg-white text-[12px] text-gray-600">
      <div className="flex items-center gap-4 border-b border-gray-200 px-3 py-2">
        <span className="text-gray-800">Predictions</span>
        <span className="text-gray-400">Models</span>
        <span className="text-gray-400">Deployments</span>
        <span className="ml-auto rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-400">
          All statuses ▾
        </span>
      </div>
      <table className="w-full min-w-[840px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            {["Model", "ID", "Status", "Source", "Hardware", "Created", "Duration"].map((h) => (
              <th key={h} className="px-3 py-1.5 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PREDICTIONS.map((p) => (
            <tr key={p.id} className="border-b border-gray-100">
              <td className="px-3 py-1.5 text-blue-600 underline decoration-blue-200">{p.model}</td>
              <td className="px-3 py-1.5">{p.id}</td>
              <td className="px-3 py-1.5">{p.status}</td>
              <td className="px-3 py-1.5">{p.source}</td>
              <td className="px-3 py-1.5">{p.hardware}</td>
              <td className="px-3 py-1.5">{p.created.replace("T", " ").replace("Z", "")}</td>
              <td className="px-3 py-1.5">{p.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-[11px] text-gray-400">Page 1 of 84</div>
    </div>
  );
}

function Rebuilt({ view }: { view: View }) {
  if (view === "loading") return <SkeletonTable />;
  if (view === "empty")
    return (
      <EmptyState
        title="No predictions yet"
        hint="Run any model from the API or the web to see it here."
        action="Browse models"
      />
    );
  if (view === "error")
    return <ErrorState message="Couldn't load predictions — request failed after 3 retries." />;

  return (
    <div className="bg-ink">
      <Toolbar
        left={
          <>
            <span className="mr-1 font-medium text-hi">Predictions</span>
            <Chip active>All statuses</Chip>
            <Chip>API only</Chip>
            <Chip>Last hour</Chip>
          </>
        }
        right={
          <span className="font-mono text-xs text-[#6b7079]">
            748 today · <span className="text-ok">96.2% success</span>
          </span>
        }
      />
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-edge text-left font-mono text-[11px] uppercase tracking-wider text-[#6b7079]">
            {["Model", "Status", "Duration", "Hardware", "Source", "Created", "ID"].map((h) => (
              <th key={h} className="px-4 py-2.5 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PREDICTIONS.map((p) => {
            const [owner, name] = p.model.split("/");
            return (
              <tr
                key={p.id}
                className={`border-b border-edge/60 transition-colors hover:bg-card ${
                  p.status === "failed" ? "bg-bad/[0.04]" : ""
                }`}
              >
                <td className="px-4 py-2.5">
                  <span className="text-[#6b7079]">{owner}/</span>
                  <span className="font-medium text-hi">{name}</span>
                </td>
                <td className="px-4 py-2.5">
                  <StatusPill kind={STATUS_META[p.status].kind} label={STATUS_META[p.status].label} />
                </td>
                <td className="px-4 py-2.5 font-mono text-[13px] font-semibold text-hi">
                  {p.duration}
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded-md bg-accent/[0.06] px-2 py-0.5 font-mono text-xs text-accent ring-1 ring-accent/25">
                    {p.hardware}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-[#6b7079]">{p.source}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-[#6b7079]">
                  {p.created.slice(11, 19)}
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-[#5c616a]">{p.id}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex items-center gap-4 px-4 py-2.5 font-mono text-xs text-[#6b7079]">
        <span>Page 1 of 84</span>
        <span className="text-bad">2 failed</span>
        <span className="text-warn">1 processing</span>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Compare
      tool="Replicate"
      screen="Predictions dashboard"
      line="Replicate made running open models one line of code. This rebuild keeps the predictions list exactly as it is — and gives it the same clarity as the CLI."
      originalImg="/originals/replicate.png"
      annotations={[
        {
          title: "Status and duration sit together",
          why: "You open this screen to answer two questions: what died, and what's slow. I moved duration next to status so both are answered in one glance — column order is a decision about how people actually read, not alphabetical habit.",
        },
        {
          title: "Hardware is a bill, not trivia",
          why: "A100 vs T4 is the difference in your invoice. The chips make hardware scannable so you can spot the job burning an H100 on work a T4 could do. An engineer renders the field; deciding it deserves visual weight is the outside eye.",
        },
        {
          title: "The owner prefix is noise",
          why: "You scan for flux-1.1-pro, not black-forest-labs. Dimming the owner is a one-line CSS change and a real decision about where your eye lands in a list of 748 — that ranking of attention is what you're paying for.",
        },
      ]}
      real={<Real />}
      rebuilt={(view) => <Rebuilt view={view} />}
    />
  );
}
