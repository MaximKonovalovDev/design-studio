---
role: judge
title: re-judge DS-12 two-variant review after 022 repair
---

Goal: independent verdict whether DS-12 two-variant evidence holds after the round-21 builder repair: `samples/cover-b/DESIGN-REVIEW.md` carries a measured cover vs cover-b comparison (both SHIP scores, both audit title px, both 256px thumb bytes and legibility, winner by audit plus 256px). Moves Scorecard row Thumbnail readability.

Scope: read-only on `samples/cover/DESIGN-REVIEW.md` plus `samples/cover-b/DESIGN-REVIEW.md`; snapshot a copy to `sprint/notes/022-repair-snapshot/` BEFORE running anything. Per-sample `node tools/judge.mjs samples/<x>/brief.json` runs are BANNED: round-21 builder finding is they rewrite DESIGN-REVIEW.md and wipe the comparison section. NOT tools/*.mjs gates, NOT page.html or PNGs, NOT VISION.md, NOT board.

Proof: (1) `grep -iE "winner|variant|cover-b" samples/cover-b/DESIGN-REVIEW.md` with numbers, before and after the whole suite (must be identical, 10 hits at repair time); (2) `node tools/audit.mjs samples/cover/brief.json` plus `samples/cover-b/brief.json` both AUDIT PASS; (3) `node tools/check.mjs` RESULT PASS; (4) `node tools/judge.mjs --check` harness green (no per-sample rewrite); (5) every number cited in the prose (title px, thumb bytes, winner) matches the fresh outputs. PASS only if the section is present with numbers and survives the suite intact; if any step rewrites the reviews, verdict FAIL and name the wiper plus propose the preserve-gate.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - re-judged DS-12 repair <VERDICT> | proof: <commands plus numbers>`.
