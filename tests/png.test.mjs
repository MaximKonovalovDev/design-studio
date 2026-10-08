// tests/png.test.mjs: the one PNG codec (tools/png.mjs): every filter type, round trips, fail-closed reads.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { chunk, decodePng, decodePngPixels, encodePng, pngDims, PNG_MAGIC } from "../tools/png.mjs";

// Forward filter for one row of bytes, the inverse of the decoder's predictor.
function paethPred(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}
function filterRow(orig, prevOrig, bpp, f) {
  const out = Buffer.alloc(orig.length);
  for (let i = 0; i < orig.length; i++) {
    const a = i >= bpp ? orig[i - bpp] : 0;
    const b = prevOrig ? prevOrig[i] : 0;
    const c = prevOrig && i >= bpp ? prevOrig[i - bpp] : 0;
    const pred = f === 0 ? 0 : f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : paethPred(a, b, c);
    out[i] = (orig[i] - pred) & 255;
  }
  return out;
}

// Builds an 8-bit PNG from raw channel rows, one filter byte per row.
function pngFrom(w, h, colorType, bpp, rows, filters) {
  const stride = w * bpp;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    const prev = y > 0 ? rows[y - 1] : null;
    raw[y * (stride + 1)] = filters[y];
    filterRow(rows[y], prev, bpp, filters[y]).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  return Buffer.concat([PNG_MAGIC, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

describe("png codec", () => {
  it("round-trips RGBA through encodePng and decodePng", () => {
    const w = 3;
    const h = 2;
    const rgba = new Uint8Array(w * h * 4).map((_, i) => (i * 37) & 255);
    const back = decodePng(encodePng(w, h, rgba));
    assert.equal(back.w, w);
    assert.equal(back.h, h);
    assert.deepEqual(Array.from(back.data), Array.from(rgba));
    assert.deepEqual(pngDims(encodePng(w, h, rgba)), { w, h });
  });

  it("undoes every filter type (none, sub, up, average, paeth) on RGB", () => {
    const w = 4;
    const h = 5;
    const rows = Array.from({ length: h }, (_, y) => Buffer.from(Array.from({ length: w * 3 }, (_, i) => (i * 13 + y * 71 + 9) & 255)));
    const png = pngFrom(w, h, 2, 3, rows, [0, 1, 2, 3, 4]);
    const back = decodePng(png);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        assert.deepEqual(Array.from(back.data.subarray(o, o + 4)), [rows[y][x * 3], rows[y][x * 3 + 1], rows[y][x * 3 + 2], 255]);
      }
    }
    const raw = decodePngPixels(png);
    assert.deepEqual(Array.from(raw.data), Array.from(Buffer.concat(rows)));
  });

  it("expands gray to RGB and keeps alpha on RGBA", () => {
    const gray = pngFrom(2, 1, 0, 1, [Buffer.from([10, 200])], [0]);
    assert.deepEqual(Array.from(decodePng(gray).data), [10, 10, 10, 255, 200, 200, 200, 255]);
    const rgba = pngFrom(1, 1, 6, 4, [Buffer.from([1, 2, 3, 4])], [0]);
    assert.deepEqual(Array.from(decodePng(rgba).data), [1, 2, 3, 4]);
  });

  it("fails closed on a bad filter byte, a bad signature and palette input to decodePng", () => {
    const raw = deflateSync(Buffer.from([9, 1, 2, 3]));
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(1, 0);
    ihdr.writeUInt32BE(1, 4);
    ihdr[8] = 8;
    ihdr[9] = 2;
    const badFilter = Buffer.concat([PNG_MAGIC, chunk("IHDR", ihdr), chunk("IDAT", raw), chunk("IEND", Buffer.alloc(0))]);
    assert.throws(() => decodePng(badFilter), /bad filter byte 9/);
    assert.throws(() => decodePng(Buffer.from("nope")), /not a PNG/);
    const palette = Buffer.from(encodePng(1, 1, new Uint8Array([0, 0, 0, 255])));
    palette[8 + 8 + 9] = 3; // IHDR colour type byte: palette is not decoded to RGBA
    assert.throws(() => decodePng(palette), /unsupported color type 3/);
    assert.throws(() => pngDims(Buffer.from("not a png")), /not a PNG/);
  });
});
