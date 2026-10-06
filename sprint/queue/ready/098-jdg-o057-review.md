---
role: judge
title: chain review O-057 sci-fi-crew-vol2 cover
chain: review
of: JDG-O-057
writer: builder
attempt: 1
origin_title: build O-057 sci-fi-crew-vol2 itch cover
---

Review JDG-O-057 desk row, built by builder across Maxim waves c850997 + 0e454f7 (folder `designs/O-057/`, BUILT PASS 16/16 re-verified by lead 2026-10-06T13:01Z; never chain-judged, no VERDICT.md yet). No prior RESULT line on record; judge measures fresh.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-057` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-057/out.png`, `designs/O-057/out-630x500.png`, `designs/O-057/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/sci-fi-crew-vol2/preview/cover.png`. Then `node tools/compose.mjs compare designs/O-057/out.png <that cover> --widths 256,315 --out designs/O-057/compare.png` and open `designs/O-057/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset. (DESIGN-REVIEW claims ours 20.8px at 256px: verify.)
   - PICTURE: real picture of the product from its own files when any exist (assets.json). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/sci-fi-crew-vol2/listing/itch.md` (watch: no engine names on the cover). One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md; landing must read the FULL product path `products/character-animation-studio/sci-fi-crew-vol2/covers/from-design-studio/O-057/` (Maxim S84) — O-056 needed a repair for the same short form, so read the bytes closely.
4. `node tools/orders-check.mjs --verdict O-057 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

End: `RESULT: DONE - O-057 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-057 <...>`
