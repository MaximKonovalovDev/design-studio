---
role: builder
title: repair O-056 landing to full product path
chain: repair
of: 094-jdg-o056-review
---

Chain repair for O-056 (cover:itch/character-animation-studio). Judge FAILed only LANE: `DELIVERY.md` line 1 + `cover.json` say short `from-design-studio/O-056/`, not the full product path. BEATS/PICTURE/FACTS/FIT all PASS; do not touch art, assets, sizes or facts.

Goal: full product landing in both files, `--built` still PASS.

Scope (owned paths, working tree only, never commit): `designs/O-056/cover.json` (landing field only), `designs/O-056/DELIVERY.md` (landing lines only). Never touch a customer file, never edit `VERDICT.md`/`compare.png`.

Steps:

1. Read `designs/O-056/cover.json`, `designs/O-056/DELIVERY.md`, and the O-051 precedent (`designs/O-051/cover.json` + `DELIVERY.md`, judged PASS r178 with landing `products/services/aeo-geo-audit/covers/from-design-studio/O-051/`).
2. Change exactly the landing strings to `products/character-animation-studio/character-animation-studio/covers/from-design-studio/O-056/` in both files (O-046 lesson: full path from the start, never the repo-root short form).
3. Proof: `node tools/orders-check.mjs --built O-056` must print BUILT PASS, plus grep the two files showing the full path and no remaining short-form landing.

Stop (M 15 min). Landing strings only; at the budget report what changed. The keeper sends a fresh judge review after your DONE; you never judge your own fix.

Card, first lines: Goal (O-056 landing repair), Scope (cover.json + DELIVERY.md landing lines), Proof (--built line + full-path lines), Stop.

End: `RESULT: DONE - O-056 landing repaired to <full path> | proof: node tools/orders-check.mjs --built O-056`
