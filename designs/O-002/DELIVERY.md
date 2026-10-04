# DELIVERY O-002: cover:gumroad/ebook-funnel-builder for factory
1. Landing in factory: `products/gated-ads-funnel/ebook-funnel-builder/covers/from-design-studio/O-002/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out.png` 1280x720 = Gumroad cover; `out-630x500.png` = store card crop; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the product's own preview/ browser captures); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/Users/me/Desktop/autonomous-factory/products/gated-ads-funnel/ebook-funnel-builder/preview/cover-1270x760.png`; facts only from `C:/Users/me/Desktop/autonomous-factory/products/gated-ads-funnel/ebook-funnel-builder/listing/gumroad.md`.
6. Adopt: commit these bytes in factory, then point the Gumroad listing at `out.png` (card: `out-630x500.png`).
7. Proof in factory: `git log -1 --format=%h -- products/gated-ads-funnel/ebook-funnel-builder/covers/from-design-studio/O-002/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-002/brief.json`.
