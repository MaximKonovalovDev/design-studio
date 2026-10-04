# ADOPT: Pixel Arena UI pack (order O-023), one page

What you get (all CC0, every pixel authored in design-studio, no third-party font or art data)
- `ui-atlas.png` + `ui-atlas.json`: 27 pieces in 256x64 (2 panels, 7 buttons in 3 states, bar frame and 4 fills, 2 slots, 11 icons). `slice` = [left, top, right, bottom] for 9-slice pieces. Nearest filter, no mipmaps, integer scale only.
- `font-5x7.png` + `font-5x7.json` + `ds-pixel-5x7.ttf`: 95 ASCII glyphs (0x20 to 0x7E), 5x7 pixels in 6x8 cells on a 16 x 6 grid. The PNG is white on transparent: tint it. The TTF has the same shapes (125 units per pixel).
- `tokens.json` (colors equal `kits/game-ui/tokens.css`), `layout.json` (the Rome bout HUD and a main menu in a 640x360 reference: x2 = 1280x720, x3 = 1920x1080, x4 = 2560x1440).
- `preview-hud.png`, `preview-menu.png`: made from those files by `node tools/ui-pack.mjs` in design-studio, so they show what your build should draw.

forge (Rome ladder step 7, HUD)
1. Copy this folder to `from-design-studio/O-023/` in forge and commit it.
2. In the Rome HUD code under `game/slice/rome/` load `ui-atlas.json` and `layout.json`; draw `hud` elements in the 640x360 reference and multiply by the integer scale. Import the PNGs with point sampling and no compression.
3. Cite the kit in that file so `scripts/rome-score.mjs` step 7 reads it: `// design-studio/kits/game-ui (order O-011), engine pack from-design-studio/O-023 (order O-023)`.
4. Labels: import `ds-pixel-5x7.ttf` as the UI font, size a multiple of 8 so the pixels stay square.

engine2040 (`crates/ui/src/text.rs`)
1. Copy the same folder under `assets/` and commit it.
2. The grid already matches `Atlas`: `FIRST` 0x20, `LAST` 0x7E, `COUNT` 95, `COLS` 16, `ROWS` 6. Change `GLYPH_W` 3 to 5 and `GLYPH_H` 5 to 7, set the cell to 6x8 (atlas 96x48), and fill the static bitmaps from `font-glyphs.json` (7 strings of 5 chars per glyph, `#` = lit). `layout`, UV rects and `emit_quads` keep their shape.
3. Menus (`menus.rs`): use the `menu` list of `layout.json` for the panel, the button states (normal, hover, pressed, disabled) and the text colors.

Proof
- design-studio: `node tools/ui-pack.mjs --check` -> UIPACK PASS; `node tools/audit.mjs designs/O-023/brief.json` -> PASS.
- Adopted when your commit holds identical bytes: `git log -1 --format=%h -- from-design-studio/O-023/ui-atlas.png`; the lead then writes that hash into `orders.csv`.
