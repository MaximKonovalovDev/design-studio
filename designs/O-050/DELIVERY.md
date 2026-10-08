# DELIVERY O-050: cover:itch/aeo-done-for-you for factory
1. Landing in factory: `products/marketing-studio/aeo-done-for-you/covers/from-design-studio/O-050/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out-630x500.png` = the itch.io cover image (630x500); `out.png` 1280x720 = the 16:9 version for a banner or screenshot slot; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of C:/empire/autonomous-factory/products/marketing-studio/aeo-done-for-you/preview/ (the product's own pictures)); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/empire/autonomous-factory/products/marketing-studio/aeo-done-for-you/preview/cover-1280x720.png`; facts only from `C:/empire/autonomous-factory/products/marketing-studio/aeo-done-for-you/listing/itch.md`.
6. Adopt: commit these bytes in factory, then set the itch.io cover image to `out-630x500.png` (banner or screenshot slot: `out.png`).
7. Proof in factory: `git log -1 --format=%h -- products/marketing-studio/aeo-done-for-you/covers/from-design-studio/O-050/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-050/brief.json`.
