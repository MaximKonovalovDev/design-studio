# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 9/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\Users\me\Desktop\design-studio\samples\cv\brief.json

## Score

- [x] brief-complete: קורות חיים 900x1270
- [x] render-exists: 900x1270 98813B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:16.3, subtitle:7.1, cta:5.2
- [x] thumbnail-legible: 20.5px at 256px (floor 12px), pixels in thumb-256.png 256x361 — human verdict: title reads at listing size
- [x] title-fits: need ~360px, box 720px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 3 font token(s), page uses type
- [x] rtl-gate: dir=rtl, logical only
- [ ] composition: title:y action:n colors:6 [cover.cta -> retitle: next: carry brief.title + cta action into page.html]

## Next edits (iterate harness: failing gate -> oid + fix-action)

- composition [cover.cta -> retitle]: next: carry brief.title + cta action into page.html

## Verdict

SHIP: 9/10 meets the floor. Thumbnail confirmed by eye in thumb-256.png (256x361); taste still human.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.

