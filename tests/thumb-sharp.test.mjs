// tests/thumb-sharp.test.mjs: DS-80 S60 Edge-free thumb path (sharp first, Edge fallback).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { THUMB_W, thumbSize, resolveSourcePng, thumbAuto } from "../tools/thumb.mjs";
import { sharpAvailable, sharpThumb, SHARP_VERSION, SHARP_LICENSE } from "../tools/sharp.mjs";
import { pngDims } from "../tools/render.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRequire = createRequire(join(ROOT, "package.json"));

describe("thumb-sharp pin (Apache-2.0, in-repo only)", () => {
  it("pins the exact sharp version (no ^, no machine-wide install)", () => {
    const pkg = repoRequire("./package.json");
    assert.equal(pkg.dependencies.sharp, SHARP_VERSION);
    assert.match(pkg.dependencies.sharp, /^\d+\.\d+\.\d+$/);
    assert.equal(SHARP_LICENSE, "Apache-2.0");
  });

  it("ships the sharp LICENSE text in-repo", () => {
    const lic = join(ROOT, "node_modules", "sharp", "LICENSE");
    assert.ok(existsSync(lic), "node_modules/sharp/LICENSE exists after in-repo npm install");
    assert.match(readFileSync(lic, "utf8"), /Apache License/);
    const vendored = join(ROOT, "designs", "job", "thumbs", "SHARP-LICENSE.txt");
    assert.ok(existsSync(vendored), "attribution copy lives in git at designs/job/thumbs/");
  });

  it("sharp loads (Edge-free path is armed)", async () => {
    assert.ok(await sharpAvailable(), "sharp must load from in-repo node_modules");
  });
});

describe("sharpThumb downscale", () => {
  it("downscales O-001 out.png to 256px wide, aspect kept, above blank floor", async () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-ts-`);
    const out = join(dir, "thumb-256.png");
    const r = await sharpThumb(join(ROOT, "designs", "O-001", "out.png"), out);
    assert.equal(r.method, "sharp");
    assert.deepEqual({ w: r.w, h: r.h }, thumbSize(1280, 720));
    assert.equal(r.w, THUMB_W);
    assert.ok(r.bytes >= 1024, `above blank floor: ${r.bytes}B`);
    assert.deepEqual(pngDims(readFileSync(out)), { w: 256, h: 144 });
  });

  it("fails closed on a missing source (never writes a blank thumb)", async () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-ts-`);
    const out = join(dir, "nope.png");
    await assert.rejects(sharpThumb(join(dir, "missing.png"), out), /missing|SKIP|blank/);
    assert.ok(!existsSync(out), "no output file left behind");
  });

  it("fails closed on a non-PNG source", async () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-ts-`);
    const src = join(dir, "src.png");
    writeFileSync(src, "not an image");
    await assert.rejects(sharpThumb(src, join(dir, "t.png")), /not a PNG/);
    assert.ok(!existsSync(join(dir, "t.png")));
  });
});

describe("thumbAuto routing (sharp first, Edge fallback)", () => {
  it("finds out.png next to the O-001 brief", () => {
    const briefPath = join(ROOT, "designs", "O-001", "brief.json");
    const brief = JSON.parse(readFileSync(briefPath, "utf8"));
    assert.equal(resolveSourcePng(briefPath, brief), join(ROOT, "designs", "O-001", "out.png"));
  });

  it("returns null when no render sits next to the brief", () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-ts-`);
    const briefPath = join(dir, "brief.json");
    writeFileSync(briefPath, JSON.stringify({ size: { w: 1280, h: 720 } }));
    assert.equal(resolveSourcePng(briefPath, { image: "out.png" }), null);
  });

  it("prefers sharp when out.png exists (no browser launched)", async () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-ts-`);
    const briefPath = join(dir, "brief.json");
    writeFileSync(briefPath, JSON.stringify({ size: { w: 1280, h: 720 }, image: "out.png" }));
    writeFileSync(join(dir, "out.png"), readFileSync(join(ROOT, "designs", "O-001", "out.png")));
    const r = await thumbAuto(briefPath);
    assert.equal(r.method, "sharp");
    assert.deepEqual({ w: r.w, h: r.h }, { w: 256, h: 144 });
  });

  it("--sharp with no source fails closed (never falls back silently)", async () => {
    const dir = mkdtempSync(`${tmpdir()}${sep}ds-ts-`);
    const briefPath = join(dir, "brief.json");
    writeFileSync(briefPath, JSON.stringify({ size: { w: 1280, h: 720 }, image: "out.png" }));
    await assert.rejects(thumbAuto(briefPath, null, { sharp: true }), /missing.*SKIP|SKIP|blank/);
    assert.ok(!existsSync(join(dir, "thumb-256.png")));
  });

  it("rejects --sharp with --edge together", async () => {
    const briefPath = join(ROOT, "designs", "O-001", "brief.json");
    await assert.rejects(thumbAuto(briefPath, null, { sharp: true, edge: true }), /never both/);
  });
});

describe("sharp vs Edge parity (O-001 proof pixels)", () => {
  it("matches the Edge thumb's dims with a small pixel diff and the same verdict", async () => {
    const sharpPath = join(ROOT, "designs", "job", "thumbs", "thumb-256.png");
    const edgePath = join(ROOT, "designs", "O-001", "thumb-256.png");
    assert.ok(existsSync(sharpPath), "proof thumb built by this packet");
    const s = pngDims(readFileSync(sharpPath));
    const e = pngDims(readFileSync(edgePath));
    assert.deepEqual(s, e, "same 256px-wide, aspect-kept dims");
    assert.ok(readFileSync(sharpPath).length >= 1024, "sharp thumb clears the blank floor");
    assert.ok(readFileSync(edgePath).length >= 1024, "edge thumb clears the blank floor");
    const sharp = repoRequire("sharp");
    const norm = async (p) => sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const a = await norm(sharpPath);
    const b = await norm(edgePath);
    assert.equal(a.info.width, b.info.width);
    assert.equal(a.info.height, b.info.height);
    let sum = 0;
    for (let i = 0; i < a.data.length; i++) sum += Math.abs(a.data[i] - b.data[i]);
    const mean = sum / a.data.length;
    assert.ok(mean < 12, `small diff, same image (mean ${mean.toFixed(2)}/255)`);
  });
});
