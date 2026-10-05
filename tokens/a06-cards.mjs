// tokens/a06-cards.mjs (A-06): 3 card renders from token JSON plus restyle proof.
// Short plan: one token file drives all cards. No hex in markup, only
// var(--*) refs. Change one token and all 3 cards shift. Parts follow the
// shadcn parts-box pattern: small composable parts, not one big block.
// Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
import { createHash } from "node:crypto";

// One token file. Small on purpose: easy to review, hard to drift.
// Same 3 colors as G-07 so the two token files stay in sync, plus one
// shape token (radius) and one surface token (line) for card edges.
export const A06_TOKENS = {
  color: {
    paper: { value: "#faf7f0" },
    ink: { value: "#1a1a1a" },
    accent: { value: "#c2410c" },
    line: { value: "#e7e0d3" },
  },
  radius: {
    card: { value: "12px" },
  },
};

// Flat CSS vars for the tokens. Stable LF, sorted keys.
export function cardCss(tokens = A06_TOKENS) {
  const lines = [":root {"];
  for (const k of Object.keys(tokens?.color ?? {}).sort()) {
    lines.push(`  --color-${k}: ${String(tokens.color[k]?.value ?? tokens.color[k]).toLowerCase()};`);
  }
  for (const k of Object.keys(tokens?.radius ?? {}).sort()) {
    lines.push(`  --radius-${k}: ${String(tokens.radius[k]?.value ?? tokens.radius[k]).toLowerCase()};`);
  }
  lines.push("}");
  return `${lines.join("\n")}\n`;
}

// Parts-box parts. Each part takes only tokens via var(--*), never hex.
export function CardHeader(title, desc) {
  return `<div class="card-header"><h3 class="card-title" style="color:var(--color-ink)">${title}</h3><p class="card-desc" style="color:var(--color-ink)">${desc}</p></div>`;
}

export function CardContent(inner) {
  return `<div class="card-content" style="color:var(--color-ink)">${inner}</div>`;
}

export function CardFooter(inner) {
  return `<div class="card-footer" style="border-color:var(--color-line)">${inner}</div>`;
}

function shell(kind, inner, radiusRef = "var(--radius-card)") {
  return `<article class="card card-${kind}" style="background:var(--color-paper);color:var(--color-ink);border:1px solid var(--color-line);border-radius:${radiusRef}">${inner}</article>`;
}

// Card 1: summary. Accent appears as the top bar.
export function renderSummary(tokens = A06_TOKENS) {
  void tokens;
  const bar = `<div class="card-accent-bar" style="background:var(--color-accent)"></div>`;
  return shell("summary", `${bar}${CardHeader("Summary", "One line on what changed")}${CardContent("Paper holds the text. Ink holds the words.")}${CardFooter("Footer note")}`);
}

// Card 2: proof. Accent appears as the big proof number.
export function renderProof(tokens = A06_TOKENS) {
  void tokens;
  const num = `<p class="card-proof-num" style="color:var(--color-accent)">98%</p>`;
  return shell("proof", `${CardHeader("Proof", "One number a human can check")}${CardContent(num)}${CardFooter("Measured, not claimed")}`);
}

// Card 3: call to action. Accent appears as the button fill.
export function renderCta(tokens = A06_TOKENS) {
  void tokens;
  const btn = `<a class="card-btn" href="#" style="background:var(--color-accent);color:var(--color-paper)">Open the page</a>`;
  return shell("cta", `${CardHeader("Next step", "One clear action")}${CardContent("One button. One link. Nothing else.")}${CardFooter(btn)}`);
}

// All 3 cards at once. Order is fixed so the proof can compare by index.
export function renderAll(tokens = A06_TOKENS) {
  return [renderSummary(tokens), renderProof(tokens), renderCta(tokens)];
}

// One token change applied on top of a base file. Deep merge, one level.
export function restyle(base = A06_TOKENS, patch = {}) {
  const out = JSON.parse(JSON.stringify(base));
  for (const group of Object.keys(patch)) {
    out[group] = out[group] ?? {};
    for (const key of Object.keys(patch[group] ?? {})) {
      out[group][key] = patch[group][key];
    }
  }
  return out;
}

// Restyle proof: change one token (accent), render all 3 before and after.
// Cards hold no hex, only var(--*) refs, so card HTML stays byte-same by
// design. The shift travels through CSS: pass means the CSS value changed,
// every card refs the changed token, and each card's full page (css + card)
// hash moves. That is the restyle proof: one token, all 3 cards shift.
export function shiftProof(before = A06_TOKENS, after = restyle(before, { color: { accent: { value: "#1d4ed8" } } })) {
  const beforeCards = renderAll(before);
  const afterCards = renderAll(after);
  const cssBefore = cardCss(before);
  const cssAfter = cardCss(after);
  const cssShifted = cssBefore !== cssAfter;
  // Each card binds the changed token, so each card shifts with the CSS.
  const bound = beforeCards.map((html) => html.includes("var(--color-accent)"));
  const moved = beforeCards.map((html, i) => {
    const h1 = createHash("sha256").update(cssBefore + html, "utf8").digest("hex");
    const h2 = createHash("sha256").update(cssAfter + afterCards[i], "utf8").digest("hex");
    return h1 !== h2;
  });
  const changed = bound.map((b, i) => b && moved[i]);
  const pass = cssShifted && changed.every(Boolean);
  return { beforeCards, afterCards, cssBefore, cssAfter, changed, moved, pass };
}

const isMain = process.argv[1] != null && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  const r = shiftProof();
  console.log(`[A06] cards: ${r.beforeCards.length}`);
  console.log(`[A06] changed: ${r.changed.join(",")}`);
  console.log(`[A06] moved: ${r.moved.join(",")}`);
  console.log(r.pass ? "A06 PASS: one token shifts all 3 cards" : "A06 FAIL: a card did not shift");
  if (!r.pass) process.exitCode = 1;
}
