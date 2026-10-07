# Leonardo da Vinci for covers + judges (2026-10-07)

Question: What stealable composition ideas from Leonardo da Vinci help design-studio covers, thumbs and judges?
Sources: https://en.wikipedia.org/wiki/Leonardo_da_Vinci + https://en.wikipedia.org/wiki/Vitruvian_Man (read 2026-10-07)
License: PUBLIC-DOMAIN-IDEAS-ONLY (died 1519; notebooks and paintings public domain; redraw everything, own CSS/SVG only)

What he does: triangle-stable figure groups, notebooks mixing small sketch beside short text, circle-plus-square body ratios, one strong light-dark face-off with soft edges.

Patterns (row / home / experiment + proof / effort):

1. Triangle composition. Main figures in a stable triangle, focus at the top third. Row: Judged quality. Home: tools/judge.mjs. Experiment: add one triangle-focus wording to rubric ds-quality-v1. Proof: `node tools/judge.mjs --check` JUDGE PASS. Effort: S.
2. Notebook layout. Small sketch box beside short note on one page. Row: Brief-to-render speed. Home: tools/canvas.mjs. Experiment: one cover-draft template with sketch box + note side by side. Proof: `node tools/check.mjs` RESULT PASS. Effort: S.
3. Circle-square grid. One focal circle on an 8px grid for HUD/cover focus. Row: Game UI kits. Home: kits/game-ui/hud.html. Experiment: focal circle + 8px grid on one HUD variant. Proof: `node tools/game-ui.mjs --check` 35/35 PASS. Effort: M.
4. Soft shade + one punch. Soft shadow plus high-contrast title box that holds at 256px. Row: Thumbnail readability. Home: tools/canvas.mjs + tools/audit.mjs. Experiment: title box with soft shadow, title >=12px at 256px. Proof: `node tools/check.mjs` RESULT PASS. Effort: S.

Take: steal grids, triangles, sketch-plus-note layouts for clearer covers and UI.
Avoid: no copies of paintings, drawings or texts; layout ideas only.
Status: CANDIDATE
