---
role: builder
title: hero ad reflow for wide sizes
---

Goal: the hero ad scores 10/10 at every size in the matrix, not just its native 1280x720: `samples/ads/hero/page.html` reflows its title box so 1080x1080 and 1200x628 pass the title-fits gate (today: need ~1056px vs box 907px/1008px, 9/10 SHIP).

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `samples/ads/hero/page.html` title sizing (fluid title_px, wider box, or size-aware rules) plus its re-render; explicitly NOT `tools/audit.mjs` gates (DS-23 judged-good, do not weaken the gate to pass), NOT `tools/check.mjs`, NOT other samples, NOT README.md.

Proof: `node tools/audit.mjs samples/ads/hero/brief.json` AUDIT PASS with the per-size matrix green at all 3 sizes; `node tools/judge.mjs samples/ads/hero/brief.json` SHIP 10/10; the render opened with your own eyes still reads as the same finished hero at 1280x720; `node tools/check.mjs` stays RESULT PASS.

Stop: M 30 min; at the budget report what landed and the next step.
