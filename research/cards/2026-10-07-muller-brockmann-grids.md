# Muller-Brockmann grids for design-studio

Question: Which grid and type ideas can we steal for covers, thumbs, and landing pages to keep Brief-to-render speed fast and Judged quality high?

Corner: S1 (design-studio vision sweep; no A1-A17 corner covers design history)

Sources: https://en.wikipedia.org/wiki/Josef_M%C3%BCller-Brockmann (accessed 2026-10-07); https://en.wikipedia.org/wiki/International_Typographic_Style (accessed 2026-10-07)

License: Proprietary idea-only | UNVERIFIED (died 1996, Grid Systems book text still copyrighted — steal ideas only, never copy text or images)

What it really does: Swiss designer (1914-1996), a lead voice of the International Typographic Style. Hallmarks read on the pages: asymmetric layouts built on a math grid, sans-serif type (Akzidenz-Grotesk, then Univers/Helvetica), flush-left ragged-right text, photography instead of drawn illustration, type used as a picture element, and objective clear order. His 1981 book Grid Systems teaches building every page from columns, gutters, margins, and baseline rhythm.

Take: 5 patterns, each with home and next step.

1. 8-col construction grid with fixed gutter. Row: Brief-to-render speed. Home: tools/render.mjs + templates/web/landing/page.html. Try: grid tokens (columns, gutter, margin) as brief defaults. Proof: `node tools/render.mjs --check` RENDER PASS. Effort: small.
2. Baseline rhythm (line height and gaps as math multiples). Row: Judged quality. Home: tools/judge.mjs (rubric ds-quality-v1). Try: one rhythm check in the rubric. Proof: `node tools/judge.mjs --check` JUDGE PASS. Effort: small.
3. Flush-left ragged-right plus one sans plus size scale 1:2:4. Row: Thumbnail readability. Home: tools/cover.mjs + templates/covers/*. Try: left-aligned title rule in one cover template. Proof: thumb gates green at 256px. Effort: small.
4. Whitespace math (margins from the same module, big empty zones kept). Row: Landing-page conversion. Home: tools/registry.mjs + templates/web/landing/page.html. Try: spacing tokens from one module in the landing template. Proof: `node tools/registry.mjs --check` REGISTRY PASS. Effort: small.
5. Photo-first with type as image (one big title as the graphic). Row: covers and thumbs. Home: tools/cover.mjs + samples/cover. Try: one cover variant with a single large title over a photo. Proof: `node tools/check.mjs` RESULT PASS plus thumb readable. Effort: small.

Avoid: copying his posters, book pages, or text (copyrighted); centered symmetric layouts; many fonts on one page; justified blocks of text (hurts speed reading); decoration that adds no order.

First experiment in center: design-studio tools/render.mjs | Brief-to-render speed stays 100% | done when grid tokens (columns/gutter/margin) land in one brief default and `node tools/render.mjs --check` prints RENDER PASS

Status: CANDIDATE
