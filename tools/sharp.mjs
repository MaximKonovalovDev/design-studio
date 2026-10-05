// tools/sharp.mjs: Edge-free PNG downscale for thumbnails (DS-80 S60 TOKEN-100x).
//
// The audit's "title legible at 256px" gate used to need Edge (no browser =
// no thumb). When a real render already exists (out.png next to the brief),
// the thumb is just that same pixel field at 256px wide, aspect kept —
// sharp downscales it with no browser, no new window, no profile dir.
//
// THIRD-PARTY (Apache-2.0, attribution kept in-repo):
//   sharp 0.35.5 (https://sharp.pixelplumbing.com) — high-performance
//   image processing (libvips). Copyright (c) Lovell Fuller and contributors.
//   Licensed under the Apache License, Version 2.0. Full text ships with the
//   package: node_modules/sharp/LICENSE after `npm install` (this repo pins
//   the exact version in package.json + package-lock.json; node_modules stays
//   in-repo only, never machine-wide). A copy of that text is vendored at
//   designs/job/thumbs/SHARP-LICENSE.txt so the attribution survives git
//   (node_modules/ is gitignored). No other dependency was added for this.
import { existsSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { pngDims } from "./render.mjs";
import { THUMB_W } from "./thumb.mjs";

export const SHARP_NAME = "sharp";
export const SHARP_VERSION = "0.35.5";
export const SHARP_LICENSE = "Apache-2.0";
export const SHARP_URL = "https://sharp.pixelplumbing.com";

// True when the pinned in-repo sharp loads (never installs, never fetches).
export async function sharpAvailable() {
  try {
    const require = createRequire(import.meta.url);
    require.resolve("sharp");
    const mod = await import("sharp");
    return !!(mod?.default ?? mod);
  } catch {
    return false;
  }
}

function loadSharp() {
  try {
    const require = createRequire(import.meta.url);
    return require("sharp");
  } catch (e) {
    throw new Error(
      `sharp ${SHARP_VERSION} (${SHARP_LICENSE}) is not installed in-repo: run npm install (never machine-wide, never a substitute dep): ${e.message}`,
    );
  }
}

// srcPng -> outPng at 256px wide, aspect kept from the SOURCE pixels.
// Fail closed: missing source, non-PNG source, or a sub-floor result throws
// and leaves no output file behind — never a blank PNG passed off as a thumb.
export async function sharpThumb(srcPng, outPng, { width = THUMB_W, minBytes = 1024 } = {}) {
  const src = resolve(srcPng);
  if (!existsSync(src)) {
    throw new Error(`sharp thumb needs an existing render (missing: ${src}); no Edge fallback available = SKIP, never a blank PNG`);
  }
  const srcBuf = readFileSync(src);
  let srcDims;
  try {
    srcDims = pngDims(srcBuf);
  } catch {
    throw new Error(`sharp thumb source is not a PNG (refusing to fake it): ${src}`);
  }
  if (!Number.isInteger(srcDims.w) || !Number.isInteger(srcDims.h) || srcDims.w < 1 || srcDims.h < 1) {
    throw new Error(`sharp thumb source has insane dimensions ${srcDims.w}x${srcDims.h} (refusing to fake it): ${src}`);
  }
  const t = { w: width, h: Math.max(16, Math.round((width * srcDims.h) / srcDims.w)) };
  if (width !== THUMB_W) {
    // The gate is defined at 256px; any other width is a different artifact.
    throw new Error(`sharp thumb width is fixed at ${THUMB_W}px (got ${width})`);
  }
  const out = resolve(outPng);
  mkdirSync(dirname(out), { recursive: true });
  const sharp = loadSharp();
  await sharp(src).resize({ width: t.w, height: t.h, fit: "fill" }).png().toFile(out);
  const buf = readFileSync(out);
  const dims = pngDims(buf);
  if (dims.w !== t.w || dims.h !== t.h) {
    try { rmSync(out); } catch { /* best effort */ }
    throw new Error(`sharp thumb size ${dims.w}x${dims.h} != expected ${t.w}x${t.h} (output removed)`);
  }
  if (buf.length < minBytes) {
    try { rmSync(out); } catch { /* best effort */ }
    throw new Error(`sharp thumb suspiciously small (${buf.length}B < ${minBytes}B floor): source likely blank (output removed, never passed off as a thumb)`);
  }
  return { out, w: dims.w, h: dims.h, bytes: buf.length, method: "sharp", src };
}
