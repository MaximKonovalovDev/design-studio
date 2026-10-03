---
name: od-ux-critique
description: Critique a rendered sample like a frustrated first-time user: spacing, alignment, flows, states, and fix list. Use before the judge or pilot review.
---

# UX Critique

Play the frustrated first-time user against the rendered PNG, not the
source. Catches what `tools/judge.mjs` scores but does not explain:
rhythm, spacing, dead ends, confusing states. Run after render, before
the judge PASS.

## Procedure

1. `node tools/render.mjs samples/<name>` and open `out.png` at full size
   plus `thumb-256.png` (thumbnail-readable is a ship floor).
2. Walk sections 1-4 below; file every defect as
   `file:line — severity — fix` in `DESIGN-REVIEW.md`.
3. Fix Critical/Major, re-render, repeat until none remain.

## 1. Spacing and alignment

- One spacing scale only (e.g. 4/8/16/24/32); no off-scale gaps.
- No orphaned whitespace: sections breathe evenly, nothing floats.
- Baseline alignment: text in adjacent columns shares a top edge.
- Tap targets >= 44px with >= 8px separation on game-UI and mobile sizes.

## 2. Hierarchy and typography

- One reading path: headline first, then subhead, then body, then CTA.
- Max two families, three sizes per view; no clashes (serif
  headline + neutral body, or single family with weight contrast).
- Line length 45-75 characters for body; Hebrew RTL keeps the same path
  mirrored (`dir="rtl"`, punctuation at the correct edge).

## 3. Flows, states, dead ends

- Every button and link answers: what happens next? No dead controls.
- Empty, loading, error, and success states exist where data can vary.
- Forms: labels visible, errors inline, progress shown on multi-step.
- Navigation never loops back on itself; a lost user finds home in one tap.

## 4. Consistency and brand

- Tokens come from `tokens.css` / `kits/` only, never one-off hex codes;
  check with `node tools/tokens.mjs`.
- Same component looks the same everywhere in the sample.
- Brand voice matches the brief (playful cover vs formal CV).

## Severity

- Critical: blocks the task (dead CTA, unreadable text, broken layout).
- Major: confuses or slows (uneven rhythm, unclear next step).
- Minor: polish (1px drift, slightly loose tracking).

## Proof

`DESIGN-REVIEW.md` lists defects found and fixed; `node tools/audit.mjs
samples/<name>` passes; full suite `node tools/check.mjs`.

Source: https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/categories/04-quality-security/ui-ux-tester.md (MIT, fetched 2026-10-03)
