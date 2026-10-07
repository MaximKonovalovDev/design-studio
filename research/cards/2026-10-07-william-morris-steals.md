# William Morris stealable design patterns (design-studio)

Question: What stealable design ideas can design-studio (covers, thumbs, brand kits, game UI, landing pages) take from William Morris, for Brand-kit consistency first?
Corner: S1
Sources: https://en.wikipedia.org/wiki/William_Morris (accessed 2026-10-07); https://en.wikipedia.org/wiki/Strawberry_Thief (accessed 2026-10-07)
License: Public domain (Morris died 1896; works published 1860s-1890s) | modern photos/scans of patterns may carry their own rights — ideas only, redraw everything
What it really does: Morris (1834-1896) built repeating wallpaper/textile motifs from nature (Strawberry Thief 1883: thrushes stealing strawberries at Kelmscott Manor), printed in flat limited natural dyes (indigo blue ground + alizarin red + weld yellow via discharge printing, days per run); Kelmscott Press paired heavy ornament borders with plain readable type. Page-level read only, no code.
Take: 4 idea-only patterns, each redrawn as SVG/CSS, never traced bitmaps.
Avoid: copying V&A/museum photos or vendor redraws (rights differ); fussy Victorian density at thumb size; muddy low-contrast natural inks on screen — raise contrast to pass audit gates.
First experiment in center: C:\Users\me\Desktop\design-studio\brand-kits\morris-tokens.json | Brand-kit consistency 5/5 holds + 1 new Morris demo page with 0 hex | done when `node tools/tokens.mjs --check` TOKENS PASS and `node tools/brandkit.mjs --check` BRANDKIT PASS and `node tools/check.mjs` RESULT PASS on the demo sample
Status: CANDIDATE

## Source + license

- https://en.wikipedia.org/wiki/William_Morris — life, Firm, Merton Abbey printing, Kelmscott Press.
- https://en.wikipedia.org/wiki/Strawberry_Thief — 1883 repeating textile, thrush subject, indigo-discharge + red/yellow over blue-white ground, V&A no. T.586-1919.
- License: public domain (died 1896). Modern photos/scans differ — idea-only redraws.

## Patterns (row / home / experiment / effort each)

1. Repeating wallpaper motif tile. One 160x160 SVG tile (leaf + bird-simple + berry dots) that repeats with no seam. Row: Brand-kit consistency. Home: `brand-kits/` + `tools/tokens.mjs` (new motif token). Experiment: add `motif-morris.svg` tile + tokens entry, render 1 cover with tiled back layer. Proof: `node tools/tokens.mjs --check` + `node tools/check.mjs`. Effort: M.
2. Limited natural palette (3 inks + ground). Indigo ground, leaf green, berry red, stem yellow — 4 vars max, pairs checked. Row: Brand-kit consistency. Home: `brand-kits/studio.json` + `tools/brandkit.mjs`. Experiment: `morris-tokens.json` palette, pairs pass contrast. Proof: `node tools/brandkit.mjs --check`. Effort: S.
3. Border frame + text-ornament rhythm. Heavy top/bottom border bars, plain center for title; ornament never behind text. Row: Thumbnail readability (title readable at 256px). Home: `templates/blocks/hero.html`. Experiment: 1 hero block with Morris border, title 12px floor kept. Proof: `node tools/check.mjs` + thumb 256px read. Effort: M.
4. Craft texture without bitmap. Paper-grain via CSS/SVG noise at 3-5% opacity over flat fills. Row: Judged quality (ship at 8/10). Home: `samples/cover/` demo + `tools/judge.mjs`. Experiment: 1 cover variant with grain layer, judge re-run. Proof: `node tools/judge.mjs samples/cover/brief.json`. Effort: S.
5. (Bonus, drop if heavy) Kelmscott initial-letter drop cap for landing hero. Row: Landing-page conversion. Home: `templates/blocks/hero.html`. Experiment: 1 landing hero with ornamented first letter. Proof: `node tools/registry.mjs --check`. Effort: L — do last.

## Take

- Steal system shapes (tile math, 4-color discipline, border-beats-text rule), all redrawn.
- Start with pattern 2 (palette, S) then 1 (tile, M) — both feed Brand-kit consistency directly.

## Avoid

- No museum/vendor image files in repo. No full-fidelity Strawberry Thief copy as brand mark.
- No ornament behind small text. No low-contrast print inks on screen without re-check.
