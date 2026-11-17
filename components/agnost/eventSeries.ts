import { useMemo } from "react";
import { fmtClock } from "@/lib/data/format";

/* Events per interval across whatever range is in view, in eight buckets.
   Shared by Home and Events so the two charts can never disagree. */
export function useEventSeries(events: { ts: number }[]) {
  return useMemo(() => {
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
}
