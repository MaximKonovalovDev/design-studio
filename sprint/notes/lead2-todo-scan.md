# lead2-todo-scan (2026-10-08T09:52Z, repo C:/Users/me/Desktop/design-studio)

Scope: tools/ tests/ templates/ covers/ only. Method: Grep tool (rg) with a path arg per folder, never whole-repo scans. Read-only except this file.
Foreign-edit check first: git status --short shows edits in orders.csv, samples/*/design-audit.json, sprint/*, but NOT sprint/notes/lead2-todo-scan.md (did not exist, Test-Path False) -- safe to create.

## 1. TODO/FIXME/XXX/HACK/NOTIMPL/TBD (case-sensitive + lowercase sweep)
- tools/: 0 hits. Proof: Grep TODO|FIXME|XXX|HACK|NOTIMPL|TBD in tools/ -> No files found; Grep todo|fixme|xxx in tools/ -> No files found.
- tests/: 0 hits. Proof: Grep TODO|FIXME|XXX|HACK|NOTIMPL|TBD in tests/ -> No files found; Grep todo|fixme|xxx in tests/ -> No files found.
- templates/: 0 hits. Proof: Grep TODO|FIXME|XXX|HACK|NOTIMPL|TBD in templates/ -> No files found.
- covers/: 0 hits. Proof: Grep TODO|FIXME|XXX|HACK|NOTIMPL|TBD in covers/ -> No files found.
- Total markers: 0.

## 2. Skipped / commented-out tests in tests/ (true skips = disabled tests, not SKIP verdict codes)
- tests/: 0 true skipped tests.
- Proof: Grep .skip(|xdescribe|xit(|xtest|describe.only|test.only|it.only|pending( in tests/ -> No files found.
- Proof: Grep .only(|TODO(|FIXME in tests/ -> No files found.
- Intentional SKIP-verdict assertions (NOT skipped tests, listed for audit):
- tests/thumb-sharp.test.mjs:54: assert.rejects(sharpThumb(...), /missing|SKIP|blank/)
- tests/thumb-sharp.test.mjs:95: assert.rejects(thumbAuto(...), /missing.*SKIP|SKIP|blank/)
- tests/brief.test.mjs:91: it(a missing file is SKIP code 2, never PASS, ...)
- tests/judge.test.mjs:134: it(missing baseline -> SKIP, never a false PASS, ...)
- tests/judge.test.mjs:136: assert.equal(r.status, SKIP)
- tests/judge.test.mjs:140: it(missing current audit -> SKIP, never a false PASS, ...)
- tests/judge.test.mjs:142: assert.equal(r.status, SKIP)
- tests/g09-figma-rtl.test.mjs:70: assert.equal(r.skipped, 1)
- tests/check.test.mjs:38: assert.match(src(), /no receipt declared, skipped/)
- Header comments (// tests/*.test.mjs: ...) in 37 files at line 1 each are descriptions, not commented-out tests.
- Total true skips: 0. Total SKIP-verdict references: 9 lines (intentional).

## 3. Half-done migrations (two ways of doing one thing)
- Verdict: NONE half-done. DS-78c migration (old templates/pages+blocks vs templates v1) is COMPLETE and archived.
- tools/template.mjs:34: LEGACY Set(pages, blocks) -- old starters (templates/registry.json): not v1 templates, never touched here
- tools/registry.mjs:1-6: DS-78c retired 2026-10-04 ... old starters moved to archive/2026-10-04/old-starters/ ... stub keeps old callers green
- tools/figma.mjs:4-6: Landing-to-templates-blocks mapping retired: old starters moved to archive/2026-10-04/old-starters/
- tools/figma.mjs:57: ok(mapping retired DS-78c, true, ...)
- tools/convert.mjs:56: ok(variant provenance historical DS-78c, true, convert/variants frozen, cite archive not templates v1)
- tools/brief.mjs:138: Facts provenance: brief-declared paths first (strict), legacy order-row (intentional fallback, documented)
- templates/README.md:21: The old templates/pages, templates/blocks and registry.json ... are archived with workshop/ under archive/2026-10-04/old-starters/ and are not part of this system.
- Proof: Test-Path templates/registry.json -> False; templates/pages -> False; templates/blocks -> False; archive/2026-10-04/old-starters -> True (blocks, pages, workshop, registry.json).
- Proof: node tools/template.mjs list -> TEMPLATES (15) (v1 lane live; README said 14, now 15 with framer/sample-01).
- Intentional dual paths (NOT half-done): thumb sharp-first + Edge fallback (tools/thumb.mjs via render.mjs); covers/ (built per-slug outputs, e.g. covers/a-m/aeo-done-for-you-itch/brief.json, cover-1280x720.png) vs templates/covers/ (v1 sources app-window, item-board, sheet-fan).
- Total half-done migrations: 0.

## Totals (from rg via Grep tool, path-scoped)
- TODO/FIXME/XXX markers in scope: 0
- True skipped/commented-out tests: 0 (9 SKIP-verdict lines, intentional)
- Half-done migrations: 0 (1 completed migration DS-78c, archived)
