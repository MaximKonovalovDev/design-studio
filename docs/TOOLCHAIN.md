# TOOLCHAIN: design-studio (2026-10-03)

How this studio CREATES finished designs from code on Windows. Licenses below
were re-verified live via `gh api repos/<owner>/<repo>` on 2026-10-03 unless
marked otherwise. Rule: copy code only under MIT / Apache-2.0 / BSD / ISC / CC0.
MPL-2.0 and GPL/AGPL are idea-only or run-as-a-tool, never vendored.

## The default pipeline (runs today, no new dependency)

```
brief.json -> tokens (tools/tokens.mjs) -> HTML/CSS/SVG design
  (templates/blocks + tools/registry.mjs) -> PNG render, Edge headless
  (tools/render.mjs) -> audit gates (tools/audit.mjs) -> judge scores the PNG
  (tools/judge.mjs, rubric ds-quality-v1, floor 8/10, SHIP to pass)
  -> export (out.png beside the brief + audit; Figma file-drop retired DS-78c, verdict gate only)
```

Proof of the whole lane: `node tools/check.mjs` (RESULT PASS = loop check plus
6 sample renders plus thumbs plus audits). Single design:
`node tools/render.mjs <page.html> <out.png> --size 1280x720`,
`node tools/audit.mjs <brief.json>`, `node tools/judge.mjs <brief.json>`.

## Generation tools ranked (strongest usable from code, Windows, 2026)

| # | Tool | License (read live 2026-10-03) | What it produces | Install / use | Verdict for us |
|---|---|---|---|---|---|
| 1 | Edge/Chromium headless screenshot (`tools/render.mjs` today; Playwright same engine) | Playwright Apache-2.0 (gh api 2026-10-03, 97k stars) | PNG of any HTML/CSS/SVG at exact size | Edge ships with Windows; `npm i -D playwright` + `npx playwright install chromium` for the matrix lane | DEFAULT renderer. Deterministic, free, no key, no GPU |
| 2 | satori (vercel/satori) | MPL-2.0 (gh api 2026-10-03, 14k stars) | HTML/CSS -> SVG (OG images, covers) | `npm i satori` (idea + SVG emit; keep the lib a tool, mind MPL file scope) | PARKED (DS-49, 2026-10-03): 0 refs in tools/, no order needs it; unpark only when an open order brief names it |
| 3 | Tailwind CSS (tailwindlabs/tailwindcss) | MIT (gh api 2026-10-03, 97k stars) | utility-first styling for blocks | `npm i tailwindcss` | block port lane (DS-52) |
| 4 | shadcn/ui (shadcn-ui/ui) | MIT (gh api 2026-10-03, 125k stars) | copy-paste component registry, CSS-var theming | copy patterns into `templates/blocks` (already the registry model) | theme-pair source (in VISION steal map S11) |
| 5 | open-props (argyleink/open-props) | MIT (gh api 2026-10-03) | fluid design tokens (spacing, type, gradients) | `npm i open-props` | token-feeding lane (DS-51) |
| 6 | Excalidraw (excalidraw/excalidraw) | MIT (gh api 2026-10-03, 133k stars) | hand-drawn wireframe starts, sketch export | `npm i @excalidraw/excalidraw` | wireframe-start lane (steal map S16) |
| 7 | dicebear (dicebear/dicebear) | MIT (gh api 2026-10-03) | style-swappable avatar placeholders | API or `npm i @dicebear/collection-*` | game-UI placeholder lane (DS-46) |
| 8 | puppeteer (puppeteer/puppeteer) | Apache-2.0 (gh api 2026-10-03) | multi-viewport screenshot matrix | `npm i puppeteer` | viewport-matrix lane (DS-53) |
| 9 | nexu-io/open-design harness | Apache-2.0 (gh api 2026-10-03, 99k stars) | local-first design agent: prototypes, landing pages, HTML/PDF export | separate app, BYOK | steal patterns for the agent loop (DS-05 lane) |
| 10 | Penpot (penpot/penpot) | MPL-2.0 (gh api 2026-10-03, 60k stars) | full design platform, SVG + layout engine, API | self-host or penpot.app; use as a TOOL via API/export, never vendor code | direction-aware layout ideas for RTL (steal map S09) |
| 12 | tldraw (tldraw/tldraw) | custom license (gh api 2026-10-03: NOASSERTION, 50k stars) | infinite-canvas SDK | patterns only, do NOT vendor; check their license page before any import | HUD-editing ideas only (steal map S10) |
| 13 | Figma REST API + plugins | proprietary (idea only) | read/write Figma files, code-connect table | token in env, never committed; file-drop JSON fixture retired (DS-78c: starters archived, `tools/figma.mjs` is verdict gate only, no network) | import/export lane, no network in checks |
| 14 | Recraft / Ideogram APIs | proprietary (idea only, keyed) | AI raster art (covers, backgrounds) | HTTPS call from a builder seat, key in env | art-assist lane; every output still judged as PNG |

## Export matrix (every finished design ships these)

| Format | How | Where |
|---|---|---|
| PNG (exact brief size) | `tools/render.mjs` | `<design>/out.png` |
| PNG thumbnail 256px | scaled full-page wrap (same as `tools/check.mjs` renderThumb) | `<design>/thumb-256.png` |
| Audit + review | `tools/audit.mjs` + `tools/judge.mjs` | `<design>/design-audit.json` + `DESIGN-REVIEW.md` |
| SVG | PARKED lane DS-49 (0 refs in tools/; unpark only when an open order brief needs it) | not shipped (no per-design SVG file) |
| PDF | no generic lane; print-template PDFs only (CV/portfolio via Edge print per order) | not shipped as a per-design file |
| Figma-ready | retired DS-78c (file-drop fixture retired with the archived starters; `tools/figma.mjs` is verdict gate only, no network) | no fixture beside the design |

## What runs where

Windows lead box: lanes 1-10 and 12-13 (CPU only, no GPU). No model runs on this
PC (Maxim 2026-10-04: no local image models, so no ComfyUI and no Stable
Diffusion; rows 11 and 15 are gone). Keyed art (#14) and the free OpenRouter image
lane (`tools/image.mjs`, opt-in only, zero-network --check; a call runs only with keys saved by Maxim, read from env
`OPENROUTER_API_KEY` or, when that is empty, the files
`%USERPROFILE%\.empire\secrets\openrouter.txt` and `openrouter2.txt` (the next key
is tried once on HTTP 429 or a credit error), never in the repo, never printed. The free vision-model fallback list in `tools/image.mjs` (FREE_VISION_MODELS) is not used by any code path yet.
Free image models: `inclusionai/ming-image-0.1-design` and
`inclusionai/ming-image-0.1-design-layer` (price 0, 2026-10-04). A paid image
model runs only behind `DS_IMAGE_BUDGET_USD`, which stays 0 until Maxim sets it.
