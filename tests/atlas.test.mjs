// tests/atlas.test.mjs: atlas packer unit + TEMP-dir end-to-end gates (no network).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import {
  nextPow2,
  packRects,
  parseArgs,
  runAtlas,
  verifyLayout,
} from "../tools/atlas.mjs";
import { decodePng, encodePng } from "../tools/png.mjs";

function solid(w, h, r, g, b, a = 255) {
  const d = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    d[i * 4] = r;
    d[i * 4 + 1] = g;
    d[i * 4 + 2] = b;
    d[i * 4 + 3] = a;
  }
  return d;
}

describe("atlas pack", () => {
  it("packs without overlap inside a tight bin", () => {
    const r = packRects(
      [
        { id: "hud", w: 640, h: 360 },
        { id: "menu", w: 640, h: 360 },
        { id: "avatar", w: 640, h: 360 },
      ],
      { pad: 1 },
    );
    assert.equal(r.placed.length, 3);
    assert.ok(verifyLayout(r.placed, r.w, r.h), "inside + no overlap");
    assert.ok(r.w <= 2048 && r.h <= 2048, `${r.w}x${r.h}`);
  });

  it("is deterministic whatever the input order", () => {
    const fwd = packRects(
      [
        { id: "a", w: 100, h: 20 },
        { id: "b", w: 40, h: 60 },
        { id: "c", w: 16, h: 16 },
      ],
      { pad: 2 },
    );
    const rev = packRects(
      [
        { id: "c", w: 16, h: 16 },
        { id: "b", w: 40, h: 60 },
        { id: "a", w: 100, h: 20 },
      ],
      { pad: 2 },
    );
    assert.deepEqual(fwd, rev);
  });

  it("rejects a sprite past --max instead of clipping it", () => {
    assert.throws(() => packRects([{ id: "big", w: 3000, h: 10 }], { max: 2048 }), /exceeds --max/);
  });

  it("verifyLayout catches overlaps and overflows", () => {
    assert.equal(verifyLayout([{ id: "a", x: 0, y: 0, w: 10, h: 10 }], 10, 10), true);
    assert.equal(
      verifyLayout(
        [
          { id: "a", x: 0, y: 0, w: 10, h: 10 },
          { id: "b", x: 5, y: 5, w: 10, h: 10 },
        ],
        20,
        20,
      ),
      false,
    );
    assert.equal(verifyLayout([{ id: "a", x: 8, y: 0, w: 10, h: 10 }], 10, 10), false);
  });

  it("nextPow2 rounds up", () => {
    assert.equal(nextPow2(100), 128);
    assert.equal(nextPow2(64), 64);
  });
});

describe("atlas png codec", () => {
  it("round-trips RGBA pixels byte-identical", () => {
    const d = solid(24, 12, 10, 200, 30, 128);
    const back = decodePng(encodePng(24, 12, d));
    assert.equal(back.w, 24);
    assert.equal(back.h, 12);
    assert.ok(Buffer.from(back.data).equals(Buffer.from(d)));
  });

  it("keeps a 1x1 opaque pixel exact", () => {
    const g = solid(1, 1, 77, 77, 77, 255);
    const back = decodePng(encodePng(1, 1, g));
    assert.deepEqual([...back.data], [77, 77, 77, 255]);
  });

  it("decodes RGB (color type 2) as opaque", () => {
    // Minimal hand-built 2x1 RGB PNG: our encoder writes RGBA only, so this
    // exercises the type-2 branch of decodePng directly.
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    const crc = (buf) => {
      let c = -1;
      for (const v of buf) c = table[(c ^ v) & 255] ^ (c >>> 8);
      return (c ^ -1) >>> 0;
    };
    const box = (type, data) => {
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length);
      const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
      const cc = Buffer.alloc(4);
      cc.writeUInt32BE(crc(td));
      return Buffer.concat([len, td, cc]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(2, 0);
    ihdr.writeUInt32BE(1, 4);
    ihdr[8] = 8;
    ihdr[9] = 2;
    const raw = Buffer.from([0, 255, 0, 0, 0, 0, 255]);
    const png = Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      box("IHDR", ihdr),
      box("IDAT", deflateSync(raw)),
      box("IEND", Buffer.alloc(0)),
    ]);
    const back = decodePng(png);
    assert.equal(back.w, 2);
    assert.deepEqual([...back.data], [255, 0, 0, 255, 0, 0, 255, 255]);
  });

  it("FAILs closed on non-PNG bytes", () => {
    assert.throws(() => decodePng(Buffer.from("nope")), /not a PNG/);
  });
});

describe("atlas args", () => {
  it("parses files + flags", () => {
    const r = parseArgs(["a.png", "b.png", "--out", "atlas.png", "--json", "a.json", "--pad", "2", "--max", "1024", "--pot"]);
    assert.deepEqual(r.files, ["a.png", "b.png"]);
    assert.equal(r.out, "atlas.png");
    assert.equal(r.jsonOut, "a.json");
    assert.equal(r.pad, 2);
    assert.equal(r.max, 1024);
    assert.equal(r.pot, true);
  });

  it("parses --src and equals forms", () => {
    const r = parseArgs(["--src=shots", "--out=x.png"]);
    assert.equal(r.src, "shots");
    assert.equal(r.out, "x.png");
  });
});

describe("atlas end-to-end in TEMP", () => {
  it("packs two PNGs and the JSON index matches the pixels", () => {
    const dir = mkdtempSync(join(tmpdir(), "atlas-test-"));
    writeFileSync(join(dir, "red.png"), encodePng(32, 16, solid(32, 16, 255, 0, 0)));
    writeFileSync(join(dir, "blue.png"), encodePng(16, 32, solid(16, 32, 0, 0, 255)));
    const r = runAtlas({ files: [], src: dir, out: join(dir, "atlas.png"), pad: 1 });
    assert.equal(r.sprites.length, 2);
    const back = decodePng(readFileSync(r.out));
    const idx = JSON.parse(readFileSync(r.jsonPath, "utf8"));
    assert.equal(idx.size.w, back.w);
    assert.equal(idx.size.h, back.h);
    for (const s of idx.sprites) {
      const px = [...back.data.subarray((s.y * back.w + s.x) * 4, (s.y * back.w + s.x) * 4 + 4)];
      const want = s.id === "red" ? [255, 0, 0, 255] : [0, 0, 255, 255];
      assert.deepEqual(px, want, `${s.id} top-left pixel intact`);
    }
    assert.ok(verifyLayout(idx.sprites, idx.size.w, idx.size.h));
  });
});
