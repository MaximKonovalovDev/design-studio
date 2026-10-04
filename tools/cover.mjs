// tools/cover.mjs: build one order folder `designs/<order>/` from its cover.json.
//   node tools/cover.mjs gen <order>...      cover.json (+ art.html, art.css) -> tokens.css, page.html, brief.json, assets.json, DELIVERY.md; copies assets
//   node tools/cover.mjs build <order>...    render every size, thumb-256.png, audit (design-audit.json), judge (DESIGN-REVIEW.md)
//   node tools/cover.mjs compare <order> [theirs.png]   compare.png: ours vs the asset to beat at 256 and 315 px wide
//   node tools/cover.mjs all <order>...      gen + build
// The page is real HTML/CSS (one stage, two layouts: wide above 800 px, card at 800 px and below), colour only
// from tokens.css, every picture a byte copy of a file from the customer's own product folder (assets.json).
// No new dependency: Edge headless through tools/render.mjs.
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { render, renderPdf, parseSize, pngDims } from "./render.mjs";
import { thumbBrief } from "./thumb.mjs";
import { auditBrief } from "./audit.mjs";
import { judgeSample, writeReview } from "./judge.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const read = (p) => readFileSync(p, "utf8").replace(/^﻿/, "");

const BASE_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  body { width: 100vw; height: 100vh; overflow: hidden; background: var(--bg); color: var(--ink); font-family: var(--font-body); }
  .stage { position: relative; display: flex; width: 100%; height: 100%; overflow: hidden; background: var(--stage-bg, var(--bg)); }
  .copy { position: relative; z-index: 3; flex: 0 0 var(--copy-w, 52%); display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding-inline-start: var(--pad, 72px); padding-block: 48px; }
  .art { position: relative; z-index: 1; flex: 1; }
  .kicker { font-weight: 800; font-size: 22px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent-ink); margin-bottom: 16px; }
  h1 { text-wrap: balance; font-family: var(--font-display); font-weight: var(--title-weight, 800); font-size: var(--title-px, 104px); line-height: 0.96; letter-spacing: var(--title-track, -0.01em); color: var(--ink); margin-bottom: 22px; }
  .claim { text-wrap: balance; font-size: var(--claim-px, 32px); line-height: 1.2; color: var(--muted); font-weight: 600; margin-bottom: 26px; max-width: var(--claim-w, 560px); }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; margin-bottom: 28px; max-width: var(--claim-w, 560px); }
  .chips li { font-size: 21px; font-weight: 700; line-height: 1.1; padding: 9px 14px; border-radius: var(--chip-r, 8px); background: var(--chip-bg); color: var(--chip-ink); border: 2px solid var(--chip-line); }
  .cta { font-size: 30px; font-weight: 800; line-height: 1; padding: 15px 30px; border-radius: var(--chip-r, 8px); background: var(--accent); color: var(--on-accent); }
  .fine { margin-top: 16px; font-size: 19px; color: var(--muted); max-width: var(--claim-w, 560px); }
  .win { position: absolute; border-radius: 10px; overflow: hidden; background: var(--win-bg, var(--ink)); box-shadow: 0 24px 48px rgba(0, 0, 0, 0.28), 0 3px 8px rgba(0, 0, 0, 0.22); }
  .win::before { content: ""; display: block; height: 22px; background: var(--win-bar, var(--ink)); border-bottom: 3px solid var(--accent); }
  .win img { display: block; width: 100%; }
  .win .vp { position: relative; overflow: hidden; }
  .win .vp img { position: absolute; max-width: none; }
  @media (max-width: 800px) {
    .stage { flex-direction: column; }
    .copy { flex: 0 0 auto; padding-inline: var(--pad-card, 26px); padding-block: var(--pad-top-card, 22px) 0; }
    .kicker { font-size: 14px; margin-bottom: 8px; }
    h1 { font-size: var(--title-px-card, 60px); margin-bottom: 8px; }
    .claim { font-size: var(--claim-px-card, 21px); margin-bottom: 12px; max-width: none; }
    .chips { gap: 6px; margin-bottom: 0; max-width: none; }
    .chips li { font-size: 14px; padding: 5px 9px; border-width: 1.5px; }
    .chips li.wide-only { display: none; }
    .cta { font-size: 19px; padding: 9px 18px; }
    .fine { display: none; }
    .art { flex: 1; min-height: 0; }
  }
`;

// The sizes one order ships: a store cover is 1280x720 + 630x500; a spec may name its own (post visuals).
function sizeList(spec) {
  if (spec.sizes) return spec.sizes.map((z, i) => ({ w: z.w, h: z.h, file: i === 0 ? "out.png" : `out-${z.w}x${z.h}.png` }));
  return [{ w: 1280, h: 720, file: "out.png" }, { w: 630, h: 500, file: "out-630x500.png" }];
}

function loadSpec(id) {
  const dir = join(ROOT, "designs", id);
  const f = join(dir, "cover.json");
  if (!existsSync(f)) throw new Error(`designs/${id}/cover.json missing`);
  const spec = JSON.parse(read(f));
  spec.dir = dir;
  spec.id = id;
  return spec;
}

function tokensCss(spec) {
  const t = spec.tokens;
  const colors = ["bg", "bg-2", "ink", "muted", "accent", "accent-ink", "on-accent", "chip-bg", "chip-ink", "chip-line", ...Object.keys(t).filter((k) => /^#/.test(String(t[k])) && !["bg", "bg-2", "ink", "muted", "accent", "accent-ink", "on-accent", "chip-bg", "chip-ink", "chip-line"].includes(k))];
  const rows = [];
  for (const k of colors) {
    if (t[k] == null) throw new Error(`${spec.id}: token ${k} missing`);
    rows.push(`  --${k}: ${t[k]};`);
  }
  const other = {
    "font-display": spec.fonts.display,
    "font-body": spec.fonts.body,
    ...(spec.fonts.mono ? { "font-mono": spec.fonts.mono } : {}),
    "title-px": `${spec.titlePx}px`,
    "title-px-card": `${spec.titlePxCard}px`,
    "title-weight": spec.titleWeight ?? 800,
    "title-track": spec.titleTrack ?? "-0.01em",
    "copy-w": spec.copyW ?? "52%",
    "claim-w": spec.claimW ?? "560px",
    "chip-r": spec.chipR ?? "8px",
    ...(spec.vars ?? {}),
  };
  for (const [k, v] of Object.entries(other)) rows.push(`  --${k}: ${v};`);
  return `/* designs/${spec.id}/tokens.css: ${spec.id} ${spec.title} (${spec.pick}). All page color comes from these vars. */\n:root {\n${rows.join("\n")}\n}\n`;
}

function pageHtml(spec) {
  const art = existsSync(join(spec.dir, "art.html")) ? read(join(spec.dir, "art.html")) : "";
  const css = existsSync(join(spec.dir, "art.css")) ? read(join(spec.dir, "art.css")) : "";
  const chips = (spec.chips ?? []).map((c) => {
    const o = typeof c === "string" ? { t: c } : c;
    return `<li${o.wide ? ' class="wide-only"' : ""}>${esc(o.t)}</li>`;
  }).join("");
  const listing = spec.listing ? basename(dirname(dirname(spec.listing))) + "/" + basename(spec.listing) : "the order brief";
  return `<!DOCTYPE html>
<!-- designs/${spec.id}/page.html: ${spec.id} ${spec.storeName} cover for ${spec.title} (${spec.pick}). Facts only from ${listing}. Color only via tokens.css. 1280x720 hero above 800px wide, 630x500 store card at 800px and below. -->
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="tokens.css">
<style>${BASE_CSS}${css}</style>
</head>
<body data-oid="cover.hero">
<div class="stage">
  <div class="copy">
    <div class="kicker">${esc(spec.kicker)}</div>
    <h1 data-oid="cover.title">${esc(spec.title)}</h1>
    <p class="claim" data-oid="cover.subtitle">${esc(spec.claim)}</p>
    <ul class="chips">${chips}</ul>
    <span class="cta" data-oid="cover.cta">${esc(spec.badge)}</span>${spec.fine ? `\n    <p class="fine">${esc(spec.fine)}</p>` : ""}
  </div>
  <div class="art">
${art}
  </div>
</div>
</body>
</html>
`;
}

// Chars on the longest line the page wraps the title onto (wrap hint: array of line strings).
const longest = (lines, title) => (Array.isArray(lines) && lines.length ? Math.max(...lines.map((l) => l.length)) : String(title).length);

function briefJson(spec) {
  const text = spec.text ?? [
    { label: "title", fg: "var(--ink)", bg: "var(--bg)", min: 4.5 },
    { label: "subtitle", fg: "var(--muted)", bg: "var(--bg)", min: 4.5 },
    { label: "cta", fg: "var(--on-accent)", bg: "var(--accent)", min: 4.5 },
    { label: "chip", fg: "var(--chip-ink)", bg: "var(--chip-bg)", min: 4.5 },
    { label: "kicker", fg: "var(--accent-ink)", bg: "var(--bg)", min: 3 },
    ...(spec.extraText ?? []),
  ];
  if (spec.sizes) {
    const first = spec.sizes[0];
    return {
      title: spec.title,
      size: { w: first.w, h: first.h },
      sizes: spec.sizes.map((z) => ({ w: z.w, h: z.h, name: z.name, title_px: z.titlePx, title_box: z.titleBox, title_longest: z.titleLongest })),
      dir: spec.textDir ?? "ltr", tokens: "tokens.css", page: "page.html", image: "out.png", text,
      title_box: first.titleBox, title_px: first.titlePx, title_longest: first.titleLongest,
      order: spec.id, product: spec.product,
    };
  }
  const copyFrac = Number.parseFloat(spec.copyW ?? "52") / 100;
  return {
    title: spec.title,
    size: { w: 1280, h: 720 },
    sizes: [
      { w: 1280, h: 720, name: "landscape" },
      { w: 630, h: 500, name: "store-card", title_px: spec.titlePxCard, title_box: [0.04, 0.04, 0.96, 0.3], title_longest: longest(spec.titleWrapCard, spec.title) },
    ],
    dir: "ltr",
    tokens: "tokens.css",
    page: "page.html",
    image: "out.png",
    text,
    title_box: [Number((72 / 1280).toFixed(3)), 0.2, Number(Math.min(0.95, copyFrac).toFixed(3)), 0.5],
    title_px: spec.titlePx,
    title_longest: longest(spec.titleWrapWide, spec.title),
    order: spec.id,
    product: spec.product,
  };
}

function assetsJson(spec) {
  return {
    note: "Every real picture the page uses: byte copies of files from the customer's own product folder.",
    assets: (spec.assets ?? []).map((a) => ({ file: `assets/${a.name}`, from: a.src ?? a.html, what: a.fit ? `${a.what} (downscaled copy, ${a.fit}px wide, same picture)` : a.html ? `${a.what} (the tool's own preview page rendered by the browser, cropped, ${a.scale ?? 2}x zoom)` : a.what, bytes: existsSync(join(spec.dir, "assets", a.name)) ? statSync(join(spec.dir, "assets", a.name)).size : 0 })),
  };
}

function deliveryMd(spec) {
  const land = `${spec.landing}`;
  if (spec.deliveryLines) return `# DELIVERY ${spec.id}: ${spec.product} for ${spec.from_repo}\n${spec.deliveryLines.map((l, i) => `${i + 1}. ${l}`).join("\n")}\n`;
  const lines = [
    `# DELIVERY ${spec.id}: ${spec.product} for ${spec.from_repo}`,
    `1. Landing in ${spec.from_repo}: \`${land}\` (copy this whole folder; never edit a file outside from-design-studio/).`,
    spec.storeName === "itch.io" ? `2. \`out-630x500.png\` = the itch.io cover image (630x500); \`out.png\` 1280x720 = the 16:9 version for a banner or screenshot slot; \`thumb-256.png\` = readability proof at 256 px.` : `2. \`out.png\` 1280x720 = ${spec.storeName} cover; \`out-630x500.png\` = store card crop; \`thumb-256.png\` = readability proof at 256 px.`,
    `3. Source: \`page.html\` + \`tokens.css\` + \`assets/\` (copies of ${spec.assetsFrom}); \`assets.json\` lists each picture.`,
    `4. Gates: \`brief.json\`, \`design-audit.json\` (audit PASS), \`DESIGN-REVIEW.md\` (SHIP), \`VERDICT.md\` (five checks), \`compare.png\` (ours vs the cover to beat).`,
    `5. Cover to beat: \`${spec.toBeat ?? "none"}\`; facts only from \`${spec.listing ?? "the order brief"}\`.`,
    spec.storeName === "itch.io" ? `6. Adopt: commit these bytes in ${spec.from_repo}, then set the itch.io cover image to \`out-630x500.png\` (banner or screenshot slot: \`out.png\`).` : `6. Adopt: commit these bytes in ${spec.from_repo}, then point the ${spec.storeName} listing at \`out.png\` (card: \`out-630x500.png\`).`,
    `7. Proof in ${spec.from_repo}: \`git log -1 --format=%h -- ${land}out.png\`; here: \`node tools/orders-check.mjs\` and \`node tools/audit.mjs designs/${spec.id}/brief.json\`.`,
  ];
  return `${lines.join("\n")}\n`;
}

// Downscale a copy through the browser (no Python): an <img> at the target size, screenshotted at that size.
function fitImage(src, dst, width) {
  const d = pngDims(readFileSync(src));
  const w = Math.min(width, d.w);
  const h = Math.round((w * d.h) / d.w);
  const f = join(tmpdir(), `ds-fit-${process.pid}-${basename(dst)}.html`);
  writeFileSync(f, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:hidden;background:transparent}img{display:block;width:${w}px;height:${h}px}</style></head><body><img src="${pathToFileURL(src).href}"></body></html>`, "utf8");
  render(f, dst, { w, h }, { minBytes: 512 });
}

// A crop of one of the customer's own HTML outputs (a preview page), rendered by the browser at a zoom so the
// text stays crisp: a.html = page, a.crop = {x, y, w, h} in the page's CSS px, a.scale = zoom, a.vw/a.vh = page viewport.
function renderHtmlAsset(a, dst) {
  const c = a.crop;
  const z = a.scale ?? 2;
  const f = join(tmpdir(), `ds-htmlasset-${process.pid}-${basename(dst)}.html`);
  writeFileSync(f, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:${Math.round(c.w * z)}px;height:${Math.round(c.h * z)}px;overflow:hidden;background:#fff}iframe{border:0;width:${a.vw ?? 1100}px;height:${a.vh ?? 760}px;transform-origin:0 0;transform:scale(${z}) translate(-${c.x}px,-${c.y}px)}</style></head><body><iframe src="${pathToFileURL(a.html).href}"></iframe></body></html>`, "utf8");
  render(f, dst, { w: Math.round(c.w * z), h: Math.round(c.h * z) }, { minBytes: 512 });
}

export function gen(id) {
  const spec = loadSpec(id);
  mkdirSync(join(spec.dir, "assets"), { recursive: true });
  for (const a of spec.assets ?? []) {
    const dst = join(spec.dir, "assets", a.name);
    if (a.html) {
      if (!existsSync(a.html)) throw new Error(`${id}: asset page missing ${a.html}`);
      if (!existsSync(dst)) renderHtmlAsset(a, dst);
      continue;
    }
    if (!existsSync(a.src)) throw new Error(`${id}: asset source missing ${a.src}`);
    if (a.fit) { if (!existsSync(dst)) fitImage(a.src, dst, a.fit); }
    else if (!existsSync(dst) || statSync(dst).size !== statSync(a.src).size) copyFileSync(a.src, dst);
  }
  if (!spec.ownTokens) writeFileSync(join(spec.dir, "tokens.css"), tokensCss(spec), "utf8");
  if (!spec.custom) writeFileSync(join(spec.dir, "page.html"), pageHtml(spec), "utf8");
  writeFileSync(join(spec.dir, "brief.json"), `${JSON.stringify(briefJson(spec), null, 2)}\n`, "utf8");
  writeFileSync(join(spec.dir, "assets.json"), `${JSON.stringify(assetsJson(spec), null, 2)}\n`, "utf8");
  writeFileSync(join(spec.dir, "DELIVERY.md"), deliveryMd(spec), "utf8");
  console.log(`GEN ${id}: tokens.css page.html brief.json assets.json DELIVERY.md`);
  return spec;
}

export function build(id) {
  const spec = loadSpec(id);
  const page = join(spec.dir, "page.html");
  const list = sizeList(spec);
  const made = list.map((z, i) => render(page, join(spec.dir, z.file), parseSize(`${z.w}x${z.h}`)));
  const wide = made[0];
  const card = made[1] ?? made[0];
  for (const x of spec.extraRenders ?? []) render(join(spec.dir, x.page), join(spec.dir, x.out), parseSize(`${x.w}x${x.h}`));
  for (const x of spec.pdfs ?? []) { const r = renderPdf(join(spec.dir, x.page), join(spec.dir, x.out)); console.log(`PDF ${id}: ${x.out} ${r.bytes}B`); }
  const th = thumbBrief(join(spec.dir, "brief.json"));
  const a = auditBrief(join(spec.dir, "brief.json"));
  const j = judgeSample(join(spec.dir, "brief.json"));
  writeReview(join(spec.dir, "brief.json"), j);
  const brief = JSON.parse(read(join(spec.dir, "brief.json")));
  if (spec.twin) {
    // the twin page (EN LTR) gets its own audit run in a scratch folder; its report lands beside the main one.
    const t = spec.twin;
    const tmp = mkdtempSync(join(tmpdir(), "ds-twin-"));
    copyFileSync(join(spec.dir, t.page), join(tmp, "page.html"));
    copyFileSync(join(spec.dir, "tokens.css"), join(tmp, "tokens.css"));
    copyFileSync(join(spec.dir, t.image), join(tmp, "out.png"));
    writeFileSync(join(tmp, "brief.json"), JSON.stringify({ ...brief, title: t.title, dir: t.dir }, null, 2), "utf8");
    const ta = auditBrief(join(tmp, "brief.json"));
    copyFileSync(join(tmp, "design-audit.json"), join(spec.dir, t.report));
    console.log(`TWIN ${id}: ${t.page} audit ${ta.pass ? "PASS" : "FAIL " + ta.errors.slice(0, 3).join("; ")}`);
    if (!ta.pass) a.pass = false;
  }
  console.log(`BUILD ${id}: ${list.map((z, i) => `${z.file} ${made[i].bytes}B`).join(", ")}, thumb ${th.w}x${th.h}, audit ${a.pass ? "PASS" : "FAIL"}${a.pass ? "" : " " + a.errors.slice(0, 3).join("; ")}, judge ${j.score}/${j.max} ${j.pass ? "SHIP" : "REWORK"}`);
  return { pass: a.pass && j.pass };
}

export function compare(id, theirs) {
  const spec = loadSpec(id);
  const beat = theirs ?? spec.toBeat;
  if (!beat || !/\.png$/i.test(beat) || !existsSync(beat)) { console.log(`COMPARE ${id}: no current asset to beat (${beat ?? "none"}), skipped`); return; }
  const ours = join(spec.dir, "out.png");
  const dims = existsSync(beat) ? pngDims(readFileSync(beat)) : { w: 1280, h: 720 };
  const row = (w) => {
    const ho = Math.round((w * 720) / 1280);
    const ht = Math.round((w * dims.h) / dims.w);
    return `<div class="r"><div><p>ours ${w}px</p><img src="${pathToFileURL(ours).href}" style="width:${w}px;height:${ho}px"></div><div><p>theirs ${w}px</p><img src="${pathToFileURL(beat).href}" style="width:${w}px;height:${ht}px"></div></div>`;
  };
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}body{background:#888;font:12px Arial;color:#fff;padding:10px;width:760px;height:430px}.r{display:flex;gap:16px;margin-bottom:14px;align-items:flex-start}p{margin:0 0 3px}</style></head><body>${row(256)}${row(315)}</body></html>`;
  const f = join(tmpdir(), `ds-compare-${id}.html`);
  writeFileSync(f, html, "utf8");
  const out = join(spec.dir, "compare.png");
  render(f, out, { w: 780, h: 450 }, { minBytes: 1024 });
  console.log(`COMPARE ${id}: ${out} (ours vs ${beat})`);
}

// Words a store cover never shows (game engines and kit brands the orders forbid); scanned in page text and alt text.
const FORBIDDEN = ["unity", "godot", "unreal", "gamemaker", "game maker", "rpg maker", "rpgmaker", "construct 3", "pygame"];

function visibleText(html) {
  const body = String(html).split("<body")[1] ?? html;
  const text = body.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
  const alts = [...String(html).matchAll(/alt="([^"]*)"/g)].map((m) => m[1]).join(" ");
  return { text, alts };
}

// Every number on the cover (counts, sizes, prices) must appear in the listing file the order names (or in the order brief itself).
export function factsCheck(id) {
  const spec = loadSpec(id);
  const html = read(join(spec.dir, "page.html"));
  const { text, alts } = visibleText(html);
  let source = "";
  if (spec.listing && existsSync(spec.listing)) source += read(spec.listing);
  const csv = join(ROOT, "orders.csv");
  const row = existsSync(csv) ? read(csv).split(/\r?\n/).find((l) => l.startsWith(`${id},`)) : "";
  source += `\n${row ?? ""}`;
  const norm = (x) => x.replace(/\u00d7/g, "x").toLowerCase();
  const hay = norm(source);
  const tokens = spec.noFacts ? [] : [...new Set((text.match(/\$?\d[\d,.]*(?:x\d+(?:\.\d+)?)?%?/g) ?? []).map((t) => t.replace(/[.,]+$/, "")))];
  const missing = tokens.filter((t) => !hay.includes(norm(t)));
  const forbidden = [...FORBIDDEN, ...(spec.forbid ?? [])].filter((w) => `${text} ${alts}`.toLowerCase().includes(w));
  return { tokens, missing, forbidden, listing: spec.listing };
}

export function verdict(id) {
  const spec = loadSpec(id);
  const brief = JSON.parse(read(join(spec.dir, "brief.json")));
  const audit = JSON.parse(read(join(spec.dir, "design-audit.json")));
  const j = judgeSample(join(spec.dir, "brief.json"));
  const f = factsCheck(id);
  const list = sizeList(spec);
  const dims = list.map((z) => ({ ...z, got: pngDims(readFileSync(join(spec.dir, z.file))) }));
  const d1 = dims[0].got;
  const d2 = (dims[1] ?? dims[0]).got;
  const exact = dims.every((z) => z.got.w === z.w && z.got.h === z.h);
  const assets = JSON.parse(read(join(spec.dir, "assets.json"))).assets;
  const ours = ((brief.title_px * 256) / brief.size.w).toFixed(1);
  const pass = audit.pass && j.pass && f.missing.length === 0 && f.forbidden.length === 0 && exact && (assets.length > 0 || spec.noPictures)  && (spec.toBeat == null || spec.theirsPx256 == null || Number(ours) > Number(spec.theirsPx256));
  const beats = spec.toBeat == null ? `no current asset to beat (${spec.beatNote ?? "the product has no cover image"}); ours is ${ours}px at 256 wide (title_px ${brief.title_px})` : `ours ${ours}px at 256 wide (title_px ${brief.title_px} in design-audit.json) vs theirs about ${spec.theirsPx256}px from compare.png (${basename(spec.toBeat)})${spec.beatNote ? "; " + spec.beatNote : ""}`;
  const lines = [
    `# VERDICT ${id}: ${pass ? "PASS" : "FAIL"} (worker self-review, 2026-10-04; the keeper's judge chain has not run on this folder)`,
    `BEATS: ${beats}.`,
    spec.pictureNote ? `PICTURE: ${spec.pictureNote}` : `PICTURE: real product pictures from the customer's own files, ${assets.length} listed in assets.json (${assets.slice(0, 4).map((a) => a.file.replace("assets/", "")).join(", ")}${assets.length > 4 ? ", ..." : ""}).`,
    spec.factsNote ? `FACTS: ${spec.factsNote}; forbidden words ${f.forbidden.length ? "FOUND: " + f.forbidden.join(",") : "absent from page text and alt text"}.` : spec.noFacts ? `FACTS: placeholders only, no claim to check; forbidden words (${[...FORBIDDEN, ...(spec.forbid ?? [])].slice(-6).join(", ")}) ${f.forbidden.length ? "FOUND: " + f.forbidden.join(",") : "absent from page text and alt text (no personal data in the folder)"}.` : `FACTS: ${f.tokens.length} numbers on the cover (${f.tokens.join(" ")}), ${f.missing.length ? "NOT in the listing: " + f.missing.join(" ") : "all found in " + basename(f.listing ?? "the order brief")}; forbidden words (game engines) ${f.forbidden.length ? "FOUND: " + f.forbidden.join(",") : "absent from page text and alt text"}.`,
    `FIT: ${dims.map((z) => `${z.file} ${z.got.w}x${z.got.h}`).join(", ")}, ${dims.length > 1 ? "both" : "it"} opened by eye, nothing cut at an edge${spec.custom ? "" : " except pictures that bleed on purpose"}; audit ${audit.pass ? "PASS" : "FAIL"} (${audit.checks.length} gates), judge ${j.score}/${j.max} ${j.pass ? "SHIP" : "REWORK"}; ${spec.custom ? `title ${ours}px at 256 wide` : `smallest design text at 256 wide is the chips (about 5px, secondary), the title is ${ours}px`}${spec.fitNote ? "; " + spec.fitNote : ""}.`,
    spec.laneNote ? `LANE: ${spec.laneNote}` : `LANE: store = DELIVERY.md names the cover to beat (${spec.toBeat ? basename(spec.toBeat) : "none"}) and the landing ${spec.landing}.`,
  ];
  writeFileSync(join(spec.dir, "VERDICT.md"), `${lines.join("\n")}\n`, "utf8");
  console.log(`VERDICT ${id}: ${pass ? "PASS" : "FAIL"} (${f.missing.length ? "missing facts " + f.missing.join(" ") : "facts ok"}${f.forbidden.length ? ", forbidden " + f.forbidden.join(",") : ""})`);
  return pass;
}

const isMain = (() => { try { return fileURLToPath(import.meta.url) === resolve(process.argv[1]); } catch { return false; } })();
if (isMain) {
  const [cmd, ...rest] = process.argv.slice(2);
  const ids = rest.filter((x) => !x.endsWith(".png"));
  const png = rest.find((x) => x.endsWith(".png"));
  let bad = 0;
  try {
    for (const id of ids) {
      if (cmd === "gen" || cmd === "all") gen(id);
      if (cmd === "build" || cmd === "all") { if (!build(id).pass) bad += 1; }
      if (cmd === "compare") compare(id, png);
      if (cmd === "facts") { const f = factsCheck(id); console.log(`FACTS ${id}: ${f.tokens.join(" ")} | missing: ${f.missing.join(" ") || "none"} | forbidden: ${f.forbidden.join(",") || "none"}`); }
      if (cmd === "verdict") { if (!verdict(id)) bad += 1; }
    }
  } catch (e) {
    console.log(`COVER FAIL: ${e.message}`);
    process.exit(1);
  }
  if (!["gen", "build", "all", "compare", "facts", "verdict"].includes(cmd)) {
    console.log("usage: node tools/cover.mjs gen|build|all|compare|facts|verdict <order>... (designs/<order>/cover.json)");
    process.exit(2);
  }
  process.exit(bad ? 1 : 0);
}
