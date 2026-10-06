---
role: judge
title: chain review O-047 freelancer-launch-kit-vol1 cover
chain: review
of: 079-bld-o047-store
writer: builder
attempt: 1
origin_title: build O-047 freelancer-launch-kit-vol1 Gumroad cover
---

Review 079-bld-o047-store, built by builder. Its record: `designs/O-047/` (new folder, BUILT PASS 16/16; never judged). Its result, cut, is at the end.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-047` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-047/out.png`, `designs/O-047/out-630x500.png`, `designs/O-047/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/niche-business-system/freelancer-launch-kit-vol1/preview/cover-od-2000x2000.png`. Then `node tools/compose.mjs compare designs/O-047/out.png <that cover> --widths 256,315 --out designs/O-047/compare.png` and open `designs/O-047/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset.
   - PICTURE: real picture of the product from its own files when any exist (assets.json). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/niche-business-system/freelancer-launch-kit-vol1/listing/Gumroad.md` (watch: listing says $9.00; no engine names on the cover). One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md, landing is the FULL product path `products/niche-business-system/freelancer-launch-kit-vol1/covers/from-design-studio/O-047/`.
4. `node tools/orders-check.mjs --verdict O-047 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

Its result, cut: DONE - O-047 built, 3 real pictures, ours 17.6px vs theirs 7.2px at 256 | proof: node tools/orders-check.mjs --built O-047 -> BUILT PASS: O-047 (16/16 checks). Claims traced: 20 pages = 3+5+4+3+5, Letter+A4, under-5-minutes, $9 one-time, no engine names.

End: `RESULT: DONE - O-047 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-047 <...>`
