---
role: builder
title: README lists 6 samples while the repo ships 11
---

Goal: a stranger following README.md sees every finished sample: README names 6 samples (cover, ad-square, story, hebrew-hero, jobhunt, cv) but the repo ships 11 finished sample dirs — samples/cover-b (factory pilot, 1280x720 53562B, opened: clean hero plus 315px listing strip) plus samples/ads/ad-1, ad-2, ad-3 (opened ad-1: finished DESIGN THAT SELLS 1080x1080) plus samples/ads/hero (opened: Ship the landing tonight 1280x720 42384B with receipt.json) — none mentioned anywhere in README.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only README.md (where-samples-live entries for cover-b plus the ads set, plus the RESULT PASS wording that says "all 6 sample renders"); explicitly NOT `tools/check.mjs` SAMPLES list (owned by 047), NOT any `samples/*` content, NOT `tools/audit.mjs` gates, NOT 018-pilot-readme-stale (that row covered 4-vs-6 jobhunt/cv, this is the new 6-vs-11 remainder: cover-b plus ads/*).

Proof: captures and outputs, all opened 2026-10-03: README.md lines 22-30 listing 6 samples plus line 19-20 "all 6 sample renders"; `Get-ChildItem samples -Directory` 8 dirs plus `samples/ads` 4 dirs = 11 sample dirs on disk; `samples/cover-b/out.png` 1280x720 53562B opened readable; `samples/ads/ad-1/out.png` opened finished creative; `samples/ads/hero/out.png` 1280x720 42384B opened plus `receipt.json` url+date+rev present; `node tools/check.mjs` RESULT PASS covers 6 only.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user runs the documented command, gets six renders described, and never learns the factory pilot cover or the marketing ad set exist; after the fix the same README walks them to all 11 finished renders.
