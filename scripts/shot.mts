/* node --experimental-strip-types scripts/shot.mts <route> <outDir> [p,p,p] [WxH]
   Screenshots a route at a list of scroll positions. `p` is a fraction of the
   first pinned reel's runway when one exists, otherwise of the whole document.
   Prints console errors, because a WebGL scene fails silently otherwise. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const [route = "/", out = "shots", ps = "0", size = "1440x900"] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3300";

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
page.on("console", (m) => m.type() === "error" && console.log("[console.error]", m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

for (const raw of ps.split(",")) {
  const p = Number(raw);
  await page.evaluate((p) => {
    const reel = document.querySelector<HTMLElement>("[data-reel], section[class*=reel]");
    const y = reel
      ? reel.offsetTop + (reel.offsetHeight - innerHeight) * p
      : (document.documentElement.scrollHeight - innerHeight) * p;
    scrollTo(0, y);
  }, p);
  await page.waitForTimeout(Number(process.env.SETTLE ?? 900));
  const name = `${out}/${route.replace(/\W+/g, "_") || "home"}-${raw.replace(".", "_")}.png`;
  await page.screenshot({ path: name });
  console.log(name);
}
await browser.close();
