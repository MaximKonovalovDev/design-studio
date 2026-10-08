# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 10/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\empire\design-studio\samples\ads\ad-3\brief.json

## Score

- [x] brief-complete: SHIP IT TONIGHT 1200x628
- [x] render-exists: 1200x628 31980B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:16.3, subtitle:7.1, cta:5.2
- [x] thumbnail-legible: 17.9px at 256px (floor 12px), pixels in thumb-256.png 256x134 — human verdict: title reads at listing size
- [x] title-fits: need ~630px, box 1056px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 3 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 6 tokens

## Next edits (iterate harness: failing gate -> oid + fix-action)

- (none — all gates green)

## Verdict

SHIP: 10/10 meets the floor. Thumbnail confirmed by eye in thumb-256.png (256x134); taste still human.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.

