---
role: builder
title: NEED-15 default app-window template to OFL fonts
chain: start
---

design-studio crew, toolsmith run for NEED-15 (Role builder, order O-051): `covers/app-window` template emits system fonts (Bahnschrift/Segoe UI) that `fonts/` cannot embed; the maker must hand-edit cover.json fonts to Inter every order. Default the template to the OFL stock.

Goal: a `template.mjs new --template covers/app-window` output that needs no hand font fix, with the template `--check` green.

Scope (owned paths, working tree only, never commit): `templates/covers/app-window/` (cover.json and/or template.json and/or art files: land an OFL default, e.g. Inter from `fonts/`), `tools/` + `tests/` ONLY if the emit path (`template.mjs new` / `cover.mjs gen`) hardcodes the system font and the template alone cannot fix it (one file each at most), `sprint/needs.md` (NEED-15 row only: mark DONE with the proof, or BLOCKED with the exact licence/key stop). Do NOT touch `orders.csv`, `knowledge/lane-store.md`, or any `designs/` path (sibling packets own them this batch). No new npm/pip dependency for this (a default value, not a tool).

Steps (toolsmith seat rules apply: licence-first, in-repo only):

1. Read NEED-15 in `sprint/needs.md` plus `templates/covers/app-window/cover.json` and `template.json`: find exactly where the system font enters (template default, `template.mjs new` slot fill, or `cover.mjs gen` tokens emit). Check what `fonts/` holds as OFL stock (Inter woff2 per O-037/O-051 lane notes).
2. Fix at the highest level that works: prefer the template default; touch the emit path only if the template cannot carry it. Keep every existing `--check` green.
3. Prove on a real order path without touching a real order: generate one throwaway render from the fixed template (temp dir under `$env:TEMP`, never `designs/`) and show its tokens carry the OFL stack with no Bahnschrift/Segoe UI string anywhere in the emitted files.
4. Proof: `node tools/template.mjs --check` TEMPLATE line, `node tools/orders-check.mjs` ORDERS line (read-only proof it still passes), and the NEED-15 row marked DONE with the proof line.

Stop (M 25 min). One need only.

Card, first lines: Goal (NEED-15, OFL default), Scope (template files + needs row), Proof (template check + throwaway render), Stop.

End: `RESULT: DONE|PARTIAL|BLOCKED - NEED-15 <fixed at template|emit path|blocked why> | proof: node tools/template.mjs --check`
Name the commit line for the lead (who commits, you never do): `git add templates/covers/app-window <any tools/tests touched> sprint/needs.md`.
