# Hokusai for covers + thumbs: composition steals (2026-10-07)

Question: What stealable design ideas from Katsushika Hokusai help design-studio covers + thumbs with strong composition, for Thumbnail readability + Judged quality?
Corner: S1
Sources: https://en.wikipedia.org/wiki/Hokusai (accessed 2026-10-07); https://en.wikipedia.org/wiki/The_Great_Wave_off_Kanagawa (accessed 2026-10-07)
License: PUBLIC-DOMAIN-IDEAS-ONLY | UNVERIFIED (Hokusai d. 1849-05-10; woodblocks public domain; photos of prints may vary, no photo copied, own CSS/SVG only)
What it really does: Great Wave c.1829-1832 is first in Thirty-six Views of Mount Fuji (36 + 10 added). Sea fills the frame, big claw-foam wave curves in a spiral with Fuji as a small dot in the gap. Boats hold 30 small men (22 seen). 1830s blue revolution: dark Prussian blue (Berlin ai, bero ai, from Holland 1820, large lots 1829) with fading indigo; first 10 prints first in Japan to use it, later 10 in blue-only aizuri-e. Pages only, no code read.
Take: copy the layout rules, never copy prints or photos.

Patterns (each: row / home / experiment + proof / effort):

1. Wave diagonal vs Fuji dot. Big curve crosses the frame, calm small mark sits in the empty gap. Eye goes curve first, dot second. Good for cover hero + small title mark.
Row: Thumbnail readability. Home: tools/canvas.mjs, canvas/templates/*.json. Experiment: one cover template with diagonal hero band + small title dot in the clear corner. Proof: `node tools/canvas.mjs --check` CANVAS PASS + thumb title >=12px. Effort: small, 1 template.

2. Prussian-blue 3-tone scale. Dark blue key shape, mid blue wash, pale paper gap + thin foam white line. Reads at 256px.
Row: Thumbnail readability. Home: tools/audit.mjs + brand tokens. Experiment: 3 blue tokens (dark/mid/pale) + 1 foam white, use on one thumb. Proof: `node tools/audit.mjs samples/cover-b/brief.json` AUDIT PASS contrast + box. Effort: small.

3. Foreground frame device. Big near shape (wave) frames the far subject (Fuji). Depth without 3D.
Row: Judged quality. Home: tools/canvas.mjs. Experiment: one rule: near band crops 1 edge, subject in the gap, nothing centered. Proof: `node tools/judge.mjs samples/cover/brief.json` score holds 8+. Effort: small.

4. Series-with-one-change (36 views method). Same subject, new angle each time: Red Fuji, rain, bridge, sea. One anchor, many covers.
Row: Judged quality. Home: templates/game/hud + samples/cover-b/. Experiment: one brief rendered in 3 variants (storm / calm / night) with same tokens. Proof: `node tools/check.mjs` RESULT PASS on all 3. Effort: medium, 1 brief + 3 thumbs.

5. Small-human-big-nature scale. Tiny boats and men against huge wave + Fuji. Makes drama, keeps title clear.
Row: Thumbnail readability. Home: tools/audit.mjs, tools/canvas.mjs. Experiment: one rule: figures <=10% of thumb height, title box never over the busy foam edge. Proof: `node tools/check.mjs` RESULT PASS + thumb crop PASS. Effort: small.

Avoid: do not copy Wave or Fuji prints, scans, or photos; rights on photos vary. Do not paste Japanese text or signature boxes; make our own title box. Do not use busy foam behind small text; keep contrast pairs. Do not center everything; Hokusai rule is off-center mass + empty gap.
First experiment in center: design-studio tools/canvas.mjs | Thumbnail 4/4 stays PASS | done when one Hokusai diagonal template + 3-tone blues land with `node tools/canvas.mjs --check` CANVAS PASS and `node tools/audit.mjs samples/cover-b/brief.json` AUDIT PASS
Status: CANDIDATE
