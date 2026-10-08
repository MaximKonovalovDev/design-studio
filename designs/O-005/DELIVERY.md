# DELIVERY O-005: cover:gumroad/artist-launch-pack for factory
1. Landing in factory: `products/creator-packs/artist-launch-pack/covers/from-design-studio/O-005/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out.png` 1280x720 = Gumroad cover; `out-630x500.png` = store card crop; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the product's own assets/ files (post tiles downscaled)); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/empire/autonomous-factory/products/creator-packs/artist-launch-pack/preview/cover-1820x1213.png`; facts only from `C:/empire/autonomous-factory/products/creator-packs/artist-launch-pack/listing/gumroad.md`.
6. Adopt: commit these bytes in factory, then point the Gumroad listing at `out.png` (card: `out-630x500.png`).
7. Proof in factory: `git log -1 --format=%h -- products/creator-packs/artist-launch-pack/covers/from-design-studio/O-005/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-005/brief.json`.
