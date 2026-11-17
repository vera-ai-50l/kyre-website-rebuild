"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  currentRange,
  useQuery,
  type Insight,
  type Intent,
  type ToolStat,
  type Violation,
} from "@/lib/data";
import { fmtAgo, fmtCost, fmtLatency, percentile, summarise } from "@/lib/data/format";
import { LineChart, niceScale } from "../Chart";
import { DataTable } from "../DataTable";
import { useEventSeries } from "../eventSeries";
import { useScrub } from "../EventsStrip";
import { ErrorState, SkeletonRows } from "../QueryState";
import { BASE } from "../Shell";
import { Badge, Delta, Empty, Panel } from "../ui";

/* Their Home is a 2x3 grid of equal-weight panels, so nothing on it is the
   answer. The failing was never the panel count — it was that five panels of
   identical weight meant none of them led. So this states the answer in a
   sentence, gives the evidence a named user actually experienced, and only then
   drops to the three drill-downs.

   The day's shape sits right under the sentence: the same chart as Events, at
   half its height, so the number in the headline has its trend next to it. */

export function Home() {
  const { events, at, range, loading, error, retry } = useScrub();
  const series = useEventSeries(events);
  const scale = niceScale(series.map((p) => p.value));
  const rangeQ = useMemo(() => currentRange(), []);

  const violations = useQuery("violations", (a) => a.getViolations(rangeQ));
  const intents = useQuery("intents", (a) => a.getIntents(rangeQ));
  const insights = useQuery("insights", (a) => a.getInsights?.(rangeQ) ?? Promise.resolve([]));

  const s = summarise(events);

  const tools = useMemo<ToolStat[]>(() => {
    const byTool = new Map<string, typeof events>();
    for (const e of events) {
      const list = byTool.get(e.tool) ?? [];
      list.push(e);
      byTool.set(e.tool, list);
    }
    return [...byTool.entries()]
      .map(([name, list]) => {
        const failures = list.filter((e) => e.status === "failure").length;
        return {
          name,
          calls: list.length,
          failures,
          successRate: (list.length - failures) / list.length,
          p50Ms: percentile(list.map((e) => e.latencyMs), 0.5),
          p99Ms: percentile(list.map((e) => e.latencyMs), 0.99),
        };
      })
      .filter((t) => t.failures > 0 || t.p99Ms >= 2000)
      .sort((a, b) => a.successRate - b.successRate || b.p99Ms - a.p99Ms);
  }, [events]);

  const scrubbedUsers = useMemo(() => new Set(events.map((e) => e.userId)), [events]);
  const shownInsights = (insights.data ?? []).filter(
    (i) => at === null || scrubbedUsers.has(i.userId),
  );

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Panel>
          <ErrorState error={error} onRetry={retry} />
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header>
        {loading ? (
          <>
            <span className="ag-skeleton block h-9 w-[28rem] max-w-full rounded" />
            <span className="ag-skeleton mt-3 block h-4 w-72 max-w-full rounded" />
          </>
        ) : (
          <>
            <h2 className="ag-display max-w-3xl">
              {s.failures > 0 ? (
                <span className="text-ag-err">
                  {s.failures} failure{s.failures === 1 ? "" : "s"}
                </span>
              ) : (
                "No failures"
              )}{" "}
              across {s.events} event{s.events === 1 ? "" : "s"}{" "}
              {at === null ? "in the last 24h" : "in this window"}
            </h2>
            {/* Cost is a headline number, not a table column that disappears — B5. */}
            <p className="ag-data mt-2 text-ag-mid">
              Cost <span className="text-ag-hi">{fmtCost(s.cost)}</span>
              <span className="px-2 text-ag-low">·</span>
              p99 <span className="text-ag-hi">{fmtLatency(s.p99)}</span>
              <span className="px-2 text-ag-low">·</span>
              <span className="text-ag-hi">{s.users}</span> users
            </p>
          </>
        )}
      </header>

      {!loading && events.length === 0 ? (
        <Panel>
          <Empty
            title="Nothing happened in this ten-minute window"
            hint="Scrub to a denser part of the strip below, or press Back to 24h to see the full day."
          />
        </Panel>
      ) : (
        <>
          <Panel
            title={`Events ${at === null ? "over 24h" : "in this window"}`}
            icon="events"
            action={
              <Link href={`${BASE}/events`} className="ag-body-sm text-ag-mid transition-colors duration-150 ease-out hover:text-ag-hi">
                Open events
              </Link>
            }
          >
            <div className="px-4 pb-3 pt-4">
              {loading ? (
                <div className="ag-skeleton h-[120px] rounded" />
              ) : (
                series.length > 0 && (
                  <LineChart
                    points={series}
                    min={scale.min}
                    max={scale.max}
                    ticks={2}
                    height={150}
                    label="Events per interval"
                  />
                )
              )}
            </div>
          </Panel>

          <Panel
            title="What users are saying"
            icon="chat"
            action={
              <Link
                href={`${BASE}/users`}
                className="flex items-center gap-1 text-[13px] font-medium text-ag-mid hover:text-ag-hi"
              >
                View all <span aria-hidden>→</span>
              </Link>
            }
          >
            {insights.error ? (
              <ErrorState error={insights.error} onRetry={insights.refetch} />
            ) : insights.loading ? (
              <SkeletonRows rows={4} />
            ) : shownInsights.length === 0 ? (
              <Empty
                title="No summarised conversations in this window"
                hint="Insights are written once a conversation ends. Scrub to a wider window to see them."
              />
            ) : (
              <ul>
                {/* Four entries, and a fifth and sixth once there is height for
                    them. This is the only panel that grows. */}
                {shownInsights.slice(0, 6).map((insight, i) => (
                  <InsightRow
                    key={insight.id}
                    insight={insight}
                    index={i}
                    now={range.end}
                    violations={violations.data ?? []}
                    intents={intents.data ?? []}
                  />
                ))}
              </ul>
            )}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
            <Panel title="What's failing" icon="warn">
              {violations.error ? (
                <ErrorState error={violations.error} onRetry={violations.refetch} />
              ) : violations.loading ? (
                <SkeletonRows rows={3} />
              ) : (
                <DataTable<Violation>
                  rows={violations.data ?? []}
                  rowKey={(v) => v.slug}
                  maxRows={3}
                  rowHref={(v) => `${BASE}/violations?v=${v.slug}`}
                  viewAllHref={`${BASE}/violations`}
                  viewAllLabel="View all violations"
                  empty={{
                    title: "No violations in this window",
                    hint: "Violations appear here when the agent promises something the product cannot do.",
                  }}
                  columns={[
                    {
                      key: "name",
                      header: "Violation",
                      cell: (v) => <span className="text-ag-hi">{v.name}</span>,
                    },
                    {
                      key: "count",
                      header: "Count",
                      width: "56px",
                      align: "right",
                      cell: (v) => <span className="ag-data text-ag-hi">{v.count}</span>,
                    },
                    {
                      key: "delta",
                      header: "Trend",
                      width: "88px",
                      align: "right",
                      cell: (v) => <Delta value={v.deltaPct} />,
                    },
                  ]}
                />
              )}
            </Panel>

            <Panel title="What users ask for" icon="intents">
              {intents.error ? (
                <ErrorState error={intents.error} onRetry={intents.refetch} />
              ) : intents.loading ? (
                <SkeletonRows rows={3} />
              ) : (
                <DataTable<Intent>
                  rows={(intents.data ?? []).filter((i) => !i.suggested)}
                  rowKey={(i) => i.slug}
                  maxRows={3}
                  rowHref={(i) => `${BASE}/intents/${i.slug}`}
                  viewAllHref={`${BASE}/intents`}
                  viewAllLabel="View all intents"
                  empty={{
                    title: "No intents matched in this window",
                    hint: "Intents are discovered from conversation text. Give the agent more traffic and they appear here.",
                  }}
                  columns={[
                    {
                      key: "name",
                      header: "Intent",
                      cell: (i) => <span className="text-ag-hi">{i.name}</span>,
                    },
                    {
                      key: "messages",
                      header: "Msgs",
                      width: "56px",
                      align: "right",
                      cell: (i) => <span className="ag-data text-ag-hi">{i.messages}</span>,
                    },
                    {
                      key: "delta",
                      header: "Trend",
                      width: "88px",
                      align: "right",
                      cell: (i) => <Delta value={i.deltaPct} />,
                    },
                  ]}
                />
              )}
            </Panel>

            {/* The third axis of the story: which tool is actually breaking. */}
            <Panel title="Tools breaking" icon="tools">
              {loading ? (
                <SkeletonRows rows={3} />
              ) : (
                <DataTable<ToolStat>
                  rows={tools}
                  rowKey={(t) => t.name}
                  maxRows={3}
                  rowHref={(t) => `${BASE}/tools#${t.name}`}
                  viewAllHref={`${BASE}/tools`}
                  viewAllLabel="View all tools"
                  empty={{
                    title: "Every tool is healthy here",
                    hint: "Tools appear in this panel once they fail a call or cross 2s at p99.",
                  }}
                  columns={[
                    {
                      key: "name",
                      header: "Tool",
                      cell: (t) => <span className="ag-data text-ag-hi">{t.name}</span>,
                    },
                    {
                      key: "failures",
                      header: "Fails",
                      width: "56px",
                      align: "right",
                      cell: (t) => (
                        <span className={`ag-data ${t.failures ? "text-ag-err" : "text-ag-low"}`}>
                          {t.failures}
                        </span>
                      ),
                    },
                    {
                      key: "p99",
                      header: "p99",
                      width: "88px",
                      align: "right",
                      cell: (t) => (
                        <span
                          className={`ag-data ${
                            /* Red only past the line that matters; the rest
                               is read, not flagged. */
                            t.p99Ms >= 2500 ? "text-ag-err" : "text-ag-hi"
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
        </>
      )}
    </div>
  );
}

/* The most distinctive content in their product: an attributed, plain-English
   account of what a named user just went through. Full width and directly under
   the headline, because it is the only panel that answers "who did this happen
   to" — the second of the two questions the console exists for. */
function InsightRow({
  insight,
  index,
  now,
  violations,
  intents,
}: {
  insight: Insight;
  index: number;
  now: number;
  violations: Violation[];
  intents: Intent[];
}) {
  const violation = violations.find((v) => v.slug === insight.violations[0]);
  return (
    <li className={index >= 4 ? "hidden 2xl:block" : undefined}>
      <Link
        href={`${BASE}/users?user=${encodeURIComponent(insight.userId)}&conv=${insight.conversationId}`}
        className="flex flex-col gap-1 border-b border-ag-subtle px-4 py-2.5 transition-colors duration-150 ease-out last:border-b-0 hover:bg-ag-overlay"
      >
        <span className="flex items-baseline justify-between gap-3">
          <span className="ag-data truncate text-[12px] text-ag-mid">{insight.userId}</span>
          <span className="ag-data shrink-0 text-[11px] text-ag-low">
            {fmtAgo(insight.timestamp, now)}
          </span>
        </span>
        {/* One line, always. Variable row heights destroy the scan rhythm. */}
        <span className="ag-body-sm truncate text-ag-hi">{insight.summary}</span>
        <span className="flex flex-wrap items-center gap-1.5">
          {insight.intents.slice(0, 2).map((slug) => (
            <Badge key={slug}>
              {intents.find((i) => i.slug === slug)?.name ?? slug}
            </Badge>
          ))}
          {violation && <Badge tone="error">{violation.name}</Badge>}
        </span>
      </Link>
    </li>
  );
}
