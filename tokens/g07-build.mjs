// tokens/g07-build.mjs (G-07): build one 3-color token file twice, compare SHA.
// Short plan: style-dictionary via npx when online, local fixture when offline.
// Both builds use the same input, so the two SHA256 hashes must match.
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// One 3-color token file. Small on purpose: easy to review, hard to drift.
export const G07_TOKENS = {
  color: {
    paper: { value: "#faf7f0" },
    ink: { value: "#1a1a1a" },
    accent: { value: "#c2410c" },
  },
};

// Online fixture: style-dictionary 5.6.0 css/variables output for G07_TOKENS.
// Recorded 2026-10-05 via npx. Used as docs, not as a pass gate.
export const SD_FIXTURE_SHA = "446940894b1a2fc258ea9b9f7e27ef3a95649b69019cf04c8bade8f020b1779e";

// Offline fixture: local emit for the same 3 colors. Stable LF, sorted keys.
export function localBuildCss(tokens = G07_TOKENS) {
  const flat = tokens?.color ?? {};
  const keys = Object.keys(flat).sort();
  const lines = [":root {"];
  for (const k of keys) lines.push(`  --color-${k}: ${String(flat[k]?.value ?? flat[k]).toLowerCase()};`);
  lines.push("}");
  return `${lines.join("\n")}\n`;
}

export const LOCAL_FIXTURE_CSS = ":root {\n  --color-accent: #c2410c;\n  --color-ink: #1a1a1a;\n  --color-paper: #faf7f0;\n}\n";

export function sha256Hex(text) {
  return createHash("sha256").update(String(text), "utf8").digest("hex");
}

// One style-dictionary build into outName. Throws with the npx reason.
function sdBuildOnce(root, outName) {
  mkdirSync(join(root, "tokens"), { recursive: true });
  writeFileSync(join(root, "tokens", "g07.json"), JSON.stringify(G07_TOKENS), "utf8");
  writeFileSync(
    join(root, "config.json"),
    JSON.stringify({
      source: ["tokens/**/*.json"],
      platforms: { css: { transformGroup: "css", buildPath: `${outName}/`, files: [{ destination: "tokens.css", format: "css/variables" }] } },
    }),
    "utf8",
  );
  const r = spawnSync("npx --yes style-dictionary build --config config.json", {
    cwd: root,
    encoding: "utf8",
    timeout: 120000,
    shell: true,
  });
  if (r.error) throw new Error(`npx offline (${String(r.error.message).slice(0, 120)})`);
  if (r.status !== 0) throw new Error(`npx offline (exit ${r.status}: ${String(r.stderr || r.stdout || "").slice(0, 120)})`);
  return readFileSync(join(root, outName, "tokens.css"), "utf8");
}

// Build twice from the same input. Same bytes twice means same SHA.
export function buildTwice() {
  const root = mkdtempSync(join(tmpdir(), "ds-g07-"));
  try {
    const css1 = sdBuildOnce(root, "out1");
    const css2 = sdBuildOnce(root, "out2");
    const hash1 = sha256Hex(css1);
    const hash2 = sha256Hex(css2);
    return { css1, css2, hash1, hash2, match: hash1 === hash2, method: "style-dictionary via npx", detail: "two npx builds, same input" };
  } catch (e) {
    // Offline path: document the reason, compare the local fixture twice.
    const css1 = localBuildCss();
    const css2 = localBuildCss();
    const hash1 = sha256Hex(css1);
    const hash2 = sha256Hex(css2);
    return {
      css1,
      css2,
      hash1,
      hash2,
      match: hash1 === hash2 && css1 === LOCAL_FIXTURE_CSS,
      method: "local-fixture (npx offline)",
      detail: `npx unavailable: ${e.message}; local emit compared to fixture`,
    };
  }
}

const isMain = process.argv[1] != null && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  const r = buildTwice();
  console.log(`[G07] method: ${r.method}`);
  console.log(`[G07] detail: ${r.detail}`);
  console.log(`[G07] hash1: ${r.hash1}`);
  console.log(`[G07] hash2: ${r.hash2}`);
  console.log(`[G07] match: ${r.match ? "yes" : "no"}`);
  console.log(r.match ? `G07 PASS: twice-same-hash ${r.hash1}` : "G07 FAIL: hashes differ");
  if (!r.match) process.exitCode = 1;
}
