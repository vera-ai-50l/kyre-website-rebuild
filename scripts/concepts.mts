/* node --experimental-strip-types scripts/concepts.mts <outDir> [WxH] [glow,signal,blind]
   Drives each hero on /concepts through its interaction and screenshots the
   states, so a change can be checked without opening a browser. */
import { chromium, type Page } from "playwright";
import { mkdir } from "node:fs/promises";

const [out = "shots", size = "1440x900", only = "glow,signal,blind"] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3300";
const mobile = width < 768;

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile });

const open = async (id: string) => {
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && console.log(`[${id} console.error]`, m.text()));
  page.on("pageerror", (e) => console.log(`[${id} pageerror]`, e.message));
  await page.goto(`${BASE}/concepts#${id}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  return page;
};
const shot = async (page: Page, name: string, full = false) => {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  console.log(name);
};
const tab = (page: Page, name: string) => page.getByRole("tab", { name, exact: true }).click();
const offer = async (page: Page, name: string) => {
  await page.evaluate(() => document.querySelector("#offer")!.scrollIntoView());
  await page.waitForTimeout(1800);
  await shot(page, name);
};

if (only.includes("glow")) {
  const page = await open("glow");
  await shot(page, "glow-0-rest");
  if (mobile) {
    await page.getByRole("button", { name: /hold|glow|see/i }).last().click();
    await page.waitForTimeout(700);
    await shot(page, "glow-1-mid");
    await page.waitForTimeout(1400);
    await shot(page, "glow-2-done");
    await shot(page, "glow-full", true);
  } else {
    await page.mouse.move(width * 0.72, height * 0.5, { steps: 8 });
    await page.waitForTimeout(500);
    await shot(page, "glow-0b-hover");
    await page.mouse.down();
    await page.waitForTimeout(620);
    await shot(page, "glow-1-mid");
    await page.waitForTimeout(1100);
    await page.mouse.up();
    await page.waitForTimeout(500);
    await shot(page, "glow-2-done");
  }
  await offer(page, "glow-3-offer");
  await page.close();
}

if (only.includes("signal")) {
  const page = await open("signal");
  await page.waitForTimeout(1200);
  await shot(page, "signal-0-rows");
  await tab(page, "Ranked");
  await page.waitForTimeout(1100);
  await shot(page, "signal-1-flight");
  await page.waitForTimeout(2400);
  await shot(page, "signal-2-ranked");
  await tab(page, "Decided");
  await page.waitForTimeout(3400);
  await shot(page, "signal-3-decided");
  if (mobile) await shot(page, "signal-full", true);
  await offer(page, "signal-4-offer");
  await page.close();
}

if (only.includes("blind")) {
  const page = await open("blind");
  await tab(page, "As designed");
  await page.waitForTimeout(900);
  await shot(page, "blind-0-see");
  for (const [i, label] of ["Low vision", "Colour-blind", "Keyboard only", "Screen reader"].entries()) {
    await tab(page, "Your store today");
    await tab(page, label);
    await page.waitForTimeout(label === "Screen reader" ? 4200 : 2100);
    await shot(page, `blind-${i + 1}a`);
    await tab(page, "After the fix");
    await page.waitForTimeout(label === "Screen reader" ? 3800 : 1500);
    await shot(page, `blind-${i + 1}b`);
  }
  await tab(page, "As designed");
  await page.waitForTimeout(900);
  await shot(page, "blind-5-fixed");
  if (mobile) await shot(page, "blind-full", true);
  await offer(page, "blind-6-offer");
  await page.close();
}

await browser.close();
