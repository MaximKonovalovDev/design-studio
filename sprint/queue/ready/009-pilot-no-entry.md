---
role: builder
title: stranger has no entry point to the brief-to-render path
---

Goal: a stranger landing on the repo finishes the brief-to-render path in 15 minutes (the VISION stranger-15min bar): open one file, run one command, see one render.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only a new stranger entry (README.md quickstart: brief.json to out.png in one `node tools/check.mjs` run, plus where samples live) and nothing else; explicitly NOT any `tools/*.mjs` behavior, NOT `samples/*` content, NOT VISION.md wording, NOT K-04 generated-untrack (owned by K-04), NOT thumb fixed-width (owned by running 002-pilot-thumb-fixedwidth).

Proof: captures and outputs, all opened 2026-10-02: `ls *.md` shows only AGENTS.md + VISION.md (139 lines, research contract + steal map, no run steps); `Test-Path README.md` False, `ls docs` missing (no quickstart anywhere); `node tools/check.mjs` RESULT PASS (loop 20/20 plus 4 renders: cover 34186B, ad-square 35419B, story 69685B, hebrew-hero 28125B plus 4 thumbs) proves the path works but is undiscoverable; 8 renders opened and readable (samples/cover, ad-square, story, hebrew-hero out.png + thumb-256.png — ad-square out.png top-weighted with blank bottom half, noted not filed); `node C:/Users/me/Desktop/center/vision-check.mjs design-studio` RESULT PASS 6/0.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user clones the repo and finds agent instructions plus a research vision but no "run this first" page, and must guess `node tools/check.mjs` from the board; after the fix the same user opens README.md, runs the one printed command, and holds a rendered PNG in minutes.
