# DESIGN-REVIEW.md: samples/cover (DS-01, 2026-10-02)

Contract: brief.json -> tokens.css + page.html -> out.png + design-audit.json.
This file is the art-director note beside the sample.

## Inspected

- `samples/cover/brief.json` (title DESIGN THAT SHIPS, 1280x720, ltr, 3 swatches)
- `samples/cover/tokens.css` (5 color vars, 2 font stacks, system fonts only)
- `samples/cover/page.html` (hero, color only via var(--*), no hardcoded hex)
- `samples/cover/out.png` (Edge headless screenshot at 1280x720)
- `samples/cover/design-audit.json` (audit output, all gates green)

## Results (2026-10-02, `node tools/check.mjs` RESULT PASS)

- Render: exact 1280x720 PNG, well above the trivial-size floor.
- Contrast: title, subtitle and CTA swatches all clear 4.5:1 (CTA white on
  accent about 5.2:1, title ink on paper far above).
- Thumbnail: 96px title scales to about 19px at 256px wide, above the 12px floor.
- Overflow: 17-char title at 96px needs about 816px, box holds about 1075px.
- RTL: ltr brief, html dir matches, gate PASS.

## Changes

- None this round: first render passed every gate.

## Taste (honest, not automated)

- Automated gates say nothing about taste. The hero is deliberately plain:
  paper field, one accent rule, one CTA. Distinctiveness, type pairing quality
  and the thumbnail read by a human eye are DS-06 (rubric judge) work, not
  claimed here.
