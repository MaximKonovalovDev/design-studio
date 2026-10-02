---
role: builder
title: workshop stories for the 6 new registry blocks
---

Goal: `node tools/workshop.mjs --check` green again: every registry block in `templates/blocks/` has a matching story in `workshop/stories/` with a pinned snapshot (today WORKSHOP FAIL 6: testimonial, faq, stats, gallery, newsletter, footer have blocks but no stories).

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `workshop/stories/*.html` (6 new stories) plus `workshop/snapshots/*.txt` (6 new pins, via the tool's own re-pin path after review); explicitly NOT `tools/workshop.mjs` gate logic (DS-07 judged-good, the gate correctly fails closed), NOT `templates/blocks/*`, NOT other tools, NOT samples, NOT README.md.

Proof: `node tools/workshop.mjs --check` WORKSHOP PASS (10 stories); `node --test tests/workshop.test.mjs` all pass; `node tools/check.mjs` stays RESULT PASS.

Stop: M 30 min; at the budget report what landed and the next step.


## Result (completed)

<task id="ses_f02fe3d10ffevgXHht5m8QHrtP" state="completed">
<task_result>
Reviewed the 6 in-flight stories (testimonial, faq, stats, gallery, newsletter, footer) against their registry blocks — all carry data-story, source-fragment cite, width 1280, ws-title 64px (12.8px at 256w), thumb-256 comment, 0 hex, token-only colors — and re-pinned via the tool's own `--write` path (10/10 byte-identical). No gate, block, tool, sample, or README touched. Next step: lead commits the 12 workshop files and flips DS-07 to DONE.

RESULT: DONE - 6 workshop stories + 6 snapshots verified and re-pinned, all gates green | proof: `node tools/workshop.mjs --check` → WORKSHOP PASS: 10 stories, 256px titles legible, snapshots match
</task_result>
</task>
