"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { currentRange, useQuery, type Event } from "@/lib/data";
import { fmtClock, fmtLatency } from "@/lib/data/format";
import { Icon } from "./ui";

/* The signature element — B7.

   Their version is a row of tick marks with no axis, no label, no time range
   and no tooltip: the product's most valuable signal, rendered
   uninterpretable. The instinct is right, so the rebuild keeps the ambient
   strip and makes it readable, then makes it an instrument: clicking a tick
   scrubs every panel above to a ten-minute window around that moment. */

const SCRUB_WINDOW = 10 * 60_000;

/** Events carry a parsed timestamp alongside the ISO string from the contract,
    so the strip can position ticks without re-parsing on every render. */
type Tick = Event & { ts: number };

type Scrub = {
  at: number | null;
  set: (t: number | null) => void;
  /** Events the screens should render — all of them, or the scrubbed window. */
  events: Tick[];
  /** Every event in range, ignoring the scrub. The strip itself needs these. */
  all: Tick[];
  range: { start: number; end: number };
  loading: boolean;
  error: Error | undefined;
  retry: () => void;
};

const EMPTY: Scrub = {
  at: null,
  set: () => {},
  events: [],
  all: [],
  range: { start: 0, end: 0 },
  loading: true,
  error: undefined,
  retry: () => {},
};

const ScrubContext = createContext<Scrub>(EMPTY);

export const useScrub = () => useContext(ScrubContext);

/* One fetch for the whole console. Every screen that needs events reads them
   from here rather than issuing its own request, which is also what makes the
   scrub instantaneous — it is a filter over data already in memory. */
export function ScrubProvider({ children }: { children: ReactNode }) {
  const [at, set] = useState<number | null>(null);
  const range = useMemo(() => currentRange(), []);
  const query = useQuery("events", (a) => a.getEvents(range));

  const all = useMemo<Tick[]>(
    () => (query.data ?? []).map((e) => ({ ...e, ts: Date.parse(e.timestamp) })),
    [query.data],
  );
  const events = useMemo(
    () => (at === null ? all : all.filter((e) => Math.abs(e.ts - at) <= SCRUB_WINDOW / 2)),
    [all, at],
  );

  const value = useMemo<Scrub>(
    () => ({
      at,
      set,
      events,
      all,
      range: { start: Date.parse(range.from), end: Date.parse(range.to) },
      loading: query.loading,
      error: query.error,
      retry: query.refetch,
    }),
    [at, events, all, range, query.loading, query.error, query.refetch],
  );

  return <ScrubContext.Provider value={value}>{children}</ScrubContext.Provider>;
}

export function EventsStrip() {
  const { at, set, all, range, loading } = useScrub();
  const [hover, setHover] = useState<Tick | null>(null);

  const DAY = Math.max(1, range.end - range.start);
  const pct = (ts: number) => ((ts - range.start) / DAY) * 100;

  const lastHourFailures = all.filter(
    (e) => e.status === "failure" && e.ts >= range.end - 3_600_000,
  ).length;

  const step = (delta: number) =>
    set(Math.min(range.end, Math.max(range.start, (at ?? range.end) + delta)));

  return (
    <div className="relative flex h-14 shrink-0 items-center gap-3 border-t border-ag-subtle bg-ag-raised px-3 sm:px-4">
      <span className="ag-label hidden shrink-0 sm:block">Live events</span>

      <div className="relative min-w-0 flex-1">
        {/* Time range is labelled at each end — without it the strip is a
            decoration rather than a timeline. */}
        <div className="ag-data pointer-events-none flex justify-between text-[10px] text-ag-low">
          {/* A 24h window opens and closes at the same clock time, so printing
              the clock at both ends gives two identical labels and no sense of
              direction. Say which day the left edge is. */}
          <span>{fmtClock(new Date(range.start).toISOString())} yesterday</span>
          <span>24h</span>
          <span>now · {fmtClock(new Date(range.end).toISOString())}</span>
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Live events, last 24 hours. Arrow keys scrub the dashboard."
          aria-valuemin={range.start}
          aria-valuemax={range.end}
          aria-valuenow={at ?? range.end}
          aria-valuetext={
            at === null
              ? "Full 24 hours"
              : `10 minutes around ${fmtClock(new Date(at).toISOString())}`
          }
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") { e.preventDefault(); step(-15 * 60_000); }
            if (e.key === "ArrowRight") { e.preventDefault(); step(15 * 60_000); }
            if (e.key === "Home") { e.preventDefault(); set(range.start); }
            if (e.key === "End") { e.preventDefault(); set(range.end); }
            if (e.key === "Escape") { e.preventDefault(); set(null); }
          }}
          onMouseLeave={() => setHover(null)}
          className="relative mt-1 h-6 w-full rounded-[3px]"
        >
          {/* The scrubbed window, drawn behind the ticks. */}
          {at !== null && (
            <span
              className="absolute inset-y-0 rounded-[2px] border-x border-ag-accent bg-ag-accent-wash"
              style={{
                left: `${pct(at - SCRUB_WINDOW / 2)}%`,
                width: `${(SCRUB_WINDOW / DAY) * 100}%`,
              }}
            />
          )}

          {/* While events are in flight the strip holds its height rather than
              collapsing and shoving the whole console down when they land. */}
          {loading && <span className="ag-skeleton absolute inset-x-0 top-2 h-2.5 rounded" />}

          {all.map((e) => (
            <button
              key={e.id}
              type="button"
              tabIndex={-1}
              aria-hidden
              onMouseEnter={() => setHover(e)}
              onClick={() => set(at === e.ts ? null : e.ts)}
              style={{ left: `${pct(e.ts)}%` }}
              className={`absolute -translate-x-1/2 cursor-pointer rounded-[1px] transition-[height,opacity] duration-150 ease-out ${
                e.status === "failure"
                  ? "top-0.5 h-5 w-[3px] bg-ag-err"
                  : "top-2 h-2.5 w-[2px] bg-ag-low hover:bg-ag-mid"
              } ${hover?.id === e.id ? "opacity-100" : "opacity-90"}`}
            />
          ))}
        </div>

        {hover && (
          <div
            role="tooltip"
            style={{ left: `${pct(hover.ts)}%` }}
            className="pointer-events-none absolute bottom-9 z-20 w-max max-w-[240px] -translate-x-1/2 rounded-md border border-ag-strong bg-ag-overlay px-2.5 py-1.5 shadow-lg"
          >
            <p className="ag-data text-[11px] text-ag-hi">
              {fmtClock(hover.timestamp)} · {hover.tool}
            </p>
            <p className="ag-data text-[11px] text-ag-low">
              {hover.userId} · {fmtLatency(hover.latencyMs)}
              {hover.status === "failure" && (
                <span className="text-ag-err"> · failed</span>
              )}
            </p>
          </div>
        )}
      </div>

      {at !== null ? (
        <button
          type="button"
          onClick={() => set(null)}
          className="ag-data flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-ag-accent/40 bg-ag-accent-wash px-2 text-[11px] text-ag-accent-text"
        >
          {fmtClock(new Date(at).toISOString())} ±5m
          <Icon name="x" className="h-3 w-3" />
        </button>
      ) : (
        /* Red ticks become a counted badge — "some red marks" is not actionable. */
        <a
          href="/agnost/console/events#failures"
          className="flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[12px] text-ag-mid transition-colors duration-150 ease-out hover:bg-ag-overlay hover:text-ag-hi"
        >
          <span className="ag-data text-ag-err">{lastHourFailures}</span>
          <span className="hidden sm:inline">failures in the last hour</span>
          <span className="sm:hidden">failures</span>
        </a>
      )}
    </div>
  );
}
