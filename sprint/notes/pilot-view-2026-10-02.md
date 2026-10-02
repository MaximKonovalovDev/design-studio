# pilot-view notes 2026-10-02 (stranger run)

Clean start as stranger. Ran every command the board says a user runs.

## Commands (all opened outputs)
- `node tools/check.mjs` RESULT PASS: loop 20/20 plus 4 sample renders plus audits (cover 1280x720 34186B thumb 256x144 5567B; ad-square 1080x1080 35419B thumb 256x256 6591B; story 1080x1920 69685B thumb 256x455 12227B; hebrew-hero 1280x720 28125B thumb 256x144 3837B).
- `node tools/tokens.mjs --check` TOKENS PASS; `node tools/judge.mjs --check` JUDGE PASS 10 checks floor 8; `node tools/agent-shot.mjs --check` AGENT-SHOT PASS 11/11; `node tools/game-ui.mjs --check` GAME-UI PASS 30/30; `node tools/registry.mjs --check` REGISTRY PASS 4 blocks + 4 templates; `node tools/thumb.mjs --check` THUMB PASS math only; `node tools/audit.mjs samples/cover/brief.json` AUDIT PASS; `node C:/Users/me/Desktop/center/vision-check.mjs design-studio` RESULT PASS 6/0.
- Missing (MODULE_NOT_FOUND raw stack, exit 1): tools/agent-block.mjs, tools/workshop.mjs, tools/figma.mjs, tools/canvas.mjs, tools/brandkit.mjs, tools/convert.mjs, tools/taste.mjs — 7 board proof commands for DS-05/07/08/09/10/17/18.
- `git ls-files` still tracks research/INDEX.md + 12 sample artifacts (out.png, thumb-256.png, design-audit.json x4) — K-04 already on board/inbox, not re-filed.
- Direct thumb `node tools/thumb.mjs samples/cover/brief.json <tmp>` now THUMB OK 256x144 5567B (opened: readable miniature DESIGN THAT SHIPS) — 002 sliver appears fixed in tools/thumb.mjs iframe wrap, 002 claimed by 002-run, not re-filed.

## Captures opened (Muse sees images)
- samples/cover/out.png (clean hero DESIGN THAT SHIPS) + thumb-256.png (readable miniature)
- samples/ad-square/out.png (hero cramped top, bottom half blank) + thumb-256.png (readable but same top-weight)
- samples/story/out.png (tall story, 3 cards + CTA) + thumb-256.png (readable miniature)
- samples/hebrew-hero/out.png (correct RTL hero עיצוב שמנצח) + thumb-256.png (readable miniature)
- C:/Users/me/AppData/Local/Temp/opencode/pilot-thumb-direct.png (readable miniature, 002 fixed)
- No README.md, no docs/ — stranger entry missing (ls *.md: AGENTS.md, VISION.md only).

## Filed
- sprint/queue/ready/008-pilot-missing-commands.md (7 missing board proof commands)
- sprint/queue/ready/009-pilot-no-entry.md (no stranger quickstart)
