/* node scripts/probe.mts <route> <p> '<js expression>' [WxH] — evaluate in the page after scrolling. */
import { chromium } from "playwright";
const [route = "/", p = "0", expr = "1", size = "1440x900"] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width, height } });
page.on("console", (m) => m.type() === "error" && console.log("[console.error]", m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(`${process.env.CAPTURE_BASE ?? "http://localhost:3300"}${route}`, { waitUntil: "networkidle" });
await page.evaluate((p) => {
  const reel = document.querySelector<HTMLElement>("[data-reel]");
  const y = reel ? reel.offsetTop + (reel.offsetHeight - innerHeight) * p : (document.documentElement.scrollHeight - innerHeight) * p;
  scrollTo(0, y);
}, Number(p));
await page.waitForTimeout(Number(process.env.SETTLE ?? 3500));
console.log(JSON.stringify(await page.evaluate(expr), null, 1));
await browser.close();
