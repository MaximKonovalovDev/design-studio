# DELIVERY O-003: cover:gumroad/episode-clips-vol1 for factory
1. Landing in factory: `products/clip-repurpose/episode-clips-vol1/covers/from-design-studio/O-003/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out.png` 1280x720 = Gumroad cover; `out-630x500.png` = store card crop; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the product's own assets/covers/ templates); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/Users/me/Desktop/autonomous-factory/products/clip-repurpose/episode-clips-vol1/preview/cover-b-1280x720.png`; facts only from `C:/Users/me/Desktop/autonomous-factory/products/clip-repurpose/episode-clips-vol1/listing/gumroad.md`.
6. Adopt: commit these bytes in factory, then point the Gumroad listing at `out.png` (card: `out-630x500.png`).
7. Proof in factory: `git log -1 --format=%h -- products/clip-repurpose/episode-clips-vol1/covers/from-design-studio/O-003/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-003/brief.json`.
