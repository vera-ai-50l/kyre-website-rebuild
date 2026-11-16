"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { adapter, currentRange, useQuery } from "@/lib/data";
import { fmtAgo, fmtDelta } from "@/lib/data/format";
import { mdIntent } from "@/lib/data/markdown";
import { LineChart, niceScale } from "../Chart";
import { ErrorState } from "../QueryState";
import { BASE, Shell } from "../Shell";
import { Badge, Bar, Button, CopyMd, Icon, Panel } from "../ui";

/** Route wrapper: the Markdown export needs the intent in scope, so the shell
    is assembled here rather than in the server page. */
export function IntentDetailScreen({ id }: { id: string }) {
  const query = useQuery(`intent:${id}`, (a) => a.getIntent(id));
  const intent = query.data;
  return (
    <Shell
      title={intent?.name ?? "Intent"}
      activeOverride={`${BASE}/intents`}
      breadcrumb={
        <Link
          href={`${BASE}/intents`}
          className="ag-body shrink-0 text-ag-low hover:text-ag-hi"
        >
          Intents <span className="px-1">/</span>
        </Link>
      }
      actions={<CopyMd label="this intent.md" build={() => mdIntent(adapter, id)} />}
    >
      <IntentDetail id={id} />
    </Shell>
  );
}

/* Their intent detail page is the best-composed screen in the product: title,
   plain-English description, review actions, two stat blocks, chart, themes.
   It is the hierarchy the list pages lack, so it is rebuilt faithfully with the
   new tokens rather than redesigned. The only changes: the themes list gets
   proportional bars instead of bare counts, the chart uses the fixed draw
   animation, and the Markdown export stops being a small top-right control. */

export function IntentDetail({ id }: { id: string }) {
  const query = useQuery(`intent:${id}`, (a) => a.getIntent(id));
  const range = useMemo(() => currentRange(), []);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const intent = query.data;

  if (query.error) {
    return (
      <div className="p-4 sm:p-6">
        <Panel>
          <ErrorState error={query.error} onRetry={query.refetch} />
        </Panel>
      </div>
    );
  }

  if (query.loading) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <span className="ag-skeleton h-9 w-[26rem] max-w-full rounded" />
        <span className="ag-skeleton h-4 w-[34rem] max-w-full rounded" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className="ag-skeleton h-[74px] rounded-[10px]" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <span className="ag-skeleton h-[260px] rounded-[10px]" />
          <span className="ag-skeleton h-[260px] rounded-[10px]" />
        </div>
      </div>
    );
  }

  if (!intent) {
    return (
      <div className="p-6">
        <p className="ag-body text-ag-hi">That intent is not in this workspace.</p>
        <Link href={`${BASE}/intents`} className="ag-body-sm text-ag-accent-text hover:underline">
          Back to all intents
        </Link>
      </div>
    );
  }

  const series = intent.series;
  const { min, max, ticks, lifted } = niceScale(series.map((p) => p.value));
  const themeMax = Math.max(...intent.themes.map((t) => t.count), 1);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="ag-display">{intent.name}</h2>
          <p className="ag-body mt-1 max-w-2xl text-ag-mid">{intent.description}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2">
            {intent.suggested && !decision && (
              <>
                <Badge tone="accent">Suggested</Badge>
                <span className="ag-body-sm text-ag-low">Awaiting review</span>
              </>
            )}
            {decision === "approved" && (
              <Badge tone="ok">
                <Icon name="check" className="h-3 w-3" />
                Approved
              </Badge>
            )}
            {decision === "rejected" && <Badge>Rejected</Badge>}
            {!intent.suggested && <Badge tone="ok">Tracked</Badge>}
            <span className="ag-data text-[11px] text-ag-low">
              last seen {fmtAgo(intent.lastSeen, Date.parse(range.to))}
            </span>
          </p>
        </div>

        {intent.suggested && !decision && (
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" icon="x" onClick={() => setDecision("rejected")}>
              Reject
            </Button>
            <Button variant="primary" icon="check" onClick={() => setDecision("approved")}>
              Approve
            </Button>
          </div>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat value={intent.messages} label="Stored messages (all time)" />
        <Stat value={intent.conversations} label="Conversations (all time)" />
        <Stat value={fmtDelta(intent.deltaPct)} label="vs prior 1 day" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Panel
          title={
            <span>
              {intent.messages} messages
              <span className="px-2 text-ag-low">·</span>
              <span className="ag-data text-ag-mid">axis {lifted ? `${min}–${max}` : `to ${max}`}</span>
            </span>
          }
          icon="events"
        >
          <div className="p-4">
            <LineChart
              points={series}
              min={min}
              max={max}
              ticks={ticks}
              label={`${intent.name}, messages per interval`}
            />
          </div>
        </Panel>

        <Panel
          title="Themes in this intent"
          icon="intents"
          action={
            <Button variant="ghost" icon="refresh">
              Re-generate
            </Button>
          }
        >
          <ul className="flex flex-col gap-3 p-4">
            {intent.themes.map((t) => (
              <li key={t.name}>
                <p className="ag-body-sm flex items-baseline justify-between gap-3">
                  <span className="text-ag-hi">{t.name}</span>
                  <span className="ag-data text-ag-mid">{t.count}</span>
                </p>
                {/* Proportional bars — a count on its own does not say whether
                    four is most of this intent or a corner of it. */}
                <span className="mt-1.5 block">
                  <Bar value={t.count} max={themeMax} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-[10px] border border-ag-subtle bg-ag-raised px-4 py-3">
      <p className="ag-data text-2xl text-ag-hi">{value}</p>
      <p className="ag-label mt-1">{label}</p>
    </div>
  );
}
