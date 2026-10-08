# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 10/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\empire\design-studio\samples\story\brief.json

## Score

- [x] brief-complete: DESIGN THAT SHIPS 1080x1920
- [x] render-exists: 1080x1920 69685B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:16.3, subtitle:7.1, cta:5.2
- [x] thumbnail-legible: 23.7px at 256px (floor 12px)
- [x] title-fits: need ~850px, box 907px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 3 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 6 tokens

## Verdict

SHIP: 10/10 meets the floor. A human eye still confirms thumbnail and taste.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.

