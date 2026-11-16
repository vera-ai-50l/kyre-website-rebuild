"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";

export const CAL_LINK = "aditya-bhagat-nadcpb/15min";
const CAL_NS = "15min";

/* Spread onto any button/anchor to make it open the Cal popup.
   The embed script binds these via event delegation, so elements
   rendered before the script lands still work. */
export const calAttrs = {
  "data-cal-namespace": CAL_NS,
  "data-cal-link": CAL_LINK,
  "data-cal-config": '{"layout":"month_view","theme":"dark"}',
};

let booted = false;

/* Cal.com's official embed loader. It queues any Cal(...) calls made
   before embed.js finishes downloading, so early clicks aren't dropped. */
export function CalLoader() {
  useEffect(() => {
    if (booted) return;
    booted = true;

    (function (C: any, A: string, L: string) {
      const p = function (a: any, ar: any) {
        a.q.push(ar);
      };
      const d = C.document;
      C.Cal =
        C.Cal ||
        function (...args: any[]) {
          const cal = C.Cal;
          const ar = args;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function (...a: any[]) {
              p(api, a);
            };
            const namespace = ar[1];
            (api as any).q = (api as any).q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    const Cal = (window as any).Cal;
    Cal("init", CAL_NS, { origin: "https://cal.com" });
    Cal.ns[CAL_NS]("ui", {
      hideEventTypeDetails: false,
      layout: "month_view",
      theme: "dark",
    });
  }, []);

  return null;
}
