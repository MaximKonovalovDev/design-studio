// tests/assets.test.mjs: tools/assets.mjs header-dim readers, Facts: path parsing,
// preview-dir resolution, the assets.json merge and the stock pickers. Offline only:
// every fetch is a fixture, the live Poly Haven list runs in tools/assets.mjs --check.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import {
  ambientDownloadUrl, dirTokens, factsPaths, findPreviewDir, imageDims, mergeAssetsJson,
  packCandidates, parseGifDims, parseJpegDims, parsePngDims, pickPolyhavenFile, repoRoot,
  resolveOrderPackIn, scoreDirName, sha256, slugTokens, slugify,
} from "../tools/assets.mjs";

describe("header dim readers (no dependency)", () => {
  it("reads PNG IHDR dims", () => {
    const buf = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]), Buffer.from("IHDR"), Buffer.from([0, 0, 5, 0, 0, 0, 3, 232])]);
    assert.deepEqual(parsePngDims(buf), { w: 1280, h: 1000 });
  });
  it("reads GIF header dims", () => {
    const buf = Buffer.concat([Buffer.from("GIF89a", "ascii"), Buffer.from([64, 0, 48, 0, 0, 0, 0])]);
    assert.deepEqual(parseGifDims(buf), { w: 64, h: 48 });
  });
  it("reads JPEG SOF dims", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0, 11, 8, 0, 16, 0, 32, 1, 1, 17, 0, 0xff, 0xd9]);
    assert.deepEqual(parseJpegDims(buf), { w: 32, h: 16 });
  });
  it("rejects non-pictures and imageDims answers null instead of throwing", () => {
    assert.throws(() => parsePngDims(Buffer.from("hello world, not a png....")));
    assert.equal(imageDims(Buffer.from("nope"), ".png"), null);
    assert.equal(imageDims(Buffer.from("nope"), ".bmp"), null);
  });
  it("sha256 is hex and stable", () => {
    assert.match(sha256(Buffer.from("x")), /^[0-9a-f]{64}$/);
    assert.equal(sha256(Buffer.from("x")), sha256(Buffer.from("x")));
  });
});

describe("Facts: paths out of the orders.csv brief", () => {
  it("one absolute listing path", () => {
    const p = factsPaths("Gumroad cover. Facts: C:/A/products/x/listing/gumroad.md. Factory cover to beat.");
    assert.deepEqual(p, ["C:/A/products/x/listing/gumroad.md"]);
  });
  it("a second bare file name resolves beside the first", () => {
    const p = factsPaths("Post visual. Facts: C:/A/campaigns/aeo/checker.md and READY.md. Open Design pick.");
    assert.equal(p.length, 2);
    assert.ok(p[1].endsWith("READY.md"));
  });
  it("two absolute paths both survive", () => {
    const p = factsPaths("Facts: C:/A/one.md and C:/B/two.md. Done.");
    assert.deepEqual(p, ["C:/A/one.md", "C:/B/two.md"]);
  });
});

describe("cover: briefs resolve repo-relative facts paths (NEED-13, O-035)", () => {
  const brief = "itch cover for indie-game-suite ($29; facts only from products/game-suite/indie-game-suite/listing/itch.md; sizes 1280x720 PNG plus 630x500 crop; factory-made cover to beat: products/game-suite/indie-game-suite/preview/cover-1280x720.png)";
  it("extracts the relative listing .md without a Facts: marker or absolute path", () => {
    assert.deepEqual(factsPaths(brief), ["products/game-suite/indie-game-suite/listing/itch.md"]);
  });
  it("ignores the cover-to-beat .png (only .md is a facts path)", () => {
    const p = factsPaths(brief);
    assert.ok(p.every((x) => x.endsWith(".md")));
    assert.ok(!p.some((x) => x.endsWith(".png")));
  });
  it("a lowercase facts: marker still splits like Facts:", () => {
    const p = factsPaths("cover. facts: C:/A/products/x/listing/itch.md. done.");
    assert.deepEqual(p, ["C:/A/products/x/listing/itch.md"]);
  });
  it("the relative path absolutized against a customer root finds preview/", () => {
    const root = mkdtempSync(join(tmpdir(), "ds-assets-cover-"));
    try {
      mkdirSync(join(root, "products", "game-suite", "indie-game-suite", "listing"), { recursive: true });
      mkdirSync(join(root, "products", "game-suite", "indie-game-suite", "preview"), { recursive: true });
      writeFileSync(join(root, "products", "game-suite", "indie-game-suite", "listing", "itch.md"), "# facts\n");
      const rel = factsPaths(brief)[0];
      const abs = join(root, ...rel.split("/"));
      assert.equal(abs, join(root, "products", "game-suite", "indie-game-suite", "listing", "itch.md"));
      assert.equal(findPreviewDir(abs), join(root, "products", "game-suite", "indie-game-suite", "preview"));
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it("absolute Facts: paths still win and still resolve", () => {
    const p = factsPaths("Gumroad cover. Facts: C:/A/products/x/listing/gumroad.md. Factory cover to beat.");
    assert.deepEqual(p, ["C:/A/products/x/listing/gumroad.md"]);
  });
});

describe("preview dir above the listing", () => {
  it("finds the preview/ sibling of listing/", () => {
    const root = mkdtempSync(join(tmpdir(), "ds-assets-test-"));
    try {
      mkdirSync(join(root, "prod", "listing"), { recursive: true });
      mkdirSync(join(root, "prod", "preview"), { recursive: true });
      writeFileSync(join(root, "prod", "listing", "gumroad.md"), "# facts\n");
      assert.equal(findPreviewDir(join(root, "prod", "listing", "gumroad.md")), join(root, "prod", "preview"));
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it("fails closed with no preview/ above", () => {
    const root = mkdtempSync(join(tmpdir(), "ds-assets-test-"));
    try {
      mkdirSync(join(root, "listing"), { recursive: true });
      assert.throws(() => findPreviewDir(join(root, "listing", "gumroad.md")), /no preview/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});

describe("assets.json merge (page.html keeps pointing at old files)", () => {
  it("keeps old entries and adds the copies", () => {
    const next = mergeAssetsJson(
      { note: "n", assets: [{ file: "assets/old.png", from: "C:/x", what: "w", bytes: 1 }] },
      [{ file: "assets/new.png", from: "C:/y", sha256: "abc", bytes: 2, size: "10x10" }],
    );
    assert.equal(next.assets.length, 2);
    assert.equal(next.assets[0].file, "assets/old.png");
    assert.equal(next.assets[1].sha256, "abc");
  });
  it("re-copying the same file updates it instead of doubling", () => {
    const next = mergeAssetsJson(
      { note: "n", assets: [{ file: "assets/a.png", from: "C:/x", bytes: 1 }] },
      [{ file: "assets/a.png", from: "C:/x", sha256: "z", bytes: 9, size: "1x1" }],
    );
    assert.equal(next.assets.length, 1);
    assert.equal(next.assets[0].bytes, 9);
  });
});

describe("order: slugs resolve the customer pack plus the factory twin (NEED-10, offline fixtures)", () => {
  const png24 = (w, h) => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]), Buffer.from("IHDR"), Buffer.from([0, 0, w >> 8, w & 255, 0, 0, h >> 8, h & 255])]);
  const fixture = () => {
    const root = mkdtempSync(join(tmpdir(), "ds-assets-order-"));
    mkdirSync(join(root, "skillworks", "packs", "fleet-vol-1"), { recursive: true });
    writeFileSync(join(root, "skillworks", "packs", "fleet-vol-1", "listing.md"), "# facts\n");
    mkdirSync(join(root, "skillworks", "packs", "other-pack"), { recursive: true });
    mkdirSync(join(root, "autonomous-factory", "products", "skill-pack", "fleet-pack", "preview"), { recursive: true });
    writeFileSync(join(root, "autonomous-factory", "products", "skill-pack", "fleet-pack", "preview", "screenshot-pairs.png"), png24(64, 48));
    return root;
  };
  const slug = "order:demo-gif-for-fleet-vol-1-a-bad-command-t";
  it("slug tokens keep the pack identity (vol-1 digit survives, glue words go)", () => {
    const t = slugTokens(slug);
    assert.ok(t.includes("fleet") && t.includes("vol") && t.includes("1"));
    assert.ok(!t.includes("for") && !t.includes("a") && !t.includes("t"));
  });
  it("dir tokens keep single digits so fleet-vol-1 beats fleet-pack 3 to 1", () => {
    assert.deepEqual(dirTokens("fleet-vol-1").sort(), ["1", "fleet", "vol"]);
    const toks = slugTokens(slug);
    assert.equal(scoreDirName(toks, "fleet-vol-1").shared, 3);
    assert.equal(scoreDirName(toks, "fleet-pack").shared, 1);
  });
  it("resolves the customer pack dir and its listing.md", () => {
    const root = fixture();
    try {
      const r = resolveOrderPackIn(slug, "skillworks", join(root, "skillworks"), join(root, "autonomous-factory"));
      assert.equal(basename(r.packDir), "fleet-vol-1");
      assert.ok(r.listingFile.endsWith("listing.md"));
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it("a papers-only pack falls back to the same-content factory twin", () => {
    const root = fixture();
    try {
      const r = resolveOrderPackIn(slug, "skillworks", join(root, "skillworks"), join(root, "autonomous-factory"));
      assert.equal(r.twins.length, 1);
      assert.equal(r.twins[0].product, "fleet-pack");
      assert.equal(r.twins[0].pics.length, 1);
      assert.equal(r.twins[0].pics[0].name, "screenshot-pairs.png");
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it("fails closed on an unknown slug and on a missing customer root", () => {
    const root = fixture();
    try {
      assert.throws(() => resolveOrderPackIn("order:zzz-qqq-nothing", "skillworks", join(root, "skillworks"), join(root, "autonomous-factory")), /2\+ tokens/);
      assert.throws(() => resolveOrderPackIn(slug, "skillworks", join(root, "no-such-root"), join(root, "autonomous-factory")), /missing on disk/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it("packCandidates stays shallow and skips missing roots", () => {
    const root = fixture();
    try {
      const found = packCandidates(join(root, "skillworks"), ["packs/*"]);
      assert.deepEqual(found.map((p) => basename(p)).sort(), ["fleet-vol-1", "other-pack"]);
      assert.deepEqual(packCandidates(join(root, "no-such-root"), ["packs/*"]), []);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it("repoRoot maps every orders.csv from_repo and rejects unknown ones", () => {
    assert.ok(repoRoot("skillworks").endsWith("skillworks"));
    assert.ok(repoRoot("factory").endsWith("autonomous-factory"));
    assert.throws(() => repoRoot("nope"), /unknown from_repo/);
  });
});

describe("stock pickers (fixtures, no network)", () => {
  it("a texture takes the smallest colour map, never disp/nor/rough or 8k exr", () => {
    const files = { Diffuse: { "1k": { jpg: { size: 800, url: "https://x.local/a_diff_1k.jpg" } }, "8k": { exr: { size: 60, url: "https://x.local/a_diff_8k.exr" } } }, Displacement: { "1k": { jpg: { size: 100, url: "https://x.local/a_disp_1k.jpg" } } } };
    assert.equal(pickPolyhavenFile(files, "texture").url, "https://x.local/a_diff_1k.jpg");
  });
  it("an hdri takes hdr, a model gltf", () => {
    assert.equal(pickPolyhavenFile({ "1k": { hdr: { size: 5, url: "https://x.local/a_1k.hdr" }, exr: { size: 1, url: "https://x.local/a_1k.exr" } } }, "hdri").url, "https://x.local/a_1k.hdr");
    assert.equal(pickPolyhavenFile({ blend: { size: 1, url: "https://x.local/a.blend" }, gltf: { size: 9, url: "https://x.local/a.gltf" } }, "model").url, "https://x.local/a.gltf");
  });
  it("polyhaven has no photo lane (openverse does)", async () => {
    const { polyhavenSearch } = await import("../tools/assets.mjs");
    await assert.rejects(polyhavenSearch("paper", "photo", 1, async () => { throw new Error("must not fetch"); }), /no photos/);
  });
  it("ambient zip url shape and slug shape", () => {
    assert.equal(ambientDownloadUrl("Wood096"), "https://ambientcg.com/get?file=Wood096_1K-JPG.zip");
    assert.equal(slugify("Decrepit Wallpaper!"), "decrepit-wallpaper");
  });
});
