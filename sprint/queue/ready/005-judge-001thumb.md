---
role: judge
title: judge 001 cover thumbnail artifact
---

Goal: independent verdict on one-off 001-pilot-cover-thumb (real 256px thumbnail beside out.png, probe duplicates removed), built round 2. The lead's own eyes confirm `samples/cover/thumb-256.png` (5567B) is a genuine readable miniature; the 002 packet's direct-path sliver is a separate defect, out of scope here.

Scope: read-only. `samples/cover/thumb-256.png`, `samples/cover/DESIGN-REVIEW.md` thumbnail lines, the thumb path in `tools/check.mjs`, plus the round-2 builder record in `sprint/queue/done/001-pilot-cover-thumb.md`.

Proof: rerun `node tools/check.mjs` yourself; open `samples/cover/thumb-256.png` and `samples/cover/out.png` with the Read tool and confirm the thumbnail reads like the cover; confirm `probe.png`/`probe2.png` are gone.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged 001 <VERDICT> | proof: <commands plus numbers>`.
