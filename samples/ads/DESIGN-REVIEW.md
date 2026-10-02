# DESIGN-REVIEW.md: DS-14 marketing-studio ad set — 3 creatives + 1 landing hero

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Set: samples/ads/{ad-1,ad-2,ad-3,hero}. Harness: convert/variants + convert/plan.json (DS-17).

## Set

| Piece | Size | Render | Thumb 256px | Title at 256px | Judge |
|---|---|---|---|---|---|
| ad-1 control (DESIGN THAT SELLS) | 1080x1080 | out.png 51337B | thumb-256.png 256x256 9334B | 22.8px | SHIP 10/10 |
| ad-2 challenger (THUMBNAIL-FIRST ADS) | 1080x1080 | out.png 54744B | thumb-256.png 256x256 9513B | 22.8px | SHIP 10/10 |
| ad-3 wide (SHIP IT TONIGHT) | 1200x628 | out.png 31980B | thumb-256.png 256x134 5191B | 17.9px | SHIP 10/10 |
| hero (Ship the landing tonight) | 1280x720 | out.png 44934B | thumb-256.png 256x144 6883B | 17.6px | SHIP 10/10 |

Wiring: ad-1 carries the convert-A control headline family, ad-2 the
convert-B proof-led challenger family; the hero composes registry blocks
hero (templates/blocks/hero.html) + cta (templates/blocks/cta.html),
carries the convert-A headline verbatim plus plan selectors h1/.sub/.cta
with a single primary action, so the DS-17 click plan runs unchanged
(`node tools/convert.mjs --check` green, unmodified).

## Verdict

SHIP: all four pieces 10/10, each audit-green (contrast 16.3/7.1/5.2,
0 hardcoded colors, title fits its box, legible at 256px by eye in each
thumb-256.png); taste still human. Per-piece machine reviews beside each brief.
Wire-up into `node tools/check.mjs` (adding samples/ads to its suite) is left
to the check.mjs owner (020); this row adds the pixels, not the gate edit.
