---
role: builder
title: judge writeReview preserve-gate for two-variant sections
chain: start
---

Goal: the suite never again wipes hand-written review sections: `tools/judge.mjs` writeReview() today unconditionally rewrites `samples/*/DESIGN-REVIEW.md`, deleting the 21-line `## Two-variant review` from `samples/cover-b/DESIGN-REVIEW.md` on any suite run (proven twice round 30: judges 049 and 051, grep 10 hits -> 1). Moves Scorecard rows Thumbnail readability (DS-12) and Landing-page conversion (DS-41).

Scope: fix touches only `tools/judge.mjs` writeReview (carry forward any existing `## Two-variant*` / `## Duel*` sections into the rewritten review, or fail-closed with a named error when such a section is present and cannot be carried; never silently drop). Verify `samples/cover-b/DESIGN-REVIEW.md` holds 10 `winner|variant|cover-b` hits BEFORE editing (lead restored it round 30; if fewer, stop BLOCKED). Explicitly NOT any gate threshold, NOT page.html, NOT receipts, NOT VISION.md.

Proof: F2P `grep -iE "winner|variant|cover-b" samples/cover-b/DESIGN-REVIEW.md` 10 hits before, then run the full suite (`node tools/check.mjs` plus `node tools/judge.mjs samples/cover-b/brief.json`) and grep still 10 hits after with section text identical; P2P `node tools/check.mjs` RESULT PASS plus `node tools/judge.mjs --check` JUDGE PASS.

Stop: M 45 min; at the budget report what landed and the next step.

What the user sees differently: today any check run silently deletes the measured cover-vs-cover-b duel the repair wrote; after the fix the duel survives every run, and a future section the writer cannot carry fails loudly instead of vanishing.
