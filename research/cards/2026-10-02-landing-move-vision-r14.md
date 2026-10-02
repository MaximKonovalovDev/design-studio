# Landing-page conversion MOVE sweep — vision-r14 (2026-10-02)

Goal: Re-sweep the Landing-page conversion part for a MOVE (held 0% round 10; since then DS-36 receipt gate plus DS-08 figma mapping plus DS-24/29 judged green — 035/036 verdicts land this round, so measure against judged rows only, hold with a dated reason if the verdicts are not both PASS). Rewrite the Parts plus Scorecard rows with measured numbers or hold, ending the How cell with `(swept 2026-10-02)`. File the steal as a card.
Scope: VISION.md Landing Scorecard row plus Parts row (plus Thumbnail hold-check, see below); research/cards/ only. No code copied (donor idea idea-only, net 0 lines). No factory page rebuild, no receipt.json written (DS-36 hero receipt already on disk, 036 verdict pending).
Proof: links plus proof outputs below (all run/read 2026-10-02). Stop: L 45 min. Single deep packet (GitHub: deepwiki_ask_wiki_question BuilderIO/mitosis one call first, then LICENSE + react/generator.ts only, no 429 hit; web: figma.com/sites + docs.lovable.dev/features/publish + elementor.com live reads).
Claim: `Landing-move | vision-r14 | 2026-10-02T14:13Z | VISION.md` in sprint/queue/claims.txt (prior Landing claim vision-r10 2026-10-02T13:03Z is within 2 h, so the Thumbnail conditional fires — see hold note).

## Live reads (2026-10-02)

- Rival Figma Sites: https://www.figma.com/sites/ read live 2026-10-02 (fetch markdown): frames-to-flexible-layouts paste, pre-built blocks with auto layout, preset interactions, Sites CMS (content edits from one view, layout stays locked), AI-or-code customize, template gallery (Events / Landing pages dark-mode / Personal / Business / Portfolios). License: proprietary, idea only (site, not a repo; no LICENSE/SHA). Confirms r10 read, no fixed block-reuse/CTA/measure rubric published.
- Rival Lovable: https://docs.lovable.dev/features/publish read live 2026-10-02 (fetch markdown): Publish button top-right → live lovable.app URL, Quick security scan (~10 s), snapshot deploy (republish pushes changes), dialog publish free, stays live indefinitely. License: proprietary, idea only.
- Riser Elementor: https://elementor.com/ read live 2026-10-02 (fetch markdown): 22M+ websites, AI prompt full pages/sections matched to site design system, pixel-perfect editing, engage-and-capture forms/popups/lead-capture, responsive assets / Core Web Vitals, hosting + domains. No fixed conversion rubric published. License: proprietary, idea only.
- Adjacent donor BuilderIO/mitosis (MIT): named by deepwiki_ask_wiki_question BuilderIO/mitosis (single-source component-to-React question, one call 2026-10-02) -> packages/core/src/generators/react/generator.ts + blocks.ts + react-native/index.ts; read only react/generator.ts. LICENSE SHA 695e60cdac6e8f073819bd6b7a2fbc399a9f7216 read live via GitHub (default branch); packages/core/src/generators/react/generator.ts SHA c40072307c9c66d1c68976c8849ea0290ea0683a read live 2026-10-02 (default branch). What it does: componentToReact transpiler (Mitosis JSON -> React/Preact/RSC/Native/Taro: fastClone, plugin pipeline, blockToReact children, style collection, prettier format). License MIT, copyable, but this sweep is idea-only, 0 lines copied.

## Our conversion work (read + run 2026-10-02)

- tools/registry.mjs DS-03: 10 blocks + 4 templates, 0 hex, dir + CTA gates.
- tools/convert.mjs DS-17: variants A/B (hero + cta provenance, one .cta href each) + convert/plan.json (6 steps, metric cta click-through).
- tools/check.mjs: default 6-sample suite receipt-skipped 6/6; samples/ads/hero carries receipt.json url+date+rev with rev == out.png sha256 (verified this run).
- tools/figma.mjs DS-08: FIGMA PASS 6 mappings, file-drop JSON, no network (031 PASS per round-13 handoff).
- Judged state 2026-10-02: DS-03/DS-14/DS-17 DONE (021/022/016 PASS), DS-24/DS-29 DONE (025 PASS 901625c), DS-08 DONE (031 PASS 6ab0e10). DS-36 receipt gate built DOING, judge packet 036-judge-ds36 queued but NO verdict landed (no done record, no commit). DS-35 likewise 035 queued, no verdict. Per packet rule (measure against judged rows only): HOLD.

## Proof outputs (run 2026-10-02)

- `node tools/registry.mjs --check` -> REGISTRY PASS: 10 blocks + 4 templates, 0 hardcoded colors.
- `node tools/convert.mjs --check` -> CONVERT PASS: 2 variants differ, click plan covers A+B, metric named.
- `node --test tests/convert.test.mjs` -> pass 3, fail 0.
- `node tools/check.mjs` (default suite) -> RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits (cover 1280x720 34186B thumb 5567B; ad-square 1080x1080 50846B; story 1080x1920 69685B; hebrew-hero 1280x720 28125B; jobhunt 1280x720 35014B; cv 900x1270 98813B); receipt skipped 6/6.
- `node tools/check.mjs samples/ads/hero/brief.json` -> render 1280x720 42384B + thumb 256x144 5675B + AUDIT PASS + receipt https://design-studio.local/ads/hero 2026-10-02 1456bd0ed00f, RESULT PASS.
- receipt rev pins out.png: sha256(out.png) == receipt rev 1456bd0ed00ff69ac9a157b59662dd727ed4c38770537e0027d6a286573727d0, match true (node crypto check this run).
- `node tools/judge.mjs samples/ads/hero/brief.json` -> SHIP 10/10 (floor 8) rubric ds-quality-v1.
- `node tools/figma.mjs --check` -> FIGMA PASS: 6 mappings, 6 frames, no network.
- 035/036 verdict check: sprint/queue/ready/035-judge-ds35.md + 036-judge-ds36.md queued; sprint/queue/done/ has no 035/036 verdict; git log --grep 035/036 shows only the round-13 build commit — verdicts NOT both PASS, so hold.

## Cards (all idea-only, 0 lines copied)

### C1 — Single-source block emit (Mitosis componentToReact pattern) into the registry
- Source: BuilderIO/mitosis MIT (LICENSE SHA 695e60cdac6e8f073819bd6b7a2fbc399a9f7216 read live 2026-10-02, default branch) packages/core/src/generators/react/generator.ts SHA c40072307c9c66d1c68976c8849ea0290ea0683a (componentToReact + fastClone + plugin pipeline + blockToReact, read live 2026-10-02, named by deepwiki_ask_wiki_question one call) | License: MIT, copyable, this card idea-only.
- What it does: one block definition fans out to every consumer (one registry block file emits the sample page section plus the consumer snippet) instead of hand-maintaining N copies; Mitosis does it via fastClone + pre/post JSON/code plugins + per-target generator.
- Home: tools/registry.mjs (exists) + templates/blocks/*.html (10 files exist); board rows DS-03 / DS-37 READY.
- Fixes: Landing-page conversion (block reuse across factory/marketing consumers).
- Net lines: 0 new (idea-only; DS-37 READY scopes the build at ~one block emits sample section + consumer snippet).
- Proof: `node tools/registry.mjs --check` REGISTRY PASS 10 blocks + 4 templates 2026-10-02 (output above). No proof = reject: satisfied.
- Effort and risk: M. Risk medium — a mini-emit step adds a build seam; contained by keeping emitted HTML checked in beside the block until a 025-style review blesses the generator.

## Reject list
- R1 — Vendor generator.ts/blockToReact into our loop. Rejected: Edge-headless static HTML needs no JSX transpiler runtime; keep the single-source-emit idea, never the vendored file (no home for a TS transpile pipeline).
- R2 — Copy Lovable/Elementor/Figma markup, templates, or copy. Rejected: proprietary licenses, idea-only per this run; unlicensed assets violate the vision rule.
- R3 — Raise Landing above 0% on REGISTRY/CONVERT/judge/hero-receipt greens alone. Rejected 2026-10-02: 035/036 verdicts not both PASS (both queued, none landed — packet orders measure against judged rows only) + hero receipt is a local URL (https://design-studio.local/ads/hero), not a live factory page + default suite still receipt-skipped 6/6; bar needs a judged registry block on a live page with a receipt.
- R4 — Invent rival percents into UNKNOWN cells. Rejected: no fixed published rubric on any rival page read; UNKNOWN stays UNKNOWN per Scorecard rules.
- R5 — Measure Thumbnail up on WORKSHOP PASS 10/10 seen on disk this run. Rejected 2026-10-02: 034 stories fix is in flight (claimed 2026-10-02T14:09Z, stories+snapshots untracked, DS-07 still DOING, no commit) — packet orders measure after it lands, else hold; hold both Thumbnail rows at 0% with this dated reason.

## VISION.md write-back
- Landing Scorecard row + Parts row rewritten 2026-10-02 with measured numbers (holds 0% with dated reason: judged greens DS-03/14/17 + DS-24/29 (025 PASS) + DS-08 (031 PASS), hero receipt rev==sha256, but 035/036 verdicts not both PASS plus no live factory page plus default suite receipt-skipped 6/6), How cell ends with (swept 2026-10-02), Parts Swept 2026-10-02. Numbers carry source + date. Steal-map S02/S20 Last read already 2026-10-02; no edit needed.
- Thumbnail conditional fired (prior Landing claim 13:03Z within 2 h of this 14:13Z claim): Thumbnail Scorecard + Parts rows re-checked this run (WORKSHOP PASS 10/10 on disk but 034 uncommitted; ad-square AUDIT PASS 3 sizes) and held at 0% with dated reason, How cell ends with (swept 2026-10-02).
