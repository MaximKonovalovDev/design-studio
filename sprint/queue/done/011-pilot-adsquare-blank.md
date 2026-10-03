---
role: builder
title: ad-square sample renders half-blank
---

Goal: a stranger following the README quickstart opens every sample render and sees four finished creatives; today `samples/ad-square/out.png` shows the hero cramped in the top ~60% with the bottom ~40% blank, which reads as an unfinished render.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `samples/ad-square/page.html` vertical distribution (fill the 1080x1080 canvas) and optionally an audit fill gate; explicitly NOT `tools/check.mjs`, NOT `tools/thumb.mjs` fixed-width path (002 fixed, verified), NOT any stub `tools/<name>.mjs` (landed 90ca5f2, verified), NOT README.md (landed, verified), NOT other samples (cover, story, hebrew-hero all read fine), NOT K-04 untrack (board-owned, active seat).

Proof: captures and outputs, all opened 2026-10-02: `node tools/check.mjs` RESULT PASS (loop 20/20 plus cover 1280x720 34186B thumb 5567B, ad-square 1080x1080 35419B thumb 6591B, story 1080x1920 69685B thumb 12227B, hebrew-hero 1280x720 28125B thumb 3837B); `samples/ad-square/out.png` opened: title DESIGN THAT SELLS plus subtitle plus CTA occupy top ~60%, bottom ~40% empty paper; `samples/ad-square/thumb-256.png` opened 256x256: same half-blank layout faithfully miniaturized; `node tools/audit.mjs samples/ad-square/brief.json` path green via check run (no vertical-fill gate exists, so the audit cannot catch it); cover/story/hebrew-hero out.png plus thumbs opened and read as finished; 7 stubs print NOT-BUILT usage exit 1 (no regression); full notes in `sprint/notes/pilot-view-2026-10-02-r2.md`.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user runs the one quickstart command and three of four samples look shipped while the square creative looks broken; after the fix the same run yields four renders that all look intentional at full size and at 256px.


## Result (completed)

<task id="ses_f00ae4c1bffe1CB0NteTcQjeEO" state="completed">
<task_result>
Done. The square creative's hero no longer floats in pooled whitespace: `.main` distributes kicker → title → sub → CTA evenly down the 1080px canvas, with the proof strip + accent footer grounding the bottom. Title, CTA, and token-only colors untouched; no audit gate added (judge 017 needs none, and a pixel-fill gate would risk the other five samples).

What landed: `samples/ad-square/page.html` 2-line CSS change (`justify-content: center` → `space-evenly`, balanced padding) plus re-rendered `out.png`/`thumb-256.png`/`design-audit.json` from the proof run, and run note `sprint/notes/011-adsquare-fill.md`. Pre-existing working-tree mods (other samples' `design-audit.json`, queue moves) left untouched. Next step: lead commits `samples/ad-square/page.html` (+ its regenerated outputs) only.

RESULT: DONE - ad-square vertical rhythm fixed, canvas reads finished at full size and 256px | proof: node tools/check.mjs RESULT PASS (loop 20/20, ad-square 1080x1080 50914B thumb 9134B) + audit AUDIT PASS
</task_result>
</task>
