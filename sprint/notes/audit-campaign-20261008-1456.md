# Audit campaign — design-studio — lap 1 — 2026-10-08 14:56Z (halted)

No cycle-ledger existed: lap 1. Prior lead2 campaign leftovers noted (waves 3-4 open, READMEs pending lead commit); not redone except fresh audit slices.
Stop: sprint/halt appeared on disk after wave 1. Waves 2-4 never ran. No commits (parallel orchestrator never commits; lead lands).

## Baselines (before wave 1)
- sprint/check.mjs: RESULT PASS 21/0/0. repo-standard: 100/100. Tracked files: 2486.

## Wave 1 scout (10 researcher helpers, read-only)
Helpers have no edit permission (edit denied), so no S cut could land on the spot. All findings below are on disk as FOUND only.

| helper | result | file | proof | number |
|---|---|---|---|---|
| slice1 YAGNI | FOUND 3xS | tools/render.mjs (PQueue.onIdle, renderQueued, --free-prompt, 0 callers) | rg onIdle/renderQueued/free-prompt = def only | 3 dead items |
| slice2 dead-code | FOUND 3xS+1xM | tools/assets.mjs unused imports; cards.py + pixel-font-ttf.py unused sys; thumbEdge unused export | ruff F401 + rg counts | 4 items |
| slice3 copy-paste | FOUND 1xS+4xM+1xL | sha256 x12 sites; outForSize; resolveSourcePng; mockup parseSize; parseArgs; selfCheck boilerplate | side-by-side file:line pairs | 12 sha256 sites |
| slice4 guessed APIs | NOOP | none: all 41 tool imports + 45 test imports resolve | node tools/check.mjs RESULT PASS | 0 |
| slice5 dead flags | FOUND 5xS | package.json @fontsource/assistant; arsenal thumb/audit/orders/fonts flags read-but-never-set | rg key vs reader | 5 keys |
| slice6 over-abstract | FOUND 4xS+2xM | sharp loadSharp, orders-check dirEntries/countLines/expectedPngs (S); previewPics, image firstLine (M) | caller counts = 1 | 6 wrappers |
| slice7 missing tests | FOUND 3xM | tools/game-ui.mjs (4 changes/60d), audit-checks.mjs, batch-covers-2026-10-06.mjs, zero test imports | git log + Grep tests/ empty | 3 files |
| slice8 prompt rot | FOUND 6xL | open-design SKILL donor line + NOTICE count; mockup/poster frontmatter; researcher license line; overseer retired; saas-landing ghost | Test-Path per ref | 6 items |
| slice9 oversized | FOUND 2xL+3xM | cover 46KB, template 43KB, assets 37KB, orders-check 35KB, render 33KB + split targets | byte counts | top5 listed |
| slice10 slow paths | FOUND 1xL+2xM | tools/check 2 renders x11 samples; sprint/check privacy guard 1.6s->14.1s variance; brief.json 3x reads | Measure-Command 3 runs | 14.1s worst |

## After wave 1
- sprint/check.mjs: RESULT PASS 21/0/0 (unchanged, nothing landed). Reverted: none.
- repo-standard still 100/100: no JUNK/ROOT/BIGDOCS/NAMES work needed.

## Skipped
- All S landings: helper env denies edits (one attempt each, then skip per Stop rule).
- Waves 2-4: sprint/halt present; campaign ends here.

## Asks (filed via empire inbox, 6 plans)
- EB-S134 render.mjs dead-code deletion. EB-S135 unused imports + inlines.
- EB-S136 copy-paste merge. EB-S144 missing tests. EB-S145 oversized splits. EB-S146 prompt rot.

## For next lap
Take EB-S134 first (3 certain deletions, smallest proof), then S135; deeper M/L need lead scheduling.
