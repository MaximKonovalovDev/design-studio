---
role: judge
title: judge DS-69 beacon verification
---

Goal: independent verdict whether DS-69 LAND-03b holds: beacon verification user of DS-43 on tools/convert.mjs + convert/plan.json (endpoint relative offline, payload url+rev, verify poll-until-live, plausible AGPL idea-only no copy, no network in --check). Moves Scorecard row Landing-page conversion.

Scope: read-only except running proofs; own no content files. Run `node tools/convert.mjs --check` CONVERT PASS (beacon gates quoted) and `node tools/check.mjs` RESULT PASS; verify no-network-in-check (code quote) + AGPL idea-only note (no copied code); verify DS-43 live gate intact. Scope dirt to owned files; attribute other dirt instead of failing. NOT live deploy, NOT receipts, NOT VISION.md, NOT board. Shell is pwsh.

Proof: (1) CONVERT PASS + beacon gates; (2) RESULT PASS; (3) no-network + idea-only quotes. A network call at check, copied AGPL code, or broken DS-43 gate is FAIL.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged DS-69 <VERDICT> | proof: <commands plus numbers>`.
