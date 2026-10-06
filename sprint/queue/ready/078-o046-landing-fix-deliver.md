---
role: builder
title: fix O-046 landing lines then deliver into factory
---

Follow-up to BLOCKED 077 (round 169): judged-PASS `designs/O-046/` cannot `--deliver` — its `cover.json` (`"landing": "from-design-studio/O-046/"`) and `DELIVERY.md` line 2 carry the short landing, so the tool resolves to repo-root `from-design-studio/O-046/` instead of the product covers folder. O-045 carries the full product path; mirror it.

Goal: correct the two landing lines, then complete the O-046 delivery with DELIVER CHECK PASS.

Scope (owned paths, working tree only, never commit): `designs/O-046/cover.json` (landing field only), `designs/O-046/DELIVERY.md` (landing lines only), `designs/O-046/DELIVERED.json`, `orders.csv` (O-046 row only), `C:/Users/me/Desktop/autonomous-factory/products/services/forge-engine2040-launch-system/covers/from-design-studio/O-046/` (+ ADOPT.md inside it; ADOPT.md already exists in `designs/O-046/` from 077 — copy it verbatim). Touch no other customer file, ever. Never edit `designs/O-046/VERDICT.md`, page/art/tokens (pixels stay as judged).

Steps:

1. Read `designs/O-046/VERDICT.md` (must say PASS; else `RESULT: BLOCKED - not judged PASS`).
2. Fix the landing: `cover.json` landing → `products/services/forge-engine2040-launch-system/covers/from-design-studio/O-046/`; `DELIVERY.md` landing lines → same full path (Maxim S84: delivery goes to `covers/from-design-studio/`, never repo root). Mirror O-045's exact form.
3. `node tools/orders-check.mjs --built O-046` must still print BUILT PASS (landing fix changes no pixels).
4. `node tools/orders-check.mjs --deliver O-046`, then proof: `node tools/orders-check.mjs --deliver O-046 --check` must print DELIVER CHECK PASS, plus the `node tools/orders-check.mjs` ORDERS line.

Stop (M 15 min). Landing lines + delivery only.

Card, first lines: Goal (O-046 landing true + delivered), Scope (cover.json + DELIVERY.md + customer folder + O-046 row), Proof (the --check line), Stop.

End: `RESULT: DONE - O-046 delivered to <customer path> (<n>/<n> files) | proof: node tools/orders-check.mjs --deliver O-046 --check`
Name the commit lines for the lead: this repo (`git add designs/O-046 orders.csv`) and the customer repo (`git -C C:/Users/me/Desktop/autonomous-factory add <that folder>` only). One inbox line for the lead if factory inbox has room: `node C:/Users/me/Desktop/center/empire.mjs inbox factory add "<what>" "<why>" "<done when>"` (three separate quoted args); else "no room".
