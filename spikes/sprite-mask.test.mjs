// spikes/sprite-mask.test.mjs: spike proof for the mask sprite generator.
// node --test spikes/sprite-mask.test.mjs. Writes one fixture PNG to the OS
// temp dir (generated, not committed) and asserts its PNG signature.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { genMask, variants8, toPNG, PALETTES } from "./sprite-mask.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const row = (g, y) => g.cells.slice(y * g.w, (y + 1) * g.w);

describe("mask generator", () => {
  it("same seed gives the same mask (deterministic)", () => {
    assert.deepEqual(genMask(7).cells, genMask(7).cells);
    assert.notDeepEqual(genMask(7).cells, genMask(8).cells);
  });

  it("every row mirrors left-right (symmetric sprite)", () => {
    const g = genMask(7, 8, 8);
    for (let y = 0; y < g.h; y++) {
      const r = row(g, y);
      assert.deepEqual(r, [...r].reverse(), `row ${y} not mirrored`);
    }
  });

  it("all cells are valid palette indexes 0-3", () => {
    for (const seed of [1, 7, 42]) {
      for (const v of genMask(seed).cells) assert.ok(v >= 0 && v <= 3, `bad cell ${v}`);
    }
    assert.ok(Object.keys(PALETTES).length >= 2, "need 2+ palettes");
  });
});

describe("8-direction variants", () => {
  it("variant 0 is the original; all 8 keep square size", () => {
    const g = genMask(7);
    const vs = variants8(g);
    assert.equal(vs.length, 8);
    assert.deepEqual(vs[0].cells, g.cells);
    for (const v of vs) assert.equal(v.w, v.h, "variant lost square size");
  });

  it("rotating 4 times returns to the original", () => {
    const g = genMask(7);
    const vs = variants8(g);
    assert.deepEqual(variants8(vs[1])[1].cells, vs[2].cells);
  });
});

describe("fixture PNG", () => {
  it("writes a valid PNG fixture to the temp dir", () => {
    const file = join(tmpdir(), "ds-sprite-fixture.png");
    writeFileSync(file, toPNG(variants8(genMask(7))[0]));
    const buf = readFileSync(file);
    assert.ok(buf.subarray(0, 8).equals(pngSig), "no PNG signature");
    assert.ok(buf.length > 100, `fixture too small (${buf.length}B)`);
    console.log(`fixture: ${file} ${buf.length}B`);
  });

  it("CLI renders --seed/--variant to --out", () => {
    const file = join(tmpdir(), "ds-sprite-cli.png");
    const r = spawnSync(process.execPath, ["spikes/sprite-mask.mjs", "--seed", "7", "--variant", "3", "--out", file], { cwd: ROOT, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(existsSync(file) && readFileSync(file).subarray(0, 8).equals(pngSig));
  });
});
