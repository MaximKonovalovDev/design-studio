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
  -> export (PNG/SVG/PDF out.png beside the brief; Figma-ready via tools/figma.mjs mapping)
```

Proof of the whole lane: `node tools/check.mjs` (RESULT PASS = loop check plus
6 sample renders plus thumbs plus audits). Single design:
`node tools/render.mjs <page.html> <out.png> --size 1280x720`,
`node tools/audit.mjs <brief.json>`, `node tools/judge.mjs <brief.json>`.

## Generation tools ranked (strongest usable from code, Windows, 2026)

| # | Tool | License (read live 2026-10-03) | What it produces | Install / use | Verdict for us |
|---|---|---|---|---|---|
| 1 | Edge/Chromium headless screenshot (`tools/render.mjs` today; Playwright same engine) | Playwright Apache-2.0 (gh api 2026-10-03, 97k stars) | PNG of any HTML/CSS/SVG at exact size | Edge ships with Windows; `npm i -D playwright` + `npx playwright install chromium` for the matrix lane | DEFAULT renderer. Deterministic, free, no key, no GPU |
| 2 | satori (vercel/satori) | MPL-2.0 (gh api 2026-10-03, 14k stars) | HTML/CSS -> SVG (OG images, covers) | `npm i satori` (idea + SVG emit; keep the lib a tool, mind MPL file scope) | SVG export lane for covers/social (DS-49) |
| 3 | Tailwind CSS (tailwindlabs/tailwindcss) | MIT (gh api 2026-10-03, 97k stars) | utility-first styling for blocks | `npm i tailwindcss` | block port lane (DS-52) |
| 4 | shadcn/ui (shadcn-ui/ui) | MIT (gh api 2026-10-03, 125k stars) | copy-paste component registry, CSS-var theming | copy patterns into `templates/blocks` (already the registry model) | theme-pair source (in VISION steal map S11) |
| 5 | open-props (argyleink/open-props) | MIT (gh api 2026-10-03) | fluid design tokens (spacing, type, gradients) | `npm i open-props` | token-feeding lane (DS-51) |
| 6 | Excalidraw (excalidraw/excalidraw) | MIT (gh api 2026-10-03, 133k stars) | hand-drawn wireframe starts, sketch export | `npm i @excalidraw/excalidraw` | wireframe-start lane (steal map S16) |
| 7 | dicebear (dicebear/dicebear) | MIT (gh api 2026-10-03) | style-swappable avatar placeholders | API or `npm i @dicebear/collection-*` | game-UI placeholder lane (DS-46) |
| 8 | puppeteer (puppeteer/puppeteer) | Apache-2.0 (gh api 2026-10-03) | multi-viewport screenshot matrix | `npm i puppeteer` | viewport-matrix lane (DS-53) |
| 9 | nexu-io/open-design harness | Apache-2.0 (gh api 2026-10-03, 99k stars) | local-first design agent: prototypes, landing pages, HTML/PDF export | separate app, BYOK | steal patterns for the agent loop (DS-05 lane) |
| 10 | Penpot (penpot/penpot) | MPL-2.0 (gh api 2026-10-03, 60k stars) | full design platform, SVG + layout engine, API | self-host or penpot.app; use as a TOOL via API/export, never vendor code | direction-aware layout ideas for RTL (steal map S09) |
| 11 | ComfyUI (comfyanonymous/ComfyUI) | GPL-3.0 (gh api 2026-10-03, 135k stars) | node-based Stable Diffusion/Flux image generation | run as a SEPARATE local tool, never vendored, never linked | raster-art lane (covers backgrounds) when a GPU box is up |
| 12 | tldraw (tldraw/tldraw) | custom license (gh api 2026-10-03: NOASSERTION, 50k stars) | infinite-canvas SDK | patterns only, do NOT vendor; check their license page before any import | HUD-editing ideas only (steal map S10) |
| 13 | Figma REST API + plugins | proprietary (idea only) | read/write Figma files, code-connect mapping | token in env, never committed; file-drop JSON fixture lane exists (`tools/figma.mjs`) | import/export lane, no network in checks |
| 14 | Recraft / Ideogram APIs | proprietary (idea only, keyed) | AI raster art (covers, backgrounds) | HTTPS call from a builder seat, key in env | art-assist lane; every output still judged as PNG |
| 15 | Stable Diffusion / Flux checkpoints (local) | per-checkpoint license (verify each model card before use) | local raster art, no vendor lock | via ComfyUI (#11) | same lane as #11 |

## Export matrix (every finished design ships these)

| Format | How | Where |
|---|---|---|
| PNG (exact brief size) | `tools/render.mjs` | `<design>/out.png` |
| PNG thumbnail 256px | scaled full-page wrap (same as `tools/check.mjs` renderThumb) | `<design>/thumb-256.png` |
| Audit + review | `tools/audit.mjs` + `tools/judge.mjs` | `<design>/design-audit.json` + `DESIGN-REVIEW.md` |
| SVG | satori lane (#2) / inline-SVG blocks | `<design>/out.svg` (when the lane lands) |
| PDF | print-CSS + headless `--print-to-pdf` (next export row) | `<design>/out.pdf` (when the lane lands) |
| Figma-ready | code-connect mapping table + file-drop JSON (`tools/figma.mjs`) | mapping fixture beside the design |

## What runs where

Windows lead box: lanes 1-10 (CPU only, no GPU, no keys). GPU box (when up):
lanes 11+15 via ComfyUI as a service. Keyed art (#14) only with owner-provided
keys in env, never in the repo.
