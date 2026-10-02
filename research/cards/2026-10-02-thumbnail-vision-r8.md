# Thumbnail readability sweep — vision-r8 (2026-10-02)

Goal: Sweep the Thumbnail readability part (DS-07 workshop plus DS-09 canvas built round 6, 011 ad-square plus 001 cover thumbs pixel-verified, audit thumb gate green on 6 samples — all still 0% unmeasured) and rewrite its VISION.md rows with measured numbers.
Scope: VISION.md Thumbnail Scorecard row plus Parts row; research/cards/ only. No code copied (all donor ideas idea-only, net 0 lines). No factory pilot rebuild (DS-12 stays READY).
Proof: links plus proof outputs below (all run/read 2026-10-02). Stop: L 45 min. Single deep packet (4 GitHub file reads + branches, web reads; no 429 hit).

## Live reads (2026-10-02)

- Rival competitor Canva Magic Switch one-to-many resize: search live 2026-10-02 via DuckDuckGo "Canva Magic Switch resize design into different sizes" returns "Resize one design for all channels / Magic Switch instantly resizes your design into many different sizes" (https://www.canva.com/pro/magic-switch/); direct fetch of https://www.canva.com/pro/magic-resize/ and /pro/magic-switch/ JS-gated 2026-10-02 ("No readable content extracted"). License: proprietary, idea only (site, not a repo; no LICENSE/SHA). Prior S01 reads (card research/cards/2026-10-02-s01.md): magic-resize plus help/resize read 2026-10-02, proprietary idea-only.
- Adjacent donor konvajs/konva (MIT): LICENSE SHA a25747cf170708ecbe162fcd4f50396993155d59 read live via GitHub (no ref = default branch); exact file src/Node.ts SHA 38472c4da65e69d3b3a4ef42489c056792b1725c read live 2026-10-02. Named by deepwiki_ask_wiki_question konvajs/konva (export files question) -> src/Node.ts (toDataURL/toImage/toCanvas plus pixelRatio) + src/Canvas.ts; read only src/Node.ts. What it does: Node.toDataURL/toImage/toCanvas with CanvasConfig pixelRatio scales export (thumbnail-size renders via pixelRatio/multiplier, imageSmoothingEnabled option).
- Adjacent donor fabricjs/fabric.js (MIT): LICENSE SHA 94cbfebf065dd7cc97a358ca3583e9828ef89415 read live via GitHub; exact file packages/core/src/canvas/StaticCanvas.ts SHA 644a47ff4f7a4213c92fe85416f382655ca421af read live 2026-10-02 (resolver: refs/heads/master SHA 013b48a325255b3b0663595582c4017ea853e887, default branch master). Named by deepwiki_ask_wiki_question fabricjs/fabric.js (SVG import + export question) -> src/parser/parseSVGDocument.ts + src/canvas/StaticCanvas.ts (toSVG/toDataURL); read only StaticCanvas.ts (v7 path packages/core/...). What it does: StaticCanvas.toDataURL({format, quality, multiplier, left/top/width/height crop, filter}) plus toCanvasElement(multiplier) plus toSVG(viewBox) — multiplier/crop is the per-size thumbnail path.
- Riser Elementor (proprietary, idea only): https://elementor.com/ fetched live 2026-10-02 (request render, markdown): "22M+ websites built", "AI prompt full pages and sections", "Pixel-perfect editing", "Image optimization: automatic high-fidelity compression", "responsive assets / Core Web Vitals". No fixed 256px/315px legibility gate published — responsive + compression only.

## Our thumbnail work (read 2026-10-02)

- tools/thumb.mjs (93 lines): thumbSize math + thumbBrief scaled-iframe render, minBytes 1024 floor.
- tools/audit.mjs (343 lines): title_box valid + title legible at 256px (floor 12px) + title fits box + contrast + PNG size gates.
- tools/check.mjs (88 lines): renders + thumbs + audits 6 samples (cover, ad-square, story, hebrew-hero, jobhunt, cv).
- tools/workshop.mjs DS-07 (121 lines): 4 stories on disk (hero, feature-grid, pricing, cta); registry now 10 blocks (DS-03 added 6).
- tools/canvas.mjs DS-09 (186 lines): 5 templates (ad-square, capsule, cover-hero, story-cover, wide-banner).
- samples/cover/brief.json title 96px 1280x720; samples/ad-square/brief.json title 96px 1080x1080.

## Proof outputs (run 2026-10-02)

- `node tools/thumb.mjs --check` -> THUMB PASS: 256px math on 4 sizes (cover 1280x720→256x144, story 1080x1920→256x455, square 1080x1080→256x256, capsule 616x353→256x147).
- `node tools/canvas.mjs --check` -> CANVAS PASS: 5 templates, Konva shape + palette + 256px green, SVG exports match.
- `node tools/workshop.mjs --check` -> WORKSHOP FAIL: 6 failing check(s) (stories 4/10: hero/feature-grid/pricing/cta PASS incl. 12.8px at 256w; stats/gallery/newsletter/footer/testimonial/faq missing after DS-03 registry growth to 10 blocks).
- `node tools/audit.mjs samples/cover/brief.json` -> AUDIT PASS incl. `[PASS] title legible at 256px: 19.2px at 256px wide (floor 12px)` + `[PASS] title fits its box: need ~816px, box 1075px`.
- `node tools/audit.mjs samples/ad-square/brief.json` -> AUDIT PASS incl. `[PASS] title legible at 256px: 22.8px at 256px wide (floor 12px)` + `[PASS] title fits its box: need ~816px, box 907px`.
- `node tools/check.mjs` -> RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits (cover 1280x720 34186B thumb 256x144 5567B; ad-square 1080x1080 50846B thumb 256x256 9164B; story 1080x1920 69685B thumb 256x455 12227B; hebrew-hero 1280x720 28125B thumb 256x144 3837B; jobhunt 1280x720 35014B thumb 256x144 5003B; cv 900x1270 98813B thumb 256x361 21777B).
- `node tools/judge.mjs samples/cover/brief.json` -> SHIP 10/10 incl. thumbnail-legible 19.2px with thumb-256.png 256x144 human verdict.

## Cards (all idea-only, 0 lines copied)

### C1 — Per-size multiplier export (Konva pixelRatio + Fabric multiplier) into our thumb path
- Source: konvajs/konva MIT (LICENSE SHA a25747c) src/Node.ts SHA 38472c4 (toDataURL pixelRatio, read live 2026-10-02) + fabricjs/fabric.js MIT (LICENSE SHA 94cbfeb) packages/core/src/canvas/StaticCanvas.ts SHA 644a47f (toDataURL multiplier + crop, default branch master, read live 2026-10-02) | License: MIT both, code-copyable but this card is idea-only, 0 lines copied.
- What it does: export one scene at N sizes via a scale factor (pixelRatio/multiplier) plus crop box, instead of one render per hand edit.
- Home: tools/thumb.mjs plus tools/render.mjs (both exist; thumbBrief already scales via iframe CSS scale) + tools/audit.mjs per-size gate; board rows DS-09 / DS-23.
- Fixes: Thumbnail readability (title readable at 256px plus listing 315px; S01 one-to-many matrix experiment).
- Net lines: 0 new (idea-only). Donor: konva src/Node.ts large + fabric StaticCanvas.ts large (SHAs above); ours: tools/thumb.mjs 93 lines + tools/audit.mjs 343 lines + tools/canvas.mjs 186 lines (Read 2026-10-02).
- Proof: `node tools/check.mjs` RESULT PASS 6/6 thumbs non-trivial (smallest 3837B over 1024B floor) + `node tools/audit.mjs samples/cover/brief.json` AUDIT PASS 19.2px + ad-square 22.8px, all run 2026-10-02 (outputs above). No proof = reject: satisfied.
- Effort and risk: S. Risk low — mirrors our iframe-scale path; risk is inventing Canva's matrix instead of measuring our consumer slots (315px, 256px floor).

### C2 — Per-size reflow gate (Fabric crop + title re-check, never scaled-blind)
- Source: same two MIT files/SHAs as C1 + Canva Magic Switch reflow idea (search live 2026-10-02, proprietary idea-only) + Elementor riser responsive assets (elementor.com read live 2026-10-02, proprietary idea-only).
- What it does: every resized variant (1280x720 + 1080x1080 + 1200x628) must re-pass title_box valid + 256px legibility + title-fits-box; a failing size reflows (smaller title_px or moved box), never ships scaled-blind.
- Home: tools/audit.mjs title gates (exist) + tools/canvas.mjs validateScene 256px gate (exists); board rows DS-07 / DS-23.
- Fixes: Thumbnail readability.
- Net lines: 0 new (idea-only).
- Proof: `node tools/audit.mjs samples/cover/brief.json` 19.2px PASS + ad-square 22.8px PASS + `node tools/canvas.mjs --check` CANVAS PASS 5/5 (all 2026-10-02). Extension proof after build is the same audit per size.
- Effort and risk: S. Risk low — gates already pass on 6/6 samples; risk is over-constraining creative boxes if the 12px floor is applied to non-title art (keep gate title-only, as today).

## Reject list
- R1 — Vendor Konva/Node.ts or Fabric/StaticCanvas.ts into our headless loop. Rejected: our Edge-headless + own SVG exporter needs no DOM and no new dep; keep the multiplier idea, never the vendored file (no home for a DOM canvas runtime).
- R2 — Copy Canva Magic Switch implementation or templates/fonts. Rejected: no code public, proprietary license, unlicensed assets violate the vision rule; home would be samples/cover but license fails. Use Kenney CC0 + Lucide ISC + our tokens (DS-11 lane).
- R3 — Publish an assumed size matrix (e.g. invent 1200x628 numbers) as measured. Rejected: no pixel table published on pages read; inventing numbers violates the research contract (UNKNOWN stays UNKNOWN). Matrix starts from measured slots: 1280x720 cover, 1080x1080 square, 315px listing gate, 256px floor.
- R4 — Raise Thumbnail above 0% today on 6/6 audits alone. Rejected 2026-10-02: workshop 4/10 FAIL + 315px listing gate unbuilt + DS-12 factory pilot cover still unreadable (STUDIO.md 2026-09-27); 0% kept with dated reason until those close.

## VISION.md write-back
- Thumbnail Scorecard row + Parts row rewritten 2026-10-02 with measured numbers (stays 0% with dated reason: 4/10 stories + no 315px gate + DS-12 unbuilt), How cell ends with (swept 2026-10-02), Parts Swept 2026-10-02. Numbers carry source + date.
