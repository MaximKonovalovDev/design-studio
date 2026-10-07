# Saul Bass — covers and thumbs that punch at 256px (2026-10-07)

Goal: steal thumbnail readability ideas for design-studio Thumbnail readability row (VISION-TABLES.md lines 16-20: title readable at 256px, floor 12px, audit gates green).
Scope: ideas only. No shapes copied, no poster art reused. For design-studio board (Thumbnail readability: DS-50, DS-84).

## Source + license

- https://en.wikipedia.org/wiki/Saul_Bass (read 2026-10-07): film title designer (Vertigo, Anatomy of a Murder, Psycho), posters built from one big symbol + rough shapes + bold type.
- https://en.wikipedia.org/wiki/Anatomy_of_a_Murder (read 2026-10-07): 1959 film; Bass poster and titles use cut-paper body shapes.
- License: Bass died 1996. Posters and titles stay copyrighted. Ideas only. We draw our own shapes and type.

## Patterns (each with home, experiment, proof, effort)

### P1 — One big symbol
- What: one shape says the whole cover (Anatomy body parts, Vertigo spiral). Reads at 256px because there is only one thing to see.
- Home: design-studio tools/thumb.mjs + tools/audit.mjs (title + symbol legibility gate); designs per order (e.g. designs/factory-gumroad-cover).
- Experiment: add one-symbol rule to one cover brief (cover-b): single SVG symbol, rest flat.
- Proof: `node tools/check.mjs` RESULT PASS + `node tools/audit.mjs <brief>` AUDIT PASS with title >=12px at 256px.
- Effort: S.

### P2 — Torn-paper shapes
- What: rough cut edges and flat blocks (Anatomy poster). Hides low detail at small size; edges stay sharp at 256px.
- Home: design-studio tools/thumb.mjs (thumb render path); canvas templates.
- Experiment: one cover uses 2-3 flat cut shapes behind title, drawn by us, no scan of Bass art.
- Proof: thumb-256.png beside render, non-trivial size, audit contrast PASS.
- Effort: S.

### P3 — Hand type vs grotesque
- What: Bass mixes shaky hand-drawn letters with plain grotesque caps. Trick: hand feel for mood, plain caps for the title that must read small.
- Home: design-studio tools/audit.mjs (title-fits-box + legibility gate).
- Experiment: title stays grotesque caps >=12px at 256px; hand style only on small accent word, never the title.
- Proof: `node tools/audit.mjs <brief>` title legible PASS + fits-box PASS.
- Effort: S.

### P4 — 2-color punch
- What: two flat inks, often black + one hot color on paper white (Anatomy, Vertigo). High contrast = readable thumb.
- Home: design-studio brand-kits/studio.json + tools/tokens.mjs (pairs gate); tools/audit.mjs contrast check.
- Experiment: one cover limited to paper + black + one brand accent; contrast pair from tokens.
- Proof: `node tools/tokens.mjs --check` TOKENS PASS + audit contrast PASS.
- Effort: S.

### P5 — Title-safe crop
- What: Bass title sequences keep text clear of moving art. Rule for us: title box never under art; each size re-checked, never scaled-blind.
- Home: design-studio tools/audit.mjs (title_box + 256px + 315px gates).
- Experiment: re-run audit per size (1280x720 + 256x144 + 315px listing); failing size reflows title, never ships.
- Proof: `node tools/check.mjs` RESULT PASS on the sample set.
- Effort: S.

## Take

- Use for Thumbnail readability: one own-drawn symbol + 2 flat colors + grotesque caps title + title-safe box, re-audited at 256px and 315px.
- Best first try: cover-b gets P1 + P4 + P5 in one brief edit.

## Avoid

- Do not copy Bass posters, spirals, or lettering. Copyrighted. Draw our own.
- Do not use hand type for the title. It dies under 256px.
- Do not add detail that only shows at full size. If it vanishes at 256px, cut it.
- Do not ship a resized thumb without re-audit. Scaled-blind is how titles break.
