# Packet note: untrack generated out.* renders (2026-10-03)

Goal: fresh clones get sources only; `node tools/check.mjs` regenerates renders locally.
What landed:
- `git rm --cached` the 18 tracked generated paths (staged, 5 canvas/out/*.svg + 13 */out.png).
- `.gitignore` += `out.png` and `canvas/out/` (unstaged, for lead to `git add .gitignore`).
- Verified: `git ls-files | Select-String out` count 0; `git check-ignore` hits on all four probes; `node tools/check.mjs` RESULT PASS (loop 20/20, 11 renders, cover 34186B/thumb 5567B, cover-b 53562B/thumb 9753B); re-rendered out.png files stay ignored, no new `?? out.png` dirt.
- Touched nothing else: other M/?? entries (knobs, README, orders.csv, HANDOFFs, lock, steals, O-001, etc.) are other agents' work, left alone.
Next step (lead): `git add .gitignore` + commit staged deletions with proof line, then fresh-clone sanity (`git ls-files | Select-String out` = 0, `node tools/check.mjs` PASS).
