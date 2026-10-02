# design-studio board

The only work list. Status: TOP, READY, DOING, BLOCKED, OWNER, DONE. A DONE row
names its commit SHA. Each row names the Scorecard row of `VISION.md` it moves.

| ID | Status | Scorecard row | What | Done when | Owner role | Evidence |
|---|---|---|---|---|---|---|
| K-01 | TOP | all | Fill the vision: Scorecard (5+ rows, 3+ real competitors), Parts, Open gaps, Steal map (10 competitors, 10 adjacent) | `node C:/Users/me/Desktop/center/vision-check.mjs design-studio` has no FAIL | planner | |
| K-02 | READY | the first part | First measurable slice of the vision | `node tools/check.mjs` passes its first step, pasted in the commit | builder | |
| K-03 | READY | all | Split the vision into board rows, each with its proof command | 10+ READY rows, each naming its Scorecard row and proof | planner | |
| DS-01 | DOING | Brief-to-render speed | Minimal loop: tools/render.mjs (Edge headless screenshot) plus tools/audit.mjs (contrast, sizes, 256px title, RTL) plus tools/check.mjs over samples/cover | `node tools/check.mjs` RESULT PASS | builder | |
| DS-02 | READY | Brand-kit consistency | tokens-01: tokens.json to tokens.css plus docs page, no hardcoded colors | `node tools/tokens.mjs --check` PASS (built in this row) | builder | |
| DS-03 | READY | Landing-page conversion | registry-01: shadcn-pattern block registry, 10 landing blocks | `node tools/registry.mjs --check` PASS (built in this row) | builder | |
| DS-04 | READY | Judged quality | agent-01: screenshot-to-code loop clone, MIT harness only | `node tools/agent-shot.mjs --check` PASS (built in this row) | builder | |
| DS-05 | READY | Judged quality | agent-02: prompt-to-block loop with judge gate | `node tools/agent-block.mjs --check` PASS (built in this row) | builder | |
| DS-06 | READY | Judged quality | rubric judge v1: ds-quality-v1, 10 checks, DESIGN-REVIEW.md writer | `node tools/judge.mjs --check` PASS (built in this row) | builder | |
| DS-07 | READY | Thumbnail readability | workshop-01: story per block plus 256px visual diff | `node tools/workshop.mjs --check` PASS (built in this row) | builder | |
| DS-08 | READY | Landing-page conversion | figma-01: code-connect mapping plus Figma MCP read seat | `node tools/figma.mjs --check` PASS (built in this row) | builder | |
| DS-09 | READY | Thumbnail readability | canvas-01: Konva template editor, 5 templates | `node tools/canvas.mjs --check` PASS (built in this row) | builder | |
| DS-10 | READY | Brand-kit consistency | brand-01: name to palette, type, voice, lockup plus tokens export | `node tools/brandkit.mjs --check` PASS (built in this row) | builder | |
| DS-11 | READY | Game UI kits | game-ui-01: HUD, menu, button kit on Kenney CC0 plus Lucide ISC | `node tools/game-ui.mjs --check` PASS (built in this row) | builder | |
| DS-12 | READY | Thumbnail readability | serve-factory-01: pilot cover two variants, thumbnail-readable, DESIGN-REVIEW.md | `node tools/check.mjs` PASS plus preview/DESIGN-REVIEW.md | builder | |
| DS-13 | READY | Hebrew RTL | jobhunt portfolio page, Hebrew plus English, RTL audit PASS | `node tools/audit.mjs` PASS on samples/jobhunt (built in this row) | builder | |
| DS-14 | READY | Landing-page conversion | marketing-studio ad set: 3 creatives plus 1 landing hero | `node tools/check.mjs` PASS on samples/ads (built in this row) | builder | |
| DS-15 | READY | Hebrew RTL | jobhunt CV design: one-page CV, print plus PNG, RTL PASS | `node tools/audit.mjs` PASS on samples/cv (built in this row) | builder | |
| DS-16 | READY | Hebrew RTL | rtl-01: Hebrew type pairing plus logical properties plus audit RTL gate | `node tools/audit.mjs --rtl --check` PASS (built in this row) | builder | |
| DS-17 | READY | Landing-page conversion | conversion harness: two landing variants plus click plan | `node tools/convert.mjs --check` PASS (built in this row) | builder | |
| DS-18 | READY | Brand-kit consistency | taste library v1 from od-taste: 20 exemplars with tokens | `node tools/taste.mjs --check` PASS (built in this row) | builder | |
| DS-19 | READY | Judged quality | weekly donor sweep: licenses, take, avoid, one experiment card | `node C:/Users/me/Desktop/center/vision-check.mjs design-studio` no FAIL plus 1 card | researcher | |
| DS-20 | READY | Game UI kits | serve-forge-01: forge HUD slice plus engine2040 menu skin | `node tools/game-ui.mjs --serve --check` PASS (built in DS-11) | builder | |
