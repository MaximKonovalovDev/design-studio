# DELIVERY O-025: order:fleet-vol-1-store-art-for-skillworks-cov for skillworks
1. Landing in skillworks: `packs/fleet-vol-1/from-design-studio/O-025/` (copy this whole folder; never edit a file outside from-design-studio/).
2. `out.png` 1280x720 = Gumroad cover; `out-630x500.png` = store card crop; `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` + `assets/` (copies of no product pictures exist yet (the pack ships no preview/ images and its listing marks the cover, the demo GIF and the screenshots all 'needed, not made yet'); the art is CSS-only with real commands named in the listing); `assets.json` lists each picture.
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md` (five checks), `compare.png` (ours vs the cover to beat).
5. Cover to beat: `none`; facts only from `C:/Users/me/Desktop/skillworks/packs/fleet-vol-1/listing.md`.
6. Adopt: commit these bytes in skillworks, then point the Gumroad listing at `out.png` (card: `out-630x500.png`).
7. Proof in skillworks: `git log -1 --format=%h -- packs/fleet-vol-1/from-design-studio/O-025/out.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-025/brief.json`.
