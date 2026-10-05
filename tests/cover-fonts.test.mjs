// tests/cover-fonts.test.mjs: the NEED-14 fonts step in tools/cover.mjs
// (fonts <id> + gen <id> --fonts; first use O-037). Reads designs/O-037 and the
// fonts/ shelf; embedFonts()/gen() are byte-stable on an embedded order.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCover, embedFonts, gen, wantedFontFamilies } from "../tools/cover.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const D37 = join(ROOT, "designs", "O-037");

describe("cover --fonts step (NEED-14, first use O-037)", () => {
  it("derives Rubik display at title weight + Inter body 400/700 from O-037 cover.json", () => {
    const spec = JSON.parse(readFileSync(join(D37, "cover.json"), "utf8"));
    const wanted = wantedFontFamilies(spec);
    assert.deepEqual(wanted.map((w) => w.slug).sort(), ["inter", "rubik"]);
    assert.deepEqual(wanted.find((w) => w.slug === "rubik").weights, [700]);
    assert.deepEqual(wanted.find((w) => w.slug === "inter").weights, [400, 700]);
  });
  it("O-037 assets/fonts/ woff2 bytes exist and tokens.css @font-face points at each (swap, relative)", () => {
    for (const f of ["rubik-latin-700-normal.woff2", "inter-latin-400-normal.woff2", "inter-latin-700-normal.woff2"]) {
      assert.ok(existsSync(join(D37, "assets", "fonts", f)), f);
    }
    const css = readFileSync(join(D37, "tokens.css"), "utf8");
    assert.ok(css.includes("Embedded OFL fonts (tools/cover.mjs fonts"), "marker");
    for (const f of ["rubik-latin-700-normal.woff2", "inter-latin-400-normal.woff2", "inter-latin-700-normal.woff2"]) {
      assert.ok(css.includes(`url(assets/fonts/${f})`), f);
    }
    const faces = css.match(/@font-face \{[^}]*\}/g) ?? [];
    assert.equal(faces.length, 3);
    assert.ok(faces.every((b) => /font-display:\s*swap/.test(b)), "swap");
  });
  it("embedFonts(O-037) is byte-stable: nothing copied, faces kept, tokens.css untouched", () => {
    const before = readFileSync(join(D37, "tokens.css"), "utf8");
    const r = embedFonts("O-037");
    assert.equal(r.copied, 0);
    assert.deepEqual(r.files, ["inter-latin-400-normal.woff2", "inter-latin-700-normal.woff2", "rubik-latin-700-normal.woff2"]);
    assert.equal(r.faces, 3);
    assert.equal(readFileSync(join(D37, "tokens.css"), "utf8"), before);
  });
  it("gen(O-037) without --fonts keeps the faces block (never wipes it)", () => {
    const before = readFileSync(join(D37, "tokens.css"), "utf8");
    gen("O-037");
    const after = readFileSync(join(D37, "tokens.css"), "utf8");
    assert.equal(after, before);
    assert.ok(after.includes("@font-face "), "faces survive gen");
  });
  it("cover --check passes", () => {
    assert.equal(checkCover().pass, true);
  });
});
