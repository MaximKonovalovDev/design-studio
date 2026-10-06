---
role: judge
title: chain review O-051 aeo-geo-audit cover
chain: review
of: 091-bld-o051-store
writer: builder
attempt: 1
origin_title: build O-051 aeo-geo-audit itch cover
---

Review 091-bld-o051-store, built by builder. Its record: `designs/O-051/` (new folder, BUILT PASS 16/16; never judged). Its result, cut, is at the end.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-051` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-051/out.png`, `designs/O-051/out-630x500.png`, `designs/O-051/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/services/aeo-geo-audit/preview/cover-1280x720.png`. Then `node tools/compose.mjs compare designs/O-051/out.png <that cover> --widths 256,315 --out designs/O-051/compare.png` and open `designs/O-051/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset. (Builder claims ours 13px vs theirs 8px: verify closely, margin is thin.)
   - PICTURE: real picture of the product from its own files when any exist (assets.json). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/services/aeo-geo-audit/listing/itch.md` (watch: price; no engine names on the cover). One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md, landing is the FULL product path `products/services/aeo-geo-audit/covers/from-design-studio/O-051/`.
4. `node tools/orders-check.mjs --verdict O-051 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

Its result, cut: DONE - O-051 built, 1 real picture, ours 13px vs theirs 8px at 256 | proof: node tools/orders-check.mjs --built O-051 -> BUILT PASS: O-051 (16/16 checks). Fact sources in DESIGN-REVIEW.md, all itch.md; $19 badge corrects their stale $29; no engine names.

End: `RESULT: DONE - O-051 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-051 <...>`
