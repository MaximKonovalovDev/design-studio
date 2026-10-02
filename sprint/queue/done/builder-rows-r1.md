# builder (board rows) #1 (@builder, standing)

## Result (completed)

<task id="ses_f03dd5c1bffevxJCQcXUhO9vnn" state="completed">
<task_result>
Goal: DS-06 — rubric judge v1 (ds-quality-v1, 10 checks, DESIGN-REVIEW.md writer); moves VISION.md weakest row Judged quality (0%, 0/10, loop OFF) by giving every output a fixed score with ship floor 8/10.
Scope: tools/judge.mjs, tests/judge.test.mjs (claimed as `DS-06 | builder-rows-r1` in sprint/queue/claims.txt; nothing else touched).
Proof: `node tools/judge.mjs --check` PASS (built in this row).
Stop: L 45 min; at budget report what landed and next step.

Built end to end: `tools/judge.mjs` exports RUBRIC_ID ds-quality-v1 with 10 fixed checks (brief-complete, render-exists, audit-green via fresh auditBrief re-run, contrast-aa, thumbnail-legible, title-fits, tokens-disciplined, type-pair, rtl-gate, composition), scores X/10 with SHIP floor 8, `judgeSample()` + `writeReview()` wiring the real consumer (judges samples/cover 10/10 SHIP), and a `--check` self-test (good/broken fixtures, threshold, real-sample gate) that runs side-effect-free in temp dirs. `tests/judge.test.mjs` covers rubric shape, below-floor rejection, review writing, and self-check. Proof runs: `node tools/judge.mjs --check` → JUDGE PASS exit 0; `node --test tests/judge.test.mjs tests/audit.test.mjs tests/render.test.mjs` → 13 pass 0 fail; `node tools/check.mjs` → RESULT PASS (no regression). Mid-build I caught `--check` rewriting samples/cover/DESIGN-REVIEW.md outside scope and fixed it (temp-dir gate) plus restored the file byte-identical. No commit (helper seat; lead commits). Next step: lead commits tools/judge.mjs + tests/judge.test.mjs, then DS-04/DS-05 agent loops can gate on `judgeSample()`.

RESULT: DONE - DS-06 rubric judge v1 built (tools/judge.mjs, tests/judge.test.mjs), samples/cover scores 10/10 SHIP | proof: `node tools/judge.mjs --check` → JUDGE PASS exit 0; `node --test` 13 pass 0 fail; `node tools/check.mjs` RESULT PASS
</task_result>
</task>
