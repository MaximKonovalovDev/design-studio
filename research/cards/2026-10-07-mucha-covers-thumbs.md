# Mucha for covers, thumbs, brand kits, landing pages (2026-10-07)

Question: What stealable design ideas from Alphonse Mucha help design-studio Thumbnail readability + Landing-page conversion (covers, thumbs, brand kits, landing pages)?
Corner: S1
Sources: https://en.wikipedia.org/wiki/Alphonse_Mucha (accessed 2026-10-07); https://en.wikipedia.org/wiki/Art_Nouveau (accessed 2026-10-07); https://en.wikipedia.org/wiki/Gismonda (accessed 2026-10-07, play page with the 1894 Gismonda poster by Mucha for Sarah Bernhardt)
License: IDEAS-ONLY | public domain in most places (Mucha d. 1939); own CSS/SVG only, no image copies
What it really does: Mucha posters = one tall figure in a halo arch, top title band, soft pastel field with one gold line, thin hairline borders, small mosaic icons in the corners. Gismonda (1894) set the shape: life-size figure, arch behind the head, name at top, readable from far. Pages only, no code read.
Take: draw our own arches, borders, and palettes; never copy Mucha images.

Patterns (each: row / home / experiment + proof / effort):

1. Halo-arch framing. A round arch behind the head or product. It holds the eye at small size.
Row: Thumbnail readability. Home: design-studio tools/audit.mjs + templates/social/card/page.html. Experiment: one CSS arch (border-radius top) behind the title zone in one card sample. Proof: `node tools/check.mjs` RESULT PASS plus title size still over 12px floor at 256px. Effort: small, 1 file.

2. Vertical poster rhythm. Title top, figure middle, small text foot. One column, no side clutter.
Row: Thumbnail readability. Home: design-studio samples/cover-b/page.html. Experiment: stack one cover sample title-top / art-middle / sub-foot. Proof: `node tools/audit.mjs` thumb gates PASS at 256px and 315px. Effort: small.

3. Pastel + gold palette pairs. Soft sage, blush, cream, slate, each with one gold/deep-ink text pair.
Row: Brand-kit consistency. Home: design-studio brand-kits/studio.json. Experiment: add 2 pastel + 1 gold token with contrast pairs only. Proof: `node tools/tokens.mjs --check` TOKENS PASS plus `node tools/brandkit.mjs --check` BRANDKIT PASS, 0 hex outside tokens. Effort: small.

4. Hairline borders. One thin 1-2px frame plus one inner line. Cheap premium feel, keeps crop safe.
Row: Landing-page conversion. Home: design-studio templates/web/landing/page.html. Experiment: one hairline frame around hero card with safe padding. Proof: `node tools/registry.mjs --check` REGISTRY PASS. Effort: small.

5. Icon corners. Small mosaic/flower marks in the four corners instead of full ornament.
Row: Landing-page conversion. Home: design-studio templates/web/landing/page.html. Experiment: 1 own SVG corner mark reused x4 on one landing hero. Proof: `node tools/convert.mjs --check` CONVERT PASS. Effort: small.

Avoid: do not copy Mucha posters, faces, or photos; rights differ by photo. Do not copy exact ornaments; make our own arch, lines, icons. Do not use low-contrast pastel text; keep one dark-on-light pair per token. Do not fill thumbs with detail; Mucha rule is plain field + one figure + top title.
First experiment in center: design-studio templates/social/card/page.html | Thumbnail 4/4 stays PASS | done when one arch + hairline frame lands with `node tools/check.mjs` RESULT PASS and thumb title over 12px at 256px
Status: CANDIDATE
