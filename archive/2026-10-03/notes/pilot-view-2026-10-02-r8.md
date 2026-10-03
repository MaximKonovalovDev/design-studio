# pilot-view 2026-10-02 r8 (clean-start stranger run, round-8 builds)

Ran the README quickstart literally: opened `samples/cover/brief.json`, ran
`node tools/check.mjs`, opened every capture below (10/10 new PNGs + audits).
Then audited + judged the round-8 slice (cover-b + 4 ads) and verified the
do-not-refile list.

## Proof commands (pasted one-line results)

- `node tools/check.mjs` RESULT PASS: loop 20/20 plus 6 sample renders plus thumbs plus audits (cover 1280x720 34186B thumb 5567B; ad-square 1080x1080 50846B thumb 9164B; story 1080x1920 69685B thumb 12227B; hebrew-hero 1280x720 28125B thumb 3837B; jobhunt 1280x720 35014B thumb 5003B; cv 900x1270 98813B thumb 21777B).
- `node tools/audit.mjs samples/cover-b/brief.json` AUDIT PASS (1080x1080 53562B, contrast 16.27/7.13/5.18, title 22.8px at 256px floor 12px).
- `node tools/audit.mjs samples/ads/ad-1/brief.json` AUDIT PASS (1080x1080 51337B, 22.8px); ad-2 AUDIT PASS (1080x1080 54744B, 22.8px); ad-3 AUDIT PASS (1200x628 31980B, 17.9px); hero AUDIT PASS (1280x720 44934B, 17.6px).
- `node tools/judge.mjs samples/cover-b/brief.json` SHIP 10/10; `node tools/judge.mjs samples/ads/ad-1/brief.json` SHIP 10/10 (matches DESIGN-REVIEW.md set table 10/10 x4).
- `tools/check.mjs` SAMPLES list = 6 (cover, ad-square, story, hebrew-hero, jobhunt, cv) — cover-b + ads/* intentionally not yet wired (DESIGN-REVIEW defers to check owner 020, board DS-12/DS-14 still DOING).

## Captures opened (10/10 new + quickstart verified)

- cover-b/out.png (1080x1080 FACTORY PILOT COVER, title DESIGN THAT SHIPS + subtitle + CTA + 256px/315px/Judged strip + footer, fills canvas, no blank).
- cover-b/thumb-256.png (256x256 readable miniature, title legible) — square slot readable: YES.
- ads/ad-1/out.png (DESIGN THAT SELLS 1080x1080, full-bleed + 4:4/256px/Judged strip + footer) + thumb-256.png (readable) — intentional at both sizes: YES.
- ads/ad-2/out.png (THUMBNAIL-FIRST ADS 1080x1080, proof strip 22px/0/Judged) + thumb-256.png (readable) — YES.
- ads/ad-3/out.png (SHIP IT TONIGHT 1200x628 wide, orange sidebar 1200x628 WIDE) + thumb-256.png 256x134 (title + sidebar survive) — YES.
- ads/hero/out.png (Ship the landing tonight 1280x720) + thumb-256.png 256x144 (title reads, CTA visible) — YES.

## Regression verify (do-not-refile list — all verified, none re-filed)

- 002 thumb sliver: VERIFIED FIXED — cover-b/ads thumbs are real miniatures, not slivers.
- 008 missing commands: VERIFIED — quickstart path green; stubs out of pilot scope this round.
- 011 ad-square blank: VERIFIED FIXED — ad-square 50846B full-bleed via check run.
- 014 cv blank: VERIFIED FIXED — cv 98813B full one-pager via check run.
- 015 newsamples-no-thumb: VERIFIED FIXED — jobhunt/cv thumbs exist, check renders 6.
- 018 readme-stale: VERIFIED LANDED (5c451ab) — README now says all 6 + lists jobhunt/cv with sizes.

## New defects filed (0)

No new packets in `sprint/queue/ready/`. Every round-8 pixel reads intentional
at full size and at 256px, every audit/judge gate passes. Known gap noted but
NOT filed: cover-b + ads/* sit outside `node tools/check.mjs` SAMPLES (6) and
outside README Where-samples-live — this parallels 015/018 but is deferred
work on DOING rows DS-12/DS-14 (DESIGN-REVIEW.md explicitly leaves wire-up to
the check owner), not a defect in finished work. Filing now would dupe the
builder's owned next step; the judge slice 022 already queues the verdict.
