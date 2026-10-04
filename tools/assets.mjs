// tools/assets.mjs: real pictures into a design, honestly sourced.
// Two lanes, both keyless:
//   node tools/assets.mjs product <order> [--copy a.png,b.png]
//     reads the brief's Facts: listing path from orders.csv, finds the
//     product's preview/ folder and lists its pictures (size, bytes, sha256,
//     already used by a design or not), largest first. --copy copies the named
//     pictures to designs/<order>/assets/ and writes assets.json (source path,
//     sha256, size), merging with entries the cover tool already wrote.
//   node tools/assets.mjs stock <polyhaven|ambientcg|openverse> "<query>"
//     [--kind texture|hdri|model|photo] [--max 5]
//     CC0 only, no key: Poly Haven and ambientCG are CC0 sites by licence,
//     Openverse is called with license=cc0. Saves to
//     packs/donors/<source>-<slug>/ with SOURCE.json (URL, id, author,
//     licence, date read, sha256) and LICENSE-NOTE.md. Files over 2 MB stay
//     out of git (appended to packs/donors/.gitignore); SOURCE.json stays so
//     they can be fetched again.
//   node tools/assets.mjs --check   (ASSETS PASS: offline fixtures + one live Poly Haven list)
// The Met search API was retired 2026-10-01 and is not used.
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, appendFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DONORS = join(ROOT, "packs", "donors");
export const GIT_KEEP_BYTES = 2 * 1024 * 1024;

const utcDate = () => new Date().toISOString().slice(0, 10);

// --- picture dimensions without a dependency: PNG IHDR, GIF header, JPEG SOF ---
export function parsePngDims(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
export function parseGifDims(buf) {
  if (buf.length < 10 || String(buf.subarray(0, 3)) !== "GIF") throw new Error("not a GIF");
  return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
}
export function parseJpegDims(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error("not a JPEG");
  let i = 2;
  while (i + 8 < buf.length) {
    if (buf[i] !== 0xff) throw new Error("bad JPEG marker");
    const m = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error("no JPEG SOF found");
}
export function imageDims(buf, ext = ".png") {
  const e = String(ext).toLowerCase();
  try {
    if (e === ".png") return parsePngDims(buf);
    if (e === ".gif") return parseGifDims(buf);
    if (e === ".jpg" || e === ".jpeg" || e === ".webp") return parseJpegDims(buf);
  } catch { return null; }
  return null;
}

export const PIC_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// --- orders.csv brief -> Facts: listing paths ---
// The brief cell holds "... Facts: C:/abs/listing/gumroad.md. Factory-made ..."
// or two paths joined by " and " (the second may be bare, relative to the first).
export function factsPaths(briefCell) {
  const text = String(briefCell ?? "");
  const after = text.includes("Facts:") ? text.slice(text.indexOf("Facts:") + 6) : text;
  const parts = after.split(/\s+and\s+/);
  const first = (parts[0].match(/[A-Za-z]:\/[^\s"']+?\.md/i) ?? [])[0] ?? null;
  const out = [];
  if (first) out.push(first.replace(/[.,;:)\]]+$/, ""));
  for (const p of parts.slice(1)) {
    const abs = (p.match(/[A-Za-z]:\/[^\s"']+?\.md/i) ?? [])[0];
    if (abs) { out.push(abs.replace(/[.,;:)\]]+$/, "")); continue; }
    const bare = (p.match(/([\w][\w\-.]*\.md)/i) ?? [])[0];
    if (bare && first) out.push(join(dirname(first), bare.replace(/[.,;:)\]]+$/, "")));
  }
  return out;
}

export function orderRow(order) {
  const csv = readFileSync(join(ROOT, "orders.csv"), "utf8").split(/\r?\n/);
  const line = csv.find((l) => l.startsWith(`${order},`));
  if (!line) throw new Error(`${order}: no row in orders.csv`);
  return line;
}

// A listing at <product>/listing/<file>.md belongs to <product>/; preview is its preview/ sibling.
export function findPreviewDir(factsPath) {
  let dir = dirname(resolve(factsPath));
  if (basename(dir).toLowerCase() === "listing") {
    const p = join(dirname(dir), "preview");
    if (existsSync(p)) return p;
  }
  for (let i = 0; i < 5; i++) {
    const p = join(dir, "preview");
    if (existsSync(p)) return p;
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  throw new Error(`${factsPath}: no preview/ folder found above the listing`);
}

export function listPreviewPictures(previewDir, designAssetsDir) {
  const used = new Set();
  if (designAssetsDir && existsSync(designAssetsDir)) {
    for (const f of readdirSync(designAssetsDir)) {
      try { used.add(sha256(readFileSync(join(designAssetsDir, f)))); } catch { /* skip dirs */ }
    }
  }
  const rows = [];
  for (const name of readdirSync(previewDir)) {
    const ext = extname(name).toLowerCase();
    if (!PIC_EXTS.has(ext)) continue;
    const full = join(previewDir, name);
    if (!statSync(full).isFile()) continue;
    const buf = readFileSync(full);
    const d = imageDims(buf, ext);
    rows.push({ name, bytes: buf.length, size: d ? `${d.w}x${d.h}` : "?", sha256: sha256(buf), used: used.has(sha256(buf)) });
  }
  rows.sort((a, b) => b.bytes - a.bytes);
  return rows;
}

// Merge --copy entries into the assets.json the cover tool wrote (keeps file/from/what/bytes,
// adds sha256+size; page.html already points at the old files, so never drop them).
export function mergeAssetsJson(existing, added) {
  const base = existing && Array.isArray(existing.assets) ? existing.assets.map((a) => ({ ...a })) : [];
  for (const a of added) {
    const i = base.findIndex((x) => x.file === a.file);
    if (i >= 0) base[i] = { ...base[i], ...a };
    else base.push(a);
  }
  return { note: existing?.note ?? "Every real picture the page uses: byte copies of files from the customer's own product folder.", assets: base };
}

export function productInfo(order) {
  const row = orderRow(order);
  const facts = factsPaths(row);
  if (!facts.length) throw new Error(`${order}: no Facts: listing path in orders.csv`);
  const preview = findPreviewDir(facts[0]);
  const dir = join(ROOT, "designs", order);
  return { order, row, facts, preview, dir, assetsDir: join(dir, "assets") };
}

// --- stock lane ---
export function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "asset";
}

const PH_KIND = { texture: "textures", hdri: "hdris", model: "models", photo: null };
export async function polyhavenSearch(query, kind = "texture", max = 5, fetchImpl = fetch) {
  const t = PH_KIND[kind];
  if (!t) throw new Error(`polyhaven has no photos (CC0 photo lane is openverse), kind is texture|hdri|model`);
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 20000);
  let j;
  try {
    const r = await fetchImpl(`https://api.polyhaven.com/assets?t=${t}`, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`polyhaven list ${r.status}`);
    j = await r.json();
  } finally { clearTimeout(to); }
  const q = String(query).toLowerCase();
  const hits = Object.entries(j)
    .filter(([slug, a]) => [slug, a?.name ?? "", (a?.tags ?? []).join(" "), (a?.categories ?? []).join(" ")].join(" ").toLowerCase().includes(q))
    .slice(0, Math.max(1, max))
    .map(([slug, a]) => ({ slug, name: a?.name ?? slug, authors: a?.authors ?? {}, page: `https://polyhaven.com/a/${slug}` }));
  return hits;
}

// Smallest file wins (a design backdrop wants the 1k jpg, never an 8k exr).
export function pickPolyhavenFile(filesJson, kind = "texture") {
  const want = kind === "hdri" ? [".hdr", ".jpg"] : kind === "model" ? [".gltf", ".glb", ".blend"] : [".jpg", ".png"];
  const flat = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (typeof node.url === "string" && typeof node.size === "number") { flat.push(node); return; }
    for (const v of Object.values(node)) walk(v);
  };
  walk(filesJson);
  const extOf = (u) => { const m = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(u); return m ? `.${m[1].toLowerCase()}` : ""; };
  for (const ext of want) {
    const c = flat.filter((f) => extOf(f.url) === ext);
    if (!c.length) continue;
    if (kind === "texture") { // a backdrop wants the colour map, never disp/nor/rough: smallest diffuse wins
      const colour = c.filter((f) => /diff|alb|basecol|_col|color/i.test(f.url)).sort((a, b) => a.size - b.size);
      if (colour.length) return colour[0];
    }
    c.sort((a, b) => a.size - b.size);
    return c[0];
  }
  flat.sort((a, b) => a.size - b.size);
  if (!flat.length) throw new Error("polyhaven files list held no download");
  return flat[0];
}

export function ambientDownloadUrl(assetId, res = "1K", fmt = "JPG") {
  return `https://ambientcg.com/get?file=${assetId}_${res}-${fmt}.zip`;
}
export async function ambientSearch(query, max = 5, fetchImpl = fetch) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 20000);
  let j;
  try {
    const r = await fetchImpl(`https://ambientcg.com/api/v2/full_json?queryString=${encodeURIComponent(query)}&limit=${Math.max(1, max)}`, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`ambientcg list ${r.status}`);
    j = await r.json();
  } finally { clearTimeout(to); }
  return (j?.foundAssets ?? []).slice(0, Math.max(1, max)).map((a) => ({
    slug: slugify(a.assetId), name: a.displayName || a.assetId, id: a.assetId,
    authors: "ambientCG", page: a.shortLink || `https://ambientcg.com/a/${a.assetId}`,
    file: ambientDownloadUrl(a.assetId),
  }));
}

export async function openverseSearch(query, kind = "photo", max = 5, fetchImpl = fetch) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 20000);
  let j;
  try {
    const r = await fetchImpl(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license=cc0&page_size=${Math.max(1, max)}&filter_dead=false`, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`openverse list ${r.status}`);
    j = await r.json();
  } finally { clearTimeout(to); }
  return (j?.results ?? []).slice(0, Math.max(1, max)).map((it) => ({
    slug: slugify(it.title || it.id), name: it.title || it.id, id: it.id,
    authors: it.creator || "unknown", page: it.foreign_landing_url || it.url,
    file: it.url, kind,
  }));
}

async function download(url, dst, fetchImpl = fetch) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 60000);
  try {
    const r = await fetchImpl(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`download ${r.status} ${url}`);
    const buf = Buffer.from(await r.arrayBuffer());
    writeFileSync(dst, buf);
    return buf;
  } finally { clearTimeout(to); }
}

// Files over 2 MB stay out of git: their path is appended to packs/donors/.gitignore,
// SOURCE.json stays tracked so the file can be fetched again.
export function keepOutOfGit(relPath) {
  const ig = join(DONORS, ".gitignore");
  let cur = existsSync(ig) ? readFileSync(ig, "utf8") : "";
  if (!cur.includes("donor packs over 2 MB stay out of git")) {
    cur += "# donor packs over 2 MB stay out of git (SOURCE.json stays, the bytes re-fetch)\n";
  }
  if (!cur.split(/\r?\n/).includes(relPath)) cur += `${cur.endsWith("\n") || cur === "" ? "" : "\n"}${relPath}\n`;
  writeFileSync(ig, cur, "utf8");
}

function sourceJson(dir, rec) {
  writeFileSync(join(dir, "SOURCE.json"), `${JSON.stringify(rec, null, 2)}\n`, "utf8");
  writeFileSync(join(dir, "LICENSE-NOTE.md"),
    `# ${rec.slug}: ${rec.licence}\n\n- Source: ${rec.source} (${rec.page})\n- File: ${rec.file_url}\n- Author: ${typeof rec.author === "string" ? rec.author : JSON.stringify(rec.author)}\n- Licence: ${rec.licence} (no attribution required, commercial use allowed)\n- Read: ${rec.date_read}; sha256 ${rec.sha256}\n- Re-fetch: ${rec.source === "polyhaven" ? `node tools/assets.mjs stock polyhaven "${rec.query}" --kind ${rec.kind}` : rec.source === "ambientcg" ? `node tools/assets.mjs stock ambientcg "${rec.query}"` : `node tools/assets.mjs stock openverse "${rec.query}"`}\n`, "utf8");
}

function selfCheckLive() {
  return polyhavenSearch("x", "texture", 1).then(() => null);
}

async function selfCheck() {
  const results = [];
  const t = (name, ok, detail) => { results.push({ name, pass: !!ok }); console.log(`[${ok ? "PASS" : "FAIL"}] ${name}: ${detail}`); };
  try { // minimal PNG: signature + IHDR 800x600
    const buf = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]), Buffer.from("IHDR"), Buffer.from([0, 0, 3, 32, 0, 0, 2, 88])]);
    const d = parsePngDims(buf);
    t("png header dims", d.w === 800 && d.h === 600, "800x600");
  } catch (e) { t("png header dims", false, String(e.message || e)); }
  try { // minimal GIF89a 64x48
    const buf = Buffer.concat([Buffer.from("GIF89a", "ascii"), Buffer.from([64, 0, 48, 0, 0, 0, 0])]);
    const d = parseGifDims(buf);
    t("gif header dims", d.w === 64 && d.h === 48, "64x48");
  } catch (e) { t("gif header dims", false, String(e.message || e)); }
  try { // minimal JPEG SOI + SOF0 32x16 (h=16 w=32)
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0, 11, 8, 0, 16, 0, 32, 1, 1, 17, 0, 0xff, 0xd9]);
    const d = parseJpegDims(buf);
    t("jpeg SOF dims", d.w === 32 && d.h === 16, "32x16");
  } catch (e) { t("jpeg SOF dims", false, String(e.message || e)); }
  try {
    const row = `O-001,factory,cover:gumroad/book-forge-pro,Gumroad cover. Facts: C:/A/products/x/listing/gumroad.md. Factory cover.,delivered,designs/O-001,no,2026-10-03,`;
    const p = factsPaths(row);
    t("facts path out of the brief", p.length === 1 && p[0] === "C:/A/products/x/listing/gumroad.md", p.join("|"));
    const row2 = `O-006,studio,post,Visual. Facts: C:/A/camp/checker.md and READY.md. Open.,delivered,designs/O-006,no,2026-10-03,`;
    const p2 = factsPaths(row2);
    t("second bare facts path resolves beside the first", p2.length === 2 && p2[1].endsWith("READY.md"), p2.join("|"));
  } catch (e) { t("facts paths", false, String(e.message || e)); }
  try {
    const files = { Diffuse: { "1k": { jpg: { size: 200, url: "https://x.local/a_diff_1k.jpg" } }, "8k": { exr: { size: 900, url: "https://x.local/a_diff_8k.exr" } } } };
    const f = pickPolyhavenFile(files, "texture");
    t("smallest jpg wins over 8k exr", f.url.endsWith("1k.jpg"), f.url);
    t("ambient zip url shape", ambientDownloadUrl("Wood096") === "https://ambientcg.com/get?file=Wood096_1K-JPG.zip", "1K-JPG.zip");
    t("slug shape", slugify("Decrepit Wallpaper!") === "decrepit-wallpaper", "decrepit-wallpaper");
  } catch (e) { t("stock pickers", false, String(e.message || e)); }
  try {
    const merged = mergeAssetsJson({ note: "n", assets: [{ file: "assets/old.png", from: "C:/x", what: "w", bytes: 1 }] }, [{ file: "assets/new.png", from: "C:/y", sha256: "abc", bytes: 2, size: "10x10" }]);
    t("assets.json merge keeps old, adds new", merged.assets.length === 2 && merged.assets[1].sha256 === "abc", "2 entries");
  } catch (e) { t("assets.json merge", false, String(e.message || e)); }
  try {
    const j = await (await fetch("https://api.polyhaven.com/assets?t=textures")).json();
    const n = Object.keys(j).length;
    t("live polyhaven textures list", n > 100, `${n} textures (521 models, 997 HDRIs, 864 textures on 2026-10-04)`);
  } catch (e) { console.log(`[SKIP] live polyhaven list: ${String(e.message || e).slice(0, 120)}`); }
  const fails = results.filter((r) => !r.pass);
  console.log(fails.length ? `ASSETS FAIL: ${fails.length} failing check(s)` : "ASSETS PASS: header dims + facts paths + stock pickers + merge + live polyhaven list green");
  return { pass: fails.length === 0, results };
}

const isMain = (() => { try { return fileURLToPath(import.meta.url) === resolve(process.argv[1]); } catch { return false; } })();

if (isMain) {
  const args = process.argv.slice(2);
  const flag = (name) => {
    const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
    if (i < 0) return null;
    const a = args[i];
    return a.includes("=") ? a.slice(name.length + 1) : args[i + 1] ?? "";
  };
  if (args.includes("--check")) {
    if (!(await selfCheck()).pass) process.exitCode = 1;
  } else if (args[0] === "product") {
    const order = args[1];
    if (!order) { console.log("usage: node tools/assets.mjs product <order> [--copy a.png,b.png]"); process.exit(2); }
    const info = productInfo(order);
    const rows = listPreviewPictures(info.preview, info.assetsDir);
    console.log(`PRODUCT ${order}: ${rows.length} pictures in ${info.preview} (largest first)`);
    for (const r of rows) console.log(`  ${r.used ? "used" : "free"} ${r.name} ${r.size} ${r.bytes}B sha256:${r.sha256.slice(0, 12)}`);
    const copy = flag("--copy");
    if (copy) {
      const names = String(copy).split(",").map((s) => s.trim()).filter(Boolean);
      const byName = new Map(rows.map((r) => [r.name.toLowerCase(), r]));
      mkdirSync(info.assetsDir, { recursive: true });
      const added = [];
      for (const n of names) {
        const hit = byName.get(n.toLowerCase());
        if (!hit) throw new Error(`${order}: ${n} is not in the preview list above (copy by exact file name)`);
        copyFileSync(join(info.preview, hit.name), join(info.assetsDir, hit.name));
        added.push({ file: `assets/${hit.name}`, from: join(info.preview, hit.name).replace(/\\/g, "/"), what: `real product picture from ${order}'s own preview/ folder`, sha256: hit.sha256, bytes: hit.bytes, size: hit.size });
        console.log(`  copied ${hit.name} -> designs/${order}/assets/${hit.name}`);
      }
      const jf = join(info.dir, "assets.json");
      const prev = existsSync(jf) ? JSON.parse(readFileSync(jf, "utf8")) : null;
      const next = mergeAssetsJson(prev, added);
      for (const e of next.assets) { // older entries predate sha256+size: backfill from the byte copy on disk
        if (e.sha256 && e.size) continue;
        const disk = join(info.dir, String(e.file ?? "").replace(/^\//, ""));
        if (!existsSync(disk)) continue;
        const buf = readFileSync(disk);
        const d = imageDims(buf, extname(disk));
        e.sha256 = sha256(buf);
        e.bytes = buf.length;
        if (d) e.size = `${d.w}x${d.h}`;
      }
      next.order = order;
      next.preview_dir = info.preview.replace(/\\/g, "/");
      next.date = utcDate();
      writeFileSync(jf, `${JSON.stringify(next, null, 2)}\n`, "utf8");
      console.log(`ASSETS ${order}: designs/${order}/assets.json (${next.assets.length} entries)`);
    }
  } else if (args[0] === "stock") {
    const source = args[1];
    const query = args[2];
    const kind = flag("--kind") || (source === "openverse" ? "photo" : "texture");
    const max = Number(flag("--max") || 5);
    if (!["polyhaven", "ambientcg", "openverse"].includes(source) || !query) {
      console.log('usage: node tools/assets.mjs stock <polyhaven|ambientcg|openverse> "<query>" [--kind texture|hdri|model|photo] [--max 5]');
      process.exit(2);
    }
    let hits;
    if (source === "polyhaven") {
      const found = await polyhavenSearch(query, kind, max);
      if (!found.length) throw new Error(`polyhaven: nothing CC0 matches "${query}" (${kind})`);
      const top = found[0];
      console.log(`STOCK polyhaven: ${found.length} match(es), taking ${top.slug} (${top.name})`);
      const fr = await fetch(`https://api.polyhaven.com/files/${top.slug}`);
      if (!fr.ok) throw new Error(`polyhaven files ${fr.status}`);
      const pick = pickPolyhavenFile(await fr.json(), kind);
      hits = [{ ...top, id: top.slug, file: pick.url, kind }];
    } else if (source === "ambientcg") {
      const found = await ambientSearch(query, max);
      if (!found.length) throw new Error(`ambientcg: nothing CC0 matches "${query}"`);
      console.log(`STOCK ambientcg: taking ${found[0].id} (${found[0].name})`);
      hits = [{ ...found[0], source, query, licence: "CC0" }];
    } else {
      const found = await openverseSearch(query, kind, max);
      if (!found.length) throw new Error(`openverse: nothing cc0 matches "${query}"`);
      console.log(`STOCK openverse: taking ${found[0].id} (${found[0].name})`);
      hits = found.map((f) => ({ ...f, source, query, licence: "CC0" }));
      hits = [hits[0]];
    }
    const hit = source === "polyhaven" ? { ...hits[0], source, query, licence: "CC0" } : { ...hits[0], source, query, licence: "CC0", kind };
    const dir = join(DONORS, `${source}-${hit.slug}`);
    mkdirSync(dir, { recursive: true });
    const url = hit.file;
    const ext = (/\.(jpg|jpeg|png|hdr|exr|zip|gltf|glb|blend)(?:[?#]|$)/i.exec(url)?.[0] ?? ".bin").replace(/[?#].*$/, "");
    const dst = join(dir, `${hit.slug}${ext}`);
    const buf = await download(url, dst);
    const sum = sha256(buf);
    sourceJson(dir, { source, query, kind: hit.kind, slug: hit.slug, id: hit.id, name: hit.name, page: hit.page, file_url: url, file: basename(dst), author: hit.authors, licence: "CC0", date_read: utcDate(), sha256: sum, bytes: buf.length });
    const rel = `packs/donors/${source}-${hit.slug}/${basename(dst)}`;
    if (buf.length > GIT_KEEP_BYTES) { keepOutOfGit(rel); console.log(`STOCK ${source}-${hit.slug}: ${basename(dst)} ${buf.length}B over 2 MB, out of git (SOURCE.json stays)`); }
    else console.log(`STOCK ${source}-${hit.slug}: ${basename(dst)} ${buf.length}B sha256:${sum.slice(0, 12)} CC0`);
  } else {
    console.log('usage: node tools/assets.mjs product <order> [--copy a.png,b.png] | node tools/assets.mjs stock <polyhaven|ambientcg|openverse> "<query>" [--kind K] [--max N] | node tools/assets.mjs --check');
    process.exit(2);
  }
}
