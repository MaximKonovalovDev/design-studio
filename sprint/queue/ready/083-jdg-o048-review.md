---
role: judge
title: chain review O-048 indie-game-suite cover
chain: review
of: 082-bld-o048-store
writer: builder
attempt: 1
origin_title: build O-048 indie-game-suite Gumroad cover
---

Review 082-bld-o048-store, built by builder. Its record: `designs/O-048/` (new folder, BUILT PASS 16/16; never judged). Its result, cut, is at the end.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-048` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-048/out.png`, `designs/O-048/out-630x500.png`, `designs/O-048/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/game-suite/indie-game-suite/preview/cover-1280x720.png`. Then `node tools/compose.mjs compare designs/O-048/out.png <that cover> --widths 256,315 --out designs/O-048/compare.png` and open `designs/O-048/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset.
   - PICTURE: real picture of the product from its own files when any exist (assets.json). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/game-suite/indie-game-suite/listing/gumroad.md` (watch: $19 one-time; no engine names on the cover). One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md, landing is the FULL product path `products/game-suite/indie-game-suite/covers/from-design-studio/O-048/`.
4. `node tools/orders-check.mjs --verdict O-048 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

Its result, cut: DONE - O-048 built, 1 real picture, ours 20.8px vs theirs 12.6px at 256 | proof: node tools/orders-check.mjs --built O-048 -> BUILT PASS: O-048 (16/16 checks). Fact sources: title + $19 (L1), pack claim (L3/L12), stats (L18), 32 colors (L20); no engine names.

End: `RESULT: DONE - O-048 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-048 <...>`
