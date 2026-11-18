import type { Plate } from "./scene";

/* The picture the breaking glass wears: the old screen, photographed off the
   live component by `npm run capture:studio`, so it cannot drift from the
   screen it turns into — run that whenever Screen.tsx's "before" face changes.

   Two, because a phone gets a different layout rather than a smaller one. The
   sizes are the capture's, and --ar in hero.module.css has to agree with them:
   the stage in the markup is what the canvas measures. `impact` is where it is
   struck, as fractions of the pane. */
export const PLATES: Record<"wide" | "narrow", Plate> = {
  wide: {
    src: "/reel/studio-wide.png",
    w: 2506,
    h: 1260,
    impact: [0.57, 0.44],
    radius: 16 / 630,
  },
  narrow: {
    src: "/reel/studio-narrow.png",
    w: 1200,
    h: 1680,
    impact: [0.54, 0.42],
    radius: 12 / 560,
  },
};
