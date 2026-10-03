---
role: builder
title: new jobhunt and cv samples have no thumbnail and skip the quickstart
---

Goal: a stranger gets the same pixel-backed loop for every sample: `samples/jobhunt/` and `samples/cv/` each ship a `thumb-256.png` beside `out.png`, and `node tools/check.mjs` renders + audits them like the other four.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `tools/check.mjs` SAMPLES list (add jobhunt, cv with their 256px thumbs via the existing renderThumb path) plus the two `thumb-256.png` artifacts; explicitly NOT `samples/jobhunt/page.html`, NOT `samples/cv/page.html` content (cv fill owned by 014), NOT `tools/audit.mjs` gates, NOT `tools/thumb.mjs` math, NOT any stub `tools/<name>.mjs`, NOT README.md wording (shape line already promises parity), NOT K-04 untrack.

Proof: captures and outputs, all opened 2026-10-02: `Get-ChildItem samples/jobhunt` shows brief.json + design-audit.json + out.png 35014B + page.html + tokens (NO thumb-256.png); `Get-ChildItem samples/cv` shows brief.json + design-audit.json + out.png 49813B + page.html + tokens (NO thumb-256.png); `Get-ChildItem samples/cover` shows out.png + thumb-256.png 5567B + design-audit.json + DESIGN-REVIEW.md (the promised shape); README.md lines 29-30 promise "Each folder is the same shape ... (+ thumb-256.png)" which jobhunt/cv break; `node tools/check.mjs` RESULT PASS covers only cover/ad-square/story/hebrew-hero (SAMPLES list 4 entries), so the quickstart stranger never renders the two RTL samples; `node tools/audit.mjs samples/jobhunt/brief.json` and `samples/cv/brief.json` both AUDIT PASS 17/17 with math-only "title legible at 256px" and no pixels to open; full notes in `sprint/notes/pilot-view-2026-10-02-r3.md`.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user runs the one documented command and gets four thumbed, pixel-backed samples while the two Hebrew RTL flagships sit outside the loop with an unbacked thumbnail claim; after the fix the same run yields six renders each with an openable 256px miniature.


## Result (completed)

<task id="ses_efe985ef5ffeZDb6GV1ChwApHm" state="completed">
<task_result>
015 verified NOOP: the jobhunt/cv parity fix was already in HEAD (6-entry SAMPLES + both tracked thumbs), so I made no code change and confirmed it with a fresh full-suite run — jobhunt and cv each render, thumb, and audit green alongside the other four.

RESULT: NOOP - 015 fix already landed, verified 6-sample parity with fresh run | proof: node tools/check.mjs → RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits
</task_result>
</task>
