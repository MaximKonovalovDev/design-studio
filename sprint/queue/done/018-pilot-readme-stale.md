---
role: builder
title: README quickstart documents 4 samples while the loop ships 6
---

Goal: a stranger following README.md sees every sample the quickstart renders; today the README names 4 samples (cover, ad-square, story, hebrew-hero) and says "all 4 sample renders", while `node tools/check.mjs` renders 6 (plus jobhunt 1280x720 and cv 900x1270 with thumbs), so the two Hebrew RTL flagships are invisible to the stranger.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only README.md (sample list plus "all 4" wording plus where-samples-live entries for jobhunt/cv); explicitly NOT `tools/check.mjs` SAMPLES list (already ships 6, verified), NOT `samples/jobhunt/page.html`, NOT `samples/cv/page.html` (014 fill verified fixed, full CV with contact footer renders), NOT `tools/audit.mjs` gates, NOT `tools/thumb.mjs`, NOT any stub `tools/<name>.mjs`, NOT K-04 untrack, NOT 002/008/009/011/014/015 (all verified, not re-filed).

Proof: captures and outputs, all opened 2026-10-02: README.md lines 19-20 "all 4 sample renders" plus lines 24-27 listing 4 samples (no jobhunt/cv); `node tools/check.mjs` RESULT PASS "loop check plus 6 sample renders plus thumbs plus audits" (cover 1280x720 34186B thumb 5567B; ad-square 1080x1080 50846B thumb 9164B; story 1080x1920 69685B thumb 12227B; hebrew-hero 1280x720 28125B thumb 3837B; jobhunt 1280x720 35014B thumb 5003B; cv 900x1270 98813B thumb 21777B); 12/12 captures opened and read as finished (6 out.png + 6 thumb-256.png incl. jobhunt RTL portfolio two CTAs, cv full one-pager with contact footer, ad-square full-bleed proof strip + footer); `node tools/audit.mjs samples/jobhunt/brief.json` AUDIT PASS 17/17; `node tools/audit.mjs samples/cv/brief.json` AUDIT PASS 17/17; full notes in `sprint/notes/pilot-view-2026-10-02-r4.md`.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user runs the one documented command, gets six finished renders, but the README tells them to look for four — the two RTL samples read as an undocumented surprise; after the fix the same run is described as six, and the stranger opens jobhunt/cv thumbs on purpose.


## Result (completed)

<task id="ses_efe89feedffeW7eal3DKCuevAM" state="completed">
<task_result>
Verified README already describes six samples; no edit needed. Proof re-ran green on real files.

- README.md lines 19-20 say "all 6 sample renders", lines 24-29 list cover, ad-square, story, hebrew-hero, jobhunt, cv — the two RTL flagships are visible.
- Fix previously landed in 5c451ab (round 8 lands 018); working tree shows no README diff.
- Next step: lead to commit pending bookkeeping (ready/012-021 deletions + done/ moves) — helper does not commit.

RESULT: NOOP - README 6-sample fix already in HEAD (5c451ab), no change | proof: node tools/check.mjs RESULT PASS: 20 pass, 0 warn, 0 fail / loop check plus 6 sample renders plus thumbs plus audits
</task_result>
</task>
