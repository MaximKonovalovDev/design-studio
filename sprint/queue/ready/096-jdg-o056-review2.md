---
role: judge
title: chain review2 O-056 character-animation-studio cover
chain: review
of: 095-o056-repair
writer: builder
attempt: 2
origin_title: repair O-056 landing to full product path
---

Review 095-o056-repair, built by builder. Its record: landing strings in `designs/O-056/cover.json` + `DELIVERY.md` changed to the full product path (BUILT PASS 16/16 re-verified by builder). First review (094) FAILed only LANE; BEATS/PICTURE/FACTS/FIT passed — re-verify all five on the repaired bytes.

Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-056` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool: `designs/O-056/out.png`, `designs/O-056/out-630x500.png`, `designs/O-056/thumb-256.png`, the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/character-animation-studio/preview/cover.png`, and the existing `designs/O-056/compare.png` (re-run `node tools/compose.mjs compare designs/O-056/out.png <that cover> --widths 256,315 --out designs/O-056/compare.png` only if the art bytes changed — they must not have).
3. Judge the five (number or yes/no): BEATS (ours px from design-audit.json vs theirs about from compare.png), PICTURE (product's own shot-sheets picture via assets/shot.png), FACTS (listing itch.md only, no engine names), FIT (both sizes whole, >=12px at 256px), LANE (landing reads FULL `products/character-animation-studio/character-animation-studio/covers/from-design-studio/O-056/` in both cover.json and DELIVERY.md — the one thing the repair changed).
4. `node tools/orders-check.mjs --verdict O-056 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert. A second FAIL comes to the lead (no third repair from the chain).

End: `RESULT: DONE - O-056 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-056 <...>`
