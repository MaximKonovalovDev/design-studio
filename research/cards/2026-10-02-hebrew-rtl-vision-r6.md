# Hebrew RTL sweep — vision-r6 (2026-10-02)

Goal: Re-sweep the Hebrew RTL part after DS-13/DS-15/DS-16 landed (round 5 builds) and rewrite its VISION.md Scorecard + Parts rows with measured numbers.

Scope: `VISION.md` plus one card (this file). Stop: L 45 min.

## Source and license

- Donor: penpot/penpot — LICENSE MPL-2.0 (SHA a612ad98 read live via GitHub 2026-10-02). Exact file: `frontend/src/app/util/code_gen/style_css_values.cljs` (SHA 4052adba read live 2026-10-02) — named by `deepwiki_ask_wiki_question(penpot/penpot)` 2026-10-02. Idea-only (MPL-2.0 is reference-only here; no code copied).
- Rival Figma: https://help.figma.com/hc/en-us/articles/4972283635863-Add-right-to-left-text (read live 2026-10-02) — proprietary, idea only. RTL + bidi text-direction controls per paragraph, Noto fallback; editor text only, no fixed audit gate.
- Rival Canva: https://www.canva.com/help/language-settings/ (fetch 2026-10-02 returned unsupported-client page; search confirms localized fonts/templates; prior VISION read 2026-10-02) — proprietary, idea only, no RTL-correctness bar published.
- Riser Elementor: https://elementor.com/ (read live 2026-10-02, homepage claims 22M+ sites) — proprietary, idea only. Israeli builder serving Hebrew sites at scale; no fixed RTL audit gate published.

## What it does

- Penpot generates direction-aware CSS with logical properties (`padding-inline-start`, `margin-inline-end`, `border-inline-*`, `inset-inline-*`) from shape layout data instead of physical left/right, so flex/grid survives RTL. Our `tools/audit.mjs` RTL gate already enforces the same shape: `dir=rtl` + logical-properties-only + Hebrew type pair.
- Figma/Canva/Elementor all handle Hebrew text or templates but publish no fixed RTL-correctness gate (no n/m rubric, no proof command) — UNKNOWN until measured.

## Home (no home = reject)

- `tools/audit.mjs` (RTL gate lines 113-133 + `rtlSelfCheck` lines 211-324) — the gate that measures this part.
- `samples/jobhunt/page.html` + `samples/cv/page.html` + `samples/hebrew-hero/page.html` — the three measured RTL samples.

## Fixes (the part)

- Hebrew RTL (Scorecard + Parts rows in VISION.md): 0% (0/3, gate unbuilt) → 100% (3/3, gate built + 3 samples green).

## Net lines

- This card only (research): +1 file. No product code changed in this sweep (DS-13/DS-15/DS-16 built the work round 5; this sweep measures + rewrites VISION rows).

## Proof (no proof = reject)

Live proof outputs run 2026-10-02 in this sweep:

- `node tools/audit.mjs --rtl --check` → `AUDIT RTL PASS: dir + logical-properties + Hebrew-type gates green` (10/10 checks, 3 on-disk RTL samples all green: cv, hebrew-hero, jobhunt).
- `node tools/audit.mjs samples/jobhunt/brief.json` → `AUDIT PASS` 17/17 (1280x720 35014B, title 19.2px at 256px, contrasts 16.27/7.13/5.18:1).
- `node tools/audit.mjs samples/cv/brief.json` → `AUDIT PASS` 17/17 (900x1270 49813B, title 20.5px at 256px, contrasts 16.27/7.13/5.18:1).
- `node tools/audit.mjs samples/hebrew-hero/brief.json` → `AUDIT PASS` 17/17 (1280x720 28125B).

## Effort and risk

- Effort S (sweep + rewrite, ~30 min). Risk low: measurement-only; no product edit, no license risk (all rival/proprietary + MPL sources idea-only, no code copied). Risk noted: Canva fetch hit unsupported-client page so Canva cell stays UNKNOWN with reason (no invented percent).

## VISION rewrite (applied)

- Scorecard Hebrew RTL → 100% (3/3 rubric ds-rtl-v1, 3 design-audit.json sources 2026-10-02), rivals UNKNOWN with live reads cited, How ends with `(swept 2026-10-02)`.
- Parts Hebrew RTL → 100% (3/3 rubric ds-rtl-v1, same sources), Best = Figma (proprietary) text-direction controls, Steal next = penpot logical-props already shaped gate; next mirror-check, Proof = `node tools/audit.mjs --rtl --check`, Swept 2026-10-02.
