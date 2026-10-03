---
role: judge
title: re-judge DS-12 two-variant review after 022 repair
---

Goal: independent verdict whether DS-12 two-variant evidence holds after the round-21 builder repair: `samples/cover-b/DESIGN-REVIEW.md` carries a measured cover vs cover-b comparison (both SHIP scores, both audit title px, both 256px thumb bytes and legibility, winner by audit plus 256px). Moves Scorecard row Thumbnail readability.

Scope: read-only on `samples/cover/DESIGN-REVIEW.md` plus `samples/cover-b/DESIGN-REVIEW.md`; snapshot a copy to `sprint/notes/022-repair-snapshot/` BEFORE running anything. Per-sample `node tools/judge.mjs samples/<x>/brief.json` runs are BANNED: round-21 builder finding is they rewrite DESIGN-REVIEW.md and wipe the comparison section. NOT tools/*.mjs gates, NOT page.html or PNGs, NOT VISION.md, NOT board.

Proof: (1) `grep -iE "winner|variant|cover-b" samples/cover-b/DESIGN-REVIEW.md` with numbers, before and after the whole suite (must be identical, 10 hits at repair time); (2) `node tools/audit.mjs samples/cover/brief.json` plus `samples/cover-b/brief.json` both AUDIT PASS; (3) `node tools/check.mjs` RESULT PASS; (4) `node tools/judge.mjs --check` harness green (no per-sample rewrite); (5) every number cited in the prose (title px, thumb bytes, winner) matches the fresh outputs. PASS only if the section is present with numbers and survives the suite intact; if any step rewrites the reviews, verdict FAIL and name the wiper plus propose the preserve-gate.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - re-judged DS-12 repair <VERDICT> | proof: <commands plus numbers>`.


## Result (completed)

<task id="ses_efe138f64ffecCWpH5Im6ZoNoE" state="completed">
<task_result>
VERDICT: FAIL — DS-12 two-variant evidence wiped by suite, not preserved.
What changed: samples/cover-b/DESIGN-REVIEW.md lost ## Two-variant review, 21 lines deleted, uncommitted.
Snapshot: copied cover+cover-b reviews to sprint/notes/022-repair-snapshot/ BEFORE any command; snapshot holds 10 hits.
Before: `grep -iE winner|variant|cover-b` cover-b =10 hits; `audit cover` PASS 19.2px/23.6px 816/1075; `audit cover-b` PASS 22.8px/28.0px 816/907.
After: same grep =1 hit; `git diff --stat` 21 deletions cover-b only; cover intact.
`node tools/check.mjs` RESULT PASS winner cover-b 5567B 19.2px vs 9753B 22.8px; thumbs 5567B 256x144 vs 9753B 256x256 match prose.
`node tools/judge.mjs --check` JUDGE PASS 10/10 floor 8; no per-sample `judge.mjs samples/...` run by me (banned).
Wiper: tools/judge.mjs writeReview() unconditional writeFileSync DESIGN-REVIEW.md (per-sample lines 437-439) — round-21 finding.
Fix: preserve-gate in writeReview to carry ## Two-variant/duel sections or fail-closed when present.
Revert (not run, read-only): `Copy-Item sprint/notes/022-repair-snapshot/cover-b-DESIGN-REVIEW.md samples/cover-b/DESIGN-REVIEW.md -Force` (HEAD also has 10).
RESULT: DONE - re-judged DS-12 repair FAIL | proof: grep 10->1, audit PASS+PASS, check PASS winner-cover-b, judge---check PASS, thumbs 5567B/9753B

</task_result>
</task>
