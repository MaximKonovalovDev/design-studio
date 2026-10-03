# Steal card: Brief-to-render speed re-sweep — refine + measured/streaming preview built (researcher vision-r11, 2026-10-02)

Goal: Re-sweep the Brief-to-render speed part since the round-3 sweep (50%): DS-21 screenshot-refine + measured preview and DS-30 streaming chunk-to-preview + annotate-refine were built round 10 in tools/render.mjs. Re-read the part's rivals + one riser live, re-measure our render work, rewrite the Parts + Scorecard rows with measured numbers (or hold 50% with a dated reason).

Scope: `VISION.md` Brief-to-render speed Part + Scorecard row + this one card. Stop: L 45 min (donor deep packet + rival/riser page reads + `node tools/render.mjs --check` + `node tools/check.mjs` only; no builder work).

Source and license:
- wandb/openui (Apache-2.0, LICENSE SHA 28a356d re-read live 2026-10-02 via GitHub MCP) — `frontend/src/components/Prompt.tsx` (SHA c6d97eb re-read live 2026-10-02): `streamResponse(query, existingHTML)` + throttled `liveMarkdown` -> `parseMarkdown` pop-last-line guard + auto-submit on `annotatedHTML`; `frontend/src/components/HtmlAnnotator.tsx` (SHA aa279c9 re-read live 2026-10-02): iframe `hydrate` via postMessage (`{html, js, action:'hydrate'}`), `take-screenshot`/`comment` back to `annotatedHTML`, `IFrameEvent` protocol. File-naming via `deepwiki_ask_wiki_question` (wandb/openui) 2026-10-02; only the named files were read. Home: https://github.com/wandb/openui
- v0 (proprietary, idea only): prompt-to-app agent — Describe idea -> high-fidelity UI -> one-click Vercel deploy + auto-fix errors, https://v0.dev/ (redirects to https://v0.app/docs.md, lastUpdated 2026-10-01) read live 2026-10-02. No code copied.
- Lovable (proprietary, idea only): Publish-button to live lovable.app URL + Quick scan checks, https://docs.lovable.dev/features/publish read live 2026-10-02 (publish dialog free, chat-publish costs credits). No code copied.
- Riser Elementor (proprietary, idea only): AI prompt full pages/sections matched to site design system + 22M+ websites + pixel-perfect drag-and-drop editor, https://elementor.com/ read live 2026-10-02. No code copied.
- Prior donors carried (SHAs verified at r2, not re-fetched this run per one-deep-packet budget): Nutlope/llamacoder MIT (LICENSE SHA 9882e62, `code-runner-react.tsx` SHA cc357bb bundleMs/watchdog pattern) + abi/screenshot-to-code MIT (LICENSE SHA bee961c, `App.tsx` SHA 1cbab73 + `generate_code.py` SHA 091874b create/update split).

What it does: OpenUI keeps the streaming loop measurable: `Prompt.tsx` streams tokens into `liveMarkdown`, throttles and pops the last line so half-written tags never flash, parses to `pureHTML`, and hydrates an isolated iframe (`HtmlAnnotator.tsx` postMessage `hydrate`); click-to-comment returns `annotatedHTML` which auto-fires the next `streamResponse('', annotatedHTML)` refine. v0/Lovable own the hosted one-box (prompt -> live URL + deploy); Elementor owns prompt-matched-to-design-system + pixel edit on WordPress. Our port (already built DS-21/DS-30): `parsePreviewMarkdown` + `streamPreview` (3-chunk progressive states, pop-last-line guard) + `buildRefinePrompt` (FIX-comment wins, else query, else fail-closed) + `measurePreview` (bundleMs + `data-preview-*` badge + 60s watchdog) + `refineHtml` (create|update split) + `renderSelfCheck` (F2P fixtures FAIL closed inside a green suite).

Home (existing file here; no home = reject): `tools/render.mjs` (exists, 297 lines; DS-21 block lines 79-142 + DS-30 block lines 90-113 + self-check lines 143-178 built round 10). Rejected homes: none — the loop landed where the r2 card aimed.

Fixes (the part): Brief-to-render speed (VISION.md Parts + Scorecard row).

Net lines: ~100 added in `tools/render.mjs` for DS-21 + DS-30 combined (wrapper + preview/stream/refine + self-check; reuses `render()` Edge headless path, 0 new deps; pattern-only, no vendor copy).

Proof (no proof = reject):
- Donor files read live 2026-10-02 via GitHub MCP (LICENSE SHA 28a356d + Prompt.tsx SHA c6d97eb + HtmlAnnotator.tsx SHA aa279c9, SHAs unchanged since r2) + DeepWiki file-naming output 2026-10-02 + v0.app/docs.md (lastUpdated 2026-10-01) + lovable publish docs + elementor.com (22M sites) reads 2026-10-02.
- Our bar re-measured 2026-10-02: `node tools/render.mjs --check` -> `RENDER PASS: refine + measured preview + 3-chunk stream green` (7/7: preview badge bundleMs=1 bytes=37, empty-HTML FAILs closed, FIX-comment update prompt, query-less FAILs closed, 3-chunk progressive 0>6>23, 1-chunk gate, create path).
- `node tools/check.mjs` -> `RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits` (cover 1280x720 34186B + thumb 256x144 5567B, ad-square 1080x1080 50846B + thumb 9164B, story 1080x1920 69685B, hebrew-hero 1280x720 28125B, jobhunt 1280x720 35014B, cv 900x1270 98813B; winner cover-b by audit + 256px; sprint/check 20 pass). Source artifact `samples/cover/design-audit.json` (`pass: true`, all gates green, 2026-10-02).
- License proof: openui LICENSE = Apache-2.0 (Copyright 2024 Weights and Biases, Inc.); v0/Lovable/Elementor proprietary = idea only. No GPL/AGPL touched.
- Held at 50% (1/2 rubric ds-speed-v1): render + audit + refine/preview/stream all PASS, but DS-05 agent-block + DS-21/DS-30 await judge reviews 026/027 (queued round 11) and token-gen lane stays the open half — no inflation.

Effort and risk: S (already built; this card is measurement only). Risk: low — file-based `brief.json` contract kept, judge still gates every iterate; streaming states never touch the hosted deploy path. Avoid: copying OpenUI Tailwind/theme, LlamaCoder keys/prompts, screenshot-to-code model keys; avoid GPL/AGPL (none here).

Stop: L 45 min — 1 DeepWiki ask + 3 GitHub file reads + 3 page reads + own render/check reads + 2 proof runs; no implementation in this card.
