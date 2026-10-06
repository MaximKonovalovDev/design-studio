---
role: judge
title: chain review O-056 character-animation-studio cover
chain: review
of: JDG-O-056
writer: builder
attempt: 1
origin_title: build O-056 character-animation-studio itch cover
---

Review JDG-O-056 desk row, built by builder across Maxim waves c850997 + 0e454f7 (folder `designs/O-056/`, BUILT PASS 16/16 re-verified by lead 2026-10-06T12:52Z; never chain-judged, no VERDICT.md yet). No prior RESULT line on record; judge measures fresh.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-056` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-056/out.png`, `designs/O-056/out-630x500.png`, `designs/O-056/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/character-animation-studio/preview/cover.png`. Then `node tools/compose.mjs compare designs/O-056/out.png <that cover> --widths 256,315 --out designs/O-056/compare.png` and open `designs/O-056/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset. (DESIGN-REVIEW claims ours 17.6px at 256px: verify.)
   - PICTURE: real picture of the product from its own files when any exist (assets.json names shot-sheets-1280x720.png). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/character-animation-studio/listing/itch.md` (watch: no engine names on the cover). One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md; landing must read the FULL product path `products/character-animation-studio/character-animation-studio/covers/from-design-studio/O-056/` (Maxim S84) — the current DELIVERY.md line 1 short form `from-design-studio/O-056/` fails this unless the cover.json landing carries the full path (O-046 lesson; judge the bytes as they are).
4. `node tools/orders-check.mjs --verdict O-056 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

End: `RESULT: DONE - O-056 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-056 <...>`
