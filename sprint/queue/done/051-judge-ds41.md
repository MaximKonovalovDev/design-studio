---
role: judge
title: judge DS-41 cover-b second receipt sample
---

Goal: independent verdict whether DS-41 LAND-01 holds: `samples/cover-b/receipt.json` carries url plus date plus rev where rev pins the current `samples/cover-b/out.png` sha256 (receipt PIN-OK exact), and `node tools/check.mjs` still RESULT PASS with the hero receipt intact. Moves Scorecard row Landing-page conversion.

Scope: read-only except running proofs; own no content files. Recompute `out.png` sha256 and compare to `receipt.json` rev (must match exactly, no re-render-and-replace to force a match: re-render only to confirm byte-stability, and any byte change is FAIL). Run `node tools/check.mjs samples/cover-b/brief.json` RESULT PASS with receipt pinned, `node tools/check.mjs` full-suite RESULT PASS, `node tools/judge.mjs samples/cover-b/brief.json` SHIP only if it does not rewrite the review (per-sample rewrite that wipes content is FAIL, name the wiper). Open `samples/cover-b/out.png` at full size and at 256px. NOT receipt.json edits, NOT VISION.md, NOT board.

Proof: (1) sha256 of out.png vs receipt rev, both strings, match true; (2) per-sample plus full-suite RESULT PASS lines; (3) PNG opened full-size plus 256px with readability note; (4) rubric score x/10, PASS only at >= 7/10 with rev PIN-OK. A stale rev or a rewritten review is FAIL with the evidence.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-41 <VERDICT> | proof: <commands plus numbers>`.


## Result (completed)

<task id="ses_efe138f16ffelxiqUk0BAzwuLO" state="completed">
<task_result>
VERDICT: FAIL
Wiper: `tools/judge.mjs` rewrote `samples/cover-b/DESIGN-REVIEW.md`, deleting 21-line Two-variant review.
Receipt PIN-OK: url+date+rev `dbe9de43…69aca` == out.png sha256 `DBE9DE43…69ACA`, match true.
PNG: out.png 1080x1080 full-size crisp; thumb-256.png 256x256 title reads, 22.8px>12px floor.
Before: `git diff HEAD~1 HEAD` no cover-b change; receipt already pinned.
After: `node tools/check.mjs samples/cover-b/brief.json` RESULT PASS; `node tools/check.mjs` RESULT PASS 20/0/0.
After: `node tools/judge.mjs samples/cover-b/brief.json` SHIP 10/10 (floor 8, >=7 met) but review wiped.
Revert: `git restore samples/cover-b/DESIGN-REVIEW.md` then re-verify `git status --short`.
RESULT: DONE - judged DS-41 FAIL | proof: sha256 match true, check per-sample PASS, full-suite 20 PASS, judge SHIP 10/10 with wipe

</task_result>
</task>
