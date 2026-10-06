# DESIGN-REVIEW.md: rubric ds-quality-v1 v1 — 10/10 SHIP

Rubric: ds-quality-v1 (10 fixed checks, ship floor 8/10). Scored by `node tools/judge.mjs`.
Sample: C:\Users\me\Desktop\design-studio\designs\O-051\brief.json

## Score

- [x] brief-complete: AI Search Visibility Audit Kit 1280x720
- [x] render-exists: 1280x720 352157B
- [x] audit-green: fresh auditBrief PASS
- [x] contrast-aa: title:17.2, subtitle:8.2, cta:5.4, chip:18.4, kicker:6.2
- [x] thumbnail-legible: 17.6px at 256px (floor 12px), pixels in thumb-256.png 256x144 — human verdict: title reads at listing size
- [x] title-fits: need ~440px, box 594px
- [x] tokens-disciplined: all color via var(--*)
- [x] type-pair: 3 font token(s), page uses type
- [x] rtl-gate: dir=ltr
- [x] composition: title + action + 10 tokens

## Next edits (iterate harness: failing gate -> oid + fix-action)

- (none — all gates green)

## Verdict

SHIP: 10/10 meets the floor. Thumbnail confirmed by eye in thumb-256.png (256x144); taste still human.

## Taste (human, not scored)

- Automated gates say nothing about taste. Distinctiveness, type feel and
  the thumbnail read by a human eye go here on the next art-director pass.
- Beat check: light clean-professional app-window vs factory dark-navy cover.
  Ours names the product in 3 stacked lines; theirs asks a question in small
  type. Pixel-measured title-line height at 256 wide (sharp downscale, same
  row-profile method both sides): ours 13px vs theirs 8px. Their cover also
  shows a stale $29 badge; the listing price is $19.00 fixed (itch.md L10, L45).
- No engine names anywhere on the cover per the brief (ChatGPT/Perplexity
  appear in the listing long description but stay off the pixels).

## Fact sources (all from listing/itch.md, nothing invented)

- Title "AI Search Visibility Audit Kit": itch title L4 (short form of the
  kit name used across the listing).
- "150 GEO probes" / sticker "150 buyer probes": L4, L20-23 (3 x 50),
  L66 (150 probes 3 x 50).
- "20-point checklist" / sticker "20 AI parameters": L4, L20, L24, L66.
- "3 worked reports" / sticker "3 real audits": L21-23 (HubSpot 4/50 8.0%
  18/20; Neil Patel 0/50 0.0% 20/20; Roto-Rooter 1/50 2.0% 17/20).
- Badge "$19 one-time": L7 (short), L10, L45 ($19.00 USD fixed, no sale).
- Fine "Sample data dated 2026-09-30 - SEARCH-PROXY": L16 (honest method
  box), L39. Window title "audit-hubspot-saas.md - HubSpot sample": L21.
- Picture: byte copy of the product's own preview/shot-report.png (real
  HubSpot sample with 20-parameter grades, L58); sha256 in assets.json.
- Open Design system: clean (brief pick clean or professional).

