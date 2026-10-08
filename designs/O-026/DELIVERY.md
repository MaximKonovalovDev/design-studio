# DELIVERY O-026: cover:gumroad/fleet-pack for factory
1. Landing in factory: `products/skill-pack/fleet-pack/covers/from-design-studio/O-026/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out.png` 1280x720 = Gumroad cover; `out-630x500.png` = store card crop; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the factory product's own preview/ pictures (made by preview/make_previews.py from the buyer zip and real runs)); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/empire/autonomous-factory/products/skill-pack/fleet-pack/preview/cover-1280x720.png`; facts only from `C:/empire/autonomous-factory/products/skill-pack/fleet-pack/listing/gumroad.md`.
6. Adopt: commit these bytes in factory, then point the Gumroad listing at `out.png` (card: `out-630x500.png`).
7. Proof in factory: `git log -1 --format=%h -- products/skill-pack/fleet-pack/covers/from-design-studio/O-026/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-026/brief.json`.
8. Honest limits: `tools/donor.mjs`, `tools/compose.mjs`, `tools/mockup.mjs` and `orders-check --built` have not landed, so system pick (clean), compare.png and the built gate ran by hand through `tools/cover.mjs`; see NEED-08.
