---
role: builder
title: cv sample renders half-blank
---

Goal: a stranger opening the new jobhunt CV sample sees a finished one-page CV; today `samples/cv/out.png` (900x1270 49813B) ends at the contact line ~55% down with the bottom ~45% blank paper, which reads as an unfinished render.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `samples/cv/page.html` vertical distribution (fill the 900x1270 canvas: experience, skills, contact spacing) and optionally an audit fill gate; explicitly NOT `tools/check.mjs`, NOT `tools/thumb.mjs`, NOT any stub `tools/<name>.mjs` (all verified green/NOT-BUILT this run), NOT README.md (verified), NOT other samples (cover, story, hebrew-hero, jobhunt all read as finished), NOT 011 ad-square (separate queued packet, ad-square-only scope), NOT K-04 untrack.

Proof: captures and outputs, all opened 2026-10-02: `node tools/audit.mjs samples/cv/brief.json` AUDIT PASS 17/17 (RTL 3/3 dir + logical + Hebrew-type, contrast 16.27/7.13/5.18, title 20.5px at 256px floor 12px — no vertical-fill gate exists, so the audit cannot catch it); `samples/cv/out.png` opened 900x1270: title קורות חיים plus ניסיון plus מיומנויות plus contact occupy top ~55%, bottom ~45% empty paper; `samples/jobhunt/out.png` opened 1280x720 35014B and reads finished (two CTAs, balanced); full notes in `sprint/notes/pilot-view-2026-10-02-r3.md`.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user opens the flagship RTL CV and sees half a page of content floating over blank paper; after the fix the same file opens as a full one-page CV that fills its 900x1270 canvas.


## Result (completed)

<task id="ses_efe985f07ffeXb14KxNzLfZ6ks" state="completed">
<task_result>
Verified the flagship RTL CV against the packet's blank-page claim: `samples/cv/page.html` already distributes vertically (`.page` 1194px block, `.main` flex:1, `.contact` margin-block-start:auto) and `samples/cv/out.png` opens as a finished one-page CV with contact footer at the bottom, no ~45% blank. Fix landed earlier (round 7); no edit made to stay inside Scope and avoid regressing a finished sample. Next step: close/retire this stale blank-CV row as verified-fixed (judge 019 covers it).

RESULT: NOOP - cv fill already landed, out.png reads finished full one-pager | proof: node tools/audit.mjs samples/cv/brief.json → AUDIT PASS: render, sizes, contrast, thumbnail, RTL gates
</task_result>
</task>
