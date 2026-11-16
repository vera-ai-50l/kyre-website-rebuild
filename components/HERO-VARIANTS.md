# Hero variants

Two complete heroes live here. Both work. Only one is mounted at a time, and
switching is a two-line edit in `app/page.tsx`.

## A — `HeroReel` (currently live)

Scroll cinematic, in seven beats that deliberately do not overlap. Everything
moving at once is what made the earlier cut read as confetti.

| `--p` | beat |
|---|---|
| 0 | headline alone on a ruled, lit field. The window is not on screen — the scrim over it is solid |
| .02–.18 | the copy leaves, growing to 1.72× toward the lens; the window arrives behind it |
| .15–.32 | caption: **"Your dashboard today / 3 of 18 users stopped coming back"** |
| .198 | **jolt** (one-shot, 980ms) — the hit that fractures the pane |
| .21–.32 | fissures light under the ring-down, three red callouts write themselves onto the failures |
| .32–.40 | hold — nothing moves, so the callouts can be read |
| .40–.57 | it breaks; the pieces scatter with their own lit edges and do not come back |
| .48–.68 | "Rebuilt with Kyre" |
| .64–.84 | the console comes up from under the frame, lying back 62°, and stands level |
| .87 | **trigger** — the rebuild plays itself, ~2.4s, then the before/after toggle |

## The pieces carry their own light

There is no separate fissure layer. There was one, drawn behind the plates on the
lattice, and it was wrong in a way that survived two attempts to patch it: a glow
fixed to where the screen *used to be* detaches from the pieces the instant
anything moves. That was obvious during the break, and it was already true
during the diagnosis — the plates part by `--gap`, so the lit line sat in the
middle of the gap with the piece it belonged to 13px away on either side.

Every lit line is now a child of the piece it is the edge of, so it cannot
detach by construction. `Edge` strokes the plate's own outline and is clipped by
that same polygon, so the outer half of every stroke is cut and what survives is
a rim on the inside of the cut — which is what a fractured edge is. Stroke
widths are doubled for that reason: 16/6/2 renders as 8/3/1.

**Only the fractures are lit.** An edge lying along the window's own border was
never a break — a corner shard has two broken edges and two original ones — so
those segments are dropped, tested on the *un-expanded* points because the 0.6%
overlap pushes a boundary vertex off the boundary by a hair. Emitted as separate
`M/L` subpaths rather than a polygon, so the dropped sides leave real gaps.
Corner plates measure two subpaths, as they should.

Two lives, one element: a hairline while the cracks open, full strength through
the flight.

A plate's ground is a flat opaque colour, not an alpha retiring with `--away`.
Fading it produced fragments you could see straight through to the fragments
behind them — a lit outline around a hole. A piece of a broken screen is a solid
object; the plate's own `--po` is what makes it leave.

Three flat strokes, no filter. Chained `drop-shadow`s re-blur each other's
output and measured 378ms a frame the last time that was tried, so the halo is a
wide translucent stroke rather than a blur.

## The console, and the one control

The pieces used to come back and re-form the same broken screen, which needed a
caption to stop it reading as the rebuild happening twice. What arrives instead
is a glass console, hinged on its own bottom edge: lying back and low, then
square to the lens and level. A screen being stood up rather than one fading in.

It lives in `.glassWrap`, outside `.stage`, because the stage is scaled almost
twice over as the camera goes through the break and none of that belongs here.

No `backdrop-filter` — a backdrop root is a full-viewport readback on every
frame of the whole scroll, it cost 36ms of a 96ms frame when it was last here,
and what sits behind this panel is empty dark space anyway. What reads as glass
is the lit top edge, the fall-off down the face, and the floor under it.

The reflection is light, not a second panel. A real mirror means another two
dashboards in the DOM — about 130 nodes — and the frame only has room to show
its top hundred-odd pixels before the mask takes it to nothing. Masked with one
radial rather than a linear: a linear fade down the page left the sides square,
so it read as a lighter rectangle with two visible vertical edges, and a floor
does not have edges.

## One console, two states

`Console` renders both states. There is no second component and nothing is ever
remounted: every difference between "before" and "after" is a CSS transition off
`[data-side]`.

This matters because the claim the page makes is that *nothing is added* between
the two screens — the same eight calls, reorganised. A reorganisation is
invisible unless the rows are the same rows and they move. Two components that
swapped, or one face keyed and remounted, both read as the screen refreshing.

- **Rows are out of flow and placed by rank.** `translateY(rank × 100%)`, rank
  from `at`, which is data. Changing the rank is then a transform the browser
  can interpolate; in document flow the same reorder is a relayout, which cannot
  be animated at all. Measured: `vector_search` travels 483px → 355px and
  `summarize_ticket` 355px → 546px, both catchable mid-flight in both
  directions.
- **Everything a row gains is mounted in both states** and grows or fades in
  place — glyph, latency bar, cost, pill. The status cell holds both readings
  stacked: "error" is what the log said, the pill is what it meant.
- **Tiles hold two readings stacked** and cross-fade, because text cannot be
  interpolated but two layers of it can. The lead tile grows by `flex-grow`, so
  the other three give way rather than jumping.
- **The side panel's width never changes**, only its contents fade. Animating
  the width would relayout the table under the rows every frame, and the one
  thing a reorder needs is for the columns to hold still while the rows move
  through them.

**The rebuild and the toggle are the same mechanism.** Crossing p 0.87 sets the
side; so does the button. The console rises carrying the old screen and is seen
to become the new one. Scrolling back up returns it to "before", so coming down
again always plays the change rather than arriving at a screen already finished.

`--d` is the row's own delay, from its rank, so the table resolves top-down.
Every use carries a `0ms` fallback: the header row is not in `.rows` and has no
rank, and one unresolved `var()` invalidates the whole declaration it sits in.

The nine copies inside the plates are wallpaper — a shattered screenshot that
never changes state — so `flat` throws away all of that machinery: the stacked
faces, the out-of-flow rows, the inner spans, the transitions. Rendering them
like the live one cost about 20ms a frame for structure nobody can see through a
fragment flying past the lens.

This is the one piece of React state in the reel. The rule everywhere else — no
React in the scroll path — is about re-rendering a fifty-node subtree sixty
times a second, which a click does not do. Reduced motion is read with
`useSyncExternalStore` rather than an effect, because it is external state that
can change while the page is open.

## Both screens carry the same columns

Trend and reach are on the broken table too, in the same grey as everything
else. That is the argument stated in data rather than asserted: `+212%` and
`18 users` are sitting in row three of the screen they already have, and the
reason nobody has read them is that they are set in the same weight as the
seven rows that are fine. The rebuilt table tones them by size, ranks the table
by cost, puts a share bar under the reach, and marks the burn chart with the
budget the curve crosses.

`BUDGET` is asserted below `PEAK` at module scope. It is plotted with the same
`cy()` as the curve, so a budget above the peak lands outside the viewBox and
silently does not render — which is what happened at 900 against a peak of 374.

## Two things are triggers, not phases

Crossing a mark writes an attribute on the section; everything downstream is a
CSS transition. `useScrollProgress` takes an optional `onProgress` for this.

**The jolt.** A shake scrubbed off `--p` never ends — stop scrolling halfway
through the break and the camera freezes at that amplitude and vibrates there
until you move. As a one-shot animation it fires and is over on its own.

It belongs to the cracking, not the scattering. Fired at .198 — just ahead of
`--diag` opening at .21 — and run over 980ms, it is the impact that fractures
the glass and it is still ringing down while the fissures draw themselves in. It
sat at .345 before, immediately ahead of the pieces parting, which put the hit a
whole beat after the damage it was meant to cause. Measured at p .24 the camera
is at (−2.6, −2.7) while the plate is still at its resting crack offset; back at
(0, 0) by p .30. Peak amplitude 7px, not 15.

**The rebuild.** Scrubbed, the rows, bars and chart advanced at whatever rate
the wheel turned: scroll an inch, the rebuild is an inch done. No easing fixes
that, because the input is the hand. `data-fix` starts it and it runs at frame
rate — rows sliding in by rank, bars growing, glyphs drawing themselves, the
chart line writing in last, green labels after that.

Both reverse if you scroll back up, so the sequence can be replayed.

Callout anchors are computed from the layout's own band percentages (app bar
11%, stats 15%, table 58%, footer 16%) rather than eyeballed, so they stay on
their targets at any window size. The two states do not share that arithmetic —
broken has a column header eating 5% of the table and rebuilt does not, which is
what had them pointing one row off.

No animation library. The plates are `clip-path` polygons over nine copies of
the same markup, and every frame is a `clamp()` slice of one custom property.
Two constraints are worth knowing before editing it:

- **Opacity, filter, overflow and clip-path force `transform-style: flat`.** Any
  of them on an ancestor kills the 3D beneath it, so fades live on leaves only.
- **The glow is one element per state, not one per plate.** A plate's own shadow
  travels with the plate and is therefore never inside the gap it just opened.
  Thirty-six filtered plates measured 378ms a frame and still did not work.
- **Plate faces are opaque only while the window is whole** (`1 - --away`).
  Neighbours overlap 0.6% to stop hairline gaps opening along the cracks; with
  see-through plates that band drew the content twice and every seam showed on
  the reassembled screen. But an opaque plate magnified in flight is a dark
  sheet across the frame, so it clears as it leaves.
- **No `backdrop-filter`.** A backdrop root is a full-viewport readback on every
  frame of the whole scroll, not only where the blur is non-zero. It cost 36ms
  of a 96ms frame for a defocus that a scrim already gave.

## Where the frames went

Headless Chromium has no GPU, so the absolute numbers are a software-rasteriser
ceiling. Treat the deltas as real and the totals as a worst case — which is
roughly what a laptop running off its battery is.

| fix | measured |
|---|---|
| **the headline's words are promoted** | **36 → 20ms.** Growing text is the most expensive thing on the page: every frame of the zoom was a fresh glyph rasterisation at a new size, ten words of it, while the scrim, the grid and the stage all changed underneath. Promoted, each word rasters once and the scale and fade belong to the compositor. The softness that comes with scaling a texture is not a defect on type flying past the lens |
| **plates fly out one way** | **64 → 36ms.** They used to travel out and come all the way back. Half the scroll was spent compositing eighteen returning layers and a scaled stage over the console arriving underneath; now the second half of the reel is one glass panel |
| **no perpetual wash drift** | **104 → 85ms.** The two largest layers on the page, ~2Mpx each, animating on 41s and 57s loops. An element with an infinite animation forces a composite on *every* frame of the document forever, and what this bought was a 20vw move over 41 seconds that nobody has ever seen. The light still moves — the tracks lean with the pointer, on demand |
| runway measured on resize, not per frame | `getBoundingClientRect()` in a scroll handler flushes pending style and layout every frame, across a sticky subtree of 1159 nodes. `scrollY` is a number the compositor already has |
| `.dim` fades by opacity, not by colour alpha | a `background-color` whose alpha changes per frame is a paint, and this one is the size of the window |
| plate ground moved to `::before` | same problem nine times over, except each of those layers holds a whole copy of the dashboard |
| skip the write when the value has not changed | parked at either end, the style write dirtied the subtree for a frame that renders identically |
| one set of plates, not two | both halves carry the same broken screen. 1823 → 1142 nodes |
| plates sized to their own bounding box | a layer rasterises at element size *before* the clip. Nine window-sized textures to show one ninth each was most of the stutter |
| backings gated on `--away` | a cut edge only exists on a piece that has moved; skipped for most of the scroll |

One infinite animation is left in the hero — `breathe` on `.wash3`, promoted and
boxed down to about half its old area. It is the only ambient movement in the
room and costs roughly nothing now that it is on its own layer.

**Measuring this is easy to get wrong.** `[class*="tag"]` also matches `stage`,
so a probe meant to hide two captions hid the entire window and reported a 2×
win that was really "draw nothing". Match the captions by `[data-when]`.

### Nothing behind the headline

There was a bordered panel once, then a radial veil meant to be the same idea
without an edge. The veil was worse: a gradient that fades to nothing still
shows its boundary once there is light behind it to darken, and it read as a
dark ellipse sitting across the middle of the hero. It was also never needed —
the scrim below is opaque at rest, so there is nothing to separate the headline
from; by the time there is, the copy has gone.

| | |
|---|---|
| Component | `components/HeroReel.tsx` |
| Styles | `components/reel.module.css` |
| Data | `components/runs.ts` (8 runs, shared) |
| Driver | `components/useScrollProgress.ts` |
| Runway | 560vh desktop, 340vh under 900px — callouts dropped there, three leader lines do not fit beside a 390px table |

## B — `Hero` (parked, intact)

Tap-to-rebuild. A single panel at normal scale; one button flips it from the
shipped state to the rebuilt state, rows reorder, latency bars draw, the burn
chart reveals.

| | |
|---|---|
| Component | `components/Hero.tsx` |
| Styles | `components/hero.module.css` |
| Scene | `components/RebuildScene.tsx` + `components/rebuild.module.css` |
| Data | self-contained inside `RebuildScene.tsx` (5 runs) |

`RebuildScene` deliberately keeps its own copy of the run data rather than
importing `runs.ts`. It is a frozen variant: pointing it at shared data would
mean a change made for the reel could silently break a hero nobody is looking
at.

## Switching

In `app/page.tsx`:

```tsx
// A → B
import Hero from "@/components/Hero";
...
<Hero />
```

```tsx
// B → A
import HeroReel from "@/components/HeroReel";
...
<HeroReel />
```

Nothing else references either one. No route, layout, or global style depends
on which is mounted.

## Why B is worth keeping

The reel needs four screens of scrolling before a visitor reaches anything they
can act on. That is a real conversion cost, and it is the kind of thing worth
measuring rather than arguing about. B is the control.
