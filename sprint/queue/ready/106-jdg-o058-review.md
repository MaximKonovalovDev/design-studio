---
role: judge
title: chain review O-058 coaches-carousel-studio cover
chain: review
of: 105-bld-o058-store
writer: builder
attempt: 1
origin_title: build O-058 coaches-carousel-studio itch cover
---

Review 105-bld-o058-store, built by builder. Its record: `designs/O-058/` (new folder, BUILT PASS 16/16 re-verified by lead; never judged). Its result, cut, is at the end.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-058` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-058/out.png`, `designs/O-058/out-630x500.png`, `designs/O-058/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/social-media-carousel/coaches-carousel-studio/preview/cover.png`. Then `node tools/compose.mjs compare designs/O-058/out.png <that cover> --widths 256,315 --out designs/O-058/compare.png` and open `designs/O-058/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset. (Builder claims ours 27px vs theirs 14px, and theirs shows a stale $39 vs listing $25: verify closely - size alone is not enough if theirs carries a false claim; judge clarity and honesty.)
   - PICTURE: real picture of the product from its own files when any exist (assets.json, 3 real slides claimed: testimonial/tip/booking). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/social-media-carousel/coaches-carousel-studio/listing/itch.md` (builder lists: 120 PNG + 120 SVG; 12 layouts, 10 colorways, 4 treatments; 120 captions + 3 guides; Instagram/Facebook/LinkedIn; $25 one-time; honest limit manual SVG retype recolor; no engine names). One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md, landing is the FULL product path `products/social-media-carousel/coaches-carousel-studio/covers/from-design-studio/O-058/`.
4. `node tools/orders-check.mjs --verdict O-058 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

Result, cut: DONE - O-058 built, 3 real pictures, ours 27px vs theirs 14px at 256.
