# Landing-page conversion sweep — vision-r10 (2026-10-02)

Goal: Sweep the Landing-page conversion part (DS-03 registry-10 DONE, DS-14 judged ad set DONE, DS-17 convert harness DONE with green proofs; DS-24/DS-29 built, 025 review pending — all still 0% unmeasured) and rewrite its VISION.md Scorecard row plus Parts row with measured numbers (or keep 0% with a dated reason).
Scope: VISION.md Landing Scorecard row plus Parts row; research/cards/ only. No code copied (all donor ideas idea-only, net 0 lines). No factory page rebuild, no receipt.json written (DS-24 stays opt-in until 025 lands).
Proof: links plus proof outputs below (all run/read 2026-10-02). Stop: L 45 min. Single deep packet (GitHub: LICENSE + generators dir + react dir + generator.ts + branches, no 429 hit; web: figma.com/sites + docs.lovable.dev/features/publish + elementor.com + 1 search; deepwiki_ask_wiki_question BuilderIO/mitosis one call first).
Claim: `Landing | vision-r10 | 2026-10-02T13:03Z | VISION.md` in sprint/queue/claims.txt (no rival Landing claim within 2 h; Brief-to-render fallback not taken).

## Live reads (2026-10-02)

- Rival Figma Sites: https://www.figma.com/sites/ read live 2026-10-02 (request render, title "Figma Sites: Design, Prototype & Publish Your Next Website"): frames-to-flexible-layouts paste, pre-built blocks with auto layout, preset interactions, Sites CMS (content edits from one view, layout stays locked), AI-or-code customize, template gallery (Events / Landing pages dark-mode / Personal / Business / Portfolios). License: proprietary, idea only (site, not a repo; no LICENSE/SHA). Matches prior S02 card (research/cards/2026-10-02-s02.md).
- Rival Lovable: https://lovable.dev/ fetch 2026-10-02 returned no readable content (JS-gated); covered live instead by https://docs.lovable.dev/features/publish read live 2026-10-02 (Publish button top-right → live lovable.app URL, Quick security scan, publish dialog free, stays live indefinitely, chat-publish consumes credits) plus DuckDuckGo search "Lovable prompt to app publish one click" 5 hits 2026-10-02 (top: lovable.dev/build/app-builder "app from a single prompt — interface, database, and logic included"; docs.lovable.dev/features/publish "Click Publish … live link"). License: proprietary, idea only.
- Riser Elementor: https://elementor.com/ read live 2026-10-02 (request render, markdown): "22M+ websites built", "AI prompt full pages and sections … matched to your site's design system", "Pixel-perfect editing", "Engage and capture: convert visitors into customers with high-performance forms, popups, and lead-capture tools", "responsive assets / Core Web Vitals", image optimization + accessibility + performance. No fixed block-reuse/CTA/measure rubric published. License: proprietary, idea only.
- Adjacent donor BuilderIO/mitosis (MIT): LICENSE SHA 695e60cdac6e8f073819bd6b7a2fbc399a9f7216 read live via GitHub (no ref = default branch); exact file packages/core/src/generators/react/generator.ts SHA c40072307c9c66d1c68976c8849ea0290ea0683a read live 2026-10-02 (discovered via generators dir + react dir listings, refs 38bbdbc321c5c2060ca63b8ecc1e31cee954d6bc). Named by deepwiki_ask_wiki_question BuilderIO/mitosis (write-once compilation question, one call) -> packages/core/src/generators/* (react, vue, svelte, solid, …); read only react/generator.ts. What it does: componentToReact transpiler (Mitosis JSON -> React/Preact/RSC/Native/Taro: fastClone, plugin pipeline, state/refs/context/provideContext, blockToReact children, styled-jsx/style-tag/emotion/native style collection, prettier format, forwardRef/useState/useEffect imports). License MIT, copyable, but this sweep is idea-only, 0 lines copied.

## Our conversion work (read + run 2026-10-02)

- tools/registry.mjs DS-03 (99 lines): 10 blocks (hero, feature-grid, pricing, cta, testimonial, faq, stats, gallery, newsletter, footer) + 4 templates (cover 1280x720, ad-square 1080x1080, story 1080x1920, capsule 616x353), 0 hardcoded colors, dir + CTA gates.
- tools/convert.mjs DS-17 (116 lines): convert/variants/{a,b}.html (hero + cta provenance, dir + size tag, exactly one .cta href, 0 hex) + convert/plan.json (6 steps, metric "cta click-through on .cta within a 5-minute review session", covers A+B).
- tools/check.mjs (176 lines): DS-24 checkReceipt gate built (opt-in; url http(s) + date YYYY-MM-DD + rev) + DS-29 pickWinner informational; 6-sample suite (cover, ad-square, story, hebrew-hero, jobhunt, cv).
- samples/ads DS-14: ad-1/ad-2/ad-3/hero each with brief.json + page.html + out.png + thumb-256.png + design-audit.json + DESIGN-REVIEW.md.

## Proof outputs (run 2026-10-02)

- `node tools/registry.mjs --check` -> REGISTRY PASS: 10 blocks + 4 templates, 0 hardcoded colors.
- `node tools/convert.mjs --check` -> CONVERT PASS: 2 variants differ, click plan covers A+B, metric named.
- `node --test tests/convert.test.mjs` -> pass 3, fail 0.
- `node tools/check.mjs` -> RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits (cover 1280x720 34186B thumb 256x144 5567B; ad-square 1080x1080 50846B thumb 256x256 9164B; story 1080x1920 69685B; hebrew-hero 1280x720 28125B; jobhunt 1280x720 35014B; cv 900x1270 98813B). Receipt line on all 6 samples: "no receipt declared, skipped" — 0 live receipts. Winner informational: cover-b by audit + 256px (cover 5567B 19.2px vs cover-b 9753B 22.8px).
- `node tools/check.mjs samples/cover/brief.json` -> render 1280x720 34186B + thumb 256x144 5567B + AUDIT PASS + receipt skipped, RESULT PASS.
- `node tools/judge.mjs --check` -> JUDGE PASS: rubric ds-quality-v1 10 checks, floor 8, samples/cover ships.
- `node tools/judge.mjs samples/ads/hero/brief.json` -> SHIP 9/10 (floor 8) rubric ds-quality-v1.

## Cards (all idea-only, 0 lines copied)

### C1 — Single-source block emit (Mitosis componentToReact pattern) into the registry
- Source: BuilderIO/mitosis MIT (LICENSE SHA 695e60c read live 2026-10-02) packages/core/src/generators/react/generator.ts SHA c400723 (componentToReact + blockToReact + plugin pipeline, read live 2026-10-02) | License: MIT, copyable, this card idea-only.
- What it does: one block definition fans out to every consumer (our analogue: one registry block file emits the sample page section plus the consumer snippet) instead of hand-maintaining N copies; Mitosis does it via fastClone + pre/post JSON/code plugins + per-target generator.
- Home: tools/registry.mjs (exists, 99 lines) + templates/blocks/*.html (10 files exist); board rows DS-03 / DS-08.
- Fixes: Landing-page conversion (block reuse across factory/marketing consumers).
- Net lines: 0 new (idea-only). Donor file large (see SHA above); ours: tools/registry.mjs 99 lines (read 2026-10-02).
- Proof: `node tools/registry.mjs --check` REGISTRY PASS 10 blocks + 4 templates 2026-10-02 (output above). No proof = reject: satisfied.
- Effort and risk: M. Risk medium — a mini-emit step adds a build seam; contained by keeping emitted HTML checked in beside the block until 025-style review blesses the generator.

### C2 — Receipt-required landing sample (Lovable publish-dialog + Sites publish-receipt pattern)
- Source: https://docs.lovable.dev/features/publish (read live 2026-10-02; Publish button -> live lovable.app URL + Quick scan, free dialog publish) + https://www.figma.com/sites/ (read live 2026-10-02; frame -> responsive site -> published URL, one path) + Elementor riser engage-and-capture (elementor.com read live 2026-10-02, forms/popups/lead-capture as the conversion payload) | License: proprietary, idea only, 0 lines copied.
- What it does: one landing sample carries receipt.json {url,date,rev} and the suite's receipt gate enforces it, so "published" is a file a reviewer can open — Lovable's live-link moment without their hosting.
- Home: tools/check.mjs checkReceipt (exists, built DS-24, opt-in today) + one sample brief.json (publish field); board row DS-24.
- Fixes: Landing-page conversion (measure plan ends in a live page receipt — the missing 4th check).
- Net lines: 0 new (idea-only; DS-24 gate already +25 lines in tree).
- Proof: `node tools/check.mjs` RESULT PASS with receipt "skipped" 6/6 2026-10-02 (proves the gate is opt-in and the bar is unmet — outputs above) + `node tools/convert.mjs --check` CONVERT PASS (the click plan the receipt will anchor). No proof = reject: satisfied.
- Effort and risk: S. Risk low — additive receipt.json on one sample; risk is URL rot, contained by keeping rev pinned to the audited out.png hash.

### C3 — CMS-split brief as conversion copy contract (Sites CMS pattern)
- Source: https://www.figma.com/sites/ section "Add, edit, and publish content quickly using Sites CMS … layout stays locked" (read live 2026-10-02) | License: proprietary, idea only.
- What it does: brief.json is the CMS record (title/sub/CTA href/proof claim), page.html is the locked layout that must carry exactly those fields; audit's title-carry gate is the parity check, extended to CTA href.
- Home: samples/ads/hero/brief.json (exists) + tools/audit.mjs title/CTA gates (exist); board rows DS-14 / DS-17.
- Fixes: Landing-page conversion (copy + CTA checks with a machine-enforced contract).
- Net lines: 0 new (idea-only).
- Proof: `node tools/judge.mjs samples/ads/hero/brief.json` SHIP 9/10 2026-10-02 + `node tools/convert.mjs --check` plan selectors h1/.sub/.cta each found in their variant (output above). No proof = reject: satisfied.
- Effort and risk: S. Risk low — brief-side fields only; follow-up M to gate CTA href parity in audit.

## Reject list
- R1 — Vendor generator.ts/blockToReact into our loop. Rejected: Edge-headless static HTML needs no JSX transpiler runtime; keep the single-source-emit idea, never the vendored file (no home for a TS transpile pipeline).
- R2 — Copy Lovable/Elementor/Figma markup, templates, or copy. Rejected: proprietary licenses, idea-only per this run; unlicensed assets violate the vision rule.
- R3 — Raise Landing above 0% on REGISTRY/CONVERT/judge greens alone. Rejected 2026-10-02: 0 receipts on 6/6 samples (receipt skipped everywhere) + DS-24/DS-29 still pending 025 review + no factory live-page receipt; bar needs a registry block on a live page with a receipt.
- R4 — Invent rival percents into UNKNOWN cells. Rejected: no fixed published rubric on any rival page read; UNKNOWN stays UNKNOWN per Scorecard rules.

## VISION.md write-back
- Landing Scorecard row + Parts row rewritten 2026-10-02 with measured numbers (stays 0% with dated reason: REGISTRY PASS 10+4 plus CONVERT PASS plus check RESULT PASS, but 0/6 receipts plus 025 pending plus no live factory page), How cell ends with (swept 2026-10-02), Parts Swept 2026-10-02. Numbers carry source + date. Steal-map S02/S20 Last read already 2026-10-02; no edit needed.
