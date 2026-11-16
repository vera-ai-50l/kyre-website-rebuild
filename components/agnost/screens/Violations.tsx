"use client";

import { useMemo } from "react";
import { currentRange, useQuery, type Violation } from "@/lib/data";
import { fmtAgo } from "@/lib/data/format";
import { DataTable } from "../DataTable";
import { useScrub } from "../EventsStrip";
import { ErrorState, SkeletonRows } from "../QueryState";
import { BASE } from "../Shell";
import { Delta, Panel } from "../ui";

/* The page Home's "What's failing" rows were already pointing at. Their console
   has it; the rebuild linked to it before it existed, which made the strongest
   rows on Home the ones most likely to disappoint.

   Users and last-seen are read off the events rather than stored: a violation
   that fired four times against two people is a different problem from one that
   fired four times against four, and that distinction is the reason the column
   is here. */

type Row = Violation & { users: number; lastSeen: number | null };

export function Violations() {
  const { events, at, loading, error, retry } = useScrub();
  const range = useMemo(() => currentRange(), []);
  const query = useQuery("violations", (a) => a.getViolations(range));

  const rows = useMemo<Row[]>(() => {
    return (query.data ?? [])
      .map((v) => {
        const hits = events.filter((e) => e.violation === v.slug);
        return {
          ...v,
          users: new Set(hits.map((e) => e.userId)).size,
          lastSeen: hits.length ? Math.max(...hits.map((e) => e.ts)) : null,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [query.data, events]);

  const total = rows.reduce((n, v) => n + v.count, 0);
  const people = new Set(
    events.filter((e) => e.violation).map((e) => e.userId),
  ).size;

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        <h2 className="ag-display max-w-3xl">
          {loading ? (
            <span className="ag-skeleton block h-9 w-[26rem] max-w-full rounded" />
          ) : (
            <>
              <span className="text-ag-err">{total} violations</span> across {people} user
              {people === 1 ? "" : "s"} {at === null ? "in the last 24h" : "in this window"}
            </>
          )}
        </h2>
        <p className="ag-body mt-2 max-w-2xl text-ag-mid">
          A violation is the agent stating something the product cannot do — a price it
          cannot honour, a link it cannot produce, a workflow that does not exist.
        </p>
      </header>

      <Panel title="Agent violations" icon="warn">
        {query.error || error ? (
          <ErrorState error={(query.error ?? error)!} onRetry={query.error ? query.refetch : retry} />
        ) : query.loading || loading ? (
          <SkeletonRows rows={4} />
        ) : (
          <DataTable<Row>
            rows={rows}
            rowKey={(v) => v.slug}
            rowHref={(v) => `${BASE}/events?violation=${v.slug}`}
            rowTone={() => "error"}
            empty={{
              title: "No violations in this window",
              hint: "The agent kept its promises here. Scrub the strip to a busier moment to check another.",
            }}
            columns={[
              {
                key: "name",
                header: "Violation",
                width: "34%",
                cell: (v) => (
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-ag-hi">{v.name}</span>
                    <span className="ag-body-sm truncate text-[12px] text-ag-low">
                      {v.description}
                    </span>
                  </span>
                ),
              },
              {
                key: "count",
                header: "Count",
                width: "88px",
                align: "right",
                cell: (v) => <span className="ag-data text-ag-err">{v.count}</span>,
              },
              {
                key: "users",
                header: "Users",
                width: "88px",
                align: "right",
                hide: "lg",
                cell: (v) => (
                  <span className="ag-data text-ag-mid">{v.users || "—"}</span>
                ),
              },
              {
                /* Never collapses — it is the column that says getting worse. */
                key: "delta",
                header: "vs prior day",
                width: "128px",
                align: "right",
                cell: (v) => <Delta value={v.deltaPct} />,
              },
              {
                key: "lastSeen",
                header: "Last seen",
                width: "132px",
                align: "right",
                hide: "xl",
                cell: (v) => (
                  <span className="ag-data text-ag-low">
                    {v.lastSeen ? fmtAgo(new Date(v.lastSeen).toISOString(), Date.parse(range.to)) : "—"}
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
