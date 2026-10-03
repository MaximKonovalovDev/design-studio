// tests/image.test.mjs: the OpenRouter key sources of tools/image.mjs (env first, else the first line of
// %USERPROFILE%\.empire\secrets\openrouter.txt then openrouter2.txt), the one-time fallback to the next key
// on 429 or a credit error, the budget gate for paid models, and the known free model ids. No network, no
// spend, never the real key files: every test passes temp files, a missing path or a fake fetch.
import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FREE_VISION_MODELS, KNOWN_FREE_IMAGE_MODELS, buildImageRequest, imageBudget, imageKey, imageKeys, keyExhausted, keyFilePaths, requestImage } from "../tools/image.mjs";

let dir, saved;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ds-image-test-"));
  saved = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  if (saved == null) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = saved;
});

const file = (name, text) => { const f = join(dir, name); writeFileSync(f, text); return f; };

describe("key sources", () => {
  it("reads the trimmed first line of the temp key files in order when env is empty", () => {
    const f1 = file("openrouter.txt", "  fake-test-key-1  \nthis second line is ignored\n");
    const f2 = file("openrouter2.txt", "fake-test-key-2\n");
    assert.deepEqual(imageKeys({ files: [f1, f2] }), ["fake-test-key-1", "fake-test-key-2"]);
    assert.equal(imageKey({ files: [f1, f2] }), "fake-test-key-1");
  });

  it("handles a BOM, CRLF and a UTF-16 file (Notepad and Windows PowerShell saves)", () => {
    const bom = file("bom.txt", "\uFEFFfake-bom-key\r\nignored\r\n");
    const u16 = join(dir, "u16.txt");
    writeFileSync(u16, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from("fake-utf16-key\r\n", "utf16le")]));
    assert.deepEqual(imageKeys({ files: [bom, u16] }), ["fake-bom-key", "fake-utf16-key"]);
  });

  it("env wins, and no file is even read while env is set", () => {
    const f1 = file("openrouter.txt", "fake-file-key\n");
    process.env.OPENROUTER_API_KEY = "  fake-env-key ";
    let reads = 0;
    assert.deepEqual(imageKeys({ files: [f1], read: () => { reads += 1; return Buffer.from("x"); } }), ["fake-env-key"]);
    assert.equal(reads, 0);
  });

  it("a blank env, an empty first file and a duplicate key fall through cleanly", () => {
    process.env.OPENROUTER_API_KEY = "   ";
    const empty = file("openrouter.txt", "\r\n   \r\n");
    const a = file("a.txt", "fake-same-key\n");
    const b = file("b.txt", "fake-same-key\n");
    assert.deepEqual(imageKeys({ files: [empty, a, b] }), ["fake-same-key"]);
  });

  it("no env and missing, empty or blank files fail closed, and the error never holds key text", () => {
    const blank = file("blank.txt", "");
    const empty = file("empty.txt", "\r\n   \r\n");
    assert.throws(() => imageKeys({ files: [join(dir, "nope.txt"), blank, empty] }), (e) => /key missing/.test(e.message) && !/fake/.test(e.message));
  });

  it("the default key files are openrouter.txt then openrouter2.txt under %USERPROFILE%\\.empire\\secrets", () => {
    const home = join("C:\\Users", "someone");
    assert.deepEqual(keyFilePaths(home), [join(home, ".empire", "secrets", "openrouter.txt"), join(home, ".empire", "secrets", "openrouter2.txt")]);
  });
});

// A fake fetch: answers each call from a list of statuses and records the Authorization header.
const fakeFetch = (statuses, seen) => {
  let i = 0;
  return async (_url, init) => {
    seen.push(init.headers.Authorization);
    const status = statuses[Math.min(i++, statuses.length - 1)];
    return { ok: status === 200, status, text: async () => (status === 402 ? "Insufficient credits" : "nope fake-secret-text"), json: async () => ({ data: [{ b64_json: "AAAA" }], usage: { cost: 0 } }) };
  };
};
const free = () => buildImageRequest({ model: KNOWN_FREE_IMAGE_MODELS[0], prompt: "a flat cover layout" });

describe("429 and credit errors try the next key once", () => {
  it("what counts as an exhausted key", () => {
    assert.equal(keyExhausted(429), true);
    assert.equal(keyExhausted(402), true);
    assert.equal(keyExhausted(403, "Key limit exceeded"), true);
    assert.equal(keyExhausted(400, "bad prompt"), false);
    assert.equal(keyExhausted(500, "insufficient credits"), false);
  });

  it("a 429 on key one is retried once on key two", async () => {
    const seen = [];
    const out = await requestImage(free(), { keys: ["fake-k1", "fake-k2"], fetchImpl: fakeFetch([429, 200], seen) });
    assert.deepEqual(seen, ["Bearer fake-k1", "Bearer fake-k2"]);
    assert.equal(out.b64, "AAAA");
    assert.equal(out.model, KNOWN_FREE_IMAGE_MODELS[0]);
  });

  it("a credit error (402) is retried once on key two", async () => {
    const seen = [];
    await requestImage(free(), { keys: ["fake-k1", "fake-k2"], fetchImpl: fakeFetch([402, 200], seen) });
    assert.equal(seen.length, 2);
  });

  it("only one retry, a non-credit error does not retry, and the error holds no key and no response text", async () => {
    const seen = [];
    await assert.rejects(requestImage(free(), { keys: ["fake-k1", "fake-k2", "fake-k3"], fetchImpl: fakeFetch([429], seen) }), (e) => /429 on the second key/.test(e.message) && !/fake/.test(e.message));
    assert.equal(seen.length, 2);
    const one = [];
    await assert.rejects(requestImage(free(), { keys: ["fake-k1", "fake-k2"], fetchImpl: fakeFetch([400], one) }), (e) => /400/.test(e.message) && !/fake/.test(e.message));
    assert.equal(one.length, 1);
  });

  it("an explicit single key is never replaced by another", async () => {
    const seen = [];
    await assert.rejects(requestImage(free(), { key: "fake-only", keys: ["fake-k1", "fake-k2"], fetchImpl: fakeFetch([429], seen) }));
    assert.deepEqual(seen, ["Bearer fake-only"]);
  });
});

describe("budget gate for paid image models", () => {
  const paid = () => buildImageRequest({ model: "bytedance-seed/seedream-4.5", prompt: "x" });

  it("the budget defaults to 0 and junk or negative values are 0", () => {
    assert.equal(imageBudget({}), 0);
    assert.equal(imageBudget({ DS_IMAGE_BUDGET_USD: "abc" }), 0);
    assert.equal(imageBudget({ DS_IMAGE_BUDGET_USD: "-2" }), 0);
    assert.equal(imageBudget({ DS_IMAGE_BUDGET_USD: "1.5" }), 1.5);
  });

  it("a paid model is refused at budget 0 before any call, allowed with a budget", async () => {
    const seen = [];
    await assert.rejects(requestImage(paid(), { keys: ["fake-k1"], fetchImpl: fakeFetch([200], seen), budget: 0 }), /budget is 0/);
    assert.equal(seen.length, 0, "no call was made");
    await requestImage(paid(), { keys: ["fake-k1"], fetchImpl: fakeFetch([200], seen), budget: 2 });
    assert.equal(seen.length, 1);
  });

  it("a model on the live free list passed by the caller runs at budget 0", async () => {
    const live = buildImageRequest({ model: "vendor/new-free-image-model", prompt: "x" });
    await requestImage(live, { keys: ["fake-k1"], fetchImpl: fakeFetch([200], []), budget: 0, freeModels: ["vendor/new-free-image-model"] });
  });
});

describe("model ids (snapshot 2026-10-04, from openrouter-images-2026-10-04.md)", () => {
  it("the two free image ids are exact and build a request that never carries a key", () => {
    assert.deepEqual(KNOWN_FREE_IMAGE_MODELS, ["inclusionai/ming-image-0.1-design", "inclusionai/ming-image-0.1-design-layer"]);
    for (const model of KNOWN_FREE_IMAGE_MODELS) {
      const r = buildImageRequest({ model, prompt: "a flat cover layout", w: 1280, h: 720 });
      assert.equal(r.body.model, model);
      assert.equal(r.body.size, "1280x720");
      assert.equal(r.headers.Authorization, "Bearer <env>");
    }
  });

  it("the free vision ids are exact and ordered", () => {
    assert.deepEqual(FREE_VISION_MODELS, ["qwen/qwen3.8-27b:free", "google/gemma-4-31b-it:free"]);
  });
});
