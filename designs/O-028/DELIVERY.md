# DELIVERY O-028: page:fp-detect-deck for fp-research
1. Landing in fp-research: `from-design-studio/O-028/` (this whole folder; no fp-research file outside it is touched).
2. `out.pdf` = the deck (8 landscape pages, real text, 5 fonts embedded, 0 images); `out.png` = slide 1; `out-1280x5760.png` = all 8 slides; `page.html` + `tokens.css` = the source (template print/deck, palette developer, same as the O-027 datasheet).
3. `FACTS.md` = every number on the page with its line in scoreboard.md or arms-race.md (2026-10-04).
4. Gates: `brief.json`, `design-audit.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP 10/10), `VERDICT.md`.
5. Open: no service name, price, pilot length or contact address exists in the sources, so the title is the plain words "Bot detection" and the ask slide says "Pilot requests: fp-research"; fp-research changes both in `page.html` when it has them (see ADOPT.md).
6. Proof here: `node tools/orders-check.mjs --built O-028`.
