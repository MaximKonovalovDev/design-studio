---
role: builder
title: DS-06 repair after judge FAIL
chain: start
---

Goal: repair DS-06 (tools/judge.mjs rubric ds-quality-v1) after judge 003 FAIL so the committed files match the tool's own output; moves Scorecard row Judged quality.

Scope: `tools/judge.mjs`, `tests/judge.test.mjs`, `samples/cover/DESIGN-REVIEW.md` only. Three faults to fix: (a) committed `samples/cover/DESIGN-REVIEW.md` carries hand-edited scored lines the tool's `writeReview` cannot produce — regenerate it via the tool and commit exactly that; (b) self-check "7/10 does not ship" asserts a fake object — rewrite it to exercise the real `judgeSample` path (a genuinely below-floor sample must not ship); (c) judge 005 FAIL 2026-10-02: tool runs stripped the thumb-256.png filename/dims/verdict lines from DESIGN-REVIEW.md (`thumbnail-legible: 19.2px` with no file, generic verdict) — restore the 360bbd1 lines (`git checkout 360bbd1 -- samples/cover/DESIGN-REVIEW.md` as the base, then regenerate) so the review names thumb-256.png 256x144 with its verdict, and make future tool runs preserve those lines.

Proof: `node tools/judge.mjs --check` JUDGE PASS plus `node tools/check.mjs` RESULT PASS, with `git diff` showing DESIGN-REVIEW.md byte-identical to fresh `writeReview` output. Done when a judge re-review returns PASS.

Stop: L 45 min; at the budget report what landed and the next step.
