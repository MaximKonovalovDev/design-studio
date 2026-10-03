---
role: builder
title: hero ad reflow for wide sizes
---

Goal: the hero ad scores 10/10 at every size in the matrix, not just its native 1280x720: `samples/ads/hero/page.html` reflows its title box so 1080x1080 and 1200x628 pass the title-fits gate (today: need ~1056px vs box 907px/1008px, 9/10 SHIP).

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `samples/ads/hero/page.html` title sizing (fluid title_px, wider box, or size-aware rules) plus its re-render; explicitly NOT `tools/audit.mjs` gates (DS-23 judged-good, do not weaken the gate to pass), NOT `tools/check.mjs`, NOT other samples, NOT README.md.

Proof: `node tools/audit.mjs samples/ads/hero/brief.json` AUDIT PASS with the per-size matrix green at all 3 sizes; `node tools/judge.mjs samples/ads/hero/brief.json` SHIP 10/10; the render opened with your own eyes still reads as the same finished hero at 1280x720; `node tools/check.mjs` stays RESULT PASS.

Stop: M 30 min; at the budget report what landed and the next step.


## Result (completed)

<task id="ses_efe46d4a7ffewYggQiHn1NWwOG" state="completed">
<task_result>
Verified the 028 slice as-is: no code change needed — the reflow already sits in HEAD.

- `samples/ads/hero/brief.json` (HEAD): `title_px` 78, `title_box` [0.05,0.3,0.95,0.55] — need ~936px vs boxes 1152/972/1080px, all 3 matrix sizes green.
- `samples/ads/hero/page.html` (HEAD): `.hero` 1152px max-width 90%, `h1 clamp(60px,6.1vw,78px)` — untouched by me, no gate touched (`tools/audit.mjs` DS-23 matrix intact, `--sizes --check` SIZES+AD-SQUARE PASS with cramped fixtures still FAILing first).
- Render opened with my own eyes at 1280x720: same finished hero — one-line title, sub, proof strip, orange CTA, accent rules.
- `node tools/check.mjs` full suite stays RESULT PASS.

Next step: lead closes 028 (fix already committed in dbeb292) and runs judge packet 029 for the independent verdict; helpers do not commit.

RESULT: NOOP - hero reflow already in HEAD, verified green no edit | proof: node tools/audit.mjs samples/ads/hero/brief.json → AUDIT PASS (22 green, SHIP 10/10, check.mjs RESULT PASS)
</task_result>
</task>
