# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 10/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\empire\design-studio\designs\factory-gumroad-cover\brief.json

## Score

- [x] brief-complete: 10 BLOCKS THAT SELL 1280x720
- [x] render-exists: 1280x720 48627B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:16.3, subtitle:7.1, cta:5.5
- [x] thumbnail-legible: 19.2px at 256px (floor 12px)
- [x] title-fits: need ~912px, box 1126px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 3 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 6 tokens

## Next edits (iterate harness: failing gate -> oid + fix-action)

- (none — all gates green)

## Verdict

SHIP: 10/10 meets the floor. A human eye still confirms thumbnail and taste.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.

