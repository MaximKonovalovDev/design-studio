// tools/png.mjs: the one PNG codec for design-studio (S239 fold of the 7 PNG helpers).
// Node zlib only: no npm package, no network, no browser.
//
// Writers: chunk(type, data), encodePng(w, h, rgba) (8-bit RGBA, filter 0, zlib).
// Readers: pngDims(buf) (IHDR size only), decodePng(buf) (-> RGBA, colour types
//   0/2/6), decodePngPixels(buf) (-> raw channel bytes, colour types 0/2/3/4/6).
//   parsePngDims (tools/assets.mjs) and the render.mjs pngDims export delegate here.
// Fail-closed: 8-bit, non-interlaced only. Anything else throws, never guesses pixels.
import { crc32, deflateSync, inflateSync } from "node:zlib";

export const PNG_MAGIC = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td) >>> 0);
  return Buffer.concat([len, td, crc]);
}

// rgba: Uint8Array or Buffer of w*h*4 bytes. Returns a complete PNG file.
export function encodePng(w, h, rgba) {
  const src = Buffer.from(rgba.buffer, rgba.byteOffset, w * h * 4);
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    src.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    PNG_MAGIC,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// PNG: 8-byte magic, then IHDR with width/height as big-endian uint32 at 16/20.
export function pngDims(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 24 || !buf.subarray(0, 8).equals(PNG_MAGIC)) {
    throw new Error("not a PNG file");
  }
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

// Walks the chunks: IHDR fields + the IDAT payloads. Strict on the header bytes
// every reader needs (compression and filter method 0, no interlace, 8-bit).
function readPngChunks(b, channelsByType) {
  let pos = 8;
  let w = 0;
  let h = 0;
  let bitDepth = 0;
  let colorType = -1;
  let interlace = 0;
  let compression = 0;
  let filter = 0;
  const idat = [];
  while (pos + 8 <= b.length) {
    const len = b.readUInt32BE(pos);
    const type = b.toString("ascii", pos + 4, pos + 8);
    const data = b.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      compression = data[10];
      filter = data[11];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    pos += 12 + len;
  }
  if (!w || !h) throw new Error("PNG has no IHDR");
  if (compression !== 0 || filter !== 0 || interlace !== 0) throw new Error("unsupported PNG (interlaced or filtered at IHDR)");
  if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth} (want 8)`);
  const channels = channelsByType[colorType];
  if (!channels) throw new Error(`unsupported color type ${colorType}`);
  return { w, h, channels, raw: inflateSync(Buffer.concat(idat)) };
}

// Undoes the per-row filters (0 none, 1 sub, 2 up, 3 average, 4 paeth).
function unfilter(raw, w, h, bpp) {
  const stride = w * bpp;
  if (raw.length !== h * (stride + 1)) throw new Error(`unexpected IDAT length ${raw.length} for ${w}x${h}`);
  const out = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    if (f > 4) throw new Error(`bad filter byte ${f} on row ${y}`);
    const cur = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const row = out.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? row[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let pr = 0;
      if (f === 1) pr = a;
      else if (f === 2) pr = b;
      else if (f === 3) pr = (a + b) >> 1;
      else if (f === 4) pr = paeth(a, b, c);
      row[i] = (cur[i] + pr) & 255;
    }
    prev = row;
  }
  return out;
}

// Decodes an 8-bit non-interlaced PNG (gray, RGB, RGBA) to { w, h, data RGBA }.
export function decodePng(buf) {
  const b = Buffer.from(buf);
  if (b.length < 33 || !b.subarray(0, 8).equals(PNG_MAGIC)) {
    throw new Error("not a PNG (bad signature)");
  }
  const { w, h, channels: ch, raw } = readPngChunks(b, { 0: 1, 2: 3, 6: 4 });
  const bytes = unfilter(raw, w, h, ch);
  const out = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const s = i * ch;
    const o = i * 4;
    if (ch === 4) {
      out[o] = bytes[s];
      out[o + 1] = bytes[s + 1];
      out[o + 2] = bytes[s + 2];
      out[o + 3] = bytes[s + 3];
    } else if (ch === 3) {
      out[o] = bytes[s];
      out[o + 1] = bytes[s + 1];
      out[o + 2] = bytes[s + 2];
      out[o + 3] = 255;
    } else {
      out[o] = out[o + 1] = out[o + 2] = bytes[s];
      out[o + 3] = 255;
    }
  }
  return { w, h, data: out };
}

// Decodes a PNG to its raw channel bytes (no RGBA expansion): { w, h, data }.
// Palette (type 3) is read as one byte per pixel, as the audit has always done.
export function decodePngPixels(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 24 || !buf.subarray(0, 8).equals(PNG_MAGIC)) throw new Error("not a PNG file");
  const { w, h, channels, raw } = readPngChunks(buf, { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 });
  return { w, h, data: unfilter(raw, w, h, channels) };
}
