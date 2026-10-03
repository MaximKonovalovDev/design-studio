---
role: researcher
title: github repos and image workflows sweep
---

Goal: find GitHub repos and workflows for IMAGES we should steal: product-faithful generation, poster/hero, device mockup, thumbnail reflow, avatar placeholders.

Scope: via GitHub MCP plus web: nexu-io/open-design (154 systems, 115 templates, 165 skills), abi/screenshot-to-code MIT, wandb/openui Apache-2.0, Nutlope/llamacoder MIT, konvajs/konva MIT pixelRatio, fabricjs/fabric MIT multiplier, dicebear/dicebear MIT avatars, iconify/iconify, BuilderIO/mitosis MIT single-source. One narrow search at most per repo, first 429 stops run. Record LICENSE SHA + file path:line, idea-only if GPL/AGPL/MPL/proprietary.

Proof: links plus exact home here (`tools/render.mjs`, `tools/thumb.mjs`, `tools/canvas.mjs`, `tools/game-ui.mjs`, `kits/game-ui/`, `samples/ad-square/`) and proof command (`node tools/render.mjs --check`, `node tools/thumb.mjs --check`, `node tools/canvas.mjs --check`, `node tools/game-ui.mjs --check`).

Stop: at most 5 best-first cards in `research/cards/<date>-images-<id>.md` plus reject list, M 30 min. Reply at most 20 lines with repos, licenses, homes, proofs. End with `RESULT: DONE - github-images | proof: <links plus numbers>`.
