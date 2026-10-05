// tests/convert-game.test.mjs: O-041 selective export adapter (convert/export-game.mjs).
// Pure gates run without a browser; the O-042 export test renders for real
// (1920x1080 PNG via tools/render.mjs + A4 PDF via Edge print, like the CV lane).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportGame, listGameExports, readGameDesign, SHEET_W, SHEET_H } from "../convert/export-game.mjs";
import { pngDims } from "../tools/render.mjs";
import { pdfInfo } from "../tools/pdfcheck.mjs";

const DESIGN = join("designs", "O-042");

describe("game export input", () => {
  it("reads the judged-PASS O-042 dir: 5 screens, 22 tokens, atlas on disk", () => {
    const d = readGameDesign(DESIGN);
    assert.deepEqual(d.screens, ["hud", "menu", "pause", "settings", "inventory"]);
    assert.equal(Object.keys(d.colors).length, 22);
    assert.ok(existsSync(d.atlasPng));
  });

  it("fails closed on a dir without layout.json (never a false PASS)", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-exp-t-"));
    assert.throws(() => readGameDesign(tmp), /needs layout\.json/);
  });

  it("fails closed on a dir without tokens.json", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-exp-t-"));
    mkdirSync(join(tmp, "x"), { recursive: true });
    writeFileSync(join(tmp, "layout.json"), JSON.stringify({ screens: { hud: [] } }), "utf8");
    writeFileSync(join(tmp, "atlas.png"), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
    assert.throws(() => readGameDesign(tmp), /needs tokens\.json/);
  });

  it("fails closed on a layout with no screens", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-exp-t-"));
    writeFileSync(join(tmp, "layout.json"), JSON.stringify({ screens: {} }), "utf8");
    writeFileSync(join(tmp, "tokens.json"), JSON.stringify({ colors: { bg: "#000000" } }), "utf8");
    writeFileSync(join(tmp, "atlas.png"), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
    assert.throws(() => readGameDesign(tmp), /no screens/);
  });
});

describe("game export wiring", () => {
  it("one templates/game export entry names this adapter with PNG + PDF", () => {
    const wired = listGameExports();
    const entry = wired.find((e) => e.export?.adapter === "convert/export-game.mjs");
    assert.ok(entry, "game/*/template.json wires convert/export-game.mjs");
    assert.ok(entry.export.png && entry.export.pdf, "entry names sheet PNG + PDF");
    assert.ok(existsSync(join(entry.export.adapter)), "adapter file on disk");
  });
});

describe("game export on O-042", () => {
  it("writes a 1920x1080 PNG (exact pixels) + a 1-page PDF with a real text layer", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-exp-o042-"));
    const r = exportGame(DESIGN, tmp);
    assert.equal(r.w, SHEET_W);
    assert.equal(r.h, SHEET_H);
    const dims = pngDims(readFileSync(r.png));
    assert.deepEqual([dims.w, dims.h], [1920, 1080]);
    const pdf = readFileSync(r.pdf);
    assert.equal(pdf.subarray(0, 5).toString("latin1"), "%PDF-");
    assert.ok(pdf.length >= 1500, `${pdf.length}B`);
    const info = await pdfInfo(r.pdf);
    assert.equal(info.pages, 1);
    assert.ok(info.chars >= 200, `${info.chars} chars`);
    for (const s of ["HUD", "MENU", "PAUSE", "SETTINGS", "INVENTORY"]) {
      assert.ok(info.fullText.includes(s), `PDF text names ${s}`);
    }
    assert.ok(info.fullText.includes("#ffb325"), "PDF text carries a token hex");
  });
});
