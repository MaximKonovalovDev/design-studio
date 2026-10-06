---
role: builder
title: deliver O-046 Gumroad cover into factory
---

design-studio crew, delivery run for O-046 (cover:gumroad/forge-engine2040-launch-system, customer factory). Chain-judged PASS round 168 (VERDICT PASS O-046, committed cf44b24).

Goal: copy judged-PASS `designs/O-046/` into the factory repo where the listing loads it, with DELIVER CHECK PASS in one go.

Scope (owned paths, working tree only, never commit): `designs/O-046/ADOPT.md` (new), `designs/O-046/DELIVERED.json`, `orders.csv` (O-046 row only), `C:/Users/me/Desktop/autonomous-factory/products/services/forge-engine2040-launch-system/covers/from-design-studio/O-046/` (+ ADOPT.md inside it). Touch no other customer file, ever. Never edit `designs/O-046/VERDICT.md`.

Lesson from O-043 (round 159 PARTIAL): `--deliver` manifests `designs/` only, so a customer-side ADOPT.md added afterwards breaks `--check`. Write `designs/O-046/ADOPT.md` FIRST (same bytes that will land in the customer folder), then run `--deliver`.

Steps:

1. `node tools/orders-check.mjs --desk`. Read `designs/O-046/VERDICT.md` (must say PASS; else `RESULT: BLOCKED - not judged PASS`). `node tools/orders-check.mjs --built O-046` must print BUILT PASS.
2. Write `designs/O-046/ADOPT.md` (5 lines at most): the exact listing cover field factory changes (Gumroad cover `out.png`, card `out-630x500.png` per `designs/O-046/DELIVERY.md`) and factory's own proof command, read from its docs, never guessed.
3. `node tools/orders-check.mjs --deliver O-046`. It copies the files (now including ADOPT.md) into `products/services/forge-engine2040-launch-system/covers/from-design-studio/O-046/`, writes `designs/O-046/DELIVERED.json` and turns the O-046 row to `delivered`.
4. Proof: `node tools/orders-check.mjs --deliver O-046 --check` must print DELIVER CHECK PASS, plus the `node tools/orders-check.mjs` ORDERS line.

Stop (M 15 min). One item only.

Card, the first lines of your reply: Goal (O-046, factory), Scope (designs ADOPT.md + customer folder + O-046 row), Proof (the --check line), Stop.

End: `RESULT: DONE - O-046 delivered to <customer path> (<n>/<n> files) | proof: node tools/orders-check.mjs --deliver O-046 --check`
Name the commit lines for the lead (who commits, you never do): this repo (`git add designs/O-046 orders.csv`) and the customer repo (`git -C C:/Users/me/Desktop/autonomous-factory add <that folder>` only). If the customer's inbox has room, give the one `empire.mjs inbox factory add "<what>" "<why>" "<done when>"` line for the lead (three separate quoted args); if not, say "no room".
