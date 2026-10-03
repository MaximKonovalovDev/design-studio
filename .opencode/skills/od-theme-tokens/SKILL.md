---
name: od-theme-tokens
description: Pick or build a palette + font-pairing theme and land it as tokens.css via tools/tokens.mjs. Use at the start of any cover, page, CV, or game-UI order.
---

# Theme Tokens

Start every order with a deliberate theme: one palette plus one
header/body font pairing, landed as design tokens. Stops one-off hex
codes and mismatched fonts across `samples/`, `kits/`, and deliveries.

## Procedure

1. Read the brief (`brief.json`): audience, mood, customer repo.
2. Pick a direction: reuse a `kits/` or `brand-kits/` palette when the
   customer has one; otherwise define fresh (sections below).
3. Write the tokens, build, and check:
   `node tools/tokens.mjs` (builds `tokens.css`), then
   `node tools/audit.mjs samples/<name>` (contrast must pass).
4. Record the choice (palette + fonts + why) in `DESIGN-REVIEW.md`.

## Palette rules

- 5-7 colors max: background, surface, ink, muted, primary, accent,
  plus one state color (success/warning/error as the brief needs).
- Every text/background pair must pass AA; verify with
  `node tools/audit.mjs` (its `contrastRatio` is the arbiter).
- Dark mode (where the brief asks): mirror the pairs through
  `parseTokensDark`, not by hand-tuned duplicates.
- Game UI (`kits/game-ui`): add HUD-first accents readable over art
  (bright action, danger red, gold reward) at AA against panel fills.

## Typography rules

- Max two families: one display (covers, heroes, HUD titles), one
  neutral body. Hebrew orders use the repo Hebrew stack
  (`tools/tokens.mjs` `HEBREW_STACK`) for body.
- Three sizes per view max; body line length 45-75 characters.
- Never below 12px for UI text; game-UI labels stay legible at the
  smallest render size in the brief's size matrix.

## Custom themes

When no kit fits, mint one: name it for its mood (e.g. `harbor-dusk`),
define the full palette + pairing in the sample's tokens file, and note
it in `DESIGN-REVIEW.md` so it can graduate to `kits/`.

## Proof

`node tools/tokens.mjs` builds clean, `node tools/audit.mjs
samples/<name>` passes, full suite `node tools/check.mjs`.

Source: https://github.com/anthropics/skills/tree/main/skills/theme-factory (Apache-2.0, fetched 2026-10-03)
