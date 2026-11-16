/* node --experimental-strip-types scripts/capture-work.mts
   The two screenshots of the Agnost rebuild that the home page's featured card
   stacks. Real captures of the real routes, so the card cannot show a screen
   that does not exist. Needs the dev server running. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3300";
await mkdir("public/work", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 936 }, deviceScaleFactor: 1.5 });
for (const [name, route] of [
  ["agnost-console", "/agnost/console"],
  ["agnost-events", "/agnost/console/events"],
]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelector("nextjs-portal")?.remove());
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `public/work/${name}.jpg`, type: "jpeg", quality: 82 });
  console.log(name);
}
await browser.close();
