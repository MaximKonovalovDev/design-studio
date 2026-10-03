---
name: od-wcag-audit
description: Audit a sample page against WCAG 2.2 AA (POUR + keyboard + ARIA) and fix violations before the judge PASS. Use for any page.html or CV before delivery.
---

# WCAG Audit

Gate every `samples/<name>/page.html` (and `designs/<order_id>/page.html`)
on WCAG 2.2 Level AA before it goes to the judge. `tools/audit.mjs`
checks contrast; this skill covers everything it cannot: keyboard,
semantics, ARIA, forms, language, headings.

## Procedure

1. Render first: `node tools/render.mjs samples/<name>` so you audit what
   ships, then open `out.png` (unopened is unverified).
2. Run `node tools/audit.mjs samples/<name>` and fix its findings first.
3. Walk the manual checklist below against `page.html` source.
4. Fix, re-render, re-audit. Log remaining non-AA-issues in
   `DESIGN-REVIEW.md`; AA blockers must be zero at handoff.

## Checklist (AA bar)

- **Language**: `<html lang>` set (`he` + `dir="rtl"` for Hebrew CVs).
- **Title**: exactly one descriptive `<title>`; one `h1`; no skipped levels.
- **Landmarks**: `header`, `main`, `footer` (or `role=` equivalents); skip link
  as first focusable element.
- **Keyboard**: every control reachable by Tab in a sensible order; visible
  `:focus-visible` outline (never `outline: none` without a replacement);
  no keyboard traps; custom widgets operable with arrows/Enter/Escape.
- **Images**: functional images have `alt`; decorative ones `alt=""`.
- **Forms**: every input has an associated `<label>`; errors identified in
  text next to the field, not by color alone.
- **Color**: nothing conveyed by color alone (underlines, icons, labels too);
  contrast left to `tools/audit.mjs`, which must pass.
- **ARIA**: native HTML first (`button`, `nav`, `dialog`); ARIA only to fill
  gaps; `aria-*` states match the visible state; live regions for dynamic
  feedback.
- **Zoom/reflow**: usable at 200% zoom and 320px width; no clipped controls.
- **Motion**: `prefers-reduced-motion` disables non-essential animation.
- **Media**: no autoplay with sound; captions or transcripts where media ships.

## Severity order

Fix Critical first (no keyboard access, missing labels, missing alt on
functional images, autoplay without controls), then Serious (contrast,
skip link, widgets, title), then Moderate (lang, link text, landmarks,
heading order). A Critical finding fails the sample regardless of score.

## Proof

`node tools/audit.mjs samples/<name>` passes and DESIGN-REVIEW.md lists
the checklist result (AA blockers: 0). Full suite: `node tools/check.mjs`.

Source: https://github.com/wshobson/agents/tree/main/plugins/accessibility-compliance/skills/wcag-audit-patterns (MIT, fetched 2026-10-03)
