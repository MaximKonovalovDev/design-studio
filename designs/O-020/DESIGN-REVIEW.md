# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 10/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\empire\design-studio\designs\O-020\brief.json

## Score

- [x] brief-complete: AI Search Visibility Audit Kit 1280x720
- [x] render-exists: 1280x720 451974B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:16.3, subtitle:13.0, cta:9.9, chip:13.9, kicker:9.9
- [x] thumbnail-legible: 18.0px at 256px (floor 12px), pixels in thumb-256.png 256x144 — human verdict: title reads at listing size
- [x] title-fits: need ~450px, box 568px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 2 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 12 tokens

## Next edits (iterate harness: failing gate -> oid + fix-action)

- (none — all gates green)

## Verdict

SHIP: 10/10 meets the floor. Thumbnail confirmed by eye in thumb-256.png (256x144); taste still human.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.

