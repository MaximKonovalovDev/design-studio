// tools/canvas.mjs (DS-09 canvas-01): Konva-compatible template editor lane.
// Templates are canvas/templates/<id>.json scenes: { id, size:{w,h}, layer[] }
// with rect/text nodes shaped like Konva JSON (x/y/text/fontSize/fill), so a
// real Konva editor can load them via Konva.Node.create. Fills are
// var(--token) only (palette below, copied from samples/cover/tokens.css
// DS-02; no hex in templates). Title gate: the scene's largest text must stay
// >= 12px when scaled to 256px wide (fontSize*256/stage.w), the thumbnail
// readability bar. exportSvg() renders a scene to a standalone SVG (own exporter, no
// Konva vendored: konvajs/konva is MIT but our headless loop needs no DOM).
// --write regenerates canvas/out/<id>.svg; --check validates + compares.
//   node tools/canvas.mjs --check
//   node tools/canvas.mjs --write
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

export const ROW = "DS-09";
// Palette provenance: samples/cover/tokens.css (tools/tokens.mjs DS-02).
export const PALETTE = {
  "--paper": "#faf7f0",
  "--ink": "#1a1a1a",
  "--muted": "#57534e",
  "--accent": "#c2410c",
  "--on-accent": "#ffffff",
  "--line": "#e7e0d3",
};

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HEX = /#[0-9a-fA-F]{6}\b/g;

export function templateDir(root = ROOT) {
  return join(root, "canvas", "templates");
}
export function outDir(root = ROOT) {
  return join(root, "canvas", "out");
}

function num(v) {
  return typeof v === "number" && Number.isFinite(v);
}

export function validateScene(scene) {
  const errors = [];
  const id = scene?.id ?? "(no id)";
  if (typeof scene?.id !== "string" || !scene.id) errors.push(`${id}: missing id`);
  const { w, h } = scene?.size ?? {};
  if (!num(w) || !num(h) || w < 16 || h < 16) errors.push(`${id}: size.w/h must be numbers >= 16`);
  const layer = scene?.layer;
  if (!Array.isArray(layer) || layer.length < 2) {
    errors.push(`${id}: layer needs 2+ nodes`);
    return errors;
  }
  for (const [i, n] of layer.entries()) {
    const tag = `${id}.layer[${i}]`;
    if (n?.type !== "rect" && n?.type !== "text") {
      errors.push(`${tag}: type must be rect|text`);
      continue;
    }
    if (!num(n.x) || !num(n.y)) errors.push(`${tag}: x/y must be numbers (Konva shape)`);
    const fill = String(n.fill ?? "");
    const m = fill.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    if (!m) {
      errors.push(`${tag}: fill must be var(--token), got ${JSON.stringify(n.fill)}`);
    } else if (!PALETTE[m[1]]) {
      errors.push(`${tag}: unknown token ${m[1]} (palette: ${Object.keys(PALETTE).join(", ")})`);
    }
    if (n.type === "rect" && (!num(n.w) || !num(n.h))) errors.push(`${tag}: rect needs w/h numbers`);
    if (n.type === "text") {
      if (typeof n.text !== "string" || !n.text) errors.push(`${tag}: text needs a non-empty string`);
      if (!num(n.fontSize) || n.fontSize <= 0) errors.push(`${tag}: text needs fontSize number`);
    }
  }
  // 256px title gate: the scene's largest text (the title a listing shows)
  // must stay >= 12px at 256px wide. Body copy below the floor is expected.
  const texts = layer.filter((n) => n?.type === "text" && num(n.fontSize));
  if (texts.length === 0) {
    errors.push(`${id}: no text node (a template needs a title)`);
  } else if (num(w)) {
    const top = texts.reduce((a, b) => (b.fontSize > a.fontSize ? b : a));
    const scaled = (top.fontSize * 256) / w;
    if (scaled < 12) errors.push(`${id}: title "${top.text}" ${top.fontSize}px at ${w}w -> ${scaled.toFixed(1)}px at 256w (floor 12px)`);
  }
  return errors;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function exportSvg(scene) {
  const { w, h } = scene.size;
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`];
  for (const n of scene.layer) {
    const fill = PALETTE[n.fill.match(/--[\w-]+/)[0]];
    if (n.type === "rect") {
      parts.push(`<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" fill="${fill}"/>`);
    } else {
      parts.push(`<text x="${n.x}" y="${n.y + n.fontSize}" font-size="${n.fontSize}" fill="${fill}" font-family="Verdana, sans-serif">${esc(n.text)}</text>`);
    }
  }
  parts.push(`</svg>`);
  return parts.join("\n") + "\n";
}

export function checkCanvas({ root = ROOT } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });
  const dir = templateDir(root);
  const out = outDir(root);
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
    ok("templates directory readable", true, `${files.length} scene(s)`);
  } catch (e) {
    ok("templates directory readable", false, String(e.message || e));
    return { pass: false, results };
  }
  ok("5 templates shipped", files.length >= 5, files.join(", ") || "none");
  for (const f of files) {
    const id = basename(f, ".json");
    let scene;
    try {
      scene = JSON.parse(readFileSync(join(dir, f), "utf8"));
      ok(`template ${id} parses`, true, `${scene?.size?.w}x${scene?.size?.h}, ${scene?.layer?.length ?? 0} nodes`);
    } catch (e) {
      ok(`template ${id} parses`, false, String(e.message || e));
      continue;
    }
    const raw = readFileSync(join(dir, f), "utf8");
    const hard = raw.match(HEX) ?? [];
    ok(`template ${id} has 0 hardcoded colors`, hard.length === 0, hard.length ? `hardcoded ${hard.slice(0, 2).join(",")}` : "fills via var(--*)");
    const errs = validateScene(scene);
    ok(`template ${id} validates (Konva shape + 256px)`, errs.length === 0, errs.length ? errs.join("; ") : "shape + palette + 256px green");
    const svgFile = join(out, `${scene.id ?? id}.svg`);
    if (!existsSync(svgFile)) {
      ok(`export ${id}.svg pinned`, false, `${id}.svg missing (run --write)`);
    } else {
      const svg = readFileSync(svgFile, "utf8");
      ok(`export ${id}.svg pinned`, true, `${svg.length}B`);
      ok(`export ${id}.svg matches scene`, svg === exportSvg(scene), svg === exportSvg(scene) ? "<svg> + <text> present" : "SVG DRIFTED: run --write");
    }
  }
  return { pass: results.every((r) => r.pass), results };
}

export function writeExports({ root = ROOT } = {}) {
  mkdirSync(outDir(root), { recursive: true });
  const done = [];
  for (const f of readdirSync(templateDir(root)).filter((f) => f.endsWith(".json")).sort()) {
    const scene = JSON.parse(readFileSync(join(templateDir(root), f), "utf8"));
    const errs = validateScene(scene);
    if (errs.length) throw new Error(`cannot export ${f}: ${errs.join("; ")}`);
    writeFileSync(join(outDir(root), `${scene.id}.svg`), exportSvg(scene), "utf8");
    done.push(scene.id);
  }
  return done;
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
  if (args.includes("--write")) {
    try {
      const done = writeExports();
      console.log(`CANVAS WRITE: exported ${done.length} SVG(s): ${done.join(", ")}`);
    } catch (e) {
      console.log(`[FAIL] export: ${e.message}`);
      process.exitCode = 1;
    }
  } else if (args.includes("--check") || args.length === 0) {
    const { pass, results } = checkCanvas();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(pass ? "CANVAS PASS: 5 templates, Konva shape + palette + 256px green, SVG exports match" : `CANVAS FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`);
    if (!pass) process.exitCode = 1;
  } else {
    console.log("usage: node tools/canvas.mjs [--check|--write]");
    process.exitCode = 2;
  }
}
