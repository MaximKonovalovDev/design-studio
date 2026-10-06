---
role: judge
title: chain review O-046 forge-engine2040-launch-system cover
chain: review
of: O-046-store-build
writer: builder
attempt: 1
origin_title: O-046 store cover build
---

Review O-046-store-build, built by builder. Its record: `designs/O-046/` (BUILT PASS 16/16; worker self-review PASS 2026-10-04, keeper chain never ran). Its result, cut, is at the end.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-046`: must print BUILT PASS (every AGENTS.md file, both sizes exact, audit PASS, SHIP 8+, real images in assets.json). FAIL: verdict FAIL with that first failing line, stop.
2. Open the pictures yourself with the Read tool (unopened PNG unverified): `designs/O-046/out.png`, `designs/O-046/out-630x500.png`, `designs/O-046/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/services/forge-engine2040-launch-system/preview/cover-1280x720.png`. Then `node tools/compose.mjs compare designs/O-046/out.png <that cover> --widths 256,315 --out designs/O-046/compare.png` and open `designs/O-046/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset.
   - PICTURE: real picture of the product from its own files when any exist (assets.json). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in the listing `C:/Users/me/Desktop/autonomous-factory/products/services/forge-engine2040-launch-system/listing/gumroad.md`; forbidden words absent. One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md, delivery to covers/from-design-studio/.
4. Write the verdict: `node tools/orders-check.mjs --verdict O-046 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file (VERDICT.md + compare.png via the commands only).

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder).

Its result, cut: O-046 built, 1 real picture, ours ~17.2px title vs theirs ~7px at 256 | proof: node tools/orders-check.mjs --built O-046 -> BUILT PASS: O-046 (16/16 checks). Worker five lines in designs/O-046/VERDICT.md (self-review, not chain).

End: `RESULT: DONE - O-046 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-046 <...>`
