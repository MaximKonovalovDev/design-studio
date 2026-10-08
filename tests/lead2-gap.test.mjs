// tests/lead2-gap.test.mjs: gap cover for tools/agent-shot.mjs
// (most-changed untested source: 2 changes/30d, 0 test refs). Pins current
// correct output of the exported pure functions. No browser needed.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  HARNESS_ID,
  DONOR,
  DEFAULT_ITERS,
  CODE_OMITTED,
  FIX_REQUEST_PREFIX,
  diffShots,
  seedShell,
  refineStep,
  optimizeMessagesForTokens,
  resolveBlockPath,
  extractAllCodeBlocks,
  buildFixPayload,
  createFixLedger,
} from "../tools/agent-shot.mjs";

// Minimal valid PNG: 8-byte magic + filler, w/h as big-endian uint32 at 16/20.
const png = (w, h, extra = 0) => {
  const buf = Buffer.alloc(24 + extra, 7);
  buf.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  buf.writeUInt32BE(w, 16);
  buf.writeUInt32BE(h, 20);
  return buf;
};

describe("agent-shot constants (MIT harness-only contract)", () => {
  it("harness id, donor, iters and markers are pinned", () => {
    assert.equal(HARNESS_ID, "ds-agent-shot-v1");
    assert.equal(DEFAULT_ITERS, 3);
    assert.match(DONOR, /MIT/);
    assert.match(DONOR, /no code copied/i);
    assert.equal(CODE_OMITTED, "[code omitted]");
    assert.ok(FIX_REQUEST_PREFIX.startsWith("The code is not working"));
  });
});

describe("diffShots (byte-level shot diff, no browser)", () => {
  it("identical buffers score 1.0 with matching dims", () => {
    const a = png(10, 20);
    const d = diffShots(a, Buffer.from(a));
    assert.equal(d.dimsMatch, true);
    assert.equal(d.byteDelta, 0);
    assert.equal(d.score, 1);
    assert.deepEqual(d.a, { w: 10, h: 20 });
    assert.deepEqual(d.b, { w: 10, h: 20 });
  });
  it("same dims but different byte length give a proportional score", () => {
    const d = diffShots(png(10, 20), png(10, 20, 6));
    assert.equal(d.dimsMatch, true);
    assert.equal(d.byteDelta, 0.2);
    assert.equal(d.score, 0.8);
  });
  it("different dims score 0", () => {
    const d = diffShots(png(10, 20), png(30, 40));
    assert.equal(d.dimsMatch, false);
    assert.equal(d.score, 0);
  });
});

describe("seedShell (iteration-0 minimal shell)", () => {
  it("carries the title and dir, defaults to UNTITLED/ltr", () => {
    const rtl = seedShell({ title: "HELLO", dir: "rtl" });
    assert.ok(rtl.includes("<html dir=\"rtl\">"));
    assert.ok(rtl.includes("<h1>HELLO</h1>"));
    const def = seedShell();
    assert.ok(def.includes("<html dir=\"ltr\">"));
    assert.ok(def.includes("<h1>UNTITLED</h1>"));
    assert.ok(seedShell({}).includes("<h1>UNTITLED</h1>"));
  });
});

describe("resolveBlockPath (fence path merge)", () => {
  it("header path wins, then next-line path, then fallback, extension defaulted", () => {
    assert.equal(resolveBlockPath("tsx{path=src/App.tsx}"), "src/App.tsx");
    assert.equal(resolveBlockPath("tsx", "{path=src/Hero.tsx}"), "src/Hero.tsx");
    assert.equal(resolveBlockPath("filename=src/main.ts"), "src/main.ts");
    assert.equal(resolveBlockPath(), "component.tsx");
    assert.equal(resolveBlockPath("tsx", "", "plain"), "plain.tsx");
  });
});

describe("extractAllCodeBlocks (every fence lands at one unique path)", () => {
  it("header-path + next-line-path + unnamed fences land at 3 unique paths", () => {
    const fences = "```tsx{path=src/App.tsx}\nx\n```\n```tsx\n{path=src/Hero.tsx}\ny\n```\n```tsx\nz\n```";
    const blocks = extractAllCodeBlocks(fences);
    assert.equal(blocks.length, 3);
    assert.deepEqual(blocks.map((b) => b.path), ["src/App.tsx", "src/Hero.tsx", "component-3.tsx"]);
    assert.deepEqual(blocks.map((b) => b.lang), ["tsx", "tsx", "tsx"]);
    assert.deepEqual(blocks.map((b) => b.code), ["x\n", "y\n", "z\n"]);
  });
  it("duplicate paths dedupe with a -2 suffix", () => {
    const blocks = extractAllCodeBlocks("```tsx{path=a.tsx}\n1\n```\n```tsx{path=a.tsx}\n2\n```");
    assert.deepEqual(blocks.map((b) => b.path), ["a.tsx", "a-2.tsx"]);
    assert.equal(blocks[1].code, "2\n");
  });
});

describe("optimizeMessagesForTokens (strip-old-code)", () => {
  const mkMsg = (code) => ({ role: "assistant", content: `fix it\n\`\`\`tsx{path=src/App.tsx}\n${code}\n\`\`\`` });
  it("strips old assistant fences but keeps the last two verbatim", () => {
    const hist = [mkMsg("A".repeat(400)), mkMsg("B".repeat(400)), mkMsg("C".repeat(400)), mkMsg("D".repeat(400)), mkMsg("E".repeat(400))];
    const stripped = optimizeMessagesForTokens(hist, 2);
    assert.equal(stripped.length, 5);
    assert.ok(stripped[0].content.includes(CODE_OMITTED));
    assert.ok(!stripped[0].content.includes("AAAA"));
    assert.ok(stripped[2].content.includes(CODE_OMITTED));
    assert.equal(stripped[3], hist[3]);
    assert.equal(stripped[4], hist[4]);
    assert.ok(stripped[4].content.includes("E".repeat(10)));
  });
  it("caps history at 10 and passes user messages through untouched", () => {
    const user = { role: "user", content: "```evil```" };
    assert.equal(optimizeMessagesForTokens([user])[0], user);
    const many = Array.from({ length: 12 }, (_, i) => mkMsg(`M${i}-`.repeat(100)));
    const kept = optimizeMessagesForTokens(many, 2);
    assert.equal(kept.length, 10);
    assert.equal(kept[9], many[11]);
  });
});

describe("buildFixPayload (fix-once-per-render enriched payload)", () => {
  it("plain payload lists prior warnings plus the fatal error", () => {
    assert.equal(
      buildFixPayload("boom", ["warn 1"]),
      `${FIX_REQUEST_PREFIX}\n- warn 1\n- boom`
    );
  });
  it("missing-import and pathless kinds carry their rewrite directives", () => {
    const rewrite = buildFixPayload("missing module three", [], "missing-import");
    assert.ok(rewrite.includes("Rewrite the app without these imports"));
    const pathless = buildFixPayload("boom", [], "pathless");
    assert.ok(pathless.includes("{path=}"));
  });
});

describe("createFixLedger (one fix per broken render)", () => {
  it("double-fire records once, hangs/pending/fix-requests never retry", () => {
    const ledger = createFixLedger();
    const key = "diff0.5|title-missing";
    assert.equal(ledger.shouldAllowFix(key), true);
    ledger.recordFix(key, buildFixPayload("boom", ["warn 1"]));
    assert.equal(ledger.shouldAllowFix(key), false);
    assert.equal(ledger.size, 1);
    assert.equal(ledger.shouldAllowFix("other"), true);
    assert.equal(ledger.shouldAllowFix("hang|stub", { hang: true }), false);
    assert.equal(ledger.shouldAllowFix("p|q", { pending: true }), false);
    assert.equal(ledger.shouldAllowFix(key, { isFixRequest: true }), false);
  });
});

describe("refineStep (reference files copied over the work dir)", () => {
  it("copies the reference tokens and page, reporting what changed", () => {
    const ref = mkdtempSync(join(tmpdir(), "lead2-gap-ref-"));
    const work = mkdtempSync(join(tmpdir(), "lead2-gap-work-"));
    writeFileSync(join(ref, "tokens.css"), ":root{--x:1}", "utf8");
    writeFileSync(join(ref, "page.html"), "<html>ref</html>", "utf8");
    const changed = refineStep(ref, work, { tokens: "tokens.css", page: "page.html" });
    assert.deepEqual(changed, ["tokens.css", "page.html"]);
    assert.equal(readFileSync(join(work, "tokens.css"), "utf8"), ":root{--x:1}");
    assert.equal(readFileSync(join(work, "page.html"), "utf8"), "<html>ref</html>");
  });
  it("skips missing reference files without throwing", () => {
    const ref = mkdtempSync(join(tmpdir(), "lead2-gap-ref2-"));
    const work = mkdtempSync(join(tmpdir(), "lead2-gap-work2-"));
    writeFileSync(join(ref, "tokens.css"), ":root{}", "utf8");
    assert.deepEqual(refineStep(ref, work, { tokens: "tokens.css", page: "nope.html" }), ["tokens.css"]);
    assert.deepEqual(refineStep(ref, work), ["tokens.css"]);
  });
});
