---
role: builder
title: board-promised user commands do not exist
---

Goal: a stranger follows the board and runs each proof command the board prints (`node tools/agent-block.mjs --check`, `workshop`, `figma`, `canvas`, `brandkit`, `convert`, `taste`) and gets a usable result or a guided usage line, not a crash.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only stub `tools/<name>.mjs` usage exits for the 7 unbuilt rows (DS-05 agent-block, DS-07 workshop, DS-08 figma, DS-09 canvas, DS-10 brandkit, DS-17 convert, DS-18 taste) plus board Evidence wording; explicitly NOT `tools/check.mjs`, NOT `tools/tokens.mjs`, NOT `tools/judge.mjs`, NOT `tools/agent-shot.mjs`, NOT `tools/game-ui.mjs`, NOT `tools/registry.mjs`, NOT `tools/thumb.mjs`, NOT `tools/audit.mjs` (all green this run), NOT `tools/thumb.mjs` fixed-width path (owned by running 002-pilot-thumb-fixedwidth), NOT K-04 untrack (owned by K-04).

Proof: captures and outputs, all opened 2026-10-02: `node tools/check.mjs` RESULT PASS (loop 20/20 plus cover 1280x720 34186B thumb 5567B, ad-square 1080x1080 35419B thumb 6591B, story 1080x1920 69685B thumb 12227B, hebrew-hero 1280x720 28125B thumb 3837B); `node tools/tokens.mjs --check` TOKENS PASS; `node tools/judge.mjs --check` JUDGE PASS 10 checks floor 8; `node tools/agent-shot.mjs --check` AGENT-SHOT PASS 11/11; `node tools/game-ui.mjs --check` GAME-UI PASS 30/30; `node tools/registry.mjs --check` REGISTRY PASS 4 blocks + 4 templates; `node tools/thumb.mjs --check` THUMB PASS; `node tools/audit.mjs samples/cover/brief.json` AUDIT PASS; 7 missing verified: `node tools/agent-block.mjs --check` MODULE_NOT_FOUND exit 1 (same raw stack for workshop, figma, canvas, brandkit, convert, taste — `Test-Path tools/<n>.mjs` MISSING x7); 8 renders opened (samples/*/out.png + thumb-256.png all readable miniatures); direct `node tools/thumb.mjs samples/cover/brief.json <tmp>` THUMB OK 256x144 5567B opened readable (002 fixed, not re-filed); `git ls-files` still tracks research/INDEX.md + 12 sample artifacts (K-04 on board, not re-filed).

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user reads a READY row promising `node tools/<x>.mjs --check` PASS and gets `Error: Cannot find module` with a node internals stack; after the fix the same command prints a one-line usage or NOT-BUILT note naming its board row, so the stranger knows what exists today and what is still owed.
