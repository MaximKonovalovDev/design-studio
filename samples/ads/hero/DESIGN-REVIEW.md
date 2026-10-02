# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 9/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\Users\me\Desktop\design-studio\samples\ads\hero\brief.json

## Score

- [x] brief-complete: Ship the landing tonight 1280x720
- [x] render-exists: 1280x720 44934B
- [ ] audit-green: size 1080x1080: title fits its box: need ~1056px, box 907px — next: reflow title_px/box for this size; size 1200x628: title fits its box: need ~1056px, box 1008px — next: reflow title_px/box for this size
- [x] contrast-aa: title:16.3, subtitle:7.1, cta:5.2
- [x] thumbnail-legible: 17.6px at 256px (floor 12px), pixels in thumb-256.png 256x144 — human verdict: title reads at listing size
- [x] title-fits: need ~1056px, box 1075px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 3 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 6 tokens

## Verdict

SHIP: 9/10 meets the floor. Thumbnail confirmed by eye in thumb-256.png (256x144); taste still human.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.

