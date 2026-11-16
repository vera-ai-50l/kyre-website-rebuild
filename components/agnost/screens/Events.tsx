"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { currentRange, useQuery, type Event } from "@/lib/data";
import { fmtAgo, fmtClock, fmtLatency, latencyTone, percentile } from "@/lib/data/format";
import { LineChart, niceScale } from "../Chart";
import { DataTable } from "../DataTable";
import { useScrub } from "../EventsStrip";
import { ErrorState, SkeletonRows } from "../QueryState";
import { BASE } from "../Shell";
import { useUrlState } from "../useUrlState";
import { Badge, Panel } from "../ui";

type Filter = "all" | "failure" | "success";
type Row = Event & { ts: number };

export function Events() {
  const { events: scrubbed, at, range, loading, error, retry } = useScrub();
  const [chosen, setChosen] = useState<Filter | null>(null);
  const { param, hash } = useUrlState();

  // Violation names live behind the adapter, so the banner resolves the slug.
  const violations = useQuery("violations", (a) => a.getViolations(currentRange()));
  const violationSlug = param("violation");
  const violation = violations.data?.find((v) => v.slug === violationSlug);

  /* Arriving from the failure counter on the strip preselects the failures
     chip; arriving from a violation row on Home narrows to that violation. The
     alert and the view it opens have to agree, or the link is decorative. */
  const events = useMemo(
    () => (violationSlug ? scrubbed.filter((e) => e.violation === violationSlug) : scrubbed),
    [scrubbed, violationSlug],
  );

  const filter: Filter =
    chosen ?? (hash === "failures" || violationSlug ? "failure" : "all");

  const median = useMemo(
    () => percentile(events.map((e) => e.latencyMs), 0.5),
    [events],
  );

  const rows = useMemo(() => {
    const filtered = events.filter((e) => filter === "all" || e.status === filter);
    /* Default sort is status, failures first, then chronological within status.
       Sorting a failure log by time buries the rows you opened it for. */
    return [...filtered].sort(
      (a, b) =>
        (a.status === "failure" ? 0 : 1) - (b.status === "failure" ? 0 : 1) || b.ts - a.ts,
    );
  }, [events, filter]);

  const failures = events.filter((e) => e.status === "failure").length;

  // Events per bucket across whatever range is in view.
  const series = useMemo(() => {
    if (!events.length) return [];
    const first = events[0].ts;
    const last = events[events.length - 1].ts;
    const span = Math.max(1, last - first);
    const buckets = Array<number>(8).fill(0);
    for (const e of events) {
      buckets[Math.min(7, Math.floor(((e.ts - first) / span) * 8))]++;
    }
    return buckets.map((value, i) => ({
      label: fmtClock(new Date(first + (span / 8) * i).toISOString()).slice(0, 5),
      value,
    }));
  }, [events]);

  const scale = niceScale(series.map((p) => p.value));

  const chips: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: events.length },
    { id: "failure", label: "Failures", count: failures },
    { id: "success", label: "Succeeded", count: events.length - failures },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      {/* Arriving pre-filtered has to say so, and has to offer the way out.
          A filter the user did not set and cannot see is a bug report. */}
      {violation && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[10px] border border-ag-err/30 bg-ag-err/[0.06] px-4 py-2.5">
          <span className="ag-body-sm text-ag-hi">
            Filtered to <span className="font-medium">{violation.name}</span>
          </span>
          <span className="ag-body-sm text-ag-mid">
            · {events.length} event{events.length === 1 ? "" : "s"}
          </span>
          <Link
            href={`${BASE}/events`}
            className="ml-auto text-[13px] font-medium text-ag-accent-text hover:underline"
          >
            Clear filter
          </Link>
        </div>
      )}

      <Panel
        title={
          <span>
            Events {at === null ? "over 24h" : "in this window"}
            <span className="px-2 text-ag-low">·</span>
            {/* Axis maximum stated, so this panel is not silently on a different
                scale from the intents chart next door — B6. */}
            <span className="ag-data text-ag-mid">
              axis {scale.lifted ? `${scale.min}–${scale.max}` : `to ${scale.max}`}
            </span>
          </span>
        }
        icon="events"
      >
        <div className="p-4">
          {loading ? (
            <div className="ag-skeleton h-[200px] rounded" />
          ) : (
            series.length > 0 && (
              <LineChart
                points={series}
                min={scale.min}
                max={scale.max}
                ticks={scale.ticks}
                label="Events per interval"
              />
            )
          )}
        </div>
      </Panel>

      <Panel
        title="Event log"
        icon="search"
        action={
          <div className="flex gap-1">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChosen(c.id)}
                aria-pressed={filter === c.id}
                className={`ag-press inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-[12px] transition-colors duration-150 ease-out ${
                  filter === c.id
                    ? "border-ag-strong bg-ag-overlay text-ag-hi"
                    : "border-ag-subtle text-ag-mid hover:text-ag-hi"
                }`}
              >
                {c.label}
                <span
                  className={`ag-data text-[11px] ${
                    c.id === "failure" && c.count > 0 ? "text-ag-err" : "text-ag-low"
                  }`}
                >
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        }
      >
        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : loading ? (
          <SkeletonRows rows={8} />
        ) : (
          <DataTable<Row>
            rows={rows}
            rowKey={(e) => e.id}
            rowTone={(e) => (e.status === "failure" ? "error" : undefined)}
            empty={{
              title:
                filter === "failure"
                  ? "No failures here. That is the good outcome"
                  : "No events in this range",
              hint:
                filter === "failure"
                  ? "Switch to All to see the successful calls, or widen the scrub window."
                  : "Scrub the strip below to a busier moment, or press Back to 24h.",
            }}
            columns={[
              {
                key: "status",
                header: "Status",
                width: "104px",
                cell: (e) =>
                  e.status === "failure" ? (
                    <Badge tone="error">Failed</Badge>
                  ) : (
                    <span className="ag-body-sm text-ag-low">OK</span>
                  ),
              },
              {
                /* Clock plus elapsed. The window spans midnight, so a bare
                   time-of-day makes a correctly sorted list look shuffled. */
                key: "time",
                header: "Time",
                width: "132px",
                cell: (e) => (
                  <span className="flex flex-col leading-tight">
                    <span className="ag-data text-ag-mid">{fmtClock(e.timestamp)}</span>
                    <span className="ag-data text-[11px] text-ag-low">
                      {fmtAgo(e.timestamp, range.end)}
                    </span>
                  </span>
                ),
              },
              {
                key: "tool",
                header: "Event",
                cell: (e) => (
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="ag-data truncate text-ag-hi">{e.tool}</span>
                    {e.violation && (
                      <span className="truncate text-ag-err">
                        {violations.data?.find((v) => v.slug === e.violation)?.name ??
                          e.violation}
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: "user",
                header: "User",
                width: "22%",
                hide: "lg",
                cell: (e) => <span className="ag-data truncate text-ag-mid">{e.userId}</span>,
              },
              {
                key: "conversation",
                header: "Conversation",
                width: "168px",
                hide: "xl",
                cell: (e) => <span className="ag-data text-ag-low">{e.conversationId}</span>,
              },
              {
                key: "latency",
                header: "Latency",
                width: "116px",
                align: "right",
                cell: (e) => (
                  <span className="inline-flex items-center justify-end gap-1.5">
                    {/* Gutter marker for anything past 2x the median — the row
                        you would otherwise have to compute to notice. */}
                    {e.latencyMs > median * 2 && (
                      <span
                        aria-label="Over twice the median latency"
                        title="Over twice the median latency"
                        className="h-3 w-0.5 rounded-full bg-ag-warn"
                      />
                    )}
                    <span
                      className={`ag-data ${
                        {
                          neutral: "text-ag-mid",
                          warn: "text-ag-warn",
                          error: "text-ag-err",
                        }[latencyTone(e.latencyMs)]
                      }`}
                    >
                      {fmtLatency(e.latencyMs)}
                    </span>
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
