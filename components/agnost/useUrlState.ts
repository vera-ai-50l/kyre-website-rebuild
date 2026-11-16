"use client";

import { useSyncExternalStore } from "react";

/* The URL is external mutable state, so it gets subscribed to rather than
   copied into an effect: the server snapshot is empty and React re-renders with
   the real location after hydration, instead of mismatching against it.

   This exists because F3's destinations have to actually do something. A row
   that links to /events?violation=broken-export and lands on an unfiltered list
   is still a dead row — it just fails one click later. */

const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  // Same-document pushState (Next's client router) fires neither event.
  window.addEventListener("ag:urlchange", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("ag:urlchange", onChange);
  };
};

const snapshot = () => window.location.search + window.location.hash;

export function useUrlState() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const [search, hash] = [
    raw.split("#")[0] || "",
    raw.includes("#") ? raw.slice(raw.indexOf("#") + 1) : "",
  ];
  const params = new URLSearchParams(search);
  return {
    /** ?key=value */
    param: (key: string) => params.get(key),
    /** the #fragment, without the # */
    hash,
  };
}
