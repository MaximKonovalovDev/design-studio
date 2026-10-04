// tests/ui-pack.test.mjs: the pixel UI pack of order O-023 (tools/ui-pack.mjs).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAll, buildFont, buildPieces, packAtlas, composeScreen, encodePng, GLYPH_ROWS, LAYOUT, ICONS } from "../tools/ui-pack.mjs";

describe("bitmap font", () => {
  it("has all 95 printable ASCII glyphs, each 5 columns x 7 rows of # and .", () => {
    for (let cp = 32; cp <= 126; cp++) {
      const rows = GLYPH_ROWS[String.fromCharCode(cp)];
      assert.ok(rows, `glyph ${cp}`);
      assert.equal(rows.length, 7);
      for (const r of rows) assert.match(r, /^[#.]{5}$/);
    }
  });
  it("lights pixels only inside each 6x8 cell of a 96x48 atlas, and the space stays empty", () => {
    const { img, json } = buildFont();
    assert.deepEqual([img.w, img.h], [96, 48]);
    assert.equal(json.firstCodepoint, 32);
    for (let i = 0; i < 95; i++) {
      const ox = (i % 16) * 6; const oy = Math.floor(i / 16) * 8; let lit = 0;
      for (let y = 0; y < 8; y++) for (let x = 0; x < 6; x++) { const a = img.get(ox + x, oy + y)[3]; if (a) { lit += 1; assert.ok(x < 5 && y < 7, `glyph ${i} writes the spacing column or row`); } }
      assert.equal(lit > 0, i !== 0, `glyph ${i} lit pixels ${lit}`);
    }
  });
});

describe("atlas", () => {
  const pieces = buildPieces();
  const { img, json } = packAtlas(pieces);
  it("packs every piece once, inside the image, without overlap", () => {
    assert.equal(new Set(json.pieces.map((p) => p.id)).size, pieces.length);
    const used = new Set();
    for (const p of json.pieces) {
      assert.ok(p.x >= 1 && p.y >= 1 && p.x + p.w + 1 <= img.w && p.y + p.h + 1 <= img.h, p.id);
      for (let y = p.y - 1; y <= p.y + p.h; y++) for (let x = p.x - 1; x <= p.x + p.w; x++) {
        const inside = x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h;
        const key = `${x},${y}`;
        if (inside) { assert.ok(!used.has(key), `overlap at ${p.id} ${key}`); used.add(key); }
      }
    }
  });
  it("keeps 9-slice borders smaller than the piece and ships every icon", () => {
    for (const p of json.pieces.filter((q) => q.slice)) { assert.ok(p.slice[0] + p.slice[2] < p.w && p.slice[1] + p.slice[3] < p.h, p.id); }
    for (const n of ICONS) assert.ok(json.pieces.some((p) => p.id === `icon-${n}` && p.w === 16 && p.h === 16), n);
  });
  it("encodes a PNG that starts with the PNG signature and whose IHDR matches", () => {
    const b = encodePng(img);
    assert.equal(b.subarray(1, 4).toString(), "PNG");
    assert.equal(b.readUInt32BE(16), img.w);
    assert.equal(b.readUInt32BE(20), img.h);
  });
});

describe("layout", () => {
  const r = buildAll();
  it("resolves every piece, group and color it names, and composes both screens at the reference size", () => {
    for (const name of Object.keys(LAYOUT.screens)) {
      const s = composeScreen(LAYOUT, name, r.atlas, r.atlasJson, r.font);
      assert.deepEqual([s.w, s.h], [LAYOUT.reference.w, LAYOUT.reference.h]);
    }
  });
  it("makes 1280x720 previews by an integer upscale", () => {
    assert.deepEqual([r.previews.hud.w, r.previews.hud.h], [1280, 720]);
    assert.deepEqual([r.previews.menu.w, r.previews.menu.h], [1280, 720]);
  });
  it("fails closed on an unknown piece", () => {
    const bad = { ...LAYOUT, screens: { hud: [{ id: "x", kind: "icon", anchor: "top-left", x: 0, y: 0, piece: "icon-nope", tint: "ink" }] } };
    assert.throws(() => composeScreen(bad, "hud", r.atlas, r.atlasJson, r.font), /not in the atlas/);
  });
});
