# DELIVERY O-007: cv-layout:he-a4 for jobhunt
1. Landing in jobhunt: `from-design-studio/O-007/` (copy this whole folder; never edit a file outside from-design-studio/). Replaces the O-010 copy in `from-design-studio/cv/` as the CV layout.
2. `page.html` = Hebrew-first RTL A4 page, `page-en.html` = EN LTR twin, both with the same named slots (`data-slot`, list in `SLOTS.md`); `cv.css` = the same styles on their own, class names as jobhunt's `tools/cv-render.mjs` uses; `tokens.css` = the only color and type source (`--scale` 1 to 0.8 shrinks a long fill).
3. `cv-he.pdf` and `cv-en.pdf` = print results (Edge headless, one A4 page, real text); `out.png` and `out-en.png` = a look at each page; `thumb-256.png` = readability proof.
4. Gates: `brief.json`, `design-audit.json` + `design-audit-en.json` (audit PASS), `DESIGN-REVIEW.md` (SHIP), `VERDICT.md`, `pdf-check.txt` (pages, real text, Hebrew order).
5. Fill: map each cv JSON field to its slot (`SLOTS.md`); a Latin run inside Hebrew goes in `<bdi dir="ltr">...</bdi>` (the HTML form of LRI ... PDI). Placeholders only here: no personal data.
6. Adopt: copy the folder, point `tools/cv-render.mjs` at `cv.css` + `tokens.css` (or this page.html), run `node tools/kit-build.mjs --all`, commit.
7. Proof in jobhunt: `git log -1 --format=%h -- from-design-studio/O-007/page.html`; here: `node tools/orders-check.mjs` and `node tools/audit.mjs designs/O-007/brief.json`.
