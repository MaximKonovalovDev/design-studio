---
role: builder
title: correct O-015 O-056 O-057 adopted rows in orders.csv
chain: start
---

design-studio crew, data-correction run for the 5 ORDERS FAIL problems (all pre-existing Maxim-wave rows). Verify-only 071 (note `sprint/notes/orders-drift-2026-10-06.md`, DONE round 166) proved the facts; now correct exactly 3 rows. Read that note first.

Goal: `orders.csv` rows O-015, O-056, O-057 stop contradicting disk + listing reality, so the next ORDERS run drops to 0 FAIL (or 1 with a stated reason).

Scope (owned paths, working tree only, never commit): `orders.csv` (O-015, O-056, O-057 rows only: status, delivered_path, adopted, adopted_commit fields). Read-only everywhere else: factory `listing/itch.md` files plus `git -C C:/Users/me/Desktop/autonomous-factory log` (read-only, never a customer edit).

Steps:

1. O-056 (`character-animation-studio`) and O-057 (`sci-fi-crew-vol2`): folders are BUILT PASS but never chain-judged, never `--deliver`ed, and both listings point at factory files with no design-studio credit. Set status open (unchanged), adopted `no`, adopted_commit empty, delivered_path empty. Nothing else on those rows.
2. O-015 (`medieval-warriors-vol4`): listing/itch.md credits the O-015 re-cover with a coveradopt line and serves our bytes at preview/cover.png. Run `git -C C:/Users/me/Desktop/autonomous-factory log -1 --format=%h -- products/character-animation-studio/medieval-warriors-vol4/listing/itch.md`: if the returned commit's diff carries the O-015 credit, set adopted_commit to that hash (status adopted stays); else set status delivered, adopted `no`, adopted_commit empty, delivered_path `designs/O-015` stays. Report which branch.
3. Proof: `node tools/orders-check.mjs` ORDERS line (expect 0 FAIL, or 1 with the exact remaining line quoted) plus `git diff -- orders.csv` pasted (3 rows only).

Stop (M 15 min). Three rows only, no tool edits, no customer edits.

Card, the first lines of your reply: Goal (3 adopted rows true), Scope (orders.csv 3 rows, factory log read-only), Proof (ORDERS line + diff), Stop.

End: `RESULT: DONE - O-015 <adopted <hash>|delivered>, O-056/O-057 open/unadopted | proof: node tools/orders-check.mjs ORDERS <line>`
