# repomap: design-studio
_generated 2026-10-03T16:13:22.501Z | 415 files mapped | 26 hot (commits, last 14d) | cap 25KB_

## tree
- `.env` - 1 file
- `.gitignore` - 1 file
- `.opencode/` - 46 files
- `AGENTS.md` - 1 file
- `FINISH-LINE.md` - 1 file
- `README.md` - 1 file
- `VISION.md` - 1 file
- `brand-kits/` - 2 files
- `canvas/` - 11 files
- `convert/` - 3 files
- `designs/` - 8 files
- `docs/` - 1 file
- `kits/` - 7 files
- `knowledge/` - 1 file
- `opencode.jsonc` - 1 file
- `packs/` - 4 files
- `research/` - 34 files
- `samples/` - 95 files
- `sprint/` - 128 files
- `taste/` - 1 file
- `templates/` - 16 files
- `tests/` - 14 files
- `tools/` - 17 files
- `workshop/` - 20 files

## symbols (hot first, xN = commits last 14d)
### `tools/check.mjs` x9 (11KB)
- `function checkReceipt`
- `function pickWinner`
### `tools/audit.mjs` x8 (33KB)
- `function luminance`
- `function contrastRatio`
- `function parseTokens`
- `function parseTokensDark`
- `function resolveColor`
- `function auditBrief`
- `function checkReferenceParity`
- `function rtlSelfCheck`
- `function sizeMatrixSelfCheck`
- `function adSquareReflowSelfCheck`
- `function listingWidthSelfCheck`
### `.opencode/plugin/loop-keeper.js` x7 (156KB)
- `const LoopKeeper`
### `tools/render.mjs` x5 (17KB)
- `function findBrowser`
- `function parseSize`
- `function pngDims`
- `const SIZE_MATRIX`
- `function outForSize`
- `const PREVIEW_WATCHDOG_MS`
- `const FIX_RE`
- `function parsePreviewMarkdown`
- `function streamPreview`
- `function buildRefinePrompt`
- `function measurePreview`
- `function refineHtml`
- `const FREE_TERMS_NOTE`
- `function freeKey`
- `function buildFreePrompt`
- `function freeDraftReceipt`
- `function renderSelfCheck`
- `function render`
### `tools/convert.mjs` x4 (8.9KB)
- `const ROW`
- `function convertPaths`
- `function checkConvert`
### `tools/game-ui.mjs` x4 (13KB)
- `function gapEqual`
- `function checkGameUi`
### `tools/judge.mjs` x4 (23KB)
- `const RUBRIC_ID`
- `const RUBRIC_VERSION`
- `const SHIP_FLOOR`
- `const CHECK_IDS`
- `const OIDS`
- `const FIX_ACTIONS`
- `function oidFor`
- `function fixActionFor`
- `function nextEditFor`
- `function dispatchFix`
- `function iterateSample`
- `function listStories`
- `function judgeSample`
- `function writeReview`
- `function selfCheck`
### `tools/registry.mjs` x4 (7.7KB)
- `function emitBlock`
- `function checkRegistry`
### `tools/tokens.mjs` x4 (18KB)
- `const HEBREW_STACK`
- `function normalizeTokens`
- `function usesReferences`
- `function refKey`
- `function resolveColorRefs`
- `const PAIR_RULES`
- `function lintPairMates`
- `function darkPairGaps`
- `function mergeKits`
- `function readTokens`
- `function buildCss`
- `function buildDocs`
- `function checkTokens`
- `function buildAll`
### `.opencode/agents/planner.md` x3 (1.8KB)
- # Planner
- ## Dispatch discipline
- ## Contract
### `tools/agent-block.mjs` x3 (23KB)
- `const ROW`
- `const BLOCK_ID`
- `const TOOL`
- `const DEFAULT_ITERS`
- `function syntheticPng`
- `function expandBrief`
- `function tokensFor`
- `function pageFor`
- `function draftCopyPrompt`
- `function freeDraftFor`
- `function seedShell`
- `function gateBlock`
- `function buildBlock`
- `function runBlockLoop`
- `function selfCheck`
### `tools/brandkit.mjs` x3 (6.2KB)
- `export {mergeKits}`
- `function checkBrandkit`
### `tools/canvas.mjs` x3 (11KB)
- `const ROW`
- `const PALETTE`
- `function templateDir`
- `function outDir`
- `function validateScene`
- `function exportSvg`
- `function checkCanvas`
- `function writeExports`
- `function placeholderUrl`
- `function validatePlaceholder`
- `function placeholderCachePlan`
- `function checkPlaceholders`
### `tools/figma.mjs` x3 (11KB)
- `const ROW`
- `const WHAT`
- `const TOOL`
- `const MAPPING`
- `function dropFixture`
- `function resolveMapping`
- `const LANDING_VERDICT_SAMPLES`
- `function verdictFor`
- `function checkLandingVerdict`
- `function checkFigma`
### `tools/workshop.mjs` x3 (6.3KB)
- `const ROW`
- `function normalizeStory`
- `function storyPaths`
- `function checkWorkshop`
- `function writeSnapshots`
### `sprint/queue/standing/planner-rows.md` x2 (874B)
### `tools/agent-shot.mjs` x2 (15KB)
- `const HARNESS_ID`
- `const DONOR`
- `const DEFAULT_ITERS`
- `function diffShots`
- `function seedShell`
- `function refineStep`
- `const CODE_OMITTED`
- `function optimizeMessagesForTokens`
- `function resolveBlockPath`
- `function extractAllCodeBlocks`
- `const FIX_REQUEST_PREFIX`
- `function buildFixPayload`
- `function createFixLedger`
- `function runShotLoop`
- `function selfCheck`
### `tools/taste.mjs` x2 (3.4KB)
- `function checkTaste`
### `tools/thumb.mjs` x2 (4.2KB)
- `const THUMB_W`
- `function thumbSize`
- `function thumbBrief`
### `docs/TOOLCHAIN.md` x1 (5.3KB)
- # TOOLCHAIN: design-studio (2026-10-03)
- ## The default pipeline (runs today, no new dependency)
- ## Generation tools ranked (strongest usable from code, Windows, 2026)
- ## Export matrix (every finished design ships these)
- ## What runs where
### `sprint/check.mjs` x1 (7.7KB) - sprint/check.mjs: the design-studio loop's own check (generated by center/loopkit.mjs).
### `sprint/queue/done/planner-research-merge-r1.md` x1 (568B)
- # research merge (hard judge of the cards) #1 (@planner, standing)
- ## Result (completed)
### `sprint/queue/done/planner-rows-r1.md` x1 (709B)
- # planner (rows from the vision) #1 (@planner, standing)
- ## Result (completed)
### `sprint/queue/done/planner-rows-r2.md` x1 (896B)
- # planner (rows from the vision) #2 (@planner, standing)
- ## Result (completed)
### `sprint/queue/standing/planner-research-merge.md` x1 (741B)
### `tools/image.mjs` x1 (5.7KB)
- `const IMAGE_API`
- `function imageKey`
- `function buildImageRequest`
- `function requestImage`
- `function imageReceipt`
