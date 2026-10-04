# DELIVERY O-006: post-visual:aeo-checker for marketing-studio
1. Landing in marketing-studio: `from-design-studio/O-006/` (copy this whole folder; never edit a file outside from-design-studio/). Nothing is posted by design-studio.
2. `out.png` 1200x630 = link card for the post or the page; `out-1080x1080.png` = square for the feed; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` (no images: the 20 signals are text from checker.md); `assets.json` is empty on purpose.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks).
5. Headline verbatim from the order: Is your site answer-ready? Free 60-second checker. Facts only from `campaigns/aeo-checker/checker.md`: 20 on-page signals, free result on screen, 3 steps. No scores or audit numbers.
6. Adopt: commit these bytes in marketing-studio and point the post step of `campaigns/aeo-checker` at `out.png` and `out-1080x1080.png`; the loop posts through its own gate.
7. Proof in marketing-studio: `git log -1 --format=%h -- from-design-studio/O-006/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-006/brief.json`.
