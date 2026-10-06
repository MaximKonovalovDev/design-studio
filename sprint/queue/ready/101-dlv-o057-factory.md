---
role: builder
title: deliver O-057 sci-fi-crew-vol2 cover into factory
---

design-studio crew, delivery run for O-057 (cover:itch/sci-fi-crew-vol2, customer factory). Chain-judged PASS round 183 (VERDICT PASS O-057, committed d4015e2; full product landing in cover.json + DELIVERY.md after the 099 repair).

Goal: copy judged-PASS `designs/O-057/` into the factory repo where the listing loads it, with DELIVER CHECK PASS in one go.

Scope (owned paths, working tree only, never commit): `designs/O-057/ADOPT.md` (new), `designs/O-057/DELIVERED.json`, `orders.csv` (O-057 row only), `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/sci-fi-crew-vol2/covers/from-design-studio/O-057/` (+ ADOPT.md inside it). Touch no other customer file, ever. Never edit `designs/O-057/VERDICT.md`.

Steps:

1. `node tools/orders-check.mjs --desk`. Read `designs/O-057/VERDICT.md` (must say PASS; else `RESULT: BLOCKED - not judged PASS`). `node tools/orders-check.mjs --built O-057` must print BUILT PASS.
2. Confirm the landing resolves to the product folder (O-046/O-056 lesson: read-only resolve check BEFORE running --deliver; if it resolves to repo root, STOP BLOCKED with the evidence).
3. Write `designs/O-057/ADOPT.md` FIRST (≤5 lines, same bytes that will land in the customer folder): the exact listing cover field factory changes (itch cover `out-630x500.png`, 16:9 slot `out.png` per DELIVERY.md) and factory's own proof command from its docs, never guessed. (O-043 lesson: ADOPT.md before --deliver so the manifest includes it.)
4. `node tools/orders-check.mjs --deliver O-057`. It copies the files into the product `covers/from-design-studio/O-057/`, writes DELIVERED.json, turns the row to delivered.
5. Proof: `node tools/orders-check.mjs --deliver O-057 --check` must print DELIVER CHECK PASS, plus the `node tools/orders-check.mjs` ORDERS line.

Stop (M 15 min). One item only.

Card, first lines: Goal (O-057, factory), Scope (designs ADOPT.md + customer folder + O-057 row), Proof (the --check line), Stop.

End: `RESULT: DONE - O-057 delivered to <customer path> (<n>/<n> files) | proof: node tools/orders-check.mjs --deliver O-057 --check`
Name the commit lines for the lead: this repo (`git add designs/O-057 orders.csv`) and the customer repo (`git -C C:/Users/me/Desktop/autonomous-factory add <that folder>` only). One inbox line for the lead if factory inbox has room (`node C:/Users/me/Desktop/center/empire.mjs inbox factory add "<what>" "<why>" "<done when>"`, three separate quoted args); else "no room".
