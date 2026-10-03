---
role: builder
title: stranger has no entry point to the brief-to-render path
---

Goal: a stranger landing on the repo finishes the brief-to-render path in 15 minutes (the VISION stranger-15min bar): open one file, run one command, see one render.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only a new stranger entry (README.md quickstart: brief.json to out.png in one `node tools/check.mjs` run, plus where samples live) and nothing else; explicitly NOT any `tools/*.mjs` behavior, NOT `samples/*` content, NOT VISION.md wording, NOT K-04 generated-untrack (owned by K-04), NOT thumb fixed-width (owned by running 002-pilot-thumb-fixedwidth).

Proof: captures and outputs, all opened 2026-10-02: `ls *.md` shows only AGENTS.md + VISION.md (139 lines, research contract + steal map, no run steps); `Test-Path README.md` False, `ls docs` missing (no quickstart anywhere); `node tools/check.mjs` RESULT PASS (loop 20/20 plus 4 renders: cover 34186B, ad-square 35419B, story 69685B, hebrew-hero 28125B plus 4 thumbs) proves the path works but is undiscoverable; 8 renders opened and readable (samples/cover, ad-square, story, hebrew-hero out.png + thumb-256.png — ad-square out.png top-weighted with blank bottom half, noted not filed); `node C:/Users/me/Desktop/center/vision-check.mjs design-studio` RESULT PASS 6/0.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user clones the repo and finds agent instructions plus a research vision but no "run this first" page, and must guess `node tools/check.mjs` from the board; after the fix the same user opens README.md, runs the one printed command, and holds a rendered PNG in minutes.


## Result (completed)

<task id="ses_f00ae4c4fffeB8OWoHDYF9cU34" state="completed">
<task_result>
Stranger path verified — no edit needed:

- `README.md` (32 lines, landed in 90ca5f2 as 009 plus 018 update in 5c451ab) already gives the 15-min bar: open `samples/cover/brief.json`, run `node tools/check.mjs`, open `samples/cover/out.png` (+ thumb + audit), plus where-samples-live for all 6 gated samples. Matches current `node tools/check.mjs` suite (6 samples).
- 6-vs-11 remainder (cover-b + ads/*) is owned by queued 046/047 — explicitly not touched per this packet's Scope.
- No files changed by me; proof run re-rendered audits (expected side effect, left uncommitted for the lead).

Next step: 046 builder updates README where-samples-live + RESULT PASS wording for cover-b + ads set.

RESULT: NOOP - README quickstart already landed (009+018), re-verified, 046 owns 6-vs-11 remainder | proof: `node tools/check.mjs` RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits (20/20 loop, cover/ad-square/story/hebrew-hero/jobhunt/cv green)

</task_result>
</task>
