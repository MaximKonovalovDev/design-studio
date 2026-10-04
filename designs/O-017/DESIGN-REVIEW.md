# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 10/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\Users\me\Desktop\design-studio\designs\O-017\brief.json

## Score

- [x] brief-complete: PDF Tables to Excel 1280x720
- [x] render-exists: 1280x720 254913B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:14.6, subtitle:8.4, cta:6.2, chip:15.3, kicker:5.9, pill-high:5.0, pill-med:8.0, pill-low:5.6
- [x] thumbnail-legible: 20.8px at 256px (floor 12px), pixels in thumb-256.png 256x144 — human verdict: title reads at listing size
- [x] title-fits: need ~520px, box 594px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 2 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 15 tokens

## Next edits (iterate harness: failing gate -> oid + fix-action)

- (none — all gates green)

## Verdict

SHIP: 10/10 meets the floor. Thumbnail confirmed by eye in thumb-256.png (256x144); taste still human.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.

