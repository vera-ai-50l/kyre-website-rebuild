"use client";

import { useMemo, useState } from "react";
import { currentRange, useQuery, type Intent } from "@/lib/data";
import { fmtAgo } from "@/lib/data/format";
import { LineChart, niceScale } from "../Chart";
import { DataTable } from "../DataTable";
import { ErrorState, SkeletonRows } from "../QueryState";
import { BASE } from "../Shell";
import { Badge, Delta, Icon, Panel, Sparkline } from "../ui";

export function Intents() {
  /* Approve / Reject is a real decision the reviewer makes here, so it holds
     state rather than navigating away. */
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});
  const range = useMemo(() => currentRange(), []);
  const query = useQuery("intents", (a) => a.getIntents(range));

  const all = useMemo(() => query.data ?? [], [query.data]);
  const rows = all.filter((i) => decided[i.slug] !== "rejected");
  const total = all.reduce((n, i) => n + i.messages, 0);
  const awaiting = rows.filter((i) => i.suggested && !decided[i.slug]).length;

  /* Matches per interval, summed across every intent's trend, so the chart, the
     sparklines and the "N matches" header are all the same numbers. Labels come
     from the data rather than being derived from the window, which is what made
     an 08:04-09:49 chart render as 10:00-06:34. */
  const series = useMemo(() => {
    const labels = all[0]?.trendLabels ?? [];
    return labels.map((label, i) => ({
      label,
      value: all.reduce((n, intent) => n + (intent.trend[i] ?? 0), 0),
    }));
  }, [all]);

  const peak = Math.max(...series.map((p) => p.value), 0);
  const scale = niceScale(series.map((p) => p.value));

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <Panel
        /* The axis maximum is stated in the header, not left to be inferred
           from a gridline against a neighbouring panel on a different scale — B6. */
        title={
          <span>
            {total} matches
            <span className="px-2 text-ag-low">·</span>
            <span className="ag-data text-ag-mid">
              peak {peak}/interval, axis {scale.lifted ? `${scale.min}–${scale.max}` : `to ${scale.max}`}
            </span>
          </span>
        }
        icon="intents"
      >
        <div className="p-4">
          {query.loading ? (
            <div className="ag-skeleton h-[200px] rounded" />
          ) : (
            series.length > 0 && (
              <LineChart
                points={series}
                min={scale.min}
                max={scale.max}
                ticks={scale.ticks}
                label="Intent matches per interval"
              />
            )
          )}
        </div>
      </Panel>

      <Panel
        title="User intents"
        icon="search"
        action={
          awaiting > 0 ? (
            <span id="review" className="scroll-mt-24">
              <Badge tone="accent">{awaiting} awaiting review</Badge>
            </span>
          ) : (
            <Badge tone="ok">
              <Icon name="check" className="h-3 w-3" />
              Review queue clear
            </Badge>
          )
        }
      >
        {query.error ? (
          <ErrorState error={query.error} onRetry={query.refetch} />
        ) : query.loading ? (
          <SkeletonRows rows={8} />
        ) : (
        <DataTable<Intent>
          rows={rows}
          rowKey={(i) => i.slug}
          rowHref={(i) => `${BASE}/intents/${i.slug}`}
          empty={{
            title: "No intents match this filter",
            hint: "Clear the search, or approve a suggested intent to start tracking it.",
          }}
          columns={[
            {
              key: "name",
              header: "User intent",
              width: "38%",
              cell: (i) => <span className="block truncate text-ag-hi">{i.name}</span>,
            },
            {
              /* Triage happens in the row. Opening each intent to approve it is
                 the reason a review queue never gets cleared. Shown on hover on
                 pointer devices, on focus for keyboards, always in card view. */
              key: "review",
              header: "Review",
              width: "184px",
              cell: (i) =>
                !i.suggested ? (
                  <span className="ag-body-sm text-ag-low">Tracked</span>
                ) : decided[i.slug] === "approved" ? (
                  <Badge tone="ok">
                    <Icon name="check" className="h-3 w-3" />
                    Approved
                  </Badge>
                ) : (
                  /* The badge states the row is awaiting review; hovering or
                     focusing swaps it for the two actions in the same slot, so
                     the column always carries something and triage never needs
                     the detail page. relative z-10 lifts the buttons above the
                     stretched row link. */
                  <span className="relative z-10 grid w-fit grid-cols-1">
                    <span className="col-start-1 row-start-1 w-fit transition-opacity duration-150 ease-out group-hover/row:opacity-0 group-focus-within/row:opacity-0">
                      <Badge tone="accent">Suggested</Badge>
                    </span>
                    <span className="col-start-1 row-start-1 flex gap-1 opacity-0 transition-opacity duration-150 ease-out group-hover/row:opacity-100 group-focus-within/row:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDecided((d) => ({ ...d, [i.slug]: "approved" }));
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-ag-ok/35 px-1.5 py-0.5 text-[11px] text-ag-ok hover:bg-ag-ok/10"
                    >
                      <Icon name="check" className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDecided((d) => ({ ...d, [i.slug]: "rejected" }));
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-ag-subtle px-1.5 py-0.5 text-[11px] text-ag-mid hover:border-ag-err/35 hover:text-ag-err"
                    >
                      <Icon name="x" className="h-3 w-3" />
                      Reject
                    </button>
                    </span>
                  </span>
                ),
            },
            {
              key: "messages",
              header: "# Messages",
              width: "108px",
              align: "right",
              cell: (i) => <span className="ag-data text-ag-hi">{i.messages}</span>,
            },
            {
              key: "trend",
              header: "Trend",
              width: "88px",
              hide: "lg",
              cell: (i) => <Sparkline points={i.trend} />,
            },
            {
              /* Never collapses. It is the column that says whether this is
                 getting worse — B4. */
              key: "delta",
              header: "vs prior 1 day",
              width: "128px",
              align: "right",
              cell: (i) => <Delta value={i.deltaPct} />,
            },
            {
              key: "lastSeen",
              header: "Last seen",
              width: "128px",
              align: "right",
              hide: "xl",
              cell: (i) => (
                <span className="ag-data text-ag-low">{fmtAgo(i.lastSeen, Date.parse(range.to))}</span>
              ),
            },
          ]}
        />
        )}
      </Panel>
    </div>
  );
}
