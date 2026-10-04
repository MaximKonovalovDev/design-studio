---
role: builder
title: DS-78c archive old starters (pages, blocks, registry.json, workshop)
chain: start
cpu: heavy
---

Goal: DS-78(c) per inbox S55 report: the old `templates/pages`, `templates/blocks`, `templates/registry.json` and `workshop/` are read by 4 tools, 4 tests, the arsenal block tool and 3 checks.md lines, by 0 orders: archive them together, porting each `--check` user to templates v1 or retiring it.

Scope (owned paths): `templates/pages`, `templates/blocks`, `templates/registry.json`, `templates/README.md` (one-line update only), `workshop/`, `archive/2026-10-04/old-starters/` (destination), `tools/registry.mjs`, `tools/figma.mjs`, `tools/workshop.mjs`, `tools/convert.mjs`, the test files under `tests/` that reference the old starters (name each in RESULT), `arsenal.json` (block entry only). Do NOT touch `tools/template.mjs` (LEGACY guard stays), `tools/check.mjs` logic (imports `checkLandingVerdict` from figma.mjs: keep that import green by port or by updating the import in the same diff), `samples/`, `packs/`, `convert/variants/`, `sprint/queue/checks.md` (history stays), `sprint/needs.md`, `orders.csv`.
1. Enumerate every code reference to the old starters (`templates/pages`, `templates/blocks`, `templates/registry.json`, `workshop/`) outside comments and history; that list is the port-or-retire set (expect 4 tools + 4 tests + 1 arsenal entry).
2. Move the four legacy roots into `archive/2026-10-04/old-starters/` together (filesystem move, no git ops); port each user to templates v1 paths or retire it with its importer updated in the same diff.
3. No new dependencies, no secrets, no network. F2P: `Test-Path templates/registry.json` is True today (legacy still live). P2P: `node tools/check.mjs` RESULT PASS, `node sprint/check.mjs` RESULT PASS, `node tools/orders-check.mjs` ORDERS PASS, `node tools/template.mjs --check` TEMPLATE PASS.

Proof: the port-or-retire list; `node tools/check.mjs` RESULT PASS; `node tools/template.mjs --check` TEMPLATE PASS; `node tools/orders-check.mjs` ORDERS PASS; `node sprint/check.mjs` RESULT PASS.
Stop: M 40 min; this archive only; helpers never commit. End with the RESULT line.
