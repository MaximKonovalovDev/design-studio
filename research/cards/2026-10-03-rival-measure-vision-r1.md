# DS-75 rival measure — vision-r1 (2026-10-03)

Goal: Answer DS-75 (inbox EB-2026-10-03-S68 item 2): measure one rival output per Scorecard row with fixed n/m, rubric ID, source artifact, date — or show why our rows stay measured and rivals stay UNKNOWN without inventing numbers.
Scope: VISION-TABLES.md plus this one card. No builder code changed. Idea-only from proprietary sources, net 0 lines copied.
Proof: live page reads plus proof outputs below (all 2026-10-03). Stop: L 45 min. One packet: 4 web reads (no GitHub reads, no 429; no donor repo so no deepwiki call), our work read, 4 proof commands.

## Live rival reads (2026-10-03, proprietary idea-only, no code taken)

- Figma AI — https://www.figma.com/ai/ (fetched live 2026-10-03): "Figma AI workflows help teams confidently build the right thing", Explore (agent generates directions/diagrams/image-edit/file-search) + Polish (compare multiple directions side by side) + Ship (code-backed prototype, MCP server to production) + AI credits. No fixed n/m rubric, no source artifact with version/date, no percent of any of our 7 bars published. License: proprietary, idea only.
- v0 — https://v0.app/ (fetched live 2026-10-03; docs page lastUpdated 2026-10-02): "Describe your idea / Create high-fidelity UIs / Deploy with one click to Vercel / Automatically fix errors". No fixed 2-check / 10-check / 4-check gate, no brief.json + out.png + design-audit.json artifact, no date-pinned measurement. License: proprietary, idea only.
- Lovable — https://lovable.dev/ (fetched live 2026-10-03): "Describe what you want in plain language / Refine your design and deploy / Hosting, handled" plus customer stories (eXp Realty $2M+ savings, 85% fewer tickets, 83K agents; Klar EUR 130K ARR; Scion 100+ apps). Business outcomes only; no fixed rubric ID, no n/m of our bar (speed 2, quality 10, thumb 4, brand 5, RTL 3, game 5, conv 4), no reproducible artifact. License: proprietary, idea only.
- Canva — https://www.canva.com/ (fetched live 2026-10-03): "Unsupported client – Please update your browser", no readable bar; https://www.canva.com/magic-studio/ returns 404 2026-10-03. Prior VISION G1/S01 reads (2026-10-02 templates + resize) stand; nothing new measurable today. License: proprietary, idea only.

Applied check: our 7 rubrics (ds-speed-v1 2/2, ds-quality-v1 10/10, ds-thumb-v1 4/4, ds-brand-v1 5/5, ds-rtl-v1 3/3, ds-game-v1 5/5, ds-conv-v1 0/4) each need a named rubric, a source artifact, a version and a real date. None of the 4 rival pages publishes any of these, so no sourced percent of our bar can be computed for any rival cell. Inventing one would violate the research contract ("Unknown remains unknown").

## Our work (read 2026-10-03)

- VISION-TABLES.md Scorecard: 6 rows read 100% with rubric + source + date; every rival cell UNKNOWN per contract (ratings need fixed n/m + rubric ID + source artifact + date).
- samples/cover-b/brief.json + page.html + tokens.css + out.png 1080x1080 + thumb-256.png + design-audit.json (AUDIT PASS, SHIP 10/10).

## Proof outputs (run 2026-10-03, C:\empire\design-studio)

- `node tools/audit.mjs samples/cover-b/brief.json` -> AUDIT PASS: render, sizes, contrast, thumbnail, RTL gates (incl. title legible at 256px 22.8px floor 12px; listing 315px 28.0px; reference parity skipped, no reference declared).
- `node tools/check.mjs` -> RESULT PASS: loop check plus 11 sample renders plus thumbs plus audits (cover-b path incl. winner cover-b by audit + 256px; hero-b by audit + 256px).
- `node tools/judge.mjs samples/cover-b/brief.json` -> SHIP 10/10 (floor 8) rubric ds-quality-v1.
- `node C:/empire/center/vision-check.mjs design-studio` -> RESULT PASS: 7 pass, 0 warn, 0 fail.

## Card (idea-only, 0 lines copied)

- Source and license: Figma AI https://www.figma.com/ai/ (proprietary, read live 2026-10-03) + v0 https://v0.app/ docs lastUpdated 2026-10-02 (proprietary, read live 2026-10-03) + Lovable https://lovable.dev/ (proprietary, read live 2026-10-03) + Canva https://www.canva.com/ unsupported-client + https://www.canva.com/magic-studio/ 404 (proprietary, read live 2026-10-03).
- What it does: honest rival-measure method — apply our fixed rubrics to rival-published artifacts only; when no artifact publishes n/m + rubric + date, keep rival UNKNOWN and keep ours only where proof commands pass.
- Home: VISION-TABLES.md (exists; Scorecard contract "Rival cells stay exactly UNKNOWN until a sourced percent is measured" + Research contract "Unknown remains unknown"). No home = reject: satisfied.
- Fixes: all Scorecard rows via DS-75 (S68 item 2); answers G1 without inventing percents.
- Net lines: 0 new (idea-only; no code copied from GPL/AGPL/proprietary/reference-only sources per seat rule).
- Proof: 4 live page reads above + 4 proof outputs above (audit AUDIT PASS, check RESULT PASS 11 samples, judge SHIP 10/10, vision-check RESULT PASS 7/0/0). No proof = reject: satisfied.
- Effort and risk: S. Risk low — read-only; risk is inventing rival percents from marketing copy (rejected) or downgrading our measured 100% rows to UNKNOWN without a failing proof (rejected: proofs pass today).

## Reject list

- R1 — Assign Canva/Figma/v0/Lovable sourced percents (e.g. 80%) of our bar from marketing claims. Rejected 2026-10-03: no fixed n/m + rubric ID + source artifact + date on any page read; violates Scorecard rule.
- R2 — Downgrade our 6 measured 100% rows to UNKNOWN because rivals are UNKNOWN. Rejected 2026-10-03: ours carry rubric + source + date and proofs pass today (check/judge/audit/vision-check outputs above).
- R3 — Vendor any rival code or copy templates/fonts. Rejected: all 4 rivals proprietary, idea-only; no LICENSE/SHA, no copyable code path.
