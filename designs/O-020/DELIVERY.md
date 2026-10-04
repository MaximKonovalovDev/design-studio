# DELIVERY O-020: cover:itch/aeo-visibility-audit-kit for factory
1. Landing in factory: `products/marketing-studio/aeo-visibility-audit-kit/covers/from-design-studio/O-020/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out.png` 1280x720 = itch.io cover; `out-630x500.png` = store card crop; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the product's own preview/ renders of its kit files); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/Users/me/Desktop/autonomous-factory/products/marketing-studio/aeo-visibility-audit-kit/preview/cover-630x500.png`; facts only from `C:/Users/me/Desktop/autonomous-factory/products/marketing-studio/aeo-visibility-audit-kit/listing/itch.md`.
6. Adopt: commit these bytes in factory, then point the itch.io listing at `out.png` (card: `out-630x500.png`).
7. Proof in factory: `git log -1 --format=%h -- products/marketing-studio/aeo-visibility-audit-kit/covers/from-design-studio/O-020/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-020/brief.json`.
