---
role: builder
title: deliver O-045 Gumroad cover into factory
---

design-studio crew, delivery run for O-045 (cover:gumroad/content-engine-service, customer factory). Chain-judged PASS round 164 (cc8da7a).

Goal: copy judged-PASS `designs/O-045/` into the factory repo where the listing loads it, with DELIVER CHECK PASS in one go.

Scope (owned paths, working tree only, never commit): `designs/O-045/ADOPT.md` (new), `designs/O-045/DELIVERED.json`, `orders.csv` (O-045 row only), `C:/Users/me/Desktop/autonomous-factory/products/services/content-engine-service/covers/from-design-studio/O-045/` (+ ADOPT.md inside it). Touch no other customer file, ever. Never edit `designs/O-045/VERDICT.md`.

Lesson from O-043 (round 159 PARTIAL): `--deliver` manifests `designs/` only, so a customer-side ADOPT.md added afterwards breaks `--check`. Write `designs/O-045/ADOPT.md` FIRST (same bytes that will land in the customer folder), then run `--deliver`.

Steps:

1. `node tools/orders-check.mjs --desk`. Read `designs/O-045/VERDICT.md` (must say PASS; else `RESULT: BLOCKED - not judged PASS`). `node tools/orders-check.mjs --built O-045` must print BUILT PASS.
2. Write `designs/O-045/ADOPT.md` (5 lines at most): the exact listing cover field factory changes (Gumroad cover `out.png`, card `out-630x500.png` per `designs/O-045/DELIVERY.md`) and factory's own proof command, read from its docs, never guessed.
3. `node tools/orders-check.mjs --deliver O-045`. It copies the files (now including ADOPT.md) into `products/services/content-engine-service/covers/from-design-studio/O-045/`, writes `designs/O-045/DELIVERED.json` and turns the O-045 row to `delivered`.
4. Proof: `node tools/orders-check.mjs --deliver O-045 --check` must print DELIVER CHECK PASS, plus the `node tools/orders-check.mjs` ORDERS line.

Stop (M 15 min). One item only.

Card, the first lines of your reply: Goal (O-045, factory), Scope (designs ADOPT.md + customer folder + O-045 row), Proof (the --check line), Stop.

End: `RESULT: DONE - O-045 delivered to <customer path> (<n>/<n> files) | proof: node tools/orders-check.mjs --deliver O-045 --check`
Name the commit lines for the lead (who commits, you never do): this repo (`git add designs/O-045 orders.csv`) and the customer repo (`git -C C:/Users/me/Desktop/autonomous-factory add <that folder>` only). If the customer's inbox has room, give the one `empire.mjs inbox factory add "<what>" "<why>" "<done when>"` line for the lead (three separate quoted args); if not, say "no room".
