# DELIVERY O-027: page:fp-detect-datasheet for fp-research
1. Landing in fp-research: `from-design-studio/O-027/` (this whole folder; no fp-research file outside it is touched).
2. `out.pdf` = the datasheet (A4, one page, real text, 5 fonts embedded); `out.png` = a look at it; `page.html` + `tokens.css` = the source (template print/one-pager, palette developer).
3. `FACTS.md` = every number on the page with its line in scoreboard.md or arms-race.md (2026-10-04).
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md`.
5. Open: no real contact address and no service name exist in the sources, so the title is the plain words "Bot detection" and the contact line says "Pilot requests: fp-research"; fp-research changes both in `page.html` when it has them (see ADOPT.md).
6. Proof here: `node tools/orders-check.mjs --built O-027`.
