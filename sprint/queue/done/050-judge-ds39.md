---
role: judge
title: judge DS-39 315px listing gate
---

Goal: independent verdict whether DS-39 THUMB-02 holds: `tools/audit.mjs` carries the 315px listing gate (title legible at 315px listing, floor 12px) plus the `--listing --check` self-check, and `samples/cover-b` plus `samples/ad-square` re-pass it with no gate weakened. Moves Scorecard row Thumbnail readability.

Scope: read-only except running proofs; own no content files. Verify `tools/audit.mjs` lines ~201-210 (at315 gate) plus ~520-580 (listingWidthSelfCheck), run `node tools/audit.mjs --listing --check` (F2P small-title fixture FAILs first, cover-b 28.0px re-passes), `node tools/audit.mjs samples/cover-b/brief.json` plus `samples/ad-square/brief.json` both AUDIT PASS, `node tools/check.mjs` RESULT PASS, `node tools/judge.mjs --check` harness green. Open `samples/cover-b/out.png` at full size and at 256px (title readable). NOT page.html edits, NOT VISION.md, NOT board.

Proof: (1) `--listing --check` output with both the fixture-FAIL line and the 28.0px re-pass line; (2) both per-sample AUDIT PASS lines; (3) `node tools/check.mjs` RESULT PASS line; (4) PNG opened full-size plus 256px with readability note; (5) rubric score x/10, PASS only at >= 7/10 with zero gate weakens. If the gate is missing or any sample fails, verdict FAIL with the failing line.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-39 <VERDICT> | proof: <commands plus numbers>`.


## Result (completed)

<task id="ses_efe138f2dffe4l25cll88oJQNN" state="completed">
<task_result>
VERDICT: PASS
Changed: `tools/audit.mjs` L201-211 315px gate (`at315=titlePx*315/size.w>=12`) + L520-569 `listingWidthSelfCheck`; 0 weakens, floor stays 12px.
`node tools/audit.mjs --listing --check` EXIT 0: fixture FAILs 11.7px line present, cover-b 28.0px + 96px reflow 28.0px re-pass, AUDIT LISTING PASS.
`node tools/audit.mjs samples/cover-b/brief.json` AUDIT PASS (28.0px listing, 22.8px thumb, contrast 16.27:1) EXIT 0.
`node tools/audit.mjs samples/ad-square/brief.json` AUDIT PASS (28.0px listing) EXIT 0.
`node tools/check.mjs` RESULT PASS (20 pass + 6 samples) EXIT 0; `node tools/judge.mjs --check` JUDGE PASS 10/10 floor 8 EXIT 0.
PNG `samples/cover-b/out.png` opened full-size (DESIGN THAT SHIPS bold, legible) + `thumb-256.png` 256px opened (title readable).
Rubric 9/10 (hierarchy/contrast/align/brand/RTL clean; -1 dense footer); >=7 and floor 8 met.
Scope: read-only, no page.html/VISION/board edits; owned files: none.
Revert: `git checkout HEAD -- tools/audit.mjs` (no-op; judge wrote nothing).
RESULT: DONE - judged DS-39 PASS | proof: audit-listing EXIT0 FAIL11.7+PASS28.0, cover-b/ad-square AUDIT PASS, check RESULT PASS, judge JUDGE PASS
</task_result>
</task>
