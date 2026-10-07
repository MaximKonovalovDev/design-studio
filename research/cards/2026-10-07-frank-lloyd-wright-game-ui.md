# Frank Lloyd Wright for game UI + ornament (2026-10-07)

Question: What stealable design ideas from Frank Lloyd Wright help design-studio Game UI kits + Brief-to-render?
Corner: S1
Sources: https://en.wikipedia.org/wiki/Frank_Lloyd_Wright (accessed 2026-10-07); https://en.wikipedia.org/wiki/Prairie_School (accessed 2026-10-07)
License: IDEAS-ONLY | UNVERIFIED (Wright d. 1959; building/photo rights mixed, no photo/plan copied, own SVGs only)
What it really does: Prairie style = long flat lines, low roofs with wide eaves, ribbon windows, earth colors, small ornament cut in wood / glass / plaster. Pages only, no code read. Art-glass windows use straight-line grids with a few bright squares on clear glass. Ornament comes from one square/circle/hexagon unit, repeated.
Take: draw our own grids and blocks, never copy windows or photos.

Patterns (each: row / home / experiment + proof / effort):

1. Art-glass geometric grids. Thin dark lines, small color squares, lots of clear space. Good for HUD frames and menu borders.
Row: Game UI kits. Home: kits/game-ui/hud.html, kits/game-ui/menu.html. Experiment: add one CSS border pattern (grid + 1 gold square) to HUD panel. Proof: `node tools/game-ui.mjs --check` stays 35/35 PASS. Effort: small, 1 file.

2. Earth palette + gold line. Warm browns, tan, clay red, leaf green, one thin gold/amber line for focus. Calm, high contrast for text.
Row: Game UI kits. Home: kits/game-ui/menu.html + tokens file. Experiment: add 4 Wright earth tokens + 1 gold focus token, 0 hex outside tokens. Proof: `node tools/tokens.mjs --check` TOKENS PASS. Effort: small.

3. Compression-release rhythm. Low dark entry, then wide bright room. In UI: tight bar, then open card. Makes menus feel big.
Row: Brief-to-render speed. Home: tools/canvas.mjs. Experiment: one layout rule (16px bar, 12px gap, open card) in one sample. Proof: `node tools/check.mjs` RESULT PASS. Effort: small.

4. Unit-block motifs for HUD frames. One square divided by lines, repeated and turned. Cheap 9-slice corners and buttons.
Row: Game UI kits. Home: kits/game-ui/hud.html. Experiment: 2 own SVGs (corner + divider) from one 4x4 grid. Proof: `node tools/game-ui.mjs --check` icons/sizes PASS. Effort: small.

5. Light-screen dividers. Rows of thin slats / lines that split space but let light pass. Good for lists, tabs, settings rows.
Row: Game UI kits. Home: kits/game-ui/menu.html. Experiment: one divider style (1px line + 6px gap repeat) for settings list. Proof: `node tools/game-ui.mjs --check` gap 6px/12px PASS. Effort: small.

Avoid: do not copy Wright window photos, house photos, or floor plans; rights are mixed. Do not copy exact art-glass patterns; make our own grids. Do not add heavy ornament; Wright rule is plain field + small rich detail. Do not use dark brown text on brown; keep contrast pairs.
First experiment in center: kits/game-ui/hud.html | Game UI 5/5 stays PASS | done when one Wright grid border + earth tokens land with `node tools/game-ui.mjs --check` 35/35 PASS
Status: CANDIDATE
