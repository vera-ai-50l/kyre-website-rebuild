import type { Plate } from "./scene";

/* The picture on the glass: the console in its "before" state, photographed
   rather than drawn a second time. `npm run capture:reel` regenerates both from
   the live component, so they cannot drift from the screen they turn into —
   run it whenever RUNS or the console's layout changes.

   Two, because a phone gets a different layout rather than a smaller one, and
   a desktop table shrunk to 360px is a texture of grey lines.

   The sizes are the capture's, and the stylesheet's --ar has to agree with
   them: the stage in the markup is what the canvas measures. */
export const PLATES: Record<"wide" | "narrow", Plate> = {
  wide: {
    src: "/reel/before-wide.png",
    w: 2506,
    h: 1260,
    /* vector_search: third row, between its name and its 12.4 seconds. */
    impact: [0.56, 0.49],
    radius: 16 / 630,
  },
  narrow: {
    src: "/reel/before-narrow.png",
    w: 1197,
    h: 1672,
    impact: [0.52, 0.495],
    radius: 12 / 560,
  },
};
