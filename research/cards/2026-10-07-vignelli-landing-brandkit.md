# Massimo Vignelli stealable design patterns (design-studio)

Question: What stealable design ideas can design-studio (landing pages, brand kits) take from Massimo Vignelli, for Landing-page conversion + Brand-kit consistency?
Corner: S1
Sources: https://en.wikipedia.org/wiki/Massimo_Vignelli (accessed 2026-10-07); https://en.wikipedia.org/wiki/New_York_City_Subway_map (accessed 2026-10-07)
License: Copyrighted (Vignelli died 2014; works and manuals still in copyright) | ideas only, redraw everything, never copy artwork or scans
What it really does: Vignelli (1931-2014), Italian modernist, Unimark + Vignelli Associates with wife Lella, defined graphic design as the organisation of information — semantically correct, syntactically consistent, pragmatically understandable — visually powerful, intellectually elegant, timeless; the 1972 NYC subway diagram abstracts geography into color-coded lines with white dot stations set in Helvetica, and the NPS Unigrid system (1977) puts every brochure on one modular grid with one typeface and black-white plus one accent color. Page-level read only, no code.
Take: 5 idea-only patterns, each rebuilt as tokens/grid/CSS, never traced or copied.
Avoid: copying subway-map artwork, Unigrid sheets, or Vignelli book scans (all copyrighted); rigid grid at thumb size that kills the title; low-contrast gray text on white.
First experiment in center: C:\empire\design-studio\brand-kits\vignelli-tokens.json | Brand-kit consistency 5/5 holds + 1 landing hero on the 3-col grid with 0 hex | done when `node tools/tokens.mjs --check` TOKENS PASS and `node tools/brandkit.mjs --check` BRANDKIT PASS and `node tools/registry.mjs --check` REGISTRY PASS on the demo sample
Status: CANDIDATE

## Source + license

- https://en.wikipedia.org/wiki/Massimo_Vignelli — life, Unimark/Vignelli Associates, modernist method, timeless-info quote.
- https://en.wikipedia.org/wiki/New_York_City_Subway_map — Vignelli map section: 1970s diagram map, color-coded routes, abstract geography.
- License: died 2014, works copyrighted — ideas only, redraw all grids, arrows, and type scales.

## Patterns (row / home / experiment / effort each)

1. Unigrid 3-column grid. One 12-unit grid, 3 content columns, fixed gutters, title always spans full width. Row: Landing-page conversion. Home: `tools/registry.mjs` + `templates/blocks/hero.html`. Experiment: 1 hero block rebuilt on the 3-col grid. Proof: `node tools/registry.mjs --check`. Effort: M.
2. Helvetica-scale discipline. One font family, 3 sizes only (title/body/caption), big title-to-body ratio, flush left. Row: Landing-page conversion. Home: `tools/registry.mjs` + `templates/blocks/hero.html`. Experiment: hero copy reset to 3 sizes, title kept above 12px floor at 256px. Proof: `node tools/check.mjs` + thumb 256px read. Effort: S.
3. Black-white plus one color. Page in black and white, one accent color reserved for the CTA and key line only. Row: Brand-kit consistency. Home: `brand-kits/studio.json` + `tools/brandkit.mjs`. Experiment: `vignelli-tokens.json` palette (ink, paper, 1 accent), pairs pass contrast. Proof: `node tools/brandkit.mjs --check`. Effort: S.
4. Wayfinding arrows and dots. One arrow style, one dot style, thick route lines; arrows guide the eye to the CTA like subway lines guide riders. Row: Landing-page conversion. Home: `tools/convert.mjs` + `templates/blocks/hero.html`. Experiment: 1 landing hero with one CTA arrow path, A/B differs by arrow only. Proof: `node tools/convert.mjs --check`. Effort: M.
5. Manual-as-code. Brand rules written as checkable tokens (grid, sizes, pairs, arrow weights), not prose. Row: Brand-kit consistency. Home: `tools/tokens.mjs` + `tools/brandkit.mjs`. Experiment: vignelli rules as token entries with 0 hex, diff in sync. Proof: `node tools/tokens.mjs --check` TOKENS PASS. Effort: S.

## Take

- Steal system shapes (grid math, 3-size type, 1-accent discipline, one-arrow wayfinding, rules-as-tokens), all rebuilt.
- Start with pattern 3 (palette, S) then 2 (type scale, S) — both feed Brand-kit consistency directly.

## Avoid

- No Vignelli artwork, map scans, or Unigrid sheets in repo. No full-fidelity subway-dot copy as brand mark.
- No tiny gray captions. No grid so rigid the CTA box shrinks below the thumb floor.
