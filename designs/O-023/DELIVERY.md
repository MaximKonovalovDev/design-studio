# DELIVERY O-023: game-ui:rome-ui-pack for forge
1. Landing in forge: `from-design-studio/O-023/` (copy the whole folder; never edit a file outside from-design-studio/). engine2040 copies the same folder.
2. Load these: `ui-atlas.png` + `ui-atlas.json` (27 pieces, 9-slice `slice` data, nearest filter, integer scale), `font-5x7.png` + `font-5x7.json` (95 ASCII glyphs, 6x8 cells) and `ds-pixel-5x7.ttf` (same glyphs as outlines), `tokens.json`, `layout.json` (HUD and menu in a 640x360 reference).
3. Look at: `preview-hud.png`, `preview-menu.png`, `preview-atlas.png` (made from the files above by `node tools/ui-pack.mjs`), `page.html` + `out.png` (kit sheet), `thumb-256.png`.
4. How to adopt in 10 minutes: `ADOPT.md` (forge Rome step 7, engine2040 `engine-ui` text atlas). Licence: CC0 (`LICENSE.txt`), no third-party font or art data.
5. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md`; here `node tools/ui-pack.mjs --check` -> UIPACK PASS.
6. Adopt: copy the folder, load the atlas and font from the JSON, build the HUD and menu from `layout.json`; forge cites `design-studio/kits/game-ui` and O-011 in its Rome file for `rome-score` step 7 and may add O-023.
7. Proof in forge or engine2040: `git log -1 --format=%h -- from-design-studio/O-023/ui-atlas.png`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-023/brief.json`.
