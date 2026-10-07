# Paula Scher for big-type brand kits (2026-10-07)

Question: What stealable type-system ideas from Paula Scher help design-studio brand kits, posters and thumbs?
Sources: https://en.wikipedia.org/wiki/Paula_Scher (read 2026-10-07; Pentagram partner, Public Theater posters, big wood-type stacking)
License: IDEAS-ONLY (living designer, works copyrighted; never copy posters or lettering, redraw our own type stacks)

What she does: giant stacked grotesque type as the image, 2-font-max discipline, map-as-texture fields, identity grids that flex per surface, color-block fields behind type.

Patterns (row / home / experiment + proof / effort):

1. Giant type stack. One title stacked in 3-5 huge lines as the hero image. Row: Thumbnail readability. Home: samples/ads/hero/page.html + tools/audit.mjs. Experiment: one ad hero with stacked caps title, title >=12px at 256px. Proof: `node tools/check.mjs` RESULT PASS. Effort: S.
2. Two-font-max rule. One grotesque for titles + one plain for body, nowhere else. Row: Brand-kit consistency. Home: brand-kits/studio.json + tools/brandkit.mjs. Experiment: cap one kit at 2 families, 3 sizes. Proof: `node tools/brandkit.mjs --check` BRANDKIT PASS. Effort: S.
3. Type-as-texture field. Small repeated words at low contrast behind the big title, never under it. Row: Judged quality. Home: tools/canvas.mjs. Experiment: one cover with texture field + clear title box. Proof: `node tools/judge.mjs samples/cover/brief.json` holds 8+. Effort: M.
4. Color-block field. One flat bold field (red/black/cream style) behind type, paper + black + one accent. Row: Brand-kit consistency. Home: tools/tokens.mjs. Experiment: 3 tokens for one block kit. Proof: `node tools/tokens.mjs --check` TOKENS PASS. Effort: S.

Take: steal the discipline (stack scale, 2 fonts, clear title box), all type redrawn by us.
Avoid: no copies of Public Theater posters or lettering; no hand type for the small title; no texture under readable text.
Status: CANDIDATE
