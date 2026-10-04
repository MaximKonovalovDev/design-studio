---
role: builder
title: renormalize orders.csv to LF so D1/D3 proofs read
chain: start
---

Goal: `node C:/Users/me/Desktop/center/finish.mjs design-studio` reads D1 met (want 1) and D3 met (want 1); today 0 of 5 with `orders.csv: 0 matching lines`.
Scope: `orders.csv` bytes only: strip the 27 CR bytes to LF (no field edits, no row edits, header untouched; `.gitattributes` already pins `orders.csv text eol=lf`). Then re-verify both adopted hashes print a commit line: `git -C C:/Users/me/Desktop/jobhunt log --oneline -1 ec65e25` (O-010) and `git -C C:/Users/me/Desktop/autonomous-factory log --oneline -1 2c6122b0` (O-015); both existed 2026-10-04. Method: write one temp script under `$env:TEMP\opencode\` that replaces CRLF with LF and run it (never multi-line `node -e`); do not touch any design folder or customer repo.
Proof: `python -c` CR-byte count prints 0; `node tools/orders-check.mjs` ORDERS PASS 26; `node C:/Users/me/Desktop/center/finish.mjs design-studio` prints D1 and D3 met; `node sprint/check.mjs` RESULT PASS.
Stop: M 15 min; bytes only, never a proof edit (FINISH-LINE.md rule: never edit a proof to make it pass).
Done when: CR count is 0, both adopted hashes still verify, and the finish run shows D1 plus D3 met with the same hashes.
Owned paths: orders.csv.
