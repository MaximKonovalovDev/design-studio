---
role: builder
title: repair O-043 delivery (ADOPT.md manifest gap)
---

design-studio crew, one-item repair for O-043 (cover:gumroad/aeo-geo-audit, factory). Round 159 delivered 24 files + customer ADOPT.md but `--check` FAILs by tool design: `--deliver` manifests `designs/O-043/` only, so customer-side ADOPT.md breaks the exact-set compare (same gap as O-042, fixed by mirroring ADOPT.md into designs/).

Goal: make `node tools/orders-check.mjs --deliver O-043 --check` print DELIVER CHECK PASS.

Scope (owned paths, working tree only, never commit): `designs/O-043/ADOPT.md` (new file, byte-identical to the customer `ADOPT.md` already landed), `designs/O-043/DELIVERED.json`, `orders.csv` (O-043 row only). Touch no other file. Never edit `designs/O-043/VERDICT.md`. Never touch a customer file outside the `--deliver` rerun.

Steps:

1. Read `C:/Users/me/Desktop/autonomous-factory/products/services/aeo-geo-audit/covers/from-design-studio/O-043/ADOPT.md` and write its exact bytes to `designs/O-043/ADOPT.md`.
2. `node tools/orders-check.mjs --deliver O-043` (re-manifests with ADOPT.md included), then `node tools/orders-check.mjs --deliver O-043 --check` must print DELIVER CHECK PASS.
3. Proof: the `--check` PASS line plus the `node tools/orders-check.mjs` ORDERS line.

Stop (M 15 min). One item only.

Card, the first lines of your reply: Goal (O-043 --check PASS), Scope (designs ADOPT.md + DELIVERED.json + O-043 row), Proof (the --check line), Stop.

End: `RESULT: DONE - O-043 --check PASS (<n>/<n> files) | proof: node tools/orders-check.mjs --deliver O-043 --check`
Name the commit lines for the lead (who commits, you never do): this repo (`git add designs/O-043 orders.csv`) and the customer repo (`git -C C:/Users/me/Desktop/autonomous-factory add products/services/aeo-geo-audit/covers/from-design-studio/O-043` only).
