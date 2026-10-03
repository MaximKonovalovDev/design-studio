# design-studio steals

Donors the scout seats found for an open finish bar (`node C:/Users/me/Desktop/center/finish.mjs design-studio`): images, skills, examples, templates, GitHub repos, tools, software. The builder lands an `open` line and marks it `landed <sha>` in that commit. At most 3 open lines per bar, none older than 7 days (center's `size-check.mjs`).

## Steals
2026-10-03 | D2 | tailwindlabs/heroicons@616b7a4dbbf3d011760af8066262cd5c6b3868f3 | MIT | kits/game-ui/hud.html | open
  what to change, and the number it moves: inline 3 heroicons 24px outline SVGs (stroke=currentColor) beside the 6 lucide SVGs; kits/game-ui icon count 6 -> 9 with `node tools/game-ui.mjs --check` staying 35/35 PASS.
2026-10-03 | D2 | h5bp/html5-boilerplate@b6597338e695dc4a8165c5abcb2bfffa586c3ee5 | MIT | templates/pages/cover.html | expired 2026-10-04 (no order uses it; the scout lands files an open order needs)
  what to change, and the number it moves: port src/index.html meta/OG/icon head block into the cover base for O-001..O-005; delivered covers 0 -> 1 (O-001) with `node tools/audit.mjs designs/O-001/brief.json` AUDIT PASS and title >=12px at 256px.

2026-10-03 | D1 | tabler/tabler-icons@v3.48.0 (0239805), icons/outline/book.svg | MIT | tools/canvas.mjs | open
  inline the pinned book-motif SVG as a sixth canvas cover template for the O-001 book cover, and the number it moves: templates shipped 5 -> 6 with CANVAS PASS green.
2026-10-03 | D1 | lovell/sharp@1189cf4, lib/resize.mjs (resize+extract, cover fit) | Apache-2.0 | tools/thumb.mjs | open
  add a sharp cover-fit extract path for the O-001 630x500 crop plus 256px raster, and the number it moves: thumb --check sizes 4 -> 5 with THUMB PASS green.
2026-10-03 | D1 | svg/svgo@e4cb29bebcc9820ac979dfc05106b512cc5de986, lib/svgo.js optimize() | MIT | tools/render.mjs | open
  what to change, and the number it moves: port preset-default minify (removeComments/cleanupIds/collapseGroups, keep viewBox+stroke=currentColor) as a pre-screenshot pass for inlined cover SVGs; `node tools/render.mjs --check` 12 -> 13 PASS (new svg-minify fixture) with designs/O-001/page.html 4573B down and out.png sha-identical.
2026-10-03 | D3 | feathericons/feather@3dc050d97405062eba78aa57115c0a15c63abdaa, icons/mail.svg | MIT | samples/cv/page.html | open
  what to change, and the number it moves: inline 3 feather 24px SVGs (mail, phone, link, stroke=currentColor stroke-width=2 fill=none) in the CV contact row; CV inline icon count 0 -> 3 with `node tools/audit.mjs --rtl --check` AUDIT RTL PASS staying green and `node tools/check.mjs` RESULT PASS.
2026-10-03 | D3 | arXiv 2402.04754v2 (LACE Eq 9 global-alignment + Eq 10 overlap, delta=1/64) | arXiv method reimplement equations no code copy | tools/judge.mjs | expired 2026-10-04 (no order uses it)
  what to change, and the number it moves: port global-alignment over 6 types (L/XC/R/T/YC/B) plus pairwise IoU plus center-distance overlap with delta=1/64 post-pass as a CV alignment sub-check; `node tools/judge.mjs --check` rubric 10 -> 11 checks with JUDGE PASS green and samples/cv DESIGN-REVIEW carrying the alignment note.
