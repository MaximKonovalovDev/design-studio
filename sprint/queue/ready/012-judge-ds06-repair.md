---
role: judge
title: judge DS-06 repair re-review
---

Goal: re-review DS-06 after the 010 repair (judge 003 FAIL -> one builder repair). Files changed since the FAIL verdict, so this is fresh, not a repeat.

Scope: read-only. `tools/judge.mjs` (thumb-aware judgeSample/writeReview), `tests/judge.test.mjs` (real-path 7/10 plus thumb-preservation tests), `samples/cover/DESIGN-REVIEW.md` (must be byte-identical to fresh writeReview output with thumb-256.png 256x144 lines).

Proof: rerun `node tools/judge.mjs --check`, `node --test tests/judge.test.mjs`, and `node tools/check.mjs` yourself; verify `git diff 360bbd1 -- samples/cover/DESIGN-REVIEW.md` is empty and a second tool run is byte-identical; confirm the self-check exercises the real judgeSample path. Open the PNGs with the Read tool.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-06 repair <VERDICT> | proof: <commands plus numbers>`.
