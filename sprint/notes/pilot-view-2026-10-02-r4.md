# pilot-view 2026-10-02 r4 (clean-start stranger run)

Ran the README quickstart literally: opened `samples/cover/brief.json`, ran
`node tools/check.mjs`, opened every capture below (12/12 PNGs + audits). Then ran
every board proof command incl. the three new ones
(`workshop`, `canvas`, `convert` --check) plus the RTL slice and the stub set.

## Proof commands (all pasted one-line results)

- `node tools/check.mjs` RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits (loop 20/20; cover 1280x720 34186B thumb 256x144 5567B; ad-square 1080x1080 50846B thumb 256x256 9164B; story 1080x1920 69685B thumb 256x455 12227B; hebrew-hero 1280x720 28125B thumb 256x144 3837B; jobhunt 1280x720 35014B thumb 256x144 5003B; cv 900x1270 98813B thumb 256x361 21777B). Render bytes are nondeterministic run-to-run (cv 49905B -> 94477B -> 98813B across runs); sizes and PASS are stable.
- `node tools/workshop.mjs --check` WORKSHOP PASS 4 stories, snapshots match.
- `node tools/canvas.mjs --check` CANVAS PASS 5 templates, SVG exports match.
- `node tools/convert.mjs --check` CONVERT PASS 2 variants differ, click plan covers A+B.
- `node tools/tokens.mjs --check` TOKENS PASS 16/16.
- `node tools/judge.mjs --check` JUDGE PASS 10 checks floor 8 (cover 10/10 ships).
- `node tools/agent-shot.mjs --check` AGENT-SHOT PASS 11/11.
- `node tools/game-ui.mjs --check` GAME-UI PASS 30/30.
- `node tools/registry.mjs --check` REGISTRY PASS 4 blocks + 4 templates.
- `node tools/thumb.mjs --check` THUMB PASS 4 sizes.
- `node tools/audit.mjs samples/cover/brief.json` AUDIT PASS 15/15.
- `node tools/audit.mjs samples/jobhunt/brief.json` AUDIT PASS 17/17 (RTL 3/3).
- `node tools/audit.mjs samples/cv/brief.json` AUDIT PASS 17/17 (RTL 3/3).
- `node tools/audit.mjs --rtl --check` AUDIT RTL PASS 10/10 (3 samples).
- 4 remaining stubs (`agent-block` DS-05, `figma` DS-08, `brandkit` DS-10, `taste` DS-18) each print NOT-BUILT usage exit 1 — guided, no crash.
- `git ls-files | INDEX|log|jsonl` empty — 0 tracked generated files.

## Captures opened (12/12)

cover/out.png (clean hero DESIGN THAT SHIPS), cover/thumb-256.png (readable),
ad-square/out.png (FIXED: full-bleed hero + proof strip 4:4/256px/Judged + footer, no blank), ad-square/thumb-256.png (faithful),
story/out.png (centered content, large top/bottom whitespace, intentional),
story/thumb-256.png (readable), hebrew-hero/out.png (correct RTL hero),
hebrew-hero/thumb-256.png (readable), jobhunt/out.png (strong RTL portfolio, two CTAs),
jobhunt/thumb-256.png (readable), cv/out.png (FIXED: full one-pager, contact footer visible),
cv/thumb-256.png (256x361 readable), cover/design-audit.json (PASS).

## Regression verify (do-not-refile list)

- 002 thumb sliver: FIXED — cover thumb 5567B readable miniature.
- 008 missing commands: VERIFIED — 3 new tools PASS, 4 remaining stubs guided NOT-BUILT.
- 009 no entry: VERIFIED — README quickstart works literally.
- 011 ad-square blank: FIXED — 50846B full-bleed, proof strip + footer, no blank.
- 014 cv blank: FIXED — full CV with contact footer, no blank.
- 015 newsamples-no-thumb: FIXED — jobhunt/cv thumbs exist, check renders 6.
- K-04 untrack: VERIFIED — 0 tracked generated files.

## New defects filed (1)

- 018 `sprint/queue/ready/018-pilot-readme-stale.md`: README documents 4 samples while the loop ships 6 (jobhunt/cv invisible to the stranger).
