# DELIVERY O-030: portfolio:card-a4 for jobhunt (placeholders only)
1. Landing in jobhunt: `from-design-studio/O-030/` (this whole folder; no jobhunt file outside it is touched).
2. `page.html` = Hebrew rtl A4 card, `page-en.html` = English ltr twin; same 52 slots (`data-slot`), list in `SLOTS.md`; `tokens.css` = the only colour and type source (template print/portfolio-card, palette clean-professional).
3. `out.pdf` and `out-en.pdf` = Edge headless print, one A4 page each, real text, no images; `out.png` and `out-en.png` = a look at each page; `thumb-256.png` = readability proof.
4. Gates: `brief.json`, `design-audit.json` + `design-audit-en.json` (audit PASS), `DESIGN-REVIEW.md` + `DESIGN-REVIEW-en.md` (SHIP), `VERDICT.md`.
5. Fill: replace the text inside each `data-slot` element and the `<title>` (`SLOTS.md`); a Latin run in Hebrew is already isolated by its `bdi`.
6. Placeholders only: the person, projects and contact lines are made up; no personal data in this folder.
7. Proof here: `node tools/orders-check.mjs --built O-030`.
