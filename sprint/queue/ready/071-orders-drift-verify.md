---
role: builder
title: verify O-015 O-056 O-057 factory-disk adoption claims
---

design-studio crew, verify-only run for the ORDERS drift blocking ORDERS PASS (5 problems, all pre-existing Maxim-wave rows). Two chain judges in a row flag it; do NOT edit `orders.csv` — report facts so the lead can decide (OWNER row vs tool change).

Goal: confirm or deny that the three claimed-adopted covers exist on factory disk and are pointed at by their listings.

Scope (owned paths, working tree only, never commit): `sprint/notes/orders-drift-2026-10-06.md` (new note only). Read-only everywhere else. Never edit `orders.csv`, never touch a customer file.

Steps:

1. For O-015 (`products/character-animation-studio/medieval-warriors-vol4`), O-056 (`products/character-animation-studio/character-animation-studio`), O-057 (`products/character-animation-studio/sci-fi-crew-vol2`) under `C:/Users/me/Desktop/autonomous-factory`: list the cover PNGs on disk (name + bytes + sha256, note gitignored), and read each product's `listing/itch.md` ## Images (or cover field) to say exactly which file the listing points at.
2. For each: `ADOPTED-DISK yes <path> <sha256> <listing points at it: yes/no>` or `no <what is missing>`.
3. Proof: the note file plus the `node tools/orders-check.mjs` ORDERS FAIL line (unchanged expected).

Stop (M 15 min). Verify only — no row edits, no tool edits.

Card, the first lines of your reply: Goal (verify 3 disk claims), Scope (the note file, read-only), Proof (note path + per-order yes/no), Stop.

End: `RESULT: DONE - disk check O-015 <yes/no>, O-056 <yes/no>, O-057 <yes/no> | proof: sprint/notes/orders-drift-2026-10-06.md`
