---
role: builder
title: correct O-043 O-045 O-046 adopted rows in orders.csv
---

design-studio crew, data-correction run for 3 ORDERS FAIL lines (O-043/O-045 flipped in the worktree 2026-10-06 after round 186's delivery commit, O-046 flipped before round 187; none from any round-186/187 packet). `node tools/orders-check.mjs` prints `[FAIL] O-XXX: adopted needs the customer's commit hash in adopted_commit` for O-043, O-045 and O-046: all three rows read status adopted / adopted yes with an identical non-hash adopted_commit value.

Goal: all three rows true to disk + factory reality, ORDERS back to 0 FAIL.

Scope (owned paths, working tree only, never commit): `orders.csv` (O-043, O-045, O-046 rows only: status, delivered_path, adopted, adopted_commit fields). Read-only everywhere else: factory listing files plus `git -C C:/Users/me/Desktop/autonomous-factory log` (read-only, never a customer edit).

Steps (per AGENTS.md Orders and delivery, adopted = customer commits identical bytes AND points its listing/post/tool at it):

1. For each order: `git -C C:/Users/me/Desktop/autonomous-factory log --format=%h -- <that order's from-design-studio folder>` and `log` on its listing file (O-043: products/services/aeo-geo-audit/; O-045: products/services/content-engine-service/; O-046: read the product path from the O-046 orders.csv brief row first, never guess). Check whether the listing file names the from-design-studio files (Images/cover field) and which commit introduced that pointer.
2. Adopted only if a factory commit carries identical bytes AND the listing points at them: set adopted_commit to that real hash (status adopted, adopted yes). Else revert the row to delivered / adopted no / empty hash with delivered_path the designs folder (O-043: products/services/aeo-geo-audit/covers/from-design-studio/O-043; O-045: products/services/content-engine-service/covers/from-design-studio/O-045; O-046: its own folder per its row).
3. Proof: `node tools/orders-check.mjs` ORDERS line (expect 0 FAIL, or quote the exact remaining line) plus `git diff -- orders.csv` pasted (3 rows only).

Stop (M 15 min). Three rows only, no tool edits, no customer edits.

Card, first lines: Goal (3 adopted rows true), Scope (orders.csv 3 rows, factory log read-only), Proof (ORDERS line + diff), Stop.

End: `RESULT: DONE - O-043 <adopted <hash>|delivered>, O-045 <adopted <hash>|delivered>, O-046 <adopted <hash>|delivered> | proof: node tools/orders-check.mjs ORDERS <line>`
