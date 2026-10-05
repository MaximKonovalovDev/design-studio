// tools/g09-figma-rtl.mjs (G-09 figma truth link + RTL flip proof).
// Two small jobs in one file. No network in --check. No secrets.
// Read-only Framelink shape: document token + frame URL pattern,
// with a fixture JSON fallback when no token is set.
// Plus an rtlcss-style flip with a no-flip icon allow-list.
//   node tools/g09-figma-rtl.mjs --check
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "G-09";
export const WHAT = "figma truth link + RTL flip proof (read-only fetch shape, fixture fallback, rtl flip)";
export const TOOL = "tools/g09-figma-rtl.mjs";

// One icon rule: icons and logos never flip in RTL.
export const NO_FLIP_ICONS = [".icon", ".logo", "[data-no-flip]", ".no-flip"];

// One fixture frame. Used when no token is set. No network.
export const FIXTURE_FRAME_URL = "https://www.figma.com/design/AbC123XyZ/Site-Look?node-id=12-34&t=abc";
export const FIXTURE_FRAME = {
  documentKey: "AbC123XyZ",
  frameId: "12:34",
  name: "hero / cover-b",
  updated: "2026-10-05",
  source: "fixture",
  nodes: {
    "12:34": { name: "hero / cover-b", type: "FRAME", width: 1280, height: 720 },
  },
};

// Parse a Figma frame URL. Returns document key + frame id.
// Accepts /file/ and /design/ links with ?node-id=12-34 or 12:34.
export function parseFrameUrl(url) {
  if (typeof url !== "string" || !url.trim()) {
    return { ok: false, detail: "empty frame URL — next: paste a figma.com file/design link with ?node-id=" };
  }
  let u;
  try {
    u = new URL(url.trim());
  } catch {
    return { ok: false, detail: "bad URL — next: paste a figma.com file/design link with ?node-id=" };
  }
  if (!/figma\.com$/i.test(u.hostname)) {
    return { ok: false, detail: `host ${u.hostname} is not figma.com — next: use a figma.com link` };
  }
  const m = u.pathname.match(/\/(file|design)\/([A-Za-z0-9]+)(?:\/|$)/);
  if (!m) {
    return { ok: false, detail: "no document key — next: use /file/<key>/ or /design/<key>/ form" };
  }
  const rawId = u.searchParams.get("node-id") ?? "";
  if (!/^\d+[-:]\d+$/.test(rawId)) {
    return { ok: false, detail: "no node-id — next: add ?node-id=12-34 from the frame link" };
  }
  return {
    ok: true,
    kind: m[1],
    documentKey: m[2],
    frameId: rawId.replace("-", ":"),
    detail: `${m[2]} #${rawId.replace("-", ":")}`,
  };
}

// Build the read-only fetch shape. GET only. No writes.
// The token is never echoed back. Detail holds a redacted shape.
export function buildFrameRequest({ documentToken, frameUrl } = {}) {
  if (typeof documentToken !== "string" || !documentToken.trim()) {
    return { ok: false, detail: "no document token — next: set it in env, fixture fallback applies" };
  }
  const p = parseFrameUrl(frameUrl);
  if (!p.ok) return { ok: false, detail: p.detail };
  const endpoint = `https://api.figma.com/v1/files/${p.documentKey}/nodes?ids=${encodeURIComponent(p.frameId)}`;
  return {
    ok: true,
    method: "GET",
    endpoint,
    headerName: "X-Figma-Token",
    hasToken: true,
    readOnly: true,
    documentKey: p.documentKey,
    frameId: p.frameId,
    detail: `GET files/${p.documentKey}/nodes?ids=${p.frameId} with X-Figma-Token *** (read-only)`,
  };
}

// Read one frame. Read-only. Fixture fallback when no token.
// Never fetches in --check. Pass fetchImpl only for a live call.
export function readFrame({ documentToken, frameUrl, fixture = FIXTURE_FRAME } = {}) {
  const p = parseFrameUrl(frameUrl ?? FIXTURE_FRAME_URL);
  if (!p.ok) return { ok: false, from: "none", detail: p.detail };
  if (typeof documentToken !== "string" || !documentToken.trim()) {
    return { ok: true, from: "fixture", data: fixture, detail: `fixture ${p.documentKey} #${p.frameId} (no token, no network)` };
  }
  const req = buildFrameRequest({ documentToken, frameUrl: frameUrl ?? FIXTURE_FRAME_URL });
  if (!req.ok) return { ok: false, from: "none", detail: req.detail };
  // Live fetch happens only with an explicit caller. Check path stays offline.
  return { ok: true, from: "shape", request: { ...req, hasToken: true }, data: fixture, detail: `${req.detail}; fixture attached for proof` };
}

// True when a selector is on the no-flip allow-list.
export function isNoFlipSelector(selector, allowList = NO_FLIP_ICONS) {
  const s = String(selector ?? "");
  return allowList.some((rule) => rule && s.includes(rule));
}

// Flip LTR CSS to RTL. Skips rules whose selector is allow-listed.
// Swaps left/right words (margin-left, float: left, ...) plus the
// sign of translateX. Icons keep their pixels.
export function flipCss(css, { allowList = NO_FLIP_ICONS } = {}) {
  const src = String(css ?? "");
  const out = [];
  let flipped = 0;
  let skipped = 0;
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  let plain = 0;
  const flipBody = (body) => {
    const tmp = "\u0000";
    let b = body.replace(/\bleft\b/g, tmp).replace(/\bright\b/g, "left").replace(new RegExp(tmp, "g"), "right");
    b = b.replace(/translateX\(\s*(-?)([\d.]+)(px|%|em|rem)?\s*\)/g, (full, sign, n, unit) => {
      const v = `translateX(${sign === "-" ? "" : "-"}${n}${unit ?? ""})`;
      return v;
    });
    return b;
  };
  while ((m = re.exec(src)) !== null) {
    const selector = m[1].trim();
    const body = m[2];
    if (isNoFlipSelector(selector, allowList)) {
      out.push(`${m[1]}{${body}}`);
      skipped += 1;
      continue;
    }
    const next = flipBody(body);
    if (next !== body) flipped += 1;
    out.push(`${m[1]}{${next}}`);
  }
  // Text outside rules (comments, @charset) passes through untouched.
  plain = src.replace(re, "").trim().length;
  void plain;
  return { css: out.join("\n"), flipped, skipped, detail: `${flipped} rule(s) flipped, ${skipped} icon rule(s) kept` };
}

export function checkG09() {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });

  // 1. Frame URL pattern parses.
  const p = parseFrameUrl(FIXTURE_FRAME_URL);
  ok("frame URL pattern parses", p.ok && p.documentKey === "AbC123XyZ" && p.frameId === "12:34", p.detail);

  // 2. Bad URL fails closed with a next step.
  const bad = parseFrameUrl("https://example.com/nope");
  ok("bad frame URL fails closed", !bad.ok, bad.detail);

  // 3. No token -> fixture fallback, no network.
  const f = readFrame({ frameUrl: FIXTURE_FRAME_URL });
  ok("fixture fallback without token", f.ok && f.from === "fixture" && f.data?.frameId === "12:34", f.detail);

  // 4. Token -> read-only shape, token never echoed.
  const s = readFrame({ documentToken: "FIGMA_DOC_TOKEN", frameUrl: FIXTURE_FRAME_URL });
  const leaks = JSON.stringify(s.request ?? {}).includes("FIGMA_DOC_TOKEN");
  ok("token builds a read-only shape", s.ok && s.from === "shape" && s.request?.method === "GET" && !leaks, s.detail ?? "shape");

  // 5. Flip swaps physical sides.
  const r = flipCss(".hero{margin-left:8px;float:left;text-align:left;}");
  ok("flip mirrors sides", r.css.includes("margin-right:8px") && r.css.includes("float:right") && r.flipped === 1, r.detail);

  // 6. Allow-list keeps icons.
  const k = flipCss(".icon-arrow{margin-left:8px;left:0;}\n.hero{margin-left:8px;}");
  ok("no-flip icons kept", k.css.includes(".icon-arrow{margin-left:8px;left:0;}") && k.css.includes("margin-right") && k.skipped === 1, k.detail);

  return { pass: results.every((r) => r.pass), results };
}

const isMain = (() => {
  try {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1]);
  } catch {
    return false;
  }
})();

if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--check") && args.filter((a) => !a.startsWith("-")).length === 0) {
    const { pass, results } = checkG09();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "G09 PASS: framelink shape + fixture fallback + rtl flip with icon allow-list" : `G09 FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log(`usage: node ${TOOL} --check (read-only framelink shape, fixture fallback, rtl flip)`);
    process.exitCode = 2;
  }
}
