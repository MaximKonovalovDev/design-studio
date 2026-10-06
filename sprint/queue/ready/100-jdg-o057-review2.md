---
role: judge
title: chain review2 O-057 sci-fi-crew-vol2 cover
chain: review
of: 099-o057-repair
writer: builder
attempt: 2
origin_title: repair O-057 landing to full product path
---

Review 099-o057-repair, built by builder. Its record: landing strings in `designs/O-057/cover.json` + `DELIVERY.md` changed to the full product path (BUILT PASS 16/16 re-verified by builder). First review (098) FAILed only LANE; BEATS/PICTURE/FACTS/FIT passed — re-verify all five on the repaired bytes.

Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-057` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool: `designs/O-057/out.png`, `designs/O-057/out-630x500.png`, `designs/O-057/thumb-256.png`, the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/sci-fi-crew-vol2/preview/cover.png`, and the existing `designs/O-057/compare.png` (re-run the compare only if the art bytes changed — they must not have).
3. Judge the five: BEATS (ours px from design-audit.json vs theirs about from compare.png), PICTURE (product's own picture via assets), FACTS (listing itch.md only, no engine names), FIT (both sizes whole, >=12px at 256px), LANE (landing reads FULL `products/character-animation-studio/sci-fi-crew-vol2/covers/from-design-studio/O-057/` in both cover.json and DELIVERY.md — the one thing the repair changed).
4. `node tools/orders-check.mjs --verdict O-057 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert. A second FAIL comes to the lead (no third repair from the chain).

End: `RESULT: DONE - O-057 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-057 <...>`
