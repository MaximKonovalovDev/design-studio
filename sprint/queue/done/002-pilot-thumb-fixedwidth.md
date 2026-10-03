---
role: builder
title: thumb fixed-width pages render as sliver
---

Goal: a stranger's 256px thumbnail looks like the cover: `node tools/thumb.mjs samples/cover/brief.json` writes a viewable miniature of the hero, not an orange sliver.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `tools/thumb.mjs` (thumb render path: viewport, scale or downscale-from-full-size) plus its self-check; explicitly NOT `samples/cover/*`, NOT `tools/audit.mjs`, NOT `tools/check.mjs` (owned by running 001-pilot-cover-thumb).

Proof: captures and outputs, all opened 2026-10-02: `node tools/check.mjs` RESULT PASS (loop 20/20 plus 4 sample renders plus audits); `node tools/thumb.mjs --check` THUMB PASS math only (cover 256x144, story 256x455, square 256x256, capsule 256x147); `node tools/thumb.mjs samples/cover/brief.json C:/Users/me/AppData/Local/Temp/opencode/pilot-thumb-test.png` THUMB OK 256x144 495B (opened: white field with one cropped orange rule, no title, no CTA); `samples/cover/out.png` 1280x720 34186B (opened: clean hero DESIGN THAT SHIPS, readable at full size); `samples/cover/thumb-256.png` (opened: identical sliver to the fresh thumb, not a miniature); root cause in `samples/cover/page.html` line 10 `body { width: 1280px; height: 720px; }` (same fixed-width pattern in `samples/ad-square/page.html` line 11 `width: 1080px`); `samples/ad-square/out.png` 1080x1080 (opened: hero cramped top, large blank bottom), `samples/story/out.png` 1080x1920 (opened), `samples/hebrew-hero/out.png` 1280x720 (opened: correct RTL hero); `samples/cover/tokens.html` docs render 1280x720 16287B (opened: last `--line` swatch cropped at viewport bottom).

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user runs the documented thumb command and gets a 495B sliver that looks like a rendering bug, while the audit still prints "title legible at 256px: 19.2px" as trusted math; after the fix the same command writes a real 256px miniature where the title and CTA are recognizable, backing the audit gate with pixels.


## Result (completed)

<task id="ses_f00b3ee49ffe2LnSwNe8Mt1gtm" state="completed">
<task_result>
No edit needed: `tools/thumb.mjs` already carries the iframe-scaled miniature path (scale 256/brief-w, 1024B blank floor) and all proofs pass — thumb is a real miniature, not the 495B sliver. Next step: close 002, no re-file.

RESULT: NOOP - thumb fix already landed in HEAD, verified miniature render | proof: `node tools/thumb.mjs samples/cover/brief.json` THUMB OK 256x144 5567B
</task_result>
</task>
