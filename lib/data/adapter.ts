/* Adapter selection, deliberately kept out of the "use client" module so it can
   also be imported from server code — generateStaticParams needs the intent
   slugs at build time, and that runs on the server. */

import { mockAdapter } from "./adapters/mock.ts";
import { restAdapter } from "./adapters/rest.ts";
import type { AgnostAdapter, Range } from "./types.ts";

/* Which adapter the screens talk to. Set in .env:
     NEXT_PUBLIC_DATA_SOURCE = mock | rest
   Defaults to mock so a fresh clone runs with no configuration. */
export const adapter: AgnostAdapter =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "rest" ? restAdapter : mockAdapter;

export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

export const RANGE_HOURS = 24;

/* Fixed for the demo so the fixtures always land inside it. Against a real
   backend this becomes Date.now(), which is why it is a function and not a
   constant. */
export function currentRange(now = Date.parse("2026-08-13T10:00:00Z")): Range {
  return {
    from: new Date(now - RANGE_HOURS * 3_600_000).toISOString(),
    to: new Date(now).toISOString(),
  };
}
