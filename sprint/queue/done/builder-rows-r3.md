# builder (board rows) #3 (@builder, standing)

## Result (completed)

<task id="ses_f02fe3ceeffeny7MtRtArc7wUE" state="completed">
<task_result>
Card (one row taken):
- Goal: DS-40 THUMB-03 — close the Thumbnail-readability endgame step 3/3 by making each workshop story's `thumb-256` legibility claim machine-checked against its computed 256px title size; moves the weakest Scorecard row (Thumbnail readability, 0%).
- Scope: `tools/workshop.mjs`, `tests/workshop.test.mjs` only.
- Proof: P2P `node tools/workshop.mjs --check` → WORKSHOP PASS (F2P: lied-claim fixture passed before the gate existed).
- Stop: L 45 min; at the budget report what landed and the next step.

What landed: DS-40 built end to end in one standing-run item. `tools/workshop.mjs` (+13 lines) gains a `story <id> thumb claim matches math` gate per block: it parses the `<n>px at 256w` figure from the story's `thumb-256` comment and fails closed when it disagrees with `titlePx*256/width` by more than 0.15px or when no figure is cited — no gate weakened, no story/snapshot file touched (034's 6 stories + snapshots left to its claimed run). `tests/workshop.test.mjs` (+20 lines) gains two tests: a lied-claim fixture fails naming the new check, and all 10 real stories' claims match the math. F2P reproved on the pre-change code (lied claim `18.0px at 256w` passed → gate unbuilt); post-change the same fixture fails and the suite is green. Other dirty files in the tree (audit, registry, ad-square, hero review) are other runs' in-flight work — untouched. No commit (helpers never commit; lead lands it with 034).

Proof run by me on the real files: `node tools/workshop.mjs --check` → `WORKSHOP PASS: 10 stories, 256px titles legible, snapshots match`, plus `node --test tests/workshop.test.mjs` → 7 pass / 0 fail, 10/10 `thumb claim matches math` PASS.

Next step: lead commits this with the 034 stories landing; DS-40 closes fully after the DS-39 315px re-pass verifies the 034 stories survive, which is what lifts Thumbnail off 0%.

RESULT: DONE - DS-40 thumb-claim-vs-math gate in tools/workshop.mjs plus 2 tests | proof: `node tools/workshop.mjs --check` WORKSHOP PASS 10 stories; `node --test tests/workshop.test.mjs` 7 pass 0 fail
</task_result>
</task>
