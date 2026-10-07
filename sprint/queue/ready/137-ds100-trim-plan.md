---
role: builder
title: DS-100 TRIM-D1 plan with numbers (no moves, no deletes)
chain: start
---

Goal: write the TRIM-D1 execution plan DS-100 needs (board 33.7KB over 30 cap, designs/ 72MB in 1384 files, 26/64 live factory listings have a cover) as one notes file with all numbers, paired with factory TRIM-A1. Plan only: move, delete and rebuild nothing.

Scope (owned paths, working tree only, never commit): `sprint/notes/trim-plan-2026-10-07.md` (new, the only write). Read-only everywhere else: `sprint/board.md`, `sprint/board-archive.md` (untracked, 6 DONE + 7 READY rows), `orders.csv`, `designs/*/DELIVERED.json` + `VERDICT.md`, factory listing files and factory board (read-only; never edit a customer file, never touch `sprint/halt`). Never delete anything, never move anything, never add a dependency.

Steps:
1. Measure today: board bytes (`sprint/board.md` + `sprint/board-archive.md`), designs/ hot MB + file count, adopted outputs older than 7 days (candidates for the cold folder, never delete).
2. Name the 10 most-viewed factory listings without a cover (view counts from the factory repo's own listing/board files; cite each source path + date). Note the factory TRIM-A1 pairing for each.
3. Write the plan file with 5 sections: board-before/after bytes, hot/cold split with MB numbers, the 10 listings with views + sources, cold-move candidate list (adopted + older than 7 days), exact follow-up packets (moves first, covers second).
4. Proof: the notes file exists with all 5 sections and every number sourced; `node sprint/check.mjs` still RESULT PASS; `node tools/orders-check.mjs` still ORDERS PASS.

Stop (S 30 min). Plan only, or BLOCKED with the exact missing source (which listing has no view count, which command is unknown).

Card, first lines: Goal (DS-100 plan, numbers only), Scope (one new notes file, rest read-only), Proof (5-section file + both checks green), Stop.
End: `RESULT: DONE - trim plan with <n> listings + <hot> MB hot (<cold> MB cold candidates) | proof: sprint/notes/trim-plan-2026-10-07.md`
