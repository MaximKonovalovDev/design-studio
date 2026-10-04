# DELIVERY O-024: post-visual:aeo-visibility-audit-kit for marketing-studio
1. Landing in marketing-studio: `from-design-studio/O-024/` (copy this whole folder; never edit a file outside from-design-studio/). Nothing is posted by design-studio.
2. `out.png` 1200x630 = devlog header for the aeo-visibility-audit-kit devlog; `out-1080x1080.png` = square from the same `page.html` (stacked reflow under 5:4); `thumb-256.png` = readability proof at 256 px.
3. Source: `page.html` + `tokens.css` (bold system, dark navy + amber). Typographic build, dry fallback: no footage and no fitting stock named by the customer, so no product bytes copied (`assets.json` notes it); NEED-06 in `sprint/needs.md` asks for a CC0 backdrop that fits a dark bold devlog header.
4. Gates: `brief.json`, `design-audit.json` (AUDIT PASS 22 green + 1 SKIP), `DESIGN-REVIEW.md` (SHIP 10/10), `VERDICT.md` (worker self-review; keeper's judge chain still to come).
5. Title is the product name verbatim: AI Search Visibility Audit Kit. Facts only from `listing/itch.md`: 200 GEO probe questions (dentist/plumber/agency/SaaS x 50, CSV+JSON+Markdown), 20-point fix checklist (Technical 4, Content 5, Authority 4, Local 4, Measurement 3), report template, $29 one-time, search-proxy honest method. No scores or audit numbers: the worked audits are synthetic samples.
6. Compare (by eye; `tools/compose.mjs` does not exist): factory `preview/cover-1280x720.png` is the light store cover; this header is the dark devlog counterpart with the same facts, no look-alike clash.
7. Post gate line for marketing-studio: `visual: order:O-024`.
8. Adopt: commit these bytes in marketing-studio and point the devlog step of `campaigns/aeo-visibility-audit-kit` at `out.png`; the loop posts through its own gate.
9. Proof here: `node tools/orders-check.mjs` ORDERS PASS (`--built` has not landed: packet 0b; built = out.png + design-audit.json + DESIGN-REVIEW.md all on disk) and `node tools/audit.mjs designs/O-024/brief.json` AUDIT PASS.
