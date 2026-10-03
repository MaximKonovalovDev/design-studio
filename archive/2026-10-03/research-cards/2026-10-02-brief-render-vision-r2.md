# Steal card: screenshot-anchored refine + measured preview for Brief-to-render speed (researcher-vision-r2, 2026-10-02)

Goal: Close Brief-to-render speed by adding a screenshot-anchored create/update refine loop plus a measured live-preview bundle in front of our one-shot `brief.json -> out.png + design-audit.json` path.

Scope: `VISION.md` Brief-to-render speed part + Scorecard row + this one card. Stop: L 45 min (donor reads + `node tools/check.mjs` only; no builder work).

Source and license:
- wandb/openui (Apache-2.0, LICENSE SHA 28a356d read live via GitHub MCP 2026-10-02) — `frontend/src/components/Prompt.tsx` (SHA c6d97eb): `streamResponse(query, existingHTML)` + auto-submit on `annotatedHTML`; `frontend/src/components/HtmlAnnotator.tsx` (SHA aa279c9): iframe `hydrate` via postMessage + comment back to `annotatedHTML`. Home: https://github.com/wandb/openui
- Nutlope/llamacoder (MIT, LICENSE SHA 9882e62 read live via GitHub MCP 2026-10-02) — `app/(main)/page.tsx` (SHA 8877c12): prompt form -> create-chat -> stream; `components/code-runner-react.tsx` (SHA cc357bb): WASM esbuild `bundle()` + `buildSrcdoc()` iframe preview + `PREVIEW_WATCHDOG_MS=60s` + `bundleMs/prepareMs/totalMs` metrics + `data-preview-*` badges. Home: https://github.com/Nutlope/llamacoder
- abi/screenshot-to-code (MIT, LICENSE SHA bee961c read live via GitHub MCP 2026-10-02) — `frontend/src/App.tsx` (SHA 1cbab73): `doCreate(referenceImages)` + `doUpdate(updateInstruction)` with `generationType: create|update`; `backend/routes/generate_code.py` (SHA 091874b): `CodeGenerationMiddleware` + `AgenticGenerationStage.process_variants` + `variantCount/variantComplete` websocket protocol. Home: https://github.com/abi/screenshot-to-code
- v0 (proprietary, idea only): prompt-to-React + one-click Vercel deploy in one box, https://v0.dev/ read live 2026-10-02 (Describe idea -> high-fidelity UI -> deploy; auto-fix errors). No code copied.
- Lovable (proprietary, idea only): prompt-to-app publishing, https://lovable.dev/ fetch 2026-10-02 -> 403 + no readable content (prior read 2026-10-02 cited in VISION G1). No code copied.
- File-naming via `deepwiki_ask_wiki_question` (wandb/openui, Nutlope/llamacoder, abi/screenshot-to-code) 2026-10-02; only the named files above were read via GitHub MCP.

What it does: OpenUI keeps `renderedHTML` in state, hydrates an isolated iframe (`action: 'hydrate'`), click-to-comment inserts `<!-- FIX -->` and auto-calls `streamResponse('', annotatedHTML)`. Screenshot-to-code splits the same loop into `create` (4 variants) vs `update` (2 variants, history + image_cache) over a websocket pipeline. LlamaCoder shows the minimal preview that makes the loop measurable: esbuild-bundle -> srcdoc iframe -> ready/error postMessage with a 60s watchdog and per-stage timings exposed as `data-preview-*` attributes.

Home (existing file here; no home = reject): `tools/render.mjs` (exists, Edge headless `render()` + `pngDims()`). The loop lands as a thin wrapper (prompt -> write `page.html` -> `render()` -> screenshot-compare -> re-prompt with `generationType`) reusing `render()`; timing/metrics gate stays in `tools/audit.mjs` / DS-05 `tools/agent-block.mjs` when built. Rejected home: `tools/agent-block.mjs` (does not exist, DS-05 READY) — no home, reject for now.

Fixes (the part): Brief-to-render speed (VISION.md Parts + Scorecard row).

Net lines: ~80-120 (new `tools/agent-loop.mjs` wrapper reusing `render()` + `auditBrief()`; create/update split + srcdoc-style preview metrics; no vendor copy-paste, pattern only).

Proof (no proof = reject):
- Donor files read live via GitHub MCP 2026-10-02 (SHAs above) + DeepWiki file-naming + v0.dev page read live 2026-10-02; lovable.dev 403 noted.
- Our bar re-measured 2026-10-02: `node tools/check.mjs` -> `RESULT PASS: loop check plus 4 sample renders plus thumbs plus audits` (sprint/check 20 pass; `[PASS] render: 1280x720 34186B`; `[PASS] thumb: thumb-256.png 256x144 5567B`; `[PASS] audit: design-audit.json written, all gates green`; ad-square 1080x1080 35419B, story 1080x1920 69685B, hebrew-hero 1280x720 28125B). Source artifact `samples/cover/design-audit.json` (`pass: true`, 15/15 checks, `at: 2026-10-02`). Still 1/2 on ds-speed-v1 (token-gen + rubric judge lane DS-05 open) — no inflation.
- License proof: openui LICENSE = Apache-2.0 (Copyright 2024 Weights and Biases, Inc.); llamacoder LICENSE = MIT (Copyright (c) 2024 Hassan El Mghari); screenshot-to-code LICENSE = MIT (Copyright (c) 2023 Abi Raja). All code-copyable; v0/Lovable proprietary = idea only.

Effort and risk: S (wrapper only, no new deps, reuses Edge + audit). Risk: low — iframe/Sandpack/esbuild pattern only; we keep file-based `brief.json` contract so the judge still gates every iterate. Avoid: copying OpenUI Tailwind/theme, LlamaCoder Together-AI keys/prompts, screenshot-to-code model keys; avoid GPL/AGPL (none here).

Stop: L 45 min — donor reads (3 DeepWiki asks + 8 GitHub file reads + v0.dev/lovable.dev pages) + own render/check/card reads + one proof run; no implementation in this card.
