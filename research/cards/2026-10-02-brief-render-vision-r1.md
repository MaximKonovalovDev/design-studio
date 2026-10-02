# Steal card: prompt-render-iterate loop for Brief-to-render speed (researcher-vision-r1, 2026-10-02)

Goal: Close Brief-to-render speed by adding an OpenUI-style prompt -> live-render -> annotate-to-refine iterate loop in front of our one-shot `brief.json -> out.png + design-audit.json` path.

Scope: `VISION.md` Brief-to-render speed part + Scorecard row + this one card. Stop: L 45 min (donor reads + `node tools/check.mjs` only; no builder work).

Source and license:
- wandb/openui (Apache-2.0, LICENSE read live via GitHub 2026-10-02, SHA 28a356d0bdc2506e51cee542244d853d4ef20309) — `frontend/src/components/Prompt.tsx` (SHA c6d97eb5e8b72bb8bcf4da14616b083ef8c9afcf): `streamResponse(query, existingHTML)` + auto-submit on `annotatedHTML`; `frontend/src/components/HtmlAnnotator.tsx` (SHA aa279c930317e4de076515d576d4da42cd189574): iframe `hydrate` via postMessage + comment back to `annotatedHTML`. Default branch read live via github_get_file_contents 2026-10-02. Home: https://github.com/wandb/openui
- Nutlope/llamacoder (MIT, LICENSE read live via GitHub 2026-10-02, SHA 9882e628435f2d186a49637c31b9d9a3bfb79745) — `app/(main)/page.tsx` (SHA 8877c12506860a4535240c489c8108d34d991592): textarea prompt form -> `/api/create-chat` -> stream -> Sandpack live preview (per DeepWiki Core Application Flow). Minimal whole-builder path. Home: https://github.com/Nutlope/llamacoder
- v0 (proprietary, idea only): prompt-to-React + one-click deploy in one box, https://v0.dev/ read 2026-10-02 (docs: describe idea -> high-fidelity UI -> deploy). No code copied.
- Lovable (proprietary, idea only): prompt-to-app publishing, https://lovable.dev/ read 2026-10-02 (describe -> build in real time -> ship). No code copied.

What it does: OpenUI keeps `renderedHTML` in state, hydrates an isolated iframe (`action: 'hydrate'`), lets the user click-to-comment on an element in the iframe, posts the annotated HTML back, and auto-calls `streamResponse('', annotatedHTML)` to refine. LlamaCoder shows the minimal version: one prompt form, one stream endpoint, one Sandpack preview. Both keep prompt, stream, and live preview in a tight loop instead of one-shot render.

Home (existing file here; no home = reject): `tools/render.mjs` (exists, Edge headless screenshot + `render()` + `pngDims()`). The loop lands as a thin wrapper (prompt -> write `page.html` -> `render()` -> annotate -> re-prompt) without replacing the renderer; judge gate stays in `tools/audit.mjs` / DS-05 `tools/agent-block.mjs` when built. Rejected homes: `tools/agent-block.mjs` (does not exist yet, DS-05 READY) — no home, reject for now.

Fixes (the part): Brief-to-render speed (VISION.md Parts + Scorecard row).

Net lines: ~60-90 lines (new `tools/agent-loop.mjs` wrapper reusing `render()` + `auditBrief()`; iframe/comment UI reuses existing `samples/cover/page.html` shell; no vendor copy-paste, pattern only).

Proof (no proof = reject):
- Donor files read live via GitHub MCP 2026-10-02 (SHAs above) + DeepWiki file-naming (wandb/openui Prompt.tsx/HtmlAnnotator.tsx; Nutlope/llamacoder page.tsx) + v0.dev/lovable.dev pages read 2026-10-02.
- Our bar re-measured 2026-10-02: `node tools/check.mjs` -> `RESULT PASS: loop check plus sample render plus audit` (sprint/check 20 pass; `[PASS] render: 1280x720 34186B`; `[PASS] audit: design-audit.json written, all gates green`). Source artifact `samples/cover/design-audit.json` (`pass: true`, 15/15 checks, `at: 2026-10-02`). Still 1/2 on ds-speed-v1 because token-gen + rubric judge lane (DS-05) is open — no inflation.
- License proof: openui LICENSE = Apache-2.0 text (Copyright 2024 Weights and Biases, Inc.); llamacoder LICENSE = MIT text (Copyright (c) 2024 Hassan El Mghari). Both code-copyable; v0/Lovable proprietary = idea only, nothing copied.

Effort and risk: S (wrapper only, no new deps, reuses Edge + audit). Risk: low — iframe/Sandpack pattern is the only copy; we keep our file-based `brief.json` contract so the judge still gates every iterate. Avoid: copying OpenUI Tailwind/theme or LlamaCoder Together-AI keys/prompts; avoid GPL/AGPL (none here).

Stop: L 45 min — donor reads (DeepWiki + 5 GitHub file reads + 2 pages) + own render/audit reads + one proof run; no implementation in this card.
