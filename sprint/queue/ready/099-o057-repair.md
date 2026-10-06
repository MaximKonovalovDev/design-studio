---
role: builder
title: repair O-057 landing to full product path
chain: repair
of: 098-jdg-o057-review
---

Chain repair for O-057 (cover:itch/sci-fi-crew-vol2). Judge FAILed only LANE: `DELIVERY.md` + `cover.json` carry the short `from-design-studio/O-057/` instead of the full product path. BEATS/PICTURE/FACTS/FIT all PASS; do not touch art, assets, sizes or facts.

Goal: full product landing in both files, `--built` still PASS.

Scope (owned paths, working tree only, never commit): `designs/O-057/cover.json` (landing field only), `designs/O-057/DELIVERY.md` (landing lines only). Never touch a customer file, never edit `VERDICT.md`/`compare.png`.

Steps:

1. Read `designs/O-057/cover.json`, `designs/O-057/DELIVERY.md`, and the O-056 precedent (`designs/O-056/cover.json` + `DELIVERY.md`, repaired in 095 to `products/character-animation-studio/character-animation-studio/covers/from-design-studio/O-056/`).
2. Change exactly the landing strings to `products/character-animation-studio/sci-fi-crew-vol2/covers/from-design-studio/O-057/` in both files.
3. Proof: `node tools/orders-check.mjs --built O-057` must print BUILT PASS, plus grep the two files showing the full path and no remaining short-form landing.

Stop (M 15 min). Landing strings only. The keeper sends a fresh judge review after your DONE; you never judge your own fix.

Card, first lines: Goal (O-057 landing repair), Scope (cover.json + DELIVERY.md landing lines), Proof (--built line + full-path lines), Stop.

End: `RESULT: DONE - O-057 landing repaired to <full path> | proof: node tools/orders-check.mjs --built O-057`
