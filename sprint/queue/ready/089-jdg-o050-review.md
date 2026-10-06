---
role: judge
title: chain review O-050 aeo-done-for-you cover
chain: review
of: 088-bld-o050-store
writer: builder
attempt: 1
origin_title: build O-050 aeo-done-for-you itch cover
---

Review 088-bld-o050-store, built by builder. Its record: `designs/O-050/` (new folder, BUILT PASS 16/16; never judged). Its result, cut, is at the end.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-050` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-050/out.png`, `designs/O-050/out-630x500.png`, `designs/O-050/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/marketing-studio/aeo-done-for-you/preview/cover-1280x720.png`. Then `node tools/compose.mjs compare designs/O-050/out.png <that cover> --widths 256,315 --out designs/O-050/compare.png` and open `designs/O-050/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset. (Builder claims ours 15px vs theirs 11px: verify closely, margin is thin.)
   - PICTURE: real picture of the product from its own files when any exist (assets.json). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/marketing-studio/aeo-done-for-you/listing/itch.md` (watch: price and probe counts; no engine names on the cover). One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md, landing is the FULL product path `products/marketing-studio/aeo-done-for-you/covers/from-design-studio/O-050/`.
4. `node tools/orders-check.mjs --verdict O-050 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

Its result, cut: DONE - O-050 built, 1 real picture, ours 15px vs theirs 11px at 256 | proof: node tools/orders-check.mjs --built O-050 -> BUILT PASS: O-050 (16/16 checks). Fact sources: $99 Tier A + 200 probes + 20 params + top-5 fixes + 5-day report + SEARCH PROXY, all itch.md; no engine names.

End: `RESULT: DONE - O-050 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-050 <...>`
