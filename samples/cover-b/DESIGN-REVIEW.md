# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 10/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\empire\design-studio\samples\cover-b\brief.json

## Score

- [x] brief-complete: DESIGN THAT SHIPS 1080x1080
- [x] render-exists: 1080x1080 53562B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:16.3, subtitle:7.1, cta:5.2
- [x] thumbnail-legible: 22.8px at 256px (floor 12px), pixels in thumb-256.png 256x256 — human verdict: title reads at listing size
- [x] title-fits: need ~816px, box 907px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 3 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 6 tokens

## Next edits (iterate harness: failing gate -> oid + fix-action)

- (none — all gates green)

## Verdict

SHIP: 10/10 meets the floor. Thumbnail confirmed by eye in thumb-256.png (256x256); taste still human.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.

## Two-variant review (cover vs cover-b)

Pilot cover duel, variant A = samples/cover (1280x720 landscape),
variant B = samples/cover-b (1080x1080 square). Measured 2026-10-03,
`node tools/judge.mjs` + `node tools/audit.mjs` + `node tools/check.mjs`.

- variant cover: judge SHIP 10/10 ds-quality-v1; audit AUDIT PASS
  (title 96px -> 19.2px at 256px, 23.6px at 315px listing, floor 12px;
  title-fits need ~816px in box 1075px); out.png 1280x720 34186B;
  thumb-256.png 256x144 5567B, legible by eye.
- variant cover-b: judge SHIP 10/10 ds-quality-v1; audit AUDIT PASS
  (title 96px -> 22.8px at 256px, 28.0px at 315px listing, floor 12px;
  title-fits need ~816px in box 907px); out.png 1080x1080 53562B;
  thumb-256.png 256x256 9753B, legible by eye.
- check.mjs winner line: "cover-b by audit + 256px
  (cover audit=PASS 5567B 19.2px vs cover-b audit=PASS 9753B 22.8px)".

Winner: cover-b by audit + 256px — both audits PASS and both judges
SHIP 10/10, cover-b leads thumbnail legibility 22.8px vs 19.2px at
256px (+3.6px) with the larger 256x256 9753B thumb vs 256x144 5567B.

