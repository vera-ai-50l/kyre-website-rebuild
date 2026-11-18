---
name: Kyre
description: A teardown bench. Screens are taken apart on a green cutting mat, labelled with yellow stickers, and put back together better.
colors:
  sticker-yellow: "#f2d24b"
  sticker-ink: "#13241c"
  mat-green: "#1d5642"
  mat-grid: "rgba(226, 236, 190, 0.07)"
  mat-grid-major: "rgba(226, 236, 190, 0.16)"
  ruler: "rgba(232, 240, 196, 0.62)"
  ruler-soft: "rgba(232, 240, 196, 0.3)"
  chalk: "#f1f4ea"
  chalk-dim: "#bfccbf"
  chalk-line: "rgba(241, 244, 234, 0.14)"
  chalk-line-strong: "rgba(241, 244, 234, 0.34)"
  part-ink: "#121b16"
  paper: "#f6f7f2"
  sheet: "#eef0ea"
  white: "#fbfbf8"
  ink: "#111a15"
  ink-2: "#1c2621"
  dim: "#47524c"
  faint: "#626d66"
  line: "rgba(17, 26, 21, 0.09)"
  line-strong: "rgba(17, 26, 21, 0.16)"
  mark-green: "#1f7a55"
  pass-green: "#17804a"
  fail-red: "#b42318"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 3.3vw, 3.4rem)"
    fontWeight: 720
    lineHeight: 0.98
    letterSpacing: "-0.038em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6.2vw, 5.6rem)"
    fontWeight: 760
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 70"
  statement:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 2.5vw, 2.15rem)"
    fontWeight: 560
    lineHeight: 1.22
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 104"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 2.6vw, 2.3rem)"
    fontWeight: 620
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 112"
  title-sm:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.037em"
    fontVariation: "'wdth' 108"
  figure:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 4.4vw, 3.9rem)"
    fontWeight: 620
    lineHeight: 0.9
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 116"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.006em"
  lede:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  button:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 620
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.01em"
  wordmark:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 118"
  measure:
    fontFamily: "Martian Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "'tnum'"
  ruler:
    fontFamily: "Martian Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "'tnum'"
rounded:
  badge: "0.3rem"
  control: "0.55rem"
  part-sm: "0.6rem"
  panel: "0.8rem"
  part: "0.9rem"
  sheet: "1rem"
  band: "1.2rem"
  pill: "999px"
  dot: "50%"
spacing:
  grid-minor: "40px"
  grid-major: "200px"
  page: "76rem"
  gutter: "1.5rem"
  gutter-mobile: "1rem"
  section-y: "clamp(3.75rem, 6.5vw, 6rem)"
  head-gap: "clamp(2.25rem, 4vw, 3.5rem)"
  part-gap: "1.5rem"
  part-pad: "2.25rem"
  part-pad-mobile: "1.6rem"
components:
  button-primary:
    backgroundColor: "{colors.sticker-yellow}"
    textColor: "{colors.sticker-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 0.4rem 0 1.25rem"
    height: "3.1rem"
  button-primary-icon:
    backgroundColor: "{colors.sticker-ink}"
    textColor: "{colors.sticker-yellow}"
    rounded: "0.38rem"
    size: "2.3rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 0.4rem 0 1.25rem"
    height: "3.1rem"
  button-ghost-on-paper:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "3.1rem"
  button-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "3.1rem"
  button-sm:
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 0.4rem 0 1rem"
    height: "2.5rem"
  sticker-dot:
    backgroundColor: "{colors.sticker-yellow}"
    textColor: "{colors.sticker-ink}"
    typography: "{typography.measure}"
    rounded: "{rounded.dot}"
    size: "1.6rem"
  part:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.dim}"
    rounded: "{rounded.part}"
    padding: "{spacing.part-pad}"
  part-ink:
    backgroundColor: "{colors.part-ink}"
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.part}"
    padding: "{spacing.part-pad}"
  dark-band:
    backgroundColor: "{colors.sticker-ink}"
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.band}"
  nav-island:
    backgroundColor: "rgba(20, 62, 47, 0.94)"
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.panel}"
    padding: "0 0.4rem 0 1.3rem"
    height: "3.4rem"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "3.1rem"
  flag:
    backgroundColor: "{colors.sticker-yellow}"
    textColor: "{colors.sticker-ink}"
    rounded: "{rounded.badge}"
    padding: "0.25rem 0.6rem"
  chip-judged:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.75rem"
  faq-item:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "1.25rem 1.25rem 1.25rem 1.5rem"
  segment-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    height: "3rem"
---

# Design System: Kyre

## Overview

**Creative North Star: "The Teardown Bench"**

The page is a self-healing cutting mat: a deep green field ruled with a pale grid every 40px and a heavier line every 200px, with ruler ticks and numerals printed along its top and left edges. Everything Kyre shows lies on that mat as a physical part: paper cards, ink cards, a product screen at a slight angle. Parts cast the shadow an object casts on a green surface, short contact plus a long soft throw, and they are flat at rest, lifted when picked up. Numbered yellow sticker dots with hairline leaders label the parts, the way a technician labels a disassembly.

The type is one family in two cuts. Archivo, on its width axis, speaks: wide and heavy for the hero line, the wordmark, card titles and prices; condensed and very large for section headlines. Martian Mono only measures: ruler numerals, sticker numbers, step numbers, day cells, code. Yellow is the sticker and the action, and nothing else. Red and green appear only as verdicts on paper (what fails, what passes).

The density is that of a workbench, not a gallery: large headlines on the open mat, then tight, information-carrying parts. Every moving figure plays once when it is revealed and settles; the only continuous motion is the hero's scroll-scrubbed disassembly.

**Key Characteristics:**
- Deep mat-green ground with a two-weight printed grid and ruler edge, everywhere on the page.
- Content lives on parts (paper or ink) with green-black object shadows; text on the open mat is chalk only.
- One yellow: buttons, sticker dots, flags and badges, focus rings on the mat.
- Archivo width axis carries the hierarchy: 70% for section headlines, 104–118% for everything wide.
- Martian Mono is reserved for numerals that measure.
- Red and green are verdict colours, used small and only on paper.

## Colors

A cool, saturated green field with chalk-white type, warm paper parts, and one sticker yellow.

### Primary
- **Sticker Yellow** (#f2d24b): the action and the label. Every primary button, every numbered sticker dot on the mat and in lists, the step numbers, the price and time badges, the "Concept, not client work" flag, the open FAQ marker, the full stop in the wordmark, text selection, and the focus ring on the mat. It reads at 5.7:1 against the mat.
- **Sticker Ink** (#13241c): the only colour that sits on yellow (10.9:1). It also fills the "How it works" band, which is the mat's darkest inset.

### Neutral (the mat)
- **Cutting Mat Green** (#1d5642): the page ground under everything, and the body background behind the route.
- **Grid** (rgba 226 236 190 / 0.07) and **Major Grid** (/ 0.16): the 40px and 200px rulings printed on the mat.
- **Ruler** (rgba 232 240 196 / 0.62) and **Ruler Soft** (/ 0.3): the 40px and 8px tick strips and the mono numerals along the hero's top and left edges, and the tick strip that continues down the page's left edge.
- **Chalk** (#f1f4ea): headlines, card titles and strong text on the mat or on ink parts (7.7:1 on the mat).
- **Chalk Dim** (#bfccbf): body copy, ledes and nav links on the mat (5.1:1 on the mat).
- **Chalk Line** (rgba 241 244 234 / 0.14) and **Chalk Line Strong** (/ 0.34): hairline dividers on the mat, and the ghost button's outline.
- **Part Ink** (#121b16): the dark part, for cards that show code, security or the product kit.

### Neutral (the parts)
- **Paper** (#f6f7f2): the default part surface; cards, FAQ items, the request form, the hero's URL field.
- **Sheet** (#eef0ea): the backing behind team photos.
- **White** (#fbfbf8): the raised face inside a part: the selected tab, the LinkedIn badge.
- **Ink** (#111a15): headings and strong text on paper (16.5:1), the "judged on" chips, the comparison table's Kyre column, the checked segment.
- **Ink 2** (#1c2621): list text inside the concept notes.
- **Dim** (#47524c): body copy on paper (7.6:1).
- **Faint** (#626d66): labels, captions and fine print on paper (5.0:1).
- **Line** (rgba 17 26 21 / 0.09) and **Line Strong** (/ 0.16): inset hairlines inside parts; input and segment outlines.

### Verdict colours
- **Mark Green** (#1f7a55): the "good" mark on paper. Check icons in scope lists, bullets in the sign list and concept notes, numbered findings in the sample teardown, the focus ring on paper inputs, the progress fill on the timeline.
- **Pass Green** (#17804a): the state after a fix. "Pass" readouts, fixed funnel figures, merge confirmation.
- **Fail Red** (#b42318): the state before a fix. "Fail" readouts, the failing funnel stage, leak reasons.

### Named Rules
**The One Yellow Rule.** Sticker Yellow marks either an action or a label, and always carries Sticker Ink on it. It is never body text, never a background wash, never decoration.

**The Paper On Mat Rule.** Text set directly on the mat is Chalk or Chalk Dim. Ink, Dim and Faint exist only on paper parts. A reading surface that needs dark text is a part, with its shadow.

**The Verdict Rule.** Red and green only say fail and pass, and only on paper or ink parts, at small sizes: a numeral, a dot, a check, a pill. They never colour a heading or a surface.

## Typography

**Display Font:** Archivo (variable, with the `wdth` axis), falling back to system-ui
**Body Font:** Archivo, same file
**Label/Mono Font:** Martian Mono (variable `wdth`), falling back to monospace

**Character:** One grotesque stretched in two directions. The wide cut is the voice of the bench, confident and flat; the condensed cut makes section headlines read as large stamped titles. The mono is the measuring tool: small, tabular, never a voice.

### Hierarchy
- **Display** (720, wdth 112, clamp(2.2rem, 3.3vw, 3.4rem), line-height 0.98): the hero headline only, the one wide display line on the page; it changes as the hero scene moves (opening line, "Taken apart", "Put back together").
- **Headline** (760, wdth 70, clamp(2.6rem, 6.2vw, 5.6rem), line-height 0.92, balanced): every section headline on the mat. Larger than the display line by design: the hero headline shares its viewport with the screen.
- **Statement** (560, wdth 104, clamp(1.4rem, 2.5vw, 2.15rem), line-height 1.22): the one paragraph that lights word by word as it climbs the screen.
- **Title** (620, wdth 108–112, clamp(1.6rem, 2.6vw, 2.4rem), line-height 1–1.05): offer names, step titles, path titles inside parts.
- **Title Small** (600, wdth 108, 1.5rem, line-height 1.1): titles in the smaller bento parts.
- **Figure** (620, wdth 116, clamp(2.6rem, 4.4vw, 3.9rem), line-height 0.9): prices. Funnel stage figures use the same wide cut at 1.55rem with tabular numerals.
- **Body** (400, 1rem, line-height 1.55): running text; on paper it is Dim, on the mat Chalk Dim. Ledes and part copy step to 1.0625rem, held to 26–36rem measures.
- **Label** (500, 0.75rem, letter-spacing 0.01–0.02em, sentence case): stage names, table row heads, captions, "Illustration, not data". Never uppercase.
- **Measure** (Martian Mono 600, 0.75rem, tabular): sticker numbers, step numbers, day and week cells, contrast readouts, code diffs, the URL rail on the screen.
- **Ruler** (Martian Mono 400, 0.6875rem, tabular): ruler numerals on the mat edge.

### Named Rules
**The Two Cuts Rule.** Width is the hierarchy. Section headlines take the condensed cut (wdth 70); the hero line, the wordmark (wdth 118, weight 800), titles and prices take the wide cut (wdth 104–118). Nothing sits at the default width above body size.

**The Mono Measures Rule.** Martian Mono sets only numerals and strings that measure or identify: rulers, part numbers, steps, days, code, URLs. It never sets a sentence, a heading or a button.

## Layout

The page ground is the mat itself: four background gradients on the root draw the 40px and 200px rulings, so the grid is continuous behind every section. Content is held to a 76rem column with a 1.5rem side gutter (1rem below 860px). Sections breathe vertically on clamp(3.75rem, 6.5vw, 6rem), with clamp(2.25rem, 4vw, 3.5rem) between a section's headline and its parts, and a 1.5rem gap between parts.

The hero is a pinned, scroll-scrubbed scene 420vh tall (340vh below 900px). On desktop it is a two-column bench: a notes column of minmax(19rem, 33rem) on the left (headline, one supporting line, the URL field and yellow button) and the screen on the right, set at -1.4deg, with ruler numerals across the top and down the left edge. Below 900px the notes stack above the bench, the top ruler hides and the side ruler narrows to 1.6rem. The left ruler's tick strip continues down the page edge below the hero.

Below the hero, parts are arranged on asymmetric grids: 5fr/6fr and 6fr/5fr pairs, a 12-column bento (7 + 5), a 5fr/7fr FAQ with a sticky heading, and a three-up team row capped at 64rem. The process steps stack as sticky cards, each parking 1.5rem lower than the last so they pile like paper. Below 860px every multi-column part collapses to one column and sticky behaviour is dropped.

**The Printed Edge Rule.** The grid and ruler are the mat's own print, not decoration laid over it: they run behind every section at the same 40/200px pitch, and nothing aligns against them by accident. Parts break the grid freely, the way objects lie on a mat.

## Elevation & Depth

Depth is physical. Parts lie on the mat and cast object shadows tinted with the mat's own green-black (rgba 4 22 14): a tight contact shadow plus a long throw with negative spread, so the shadow sits under the object rather than glowing around it. Inside parts, layering is tonal: inset hairlines (Line, Chalk Line) separate regions, and no inner element gets its own drop shadow except small raised faces (a selected tab, a badge, the comparison handle).

### Shadow Vocabulary
- **Flat** (`box-shadow: 0 1px 2px rgba(4, 22, 14, 0.32), 0 10px 22px -14px rgba(4, 22, 14, 0.55)`): every part at rest, the primary button, signs, FAQ items, the URL field.
- **Lifted** (`box-shadow: 0 1px 2px rgba(4, 22, 14, 0.38), 0 22px 40px -20px rgba(4, 22, 14, 0.7)`): something picked up or floating: the nav island, the request form, an open FAQ item, a hovered button, the dark band.
- **Held** (`box-shadow: 0 2px 4px rgba(4, 22, 14, 0.4), 0 36px 60px -26px rgba(4, 22, 14, 0.8)`): defined as the third level; no element wears it yet. The hero's parts in mid-air use their own value of the same family (`0 1px 2px rgba(4, 22, 14, 0.45), 0 16px 30px -12px rgba(4, 22, 14, 0.7)`), arriving as the part is picked up and leaving once it is seated.

### Named Rules
**The Object Shadow Rule.** A shadow is cast by a part onto the mat, so it is green-black and offset downward with negative spread. No neutral grey or blue-black shadows on the mat, no glows, no backdrop blur: the nav island is near-opaque mat green, not glass.

**The Picked-Up Rule.** Parts are flat at rest. Elevation rises only in response to state (hover, open, held in the hero), and a pressed button goes flatter than rest.

## Shapes

Gently rounded rectangles throughout, with radius growing with the size of the object: 0.3rem for badges and flags, 0.55rem for buttons and inputs, 0.6rem for small parts and signs, 0.8rem for the nav island, FAQ items and the form, 0.9rem for cards and the product housing, 1rem for sheets and comparison frames, 1.2rem for the inset dark band. Pills (999px) are reserved for chips and verdict tags; circles for sticker dots, step numbers and icon discs. Borders are drawn as inset box-shadow hairlines, never as CSS borders, so they do not shift layout. The trailing arrow in a button lives in its own square disc (0.38rem) that is the part that moves.

## Components

### Buttons
A label strip lying on the mat: yellow, compact, with its arrow in a dark disc.
- **Shape:** gently rounded (0.55rem), 3.1rem tall, padded 1.25rem left and 0.4rem right so the 2.3rem icon disc sits flush.
- **Primary:** Sticker Yellow with Sticker Ink text at 620 weight, Flat shadow plus an inset 1px amber edge and a 2px inner bottom lip. The icon disc is Sticker Ink with a yellow hairline arrow.
- **Hover / Focus:** rises 1px to the Lifted shadow and the arrow disc nudges 2px right (160ms, ease-out-expo `cubic-bezier(0.16, 1, 0.3, 1)`); press drops 1px to a near-contact shadow. Focus is a 2px yellow outline at 3px offset on the mat, Ink on paper.
- **Ghost:** transparent with a Chalk Line Strong inset outline and Chalk text on the mat; on paper parts it switches to Ink text with a Line Strong outline. Used for the second path (book a call, the real product link, the dashboard offer).
- **Light:** Paper with Ink text and the Flat shadow, for an action on an ink part.
- **Small:** 2.5rem tall, 0.8125rem text, 1.8rem disc; used in the nav island.

### Sticker dot (signature)
The yellow numbered dot the parts wear. 1.6rem circle of Sticker Yellow, Sticker Ink numeral in Martian Mono 600 at 0.75rem, a contact shadow and an amber inner lip. On the hero screen it sits off a part's corner with a 1px yellow hairline leader running to the corner it labels, and fades and scales in (260/420ms) once the part is off the board. The same dot numbers the findings and fixes lists beside the screen and the process steps (2rem).

### Parts (cards)
- **Corner Style:** 0.9rem (0.8rem below 860px).
- **Background:** Paper by default; Part Ink for code, security and kit content.
- **Shadow Strategy:** Flat at rest (see Elevation & Depth); ink parts add a 1px chalk inset edge at 7%.
- **Border:** none; internal regions divided by inset hairlines.
- **Internal Padding:** 2–2.75rem (1.6rem on phones). Figure regions sit at the top of a part with a faint vertical wash; text sits at the foot.

### Inputs / Fields
- **Style:** Paper (hero) or white (form) field, 3.1–3.2rem tall, 0.55rem radius, Line Strong inset outline; the hero field also carries the Flat shadow so it lies on the mat beside the button.
- **Focus:** the outline thickens to a 2px Mark Green inset ring; no glow.
- **Segmented choice:** 3rem options with a Line Strong outline; the checked option fills Ink with Paper text at 600.

### Navigation
A floating island, not a bar: 3.4rem tall, 0.8rem radius, near-opaque mat green (rgba 20 62 47 / 0.94) with a Chalk Line inset edge and the Lifted shadow, centred 1rem below the top. Holds the wordmark ("kyre" with a yellow full stop), section links in Chalk Dim at 0.8125rem/500 (hover: Chalk on a 8% chalk wash) and a small primary button. It slides away on scroll down and returns on scroll up (800ms spring `cubic-bezier(0.32, 0.72, 0, 1)`). Below 860px the links fold into a two-line burger that opens a full-screen mat-green menu with 2.5rem wide-cut links staggered in.

### Chips and badges
- **Judged-on chips:** Ink pills with white 0.8125rem text, naming the one number a package is judged on.
- **Badges and flags:** Sticker Yellow at 0.3rem radius with Sticker Ink text at 600, for "7 days", the sample teardown header and the inline "Concept, not client work" flag.
- **Signs:** paper slips (0.6rem radius, Flat shadow) with a Mark Green bullet, tilted -0.8deg or 1.1deg as if dropped on the mat.

### Disclosure (FAQ)
Paper part at 0.8rem radius, Flat at rest and Lifted when open. The summary is 1.25rem/580 Ink; the marker is a 2.3rem disc that turns Sticker Yellow and rotates 180deg as its plus resolves to a minus (700ms spring). The answer rises 0.7rem into place.

### Honest caption
Every illustrative figure carries a 0.75rem Faint caption under it ("Illustration, not data", "Illustrative values", "Drag to compare"), and every comparison carries its Before/After tags. Captions sit below the thing they describe, never above a heading.

## Do's and Don'ts

### Do:
- **Do** put every reading surface on a part (Paper #f6f7f2 or Part Ink #121b16) with the Flat shadow; leave the open mat for headlines, ledes and the hero notes in Chalk and Chalk Dim.
- **Do** use Sticker Yellow (#f2d24b) with Sticker Ink (#13241c) for the primary action and for numbered labels, and nowhere else.
- **Do** number parts with sticker dots and a hairline leader, and repeat the same number in the text that explains the part.
- **Do** set section headlines in Archivo 760 at wdth 70 and everything wide (hero line, titles, prices, wordmark) at wdth 104–118.
- **Do** keep Martian Mono to measuring numerals: rulers, part and step numbers, days, code, URLs.
- **Do** cast shadows in the mat's green-black (rgba 4 22 14) with negative spread, and raise elevation only on hover, open or pick-up.
- **Do** let each figure below the hero play once when revealed and settle; give every animation a reduced-motion end state.
- **Do** label every example for what it is with a Faint caption under the figure.

### Don't:
- **Don't** use the generic-AI palette (violet-to-pink gradients from #8b5cf6 to #ec4899, navy #1e2130, gradient text) on any Kyre element; it exists only inside the depicted "before" screens being torn down.
- **Don't** put Ink, Dim or Faint text directly on the mat, or Chalk text on paper.
- **Don't** use red or green for headings, surfaces or decoration; they are fail and pass marks only.
- **Don't** use glass, backdrop blur, glows or neutral grey shadows on the mat.
- **Don't** set uppercase tracked labels; labels are sentence case at 0.75rem.
- **Don't** place a label or eyebrow above a section headline; the headline speaks for itself.
- **Don't** loop motion below the hero.
