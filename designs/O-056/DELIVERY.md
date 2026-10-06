# DELIVERY O-056: cover:itch/character-animation-studio for factory
1. Landing in factory: `from-design-studio/O-056/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out-630x500.png` = the itch.io cover image (630x500); `out.png` 1280x720 = the 16:9 version for a banner or screenshot slot; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the product's own preview/ pictures); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/character-animation-studio/preview/cover.png`; facts only from `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/character-animation-studio/listing/itch.md`.
6. Adopt: commit these bytes in factory, then set the itch.io cover image to `out-630x500.png` (banner or screenshot slot: `out.png`).
7. Proof in factory: `git log -1 --format=%h -- from-design-studio/O-056/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-056/brief.json`.
