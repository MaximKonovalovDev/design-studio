# DELIVERY O-021: cover:itch/aeo-visibility-mini-check for factory
1. Landing in factory: `products/marketing-studio/aeo-visibility-audit-kit/covers/from-design-studio/O-021/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out-630x500.png` = the itch.io cover image (630x500); `out.png` 1280x720 = the 16:9 version for a banner or screenshot slot; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the kit's own preview/ render of its probe banks (a 5-probe excerpt per category)); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/empire/autonomous-factory/products/marketing-studio/aeo-visibility-audit-kit/preview/cover-630x500.png`; facts only from `C:/empire/autonomous-factory/products/marketing-studio/aeo-visibility-audit-kit/listing/free-magnet/itch-free.md`.
6. Adopt: commit these bytes in factory, then set the itch.io cover image to `out-630x500.png` (banner or screenshot slot: `out.png`).
7. Proof in factory: `git log -1 --format=%h -- products/marketing-studio/aeo-visibility-audit-kit/covers/from-design-studio/O-021/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-021/brief.json`.
