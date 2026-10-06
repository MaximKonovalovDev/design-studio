---
role: builder
title: deliver O-058 coaches-carousel-studio cover into factory
---

design-studio crew, delivery run for O-058 (cover:itch/coaches-carousel-studio, customer factory). Chain-judged PASS round 186 (VERDICT PASS O-058, committed 7bee1ec; BUILT PASS 16/16).

Goal: copy judged-PASS `designs/O-058/` into the factory repo where the listing loads it, with DELIVER CHECK PASS in one go.

Scope (owned paths, working tree only, never commit): `designs/O-058/ADOPT.md` (new), `designs/O-058/DELIVERED.json`, `orders.csv` (O-058 row only), `C:/Users/me/Desktop/autonomous-factory/products/social-media-carousel/coaches-carousel-studio/covers/from-design-studio/O-058/` (+ ADOPT.md inside it). Touch no other customer file, ever. Never edit `designs/O-058/VERDICT.md`.

Steps:

1. `node tools/orders-check.mjs --desk`. Read `designs/O-058/VERDICT.md` (must say PASS; else `RESULT: BLOCKED - not judged PASS`). `node tools/orders-check.mjs --built O-058` must print BUILT PASS.
2. Confirm the landing resolves to the product folder (O-046/O-056 lesson: read-only resolve check BEFORE running --deliver; if it resolves to repo root, STOP BLOCKED with the evidence).
3. Write `designs/O-058/ADOPT.md` FIRST (5 lines at most, same bytes that will land in the customer folder): the exact listing cover field factory changes (itch cover `out-630x500.png`, 16:9 slot `out.png` per DELIVERY.md) and factory's own proof command from its docs, never guessed. (O-043 lesson: ADOPT.md before --deliver so the manifest includes it.)
4. `node tools/orders-check.mjs --deliver O-058`. It copies the files into the product `covers/from-design-studio/O-058/`, writes DELIVERED.json, turns the row to delivered.
5. Proof: `node tools/orders-check.mjs --deliver O-058 --check` must print DELIVER CHECK PASS, plus the `node tools/orders-check.mjs` ORDERS line.

Stop (M 15 min). One item only.

Card, first lines: Goal (O-058, factory), Scope (designs ADOPT.md + customer folder + O-058 row), Proof (the --check line), Stop.

End: `RESULT: DONE - O-058 delivered to <customer path> (<n>/<n> files) | proof: node tools/orders-check.mjs --deliver O-058 --check`
Name the commit lines for the lead: this repo (`git add designs/O-058 orders.csv`) and the customer repo (`git -C C:/Users/me/Desktop/autonomous-factory add <that folder>` only). One inbox line for the lead if factory inbox has room (`node C:/Users/me/Desktop/center/empire.mjs inbox factory add "<what>" "<why>" "<done when>"`, three separate quoted args); else "no room".
