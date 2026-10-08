# DELIVERY O-017: cover:gumroad/pdf-tables-excel for factory
1. Landing in factory: `packs/products/pdf-tables-excel/covers/from-design-studio/O-017/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out.png` 1280x720 = Gumroad cover; `out-630x500.png` = store card crop; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the tool's own demo/ preview pages); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `none`; facts only from `C:/empire/autonomous-factory/packs/products/pdf-tables-excel/STORE_LISTING.md`.
6. Adopt: commit these bytes in factory, then point the Gumroad listing at `out.png` (card: `out-630x500.png`).
7. Proof in factory: `git log -1 --format=%h -- packs/products/pdf-tables-excel/covers/from-design-studio/O-017/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-017/brief.json`.
