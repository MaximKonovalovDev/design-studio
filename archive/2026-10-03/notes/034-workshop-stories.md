# 034 workshop stories fix — run note (2026-10-02T14:20Z)

Goal: `node tools/workshop.mjs --check` green again (10/10 stories).
Found: 6 stories + 6 snapshots already on disk untracked (testimonial, faq, stats, gallery, newsletter, footer), same DS-07 pattern as hero/cta (data-story, source-fragment cite, width 1280, ws-title 64px -> 12.8px at 256w, thumb-256 comment, 0 hex, var(--*) tokens).
Review: each story mirrors its block (quote+attr, 3 Q&A, 3 stats, 3 tiles, subscribe CTA, footer links); logical properties where directional. No gate touched.
Re-pin: `node tools/workshop.mjs --write` re-pinned 10/10 (byte-identical), `--check` re-passed.
Proof: `node tools/workshop.mjs --check` → WORKSHOP PASS 10 stories; `node --test tests/workshop.test.mjs` → 5/5 pass; `node tools/check.mjs` → RESULT PASS.
Next: lead commits workshop/stories/{testimonial,faq,stats,gallery,newsletter,footer}.html + workshop/snapshots/{...}.txt (12 files) and flips DS-07 DOING→DONE.
