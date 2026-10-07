# DELIVERY O-087: cover:gumroad/niche-playbook-solo-business for factory
1. Landing in factory: `products/services/niche-playbook-solo-business/covers/from-design-studio/O-087/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out.png` 1280x720 = Gumroad cover; `out-630x500.png` = store card crop; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of the product's own preview/ pictures); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `C:/Users/me/Desktop/autonomous-factory/products/services/niche-playbook-solo-business/preview/cover-1280x720.png`; facts only from `C:/Users/me/Desktop/autonomous-factory/products/services/niche-playbook-solo-business/listing/gumroad.md`.
6. Adopt: commit these bytes in factory, then point the Gumroad listing at `out.png` (card: `out-630x500.png`).
7. Proof in factory: `git log -1 --format=%h -- products/services/niche-playbook-solo-business/covers/from-design-studio/O-087/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-087/brief.json`.
