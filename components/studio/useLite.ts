"use client";

/* The lighter tiers (html[data-lite]) are now only ever set by hand, with
   ?fx=low or ?fx=nogpu (app/layout.tsx); every visitor otherwise gets the
   full page. */
export const LITE_EVENT = "kyre:lite";
/* Fired by the theme switch in the nav, for the canvases that draw colour. */
export const THEME_EVENT = "kyre:theme";

export function isLite() {
  return typeof document !== "undefined" && "lite" in document.documentElement.dataset;
}

/* The scroll watchdog that used to step a slow machine down to "low" mid-visit
   is gone: every visitor keeps the full page for the whole visit. Kept as a
   hook so callers need not change. */
export function useLite() {}
