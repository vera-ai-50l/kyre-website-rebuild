"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { adapter } from "./adapter";
import type { AgnostAdapter } from "./types";

export * from "./types";
export { adapter, currentRange, DATA_SOURCE, RANGE_HOURS } from "./adapter";


/* One in-flight request per key, shared across components. Without it the Shell
   and Home both asking for intents means two round trips for one answer. */
const cache = new Map<string, Promise<unknown>>();

export const invalidate = (key?: string) => {
  if (key) cache.delete(key);
  else cache.clear();
};

export type Query<T> = {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
};

/* One hook behind every screen. Screens never import fixtures and never know
   which adapter answered — they get data, loading, error, and that is all. */
export function useQuery<T>(
  key: string,
  fetcher: (a: AgnostAdapter) => Promise<T>,
): Query<T> {
  /* One state object stamped with the request it belongs to. Loading is then
     derived during render — `we have not settled this key yet` — rather than
     set synchronously at the top of the effect, which would queue a second
     render pass on every key change. */
  const [settled, setSettled] = useState<{
    key: string;
    nonce: number;
    data?: T;
    error?: Error;
  }>({ key: "", nonce: -1 });
  const [nonce, setNonce] = useState(0);

  /* Callers pass an inline arrow, so the fetcher identity changes every render.
     useEffectEvent holds the latest one without making it reactive — the older
     trick of assigning to a ref during render is a render side effect. */
  const run = useEffectEvent(() => fetcher(adapter));

  useEffect(() => {
    let cancelled = false;
    let inflight = cache.get(key) as Promise<T> | undefined;
    if (!inflight) {
      inflight = run();
      cache.set(key, inflight);
      // A rejected promise must not stay cached, or retry can never succeed.
      inflight.catch(() => cache.delete(key));
    }
    inflight.then(
      (data) => {
        if (!cancelled) setSettled({ key, nonce, data });
      },
      (e: unknown) => {
        if (!cancelled) {
          setSettled({ key, nonce, error: e instanceof Error ? e : new Error(String(e)) });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, nonce]);

  const refetch = useCallback(() => {
    invalidate(key);
    setNonce((n) => n + 1);
  }, [key]);

  const fresh = settled.key === key && settled.nonce === nonce;
  return {
    data: fresh ? settled.data : undefined,
    error: fresh ? settled.error : undefined,
    loading: !fresh,
    refetch,
  };
}
