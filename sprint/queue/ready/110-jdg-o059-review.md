---
role: judge
title: chain review O-059 content-engine-service cover
chain: review
of: 109-bld-o059-store
writer: builder
attempt: 1
origin_title: build O-059 content-engine-service itch cover
---

Review 109-bld-o059-store, built by builder. Its record: `designs/O-059/` (new folder, BUILT PASS 16/16 re-verified by lead; never judged). Its result, cut, is at the end.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-059` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-059/out.png`, `designs/O-059/out-630x500.png`, `designs/O-059/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/services/content-engine-service/preview/cover-1280x720.png` (dark navy/amber per builder). Then `node tools/compose.mjs compare designs/O-059/out.png <that cover> --widths 256,315 --out designs/O-059/compare.png` and open `designs/O-059/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json, claimed 17.6px; theirs pixel-measured, claimed 6.4px). Not better: FAIL, unless no current asset.
   - PICTURE: real picture of the product from its own files when any exist (assets.json, 3 real preview screenshots claimed: shot-flagship, shot-matrix, shot-outputs). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/services/content-engine-service/listing/itch.md` (builder lists: 1 flagship, 12 outputs, 3 scripts, 7 posts + 7-day calendar, 5-stage manual, $19 one-time, no fake was-price, no engine names). One invented fact: FAIL. Cross-check price $19 against the file, not the sibling O-045 gumroad cover.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md, landing is the FULL product path `products/services/content-engine-service/covers/from-design-studio/O-059/`.
4. `node tools/orders-check.mjs --verdict O-059 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

Result, cut: DONE - O-059 built, 3 real pictures, ours 17.6px vs theirs 6.4px at 256.
