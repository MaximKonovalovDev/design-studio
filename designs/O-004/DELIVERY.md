# DELIVERY O-004: cover:gumroad/tiks-sfx-factory for factory
1. Landing in factory: `products/game-dev-2d/tiks-sfx-factory/covers/from-design-studio/O-004/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out.png` 1280x720 = Gumroad cover; `out-630x500.png` = store card crop; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the product's own preview/ renders of its real waveforms); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/empire/autonomous-factory/products/game-dev-2d/tiks-sfx-factory/preview/cover-1280x720.png`; facts only from `C:/empire/autonomous-factory/products/game-dev-2d/tiks-sfx-factory/listing/gumroad.md`.
6. Adopt: commit these bytes in factory, then point the Gumroad listing at `out.png` (card: `out-630x500.png`).
7. Proof in factory: `git log -1 --format=%h -- products/game-dev-2d/tiks-sfx-factory/covers/from-design-studio/O-004/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-004/brief.json`.
