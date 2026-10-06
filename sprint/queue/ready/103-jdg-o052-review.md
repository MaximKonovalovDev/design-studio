---
role: judge
title: chain review O-052 carousel-template-studio cover
chain: review
of: 102-bld-o052-store
writer: builder
attempt: 1
origin_title: build O-052 carousel-template-studio itch cover
---

Review 102-bld-o052-store, built by builder. Its record: `designs/O-052/` (new folder, BUILT PASS 16/16 re-verified by lead; never judged). Its result, cut, is at the end.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-052` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-052/out.png`, `designs/O-052/out-630x500.png`, `designs/O-052/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/social-media-carousel/carousel-template-studio/preview/cover-od-1280x720.png`. Then `node tools/compose.mjs compare designs/O-052/out.png <that cover> --widths 256,315 --out designs/O-052/compare.png` and open `designs/O-052/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset. (Builder claims ours 17.6px vs theirs big-but-false: verify closely — size alone is not enough if theirs is a false claim; judge clarity and honesty.)
   - PICTURE: real picture of the product from its own files when any exist (assets.json, 3 real slides claimed). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/social-media-carousel/carousel-template-studio/listing/itch.md` (builder lists: 108 templates $25 one-time; 27 each Instagram/TikTok/LinkedIn/Pinterest; 108 PNG + 108 SVG; 10 layouts x 5 colorways x 4 treatments; 108 captions + 3 guides; 6+ editable text nodes; 5 hex colors + handle + tagline; honest fine "Figma import not click-verified"; no engine names). One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md, landing is the FULL product path `products/social-media-carousel/carousel-template-studio/covers/from-design-studio/O-052/`.
4. `node tools/orders-check.mjs --verdict O-052 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

Its result, cut: DONE - O-052 built, 3 real pictures, ours 17.6px vs theirs big-but-false at 256 | proof: node tools/orders-check.mjs --built O-052 -> BUILT PASS: O-052 (16/16 checks). Fact sources in DESIGN-REVIEW.md, all itch.md; $25 corrects their stale $39; no engine names.

End: `RESULT: DONE - O-052 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-052 <...>`
