// tests/assemble.test.mjs: O-040 plan-to-steps-to-assemble unit tests.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { assemblePlan, assembleHtml, networkRefs, loadBrandKit } from "../tools/assemble.mjs";
import { render, pngDims } from "../tools/render.mjs";

const EXAMPLE = fileURLToPath(new URL("../packs/plan-assemble-o040/plan.json", import.meta.url));

function badPlan(obj) {
  const dir = mkdtempSync(`${tmpdir()}${sep}ds-asm-t-`);
  const p = join(dir, "plan.json");
  writeFileSync(p, JSON.stringify(obj));
  return p;
}

describe("assemble", () => {
  it("bad brand-kit ref fails closed", () => {
    const p = badPlan({ plan: "bad", brandKit: "brand-kits/nope.json", size: { w: 1280, h: 720 }, steps: [{ id: "h", kind: "hero", title: "T", subtitle: "S" }] });
    assert.throws(() => assemblePlan(p), /brand-kit ref not found/);
  });

  it("assembled HTML inlines tokens and has zero network refs", () => {
    const { html, kit } = assemblePlan(EXAMPLE);
    assert.ok(html.includes(String(kit.palette.accent)), "accent hex inlined");
    assert.ok(html.includes("var(--accent)"), "var(--*) tokens used");
    assert.deepEqual(networkRefs(html), []);
    assert.ok(!html.includes("<link"), "no stylesheet link");
    assert.ok(!html.includes("<script"), "no script tag");
  });

  it("end-to-end: plan -> HTML -> PNG via render.mjs", () => {
    const { html, plan } = assemblePlan(EXAMPLE);
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-asm-e2e-`);
    const page = join(dir, "page.html");
    const out = join(dir, "out.png");
    writeFileSync(page, html, "utf8");
    const r = render(page, out, { w: plan.size.w, h: plan.size.h }, { history: false });
    assert.ok(existsSync(out), "PNG written");
    const dims = pngDims(readFileSync(out));
    assert.deepEqual({ w: dims.w, h: dims.h }, { w: plan.size.w, h: plan.size.h });
    assert.ok(r.bytes > 4096, `PNG looks rendered (${r.bytes}B)`);
  });

  it("unknown step kind and empty steps fail closed", () => {
    const kit = "../../brand-kits/engine2040-ui1.json";
    const badKind = badPlan({ plan: "bad", brandKit: kit, size: { w: 1280, h: 720 }, steps: [{ id: "x", kind: "video" }] });
    assert.throws(() => assemblePlan(badKind), /kind must be/);
    const empty = badPlan({ plan: "bad", brandKit: kit, size: { w: 1280, h: 720 }, steps: [] });
    assert.throws(() => assemblePlan(empty), /1\+ ordered steps/);
  });

  it("brand-kit fails closed on a palette-poor kit", () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-asm-k-`);
    const kp = join(dir, "kit.json");
    writeFileSync(kp, JSON.stringify({ id: "poor", palette: { paper: "#ffffff" }, type: { display: "x", body: "y" }, voice: { tone: "t", tagline: "g", cta: "c" } }));
    assert.throws(() => loadBrandKit(kp, dir), /5\+ hex palette/);
  });

  it("assembleHtml escapes step text (no tag injection)", () => {
    const { kit } = loadBrandKit("engine2040-ui1.json", dirname(fileURLToPath(new URL("../brand-kits/engine2040-ui1.json", import.meta.url))));
    const html = assembleHtml(
      { plan: "x", size: { w: 1280, h: 720 }, steps: [{ id: "h", kind: "hero", title: "<b>Hi</b>", subtitle: "S" }] },
      kit,
    );
    assert.ok(!html.includes("<b>Hi</b>"), "step text escaped");
  });
});
