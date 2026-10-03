# HANDOFF forge + engine2040 — game UI kit (DS-71 backfill O-011)

HUD plus menu plus buttons kit for forge HUD slice and engine2040 menu skin.

## What
- `kits/game-ui/hud.html` + `menu.html` + `avatar.html` + `buttons.css` + `tokens.css`.
- `kits/game-ui/manifest.json` — pieces plus icons plus sizes plus engines map.
- Tokens plus states plus icons plus sizes plus import per `tools/game-ui.mjs`.

## Pull (forge and engine2040)
Drop `hud.html` + `menu.html` into the forge HUD slice and skin the engine2040 menu with the same two link imports.

## Proof
`node tools/game-ui.mjs --serve --check` GAME-UI PASS.

## INBOX ASK (DS-71 backfill O-011 for center to file)
INBOX ASK: forge / kits/game-ui/hud.html / adopt HUD plus menu kit for forge HUD slice and engine2040 menu skin
