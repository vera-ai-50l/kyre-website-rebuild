/* npm run capture
   ---------------------------------------------------------------------------
   Screenshots every route at 1600x900 into reference/rebuild/.

   The five-second settle is the point. Every "fixed" claim before this script
   existed was made from a DOM measurement or a mid-render capture, which is how
   a chart that is correct at rest and broken-looking for six seconds got signed
   off twice. A screenshot at one second is not evidence.

   Also asserts determinism: each route is captured twice and the two buffers
   must be byte-identical, which catches a fixture that randomises per load. */

import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const ROUTES: [name: string, route: string][] = [
  ["home", "/agnost/console"],
  ["users", "/agnost/console/users"],
  ["users-selected", "/agnost/console/users?user=luis%40reelpilot.studio"],
  ["intents", "/agnost/console/intents"],
  ["intent-detail", "/agnost/console/intents/burned-in-captions"],
  ["violations", "/agnost/console/violations"],
  ["events", "/agnost/console/events"],
  ["tools", "/agnost/console/tools"],
  ["alerts", "/agnost/console/alerts"],
  ["improve", "/agnost/console/improve"],
  ["marketing", "/agnost"],
];

const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";
const SETTLE_MS = 5000;
const OUT = "reference/rebuild";

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const routes = only.length ? ROUTES.filter(([n]) => only.includes(n)) : ROUTES;
const checkDeterminism = !process.argv.includes("--no-determinism");

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
});

const shoot = async (route: string) => {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(SETTLE_MS);
  return page.screenshot({ fullPage: true });
};

const digest = (b: Buffer) => createHash("sha256").update(b).digest("hex").slice(0, 12);

let drift = 0;
let failed = 0;

for (const [name, route] of routes) {
  try {
    const first = await shoot(route);
    await writeFile(`${OUT}/${name}.png`, first);

    let note = "";
    if (checkDeterminism) {
      const second = await shoot(route);
      const same = first.equals(second);
      if (!same) {
        drift++;
        note = `  \x1b[31mNON-DETERMINISTIC\x1b[0m (${digest(first)} vs ${digest(second)})`;
      }
    }
    const kb = Math.round(first.length / 1024);
    console.log(
      `  ${drift && note ? "\x1b[31mDRIFT\x1b[0m" : "\x1b[32m ok  \x1b[0m"} ${name.padEnd(16)} ${String(kb).padStart(4)}kb  ${digest(first)}${note}`,
    );
  } catch (e) {
    failed++;
    console.log(`  \x1b[31mFAIL \x1b[0m ${name.padEnd(16)} ${(e as Error).message.split("\n")[0]}`);
  }
}

await browser.close();

console.log(
  `\n${routes.length - failed}/${routes.length} captured into ${OUT}/` +
    (drift ? `\n\x1b[31m${drift} route(s) differ between identical loads.\x1b[0m` : "") +
    (checkDeterminism && !drift && !failed ? "\n\x1b[32mAll routes byte-identical across two loads.\x1b[0m" : "") +
    "\n",
);
process.exit(failed || drift ? 1 : 0);
