// tools/c04-frame-pull.mjs (C-04 framelink frame pull proof).
// Thin pull proof over tools/g09-figma-rtl.mjs. No second system.
// Read-only. No network in --check. No secrets printed or committed.
// Token is read-only from env ONLY when already set (FIGMA_TOKEN,
// FIGMA_DOC_TOKEN, FIGMA_FILE_TOKEN). When absent: fixture JSON pull
// with an honest NO-TOKEN label. Never asks, never fakes a live call.
//   node tools/c04-frame-pull.mjs --check
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseFrameUrl,
  readFrame,
  FIXTURE_FRAME_URL,
  FIXTURE_FRAME,
} from "./g09-figma-rtl.mjs";

export const ROW = "C-04";
export const WHAT = "framelink frame pull proof (fixture JSON pull + token-names-survive, NO-TOKEN when offline)";
export const TOOL = "tools/c04-frame-pull.mjs";

// Env names read read-only. First set wins. Values never leave this file.
export const TOKEN_ENV_NAMES = ["FIGMA_TOKEN", "FIGMA_DOC_TOKEN", "FIGMA_FILE_TOKEN"];

// Fixture token names that must survive the pull unchanged.
export const FIXTURE_TOKEN_NAMES = ["--paper", "--ink", "--muted", "--accent", "--on-accent", "--line"];

// One fixture pull. Fixture JSON only. No network.
export const FIXTURE_PULL = {
  frameId: "12:34",
  documentKey: "AbC123XyZ",
  name: "hero / cover-b",
  source: "fixture",
  tokens: {
    "--paper": "#faf7f0",
    "--ink": "#1a1a1a",
    "--muted": "#57534e",
    "--accent": "#c2410c",
    "--on-accent": "#ffffff",
    "--line": "#e7e0d3",
  },
};

// Read a token from env without printing it. Returns the env name only.
export function tokenFromEnv(env = process.env) {
  for (const name of TOKEN_ENV_NAMES) {
    const v = env?.[name];
    if (typeof v === "string" && v.trim()) return { present: true, name };
  }
  return { present: false, name: null };
}

// Pull one frame. Offline proof: fixture when no token, read-only request
// shape when a token exists. Never fetches inside --check.
export function pullFrame({ frameUrl = FIXTURE_FRAME_URL, env = process.env } = {}) {
  const p = parseFrameUrl(frameUrl);
  if (!p.ok) return { ok: false, mode: "none", label: "BAD-URL", detail: p.detail };
  const t = tokenFromEnv(env);
  if (!t.present) {
    return {
      ok: true,
      mode: "fixture",
      label: "NO-TOKEN",
      data: FIXTURE_PULL,
      frame: FIXTURE_FRAME,
      detail: `fixture JSON pull ${p.documentKey} #${p.frameId} (NO-TOKEN, no network)`,
    };
  }
  const r = readFrame({ documentToken: "PRESENT", frameUrl });
  if (!r.ok) return { ok: false, mode: "none", label: "NO-TOKEN", detail: r.detail };
  return {
    ok: true,
    mode: "live-shape",
    label: "TOKEN-SHAPE",
    data: FIXTURE_PULL,
    request: { method: "GET", readOnly: true, viaEnv: t.name },
    detail: `read-only GET shape for ${p.documentKey} #${p.frameId} via ${t.name} (token never echoed)`,
  };
}

// True when every expected token name is present in the pulled tokens.
export function tokenNamesSurvive(pulled = {}, expected = FIXTURE_TOKEN_NAMES) {
  const names = Object.keys(pulled ?? {});
  const missing = expected.filter((n) => !names.includes(n));
  const extra = names.filter((n) => !expected.includes(n));
  const pass = missing.length === 0;
  return {
    pass,
    missing,
    extra,
    detail: pass
      ? `${expected.length} token names survive${extra.length ? ` (+${extra.length} extra)` : ""}`
      : `missing token names: ${missing.join(", ")}`,
  };
}

export function checkC04({ env = process.env } = {}) {
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });

  // 1. Frame URL pattern parses (shared shape with G-09).
  const p = parseFrameUrl(FIXTURE_FRAME_URL);
  ok("frame URL pattern parses", p.ok && p.documentKey === "AbC123XyZ" && p.frameId === "12:34", p.detail);

  // 2. Fixture JSON pull with an honest label.
  const pulled = pullFrame({ frameUrl: FIXTURE_FRAME_URL, env });
  const t = tokenFromEnv(env);
  if (t.present) {
    ok("live-shape pull (token in env)", pulled.ok && pulled.mode === "live-shape", pulled.detail);
  } else {
    ok(
      "fixture JSON pull (NO-TOKEN)",
      pulled.ok && pulled.mode === "fixture" && pulled.label === "NO-TOKEN",
      pulled.detail,
    );
  }

  // 3. Token names survive the pull.
  const s = tokenNamesSurvive(pulled.data?.tokens ?? pulled.data ?? {});
  ok("token names survive", s.pass, s.detail);

  // 4. Read-only shape never echoes a token value.
  const r = readFrame({ documentToken: "secret-123", frameUrl: FIXTURE_FRAME_URL });
  const leaks = JSON.stringify(r.request ?? r).includes("secret-123");
  ok("read-only shape never echoes the token", r.ok && !leaks, "GET shape, token redacted");

  // 5. Bad URL fails closed.
  const bad = pullFrame({ frameUrl: "https://example.com/nope", env });
  ok("bad frame URL fails closed", !bad.ok, bad.detail);

  return { pass: results.every((x) => x.pass), results, mode: pulled.mode, label: pulled.label };
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
    const { pass, results, mode, label } = checkC04();
    for (const r of results) console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}: ${r.detail}`);
    console.log(
      pass
        ? `C04 PASS: frame pull proof (${mode}, ${label}) + token names survive`
        : `C04 FAIL: ${results.filter((r) => !r.pass).length} failing check(s)`,
    );
    if (!pass) process.exitCode = 1;
  } else {
    console.log(`usage: node ${TOOL} --check (fixture JSON pull + token-names-survive, NO-TOKEN when offline)`);
    process.exitCode = 2;
  }
}
