---
role: builder
title: DS-12 two-variant review repair after judge FAIL
---

Goal: repair DS-12 after judge 022 re-review FAIL (round 20): write the missing two-variant cover vs cover-b comparison into `samples/cover-b/DESIGN-REVIEW.md` (and `samples/cover/DESIGN-REVIEW.md` if it names the duel) with measured numbers, so the board's "two-variant review" evidence is true again. Moves Scorecard row Thumbnail readability.

Scope: `samples/cover-b/DESIGN-REVIEW.md` plus `samples/cover/DESIGN-REVIEW.md` (review prose only). Must cite real measured figures: cover vs cover-b audit title px, 256px thumb bytes and legibility, judge SHIP scores for both, and the winner by audit plus 256px. Explicitly NOT any `tools/*.mjs` gate, NOT any `samples/*/page.html` or PNG, NOT VISION.md, NOT board.

Proof: `node tools/judge.mjs samples/cover/brief.json` plus `node tools/judge.mjs samples/cover-b/brief.json` both SHIP, `node tools/audit.mjs samples/cover/brief.json` plus `samples/cover-b/brief.json` both AUDIT PASS, `node tools/check.mjs` RESULT PASS, and `grep -i "winner\|variant\|cover-b" samples/cover-b/DESIGN-REVIEW.md` returns hits with numbers. Done when a judge re-review returns PASS.

Stop: M 30 min; at the budget report what landed and the next step.


## Result (completed)

<task id="ses_efe4ff092ffeI79ew8P3dtUnWB" state="completed">
<task_result>
Repaired DS-12 two-variant evidence: `samples/cover-b/DESIGN-REVIEW.md` now carries a measured `Two-variant review (cover vs cover-b)` section (variant A cover 1280x720 34186B, 19.2px@256px/23.6px@315px, thumb 256x144 5567B, SHIP 10/10, AUDIT PASS; variant B cover-b 1080x1080 53562B, 22.8px@256px/28.0px@315px, thumb 256x256 9753B, SHIP 10/10, AUDIT PASS; winner cover-b by audit + 256px per check.mjs), plus a duel pointer in `samples/cover/DESIGN-REVIEW.md`. Prose-only, no gates/pages/VISION/board touched. Note: `tools/judge.mjs` rewrites DESIGN-REVIEW.md on every run, so the comparison must be applied after the final judge run (done here); a future judge run will wipe it again — persistent fix would need a judge preserve-gate, out of this packet's scope. Next step: request judge 022 re-review for PASS. No commit (helper role).

RESULT: DONE - two-variant cover vs cover-b comparison with measured numbers restored to DESIGN-REVIEW.md | proof: grep -iE winner|variant|cover-b samples/cover-b/DESIGN-REVIEW.md → 10 hits; check RESULT PASS; audits AUDIT PASS; judges SHIP 10/10 both
</task_result>
</task>
