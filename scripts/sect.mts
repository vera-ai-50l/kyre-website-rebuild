/* node --experimental-strip-types scripts/sect.mts <route> <outDir> "<sel>|<sel>" [WxH] [offset]
   Scrolls each selector to the top of the viewport (minus offset), waits for
   reveals to land, and screenshots the viewport. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const [route = "/", out = "shots", sels = "main", size = "1440x900", off = "0"] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3300";

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 768, isMobile: width < 768 });
page.on("console", (m) => m.type() === "error" && console.log("[console.error]", m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

let i = 0;
for (const sel of sels.split("|")) {
  const [s, extra = "0"] = sel.split("@");
  const ok = await page.evaluate(([s, o]) => {
    const el = document.querySelector<HTMLElement>(s);
    if (!el) return false;
    scrollTo(0, el.getBoundingClientRect().top + scrollY - Number(o));
    return true;
  }, [s, String(Number(off) - Number(extra))]);
  if (!ok) { console.log("missing", s); continue; }
  await page.waitForTimeout(Number(process.env.SETTLE ?? 1800));
  const name = `${out}/s${i++}.png`;
  await page.screenshot({ path: name });
  console.log(name, s);
}
await browser.close();
