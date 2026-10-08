# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 10/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\empire\design-studio\samples\cover\brief.json

## Score

- [x] brief-complete: DESIGN THAT SHIPS 1280x720
- [x] render-exists: 1280x720 34186B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:16.3, subtitle:7.1, cta:5.2
- [x] thumbnail-legible: 19.2px at 256px (floor 12px), pixels in thumb-256.png 256x144 — human verdict: title reads at listing size
- [x] title-fits: need ~816px, box 1075px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 3 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 6 tokens

## Next edits (iterate harness: failing gate -> oid + fix-action)

- (none — all gates green)

## Verdict

SHIP: 10/10 meets the floor. Thumbnail confirmed by eye in thumb-256.png (256x144); taste still human.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.

## Two-variant duel (cover vs cover-b)

Duel pointer — full numbers live in samples/cover-b/DESIGN-REVIEW.md.
variant cover: judge SHIP 10/10, audit AUDIT PASS, 19.2px at 256px,
thumb-256.png 256x144 5567B, out.png 1280x720 34186B. variant cover-b:
judge SHIP 10/10, audit AUDIT PASS, 22.8px at 256px, thumb-256.png
256x256 9753B, out.png 1080x1080 53562B. Winner: cover-b by audit +
256px (22.8px vs 19.2px).

