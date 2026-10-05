// tools/batch-covers-2026-10-06.mjs: batch driver for O-043, O-045, O-046.
// Drives the existing template tool only: new (stamp) then build (gen + render).
// Each job stamps designs/<order>/ from covers/app-window + clean-professional,
// then builds it. Build writes out.png (1280x720) + out-630x500.png; we copy
// them to cover-1280x720.png + cover-630x500.png so both names exist.
// The loop runs it: node tools/batch-covers-2026-10-06.mjs
import { copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { newOrder, buildOrder } from "./template.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = "covers/app-window";
const PALETTE = "clean-professional";

const JOBS = [
  {
    order: "O-043",
    slots: {
      TITLE: "AEO GEO Audit",
      LISTING: "C:/Users/me/Desktop/autonomous-factory/products/services/aeo-geo-audit/listing/gumroad.md",
      TO_BEAT: "C:/Users/me/Desktop/autonomous-factory/products/services/aeo-geo-audit/preview/cover-1280x720.png",
    },
  },
  {
    order: "O-045",
    slots: {
      TITLE: "Content Engine Service",
      LISTING: "C:/Users/me/Desktop/autonomous-factory/products/services/content-engine-service/listing/gumroad.md",
      TO_BEAT: "C:/Users/me/Desktop/autonomous-factory/products/services/content-engine-service/preview/cover-1280x720.png",
    },
  },
  {
    order: "O-046",
    slots: {
      TITLE: "Forge engine2040 Launch System",
      LISTING: "C:/Users/me/Desktop/autonomous-factory/products/services/forge-engine2040-launch-system/listing/gumroad.md",
      TO_BEAT: "C:/Users/me/Desktop/autonomous-factory/products/services/forge-engine2040-launch-system/preview/cover-1280x720.png",
    },
  },
];

export function runBatch({ only } = {}) {
  const results = [];
  for (const job of JOBS) {
    if (only && job.order !== only) continue;
    const dir = join(ROOT, "designs", job.order);
    if (!existsSync(dir)) {
      const st = newOrder(job.order, { template: TEMPLATE, palette: PALETTE, slots: job.slots });
      console.log(`NEW ${job.order}: ${st.ref} + ${st.palette} -> designs/${job.order}`);
    } else {
      console.log(`SKIP new ${job.order}: designs/${job.order} exists`);
    }
    const r = buildOrder(job.order);
    const wide = join(dir, "out.png");
    const card = join(dir, "out-630x500.png");
    if (existsSync(wide)) copyFileSync(wide, join(dir, "cover-1280x720.png"));
    if (existsSync(card)) copyFileSync(card, join(dir, "cover-630x500.png"));
    console.log(`BUILD ${job.order}: designs/${job.order}/cover-1280x720.png + cover-630x500.png`);
    results.push({ order: job.order, pass: r.pass });
  }
  return results;
}

const isMain = (() => { try { return fileURLToPath(import.meta.url) === process.argv[1]; } catch { return false; } })();
if (isMain) {
  const i = process.argv.indexOf("--only");
  const only = i >= 0 ? process.argv[i + 1] : undefined;
  const results = runBatch({ only });
  const fail = results.filter((r) => !r.pass);
  if (fail.length) console.log(`BATCH FAIL: ${fail.map((r) => r.order).join(" ")}`);
  else console.log(`BATCH PASS: ${results.map((r) => r.order).join(" ")}`);
  process.exit(fail.length ? 1 : 0);
}
