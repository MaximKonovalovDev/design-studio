# DESIGN-REVIEW.md: DS-12 factory pilot cover, two variants — 10/10 SHIP each

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Samples: samples/cover/brief.json (variant A, 1280x720) + samples/cover-b/brief.json (variant B, 1080x1080 square-fill).

## Variants

| Variant | Size | Render | Thumb 256px | Title at 256px | Judge |
|---|---|---|---|---|---|
| A (page.html) | 1280x720 | out.png 34186B | thumb-256.png 256x144 5567B | 19.2px (floor 12px) | SHIP 10/10 |
| B (cover-b) | 1080x1080 | out.png 53562B | thumb-256.png 256x256 9753B | 22.8px (floor 12px) | SHIP 10/10 |

Variant B reflows variant A for the square listing slot: same title and
offer, stacked proof bar (256px / 315px / judged), full-bleed accent foot.
Both pass `node tools/audit.mjs` on every gate (contrast 16.3/7.1/5.2,
0 hardcoded colors, title fits its box).

## Score (variant A, re-confirmed this row)

- [x] brief-complete: DESIGN THAT SHIPS 1280x720
- [x] render-exists: 1280x720 34186B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:16.3, subtitle:7.1, cta:5.2
- [x] thumbnail-legible: 19.2px at 256px (floor 12px), pixels in thumb-256.png 256x144 - human verdict: title reads at listing size
- [x] title-fits: need ~816px, box 1075px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 3 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 6 tokens

## Verdict

SHIP: both variants 10/10, thumbnail-readable by eye at 256px (A 256x144,
B 256x256, opened full-size and at listing width); taste still human.
Per-variant machine reviews: samples/cover-b/DESIGN-REVIEW.md.
