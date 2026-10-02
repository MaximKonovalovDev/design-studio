---
role: builder
title: cover thumbnail proof plus probe cleanup
---

Goal: a stranger can SEE the DS-12 cover is thumbnail-readable: `samples/cover/` gains a real 256px thumbnail artifact referenced by `DESIGN-REVIEW.md`, and the triplicate `probe.png` / `probe2.png` confusion is gone (removed or documented in one line).

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `samples/cover/` (new `thumb-256.png` or equivalent, `DESIGN-REVIEW.md` thumbnail line, `probe*.png` handling) plus whatever tool writes it (`tools/audit.mjs` and/or `tools/check.mjs`).

Proof: captures and outputs, all opened 2026-10-02: `samples/cover/out.png` 1280x720 34186B (opened, clean hero, readable at full size); `probe.png` and `probe2.png` are byte-identical to `out.png` (SHA256 7DB28EE236D8831983CA8D2F0819C4449F248192DB7A2E46281175EDB9C9C3A5, all three); `node tools/check.mjs` RESULT PASS (loop 20/20 plus render plus audit); `node tools/audit.mjs samples/cover/brief.json` AUDIT PASS with computed-only gate `title legible at 256px: 19.2px at 256px wide (floor 12px)` and no image artifact; `C:\Users\me\AppData\Local\Temp\opencode\tokens-docs.png` 1280x720 15851B (opened, `tokens.html` docs render crops the last swatch at 720px viewport). Done when a 256px thumbnail file exists beside `out.png`, `DESIGN-REVIEW.md` names it with its verdict, and `probe*.png` are either gone or one line says what they are.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user reads "title legible at 256px: 19.2px" as text and must trust the math, while three identical full-size PNGs sit unexplained in the folder; after the fix the user opens one small thumbnail file that looks like the store listing and sees exactly one canonical render plus its thumbnail.


## Result (completed)

<task id="ses_f03bce1f8ffe5JqSZB2fL0gmo5" state="completed">
<task_result>
Done. What landed:

- **`samples/cover/thumb-256.png` (256×144, 5567B)** — a real store-listing-style thumbnail beside `out.png`. Key catch: the naive approach (screenshot at a 256px viewport) produced a 495B near-blank crop — 10 distinct byte values, just paper background — because the hero is fixed 1280px wide. So the writer renders the full page in an iframe scaled by CSS `transform: scale(256/briefW)` and screenshots that: full hero, title/CTA legible, 253/256 byte values. Opened and eye-confirmed.
- **`tools/check.mjs`** now writes `thumb-256.png` per sample (reuses `thumbSize` from `tools/thumb.mjs`, which I deliberately did not touch — outside Scope) with a 1024B floor that rejects blank crops. All 4 samples green: cover 5567B, ad-square 6591B, story 12227B, hebrew-hero 3837B.
- **`probe.png` / `probe2.png` deleted** — verified byte-identical triplicates first (SHA256 `7DB28EE2…9C3A5` on all three), so removal loses zero pixels.
- **`DESIGN-REVIEW.md`** thumbnail bullet now names `thumb-256.png` with the human verdict, and the Verdict line records the eye-confirmation. (Note: a loop `judge.mjs` run refreshed the contrast numbers mid-session; my two lines landed cleanly on top.)

Proof (all run by me on the real files):
- `node tools/check.mjs` → `RESULT PASS: loop check plus 4 sample renders plus thumbs plus audits` (loop 20/20, 4 renders, 4 thumbs, 4 audits)
- `node tools/audit.mjs samples/cover/brief.json` → `AUDIT PASS` incl. `title legible at 256px: 19.2px at 256px wide (floor 12px)`

Next step (for lead, I don't commit): commit `samples/cover/` + `tools/check.mjs` and close `001-pilot-cover-thumb`. Follow-up candidate: teach `judge.mjs writeReview` to emit the thumbnail line itself, or the next judge run wipes my hand-written reference; the `tokens-docs.png` crop note stays a separate packet.

RESULT: DONE - real 256px thumbnail beside out.png wired into check.mjs, probe duplicates removed, review names thumb with verdict | proof: `node tools/check.mjs` RESULT PASS: loop check plus 4 sample renders plus thumbs plus audits
</task_result>
</task>
