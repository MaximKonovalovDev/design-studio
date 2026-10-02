// tests/canvas.test.mjs: DS-09 canvas unit tests (no browser needed).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkCanvas, validateScene, exportSvg } from "../tools/canvas.mjs";

describe("canvas", () => {
  it("--check passes (5 templates, Konva shape, 256px, SVG exports match)", () => {
    const { pass, results } = checkCanvas();
    assert.equal(pass, true, results.filter((r) => !r.pass).map((r) => r.name).join("; "));
  });

  it("rejects a title that falls below 12px at 256w", () => {
    const errs = validateScene({
      id: "tiny",
      size: { w: 1280, h: 720 },
      layer: [
        { type: "rect", x: 0, y: 0, w: 1280, h: 720, fill: "var(--paper)" },
        { type: "text", x: 10, y: 10, text: "too small", fontSize: 8, fill: "var(--ink)" },
      ],
    });
    assert.ok(errs.some((e) => e.includes("floor 12px")), `expected 256px floor error, got: ${errs.join("; ")}`);
  });

  it("rejects hardcoded hex fills and unknown tokens", () => {
    const hex = validateScene({
      id: "hex", size: { w: 640, h: 480 },
      layer: [
        { type: "rect", x: 0, y: 0, w: 640, h: 480, fill: "#ff0000" },
        { type: "text", x: 5, y: 5, text: "hi", fontSize: 64, fill: "var(--nope)" },
      ],
    });
    assert.ok(hex.some((e) => e.includes("var(--token)")), "hex fill rejected");
    assert.ok(hex.some((e) => e.includes("unknown token")), "unknown token rejected");
  });

  it("exportSvg resolves palette vars and escapes text", () => {
    const svg = exportSvg({
      id: "t", size: { w: 100, h: 50 },
      layer: [
        { type: "rect", x: 0, y: 0, w: 100, h: 50, fill: "var(--paper)" },
        { type: "text", x: 5, y: 5, text: "a<b", fontSize: 20, fill: "var(--ink)" },
      ],
    });
    assert.ok(svg.startsWith("<svg"), "svg root");
    assert.ok(svg.includes("#faf7f0"), "paper resolved");
    assert.ok(svg.includes("a&lt;b"), "text escaped");
  });

  it("fails closed on a missing export", () => {
    const tmp = mkdtempSync(join(tmpdir(), "ds-canvas-"));
    mkdirSync(join(tmp, "canvas", "templates"), { recursive: true });
    mkdirSync(join(tmp, "canvas", "out"), { recursive: true });
    const scene = {
      id: "solo", size: { w: 640, h: 480 },
      layer: [
        { type: "rect", x: 0, y: 0, w: 640, h: 480, fill: "var(--paper)" },
        { type: "text", x: 10, y: 10, text: "Solo", fontSize: 64, fill: "var(--ink)" },
      ],
    };
    writeFileSync(join(tmp, "canvas", "templates", "solo.json"), JSON.stringify(scene), "utf8");
    const { pass, results } = checkCanvas({ root: tmp });
    assert.equal(pass, false, "1 template (< 5) plus missing export must FAIL");
    assert.ok(results.some((r) => !r.pass), "names a failing gate");
  });
});
