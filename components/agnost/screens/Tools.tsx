"use client";

import { useMemo } from "react";
import { percentile, fmtLatency } from "@/lib/data/format";
import type { Event, ToolStat } from "@/lib/data";
import { DataTable } from "../DataTable";
import { useScrub } from "../EventsStrip";
import { ErrorState, SkeletonRows } from "../QueryState";
import { useUrlState } from "../useUrlState";
import { Badge, Bar, Panel } from "../ui";

/* Their Tools page leads with a twelve-slice volume pie. Volume share is the
   least decision-relevant fact here — knowing that render_video is 19% of calls
   changes nothing. What changes something is which tool fails and which one is
   slow, so this is a table sorted by failure rate descending, and the pie is
   gone rather than demoted.

   Stats are computed from the events already in memory rather than fetched
   separately, so the table always agrees with the strip it sits above. Against
   a real backend that has a getToolStats endpoint, swap this for the adapter
   call — the shape is identical. */
function aggregate(events: Event[]): ToolStat[] {
  const byTool = new Map<string, Event[]>();
  for (const e of events) {
    const list = byTool.get(e.tool) ?? [];
    list.push(e);
    byTool.set(e.tool, list);
  }
  return [...byTool.entries()]
    .map(([name, list]) => {
      const latencies = list.map((e) => e.latencyMs);
      const failures = list.filter((e) => e.status === "failure").length;
      return {
        name,
        calls: list.length,
        failures,
        successRate: (list.length - failures) / list.length,
        p50Ms: percentile(latencies, 0.5),
        p99Ms: percentile(latencies, 0.99),
      };
    })
    .sort((a, b) => a.successRate - b.successRate || b.calls - a.calls);
}

export function Tools() {
  const { events, at, loading, error, retry } = useScrub();
  const { hash } = useUrlState();
  const tools = useMemo(() => aggregate(events), [events]);
  /* Arriving from a "Tools breaking" row on Home marks the tool it named. */
  const linked = tools.find((t) => t.name === decodeURIComponent(hash));
  const slowest = tools.reduce<ToolStat | null>((a, b) => (a && a.p99Ms > b.p99Ms ? a : b), null);
  const maxCalls = Math.max(...tools.map((t) => t.calls), 1);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <Panel
        title={
          <span>
            Tools by failure rate
            <span className="px-2 text-ag-low">·</span>
            <span className="ag-data text-ag-mid">
              {at === null ? "last 24h" : "this window"}
            </span>
          </span>
        }
        icon="tools"
        action={
          slowest && (
            <span className="ag-body-sm hidden text-ag-mid sm:inline">
              Slowest p99:{" "}
              <span className="ag-data text-ag-warn">
                {slowest.name} {fmtLatency(slowest.p99Ms)}
              </span>
            </span>
          )
        }
      >
        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : loading ? (
          <SkeletonRows rows={8} />
        ) : (
          <DataTable<ToolStat>
            rows={tools}
            rowKey={(t) => t.name}
            isSelected={(t) => t.name === linked?.name}
            rowTone={(t) => (t.failures > 0 ? "error" : undefined)}
            empty={{
              title: "No tool calls in this window",
              hint: "Scrub the strip below to a busier moment, or press Back to 24h.",
            }}
            columns={[
              {
                key: "name",
                header: "Tool",
                width: "26%",
                cell: (t) => (
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="ag-data truncate text-ag-hi">{t.name}</span>
                    {t.name === slowest?.name && <Badge tone="warn">Slowest p99</Badge>}
                  </span>
                ),
              },
              {
                key: "calls",
                header: "Calls",
                width: "18%",
                hide: "lg",
                cell: (t) => (
                  <span className="flex items-center gap-2">
                    <span className="ag-data w-6 text-right text-ag-mid">{t.calls}</span>
                    <Bar value={t.calls} max={maxCalls} />
                  </span>
                ),
              },
              {
                key: "failures",
                header: "Failures",
                width: "100px",
                align: "right",
                cell: (t) =>
                  t.failures ? (
                    <span className="ag-data text-ag-err">{t.failures}</span>
                  ) : (
                    <span className="ag-data text-ag-low">0</span>
                  ),
              },
              {
                key: "success",
                header: "Success rate",
                width: "128px",
                align: "right",
                cell: (t) => (
                  <span
                    className={`ag-data ${t.successRate < 0.9 ? "text-ag-err" : "text-ag-mid"}`}
                  >
                    {(t.successRate * 100).toFixed(1)}%
                  </span>
                ),
              },
              {
                key: "p50",
                header: "p50",
                width: "96px",
                align: "right",
                hide: "xl",
                cell: (t) => <span className="ag-data text-ag-mid">{fmtLatency(t.p50Ms)}</span>,
              },
              {
                key: "p99",
                header: "p99",
                width: "104px",
                align: "right",
                cell: (t) => (
                  <span
                    className={`ag-data ${
                      t.p99Ms >= 2500
                        ? "text-ag-err"
                        : t.p99Ms >= 1000
                          ? "text-ag-warn"
                          : "text-ag-mid"
                    }`}
                  >
                    {fmtLatency(t.p99Ms)}
                  </span>
                ),
              },
            ]}
          />
        )}
      </Panel>
    </div>
  );
}
