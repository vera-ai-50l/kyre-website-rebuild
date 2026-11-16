/* npm run capture:reel
   ---------------------------------------------------------------------------
   Photographs the hero's console in its "before" state, twice, into
   public/reel/. Those two pictures are what the WebGL pane in the hero wears
   (components/shatter/plates.ts), so the screen that breaks is by construction
   the screen the rebuilt one came from.

   Needs the dev server running. Re-run it whenever RUNS or the console's
   layout changes, and if the printed sizes differ from plates.ts, update
   plates.ts and the --ar / --cap pair in reel.module.css to match. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3300";
const OUT = "public/reel";
/* Just short of the mark that flips the console to "after" (0.87), and past
   the end of its rise (0.84) so it is square to the lens. */
const AT = 0.855;

/* `capture-reel.mts studio` photographs the new home page's pane (components/studio);
   the default is the first version's, which now lives at /v1. */
const STUDIO = process.argv[2] === "studio";
const PATH = STUDIO ? "/" : "/v1";
const SHOTS = [
  { name: STUDIO ? "studio-wide" : "before-wide", width: 1440, height: 900, scale: 2 },
  { name: STUDIO ? "studio-narrow" : "before-narrow", width: 430, height: 932, scale: 3 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const s of SHOTS) {
  const page = await browser.newPage({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: s.scale,
  });
  await page.goto(BASE + PATH, { waitUntil: "networkidle" });
  await page.evaluate((at) => {
    document.documentElement.dataset.capture = "";
    document.querySelector("header")?.remove();
    document.querySelector("nextjs-portal")?.remove();
    const reel = document.querySelector<HTMLElement>("[data-reel]")!;
    scrollTo(0, reel.offsetTop + (reel.offsetHeight - innerHeight) * at);
  }, AT);
  /* The scroll is eased and the fonts are late; a capture at one second is a
     capture of something still arriving. */
  await page.waitForTimeout(2500);
  const glass = page.locator('[data-shot="glass"]');
  if ((await glass.getAttribute("data-side")) !== "before") throw new Error("console is not in its before state");
  const box = (await glass.boundingBox())!;
  await glass.screenshot({ path: `${OUT}/${s.name}.png` });
  console.log(`${s.name}: ${Math.round(box.width * s.scale)}x${Math.round(box.height * s.scale)}  css ${box.width.toFixed(1)}x${box.height.toFixed(1)}  ar ${(box.width / box.height).toFixed(4)}`);
  await page.close();
}
await browser.close();
