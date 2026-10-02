# VISION: design-studio (2026-10-02)

design-studio: Maxim's autonomous AI design studio on steroids. It turns a brief into a finished, judged design: brief.json -> design tokens -> page/creative/UI kit -> rendered PNG -> design audit -> art-director review, with no human in the loop. It serves 3+ consumers: factory product covers and store visuals, marketing-studio ad creatives and landing pages, jobhunt portfolio site and CV design, forge/engine2040 game UI kits. It steals hard from open design donors (nexu-io/open-design Apache-2.0, shadcn/ui MIT, Style Dictionary Apache-2.0, Konva MIT, satori MPL idea-only, Penpot MPL idea-only, screenshot-to-code MIT, OpenUI Apache-2.0) and beats Canva, Figma AI and v0 on judged quality per minute. Rules: every output is rendered and opened, scored by a fixed rubric, thumbnail-readable; no unlicensed assets; GPL/AGPL is idea only; Hebrew RTL first-class.

The proof that this vision is met: `node tools/check.mjs`.

This file is the ground the research loop reaches for. The current research
crew owns bounded sweeps; `node C:/Users/me/Desktop/center/vision-check.mjs
design-studio` passes as of 2026-10-02 (RESULT PASS, 0 fail). Keeping it
passing is the standing work, and the freshness rules it enforces: at least one
Parts row swept within 3 days, any estimate older than 7 days replaced by a
measurement, the steal map read within 7 days (oldest row first), no part
starved past 14 days, and every plan file on disk listed in the Plans map below
(`sprint/board.md`).

## Scorecard: design-studio against the best (percent of our final bar)

How to read it: 100 means our own final bar for that row is met. Every other
column says how much of that same bar the competitor meets today, with a source.
Our own number rises only by a proof command. Rival cells stay exactly UNKNOWN
until a sourced percent of our bar is measured for them; the sourced facts we
hold today are cited in each row's coverage cell and in gap G1, never invented
into a cell. Ratings need a fixed n/m, a named `rubric: ID`,
`source: artifact`, version and real date. Unknown criteria stay in the shared
denominator; a draft or document alone cannot prove a product outcome.

| Row (part of our bar) | design-studio | Canva | Figma AI | v0 | Lovable | How we cover it and beat them |
|---|---|---|---|---|---|---|
| Brief-to-render speed | 50% (1/2 rubric: ds-speed-v1 source: samples/cover/design-audit.json 2026-10-02) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Bar: brief.json to out.png plus design-audit.json in one `node tools/check.mjs` run, no Python needed. Measured: sample cover renders 1280x720 34186B via Edge headless plus audit 15/15 PASS via `node tools/check.mjs` RESULT PASS 2026-10-02 (render plus audit land, token-gen plus rubric judge open DS-05). Rival read: v0 prompt-to-React generation on https://v0.dev/ (read 2026-10-02, proprietary idea-only); Lovable prompt-to-app on https://lovable.dev/ (read 2026-10-02, proprietary idea-only); open donors wandb/openui Apache-2.0 (LICENSE read live 2026-10-02, Prompt.tsx SHA c6d97eb + HtmlAnnotator.tsx SHA aa279c9) plus Nutlope/llamacoder MIT (LICENSE read live 2026-10-02, page.tsx SHA 8877c12) read live via GitHub MCP. Steal next: wandb/openui Apache-2.0 prompt-render-iterate loop (streamResponse + iframe hydrate + annotatedHTML refine) into tools/render.mjs (card research/cards/2026-10-02-brief-render-vision-r1.md, DS-05). Proof: `node tools/check.mjs` (swept 2026-10-02) |
| Judged quality | 100% (10/10 rubric: ds-quality-v1 source: samples/cover/DESIGN-REVIEW.md 2026-10-02) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Bar: every output scored 10 checks by rubric ds-quality-v1 plus a written DESIGN-REVIEW.md; nothing ships below 8. Measured: samples/cover SHIP 10/10 via `node tools/judge.mjs samples/cover/brief.json` 2026-10-02 plus `node tools/judge.mjs --check` JUDGE PASS 2026-10-02 (rubric 10 checks floor 8, broken 5/10, 7/10 no-ship); iterate plus workshop open DS-04/DS-07. Rival read: Figma AI agent generation plus side-by-side compare plus MCP to production on https://www.figma.com/ai/ (read 2026-10-02, proprietary idea-only, no fixed rubric published); Canva Magic Studio on canva.com (read 2026-10-02, proprietary idea-only). Steal next: abi/screenshot-to-code MIT create-update (LICENSE SHA bee961c read live 2026-10-02) + onlook-dev/onlook Apache-2.0 oid click-to-code (LICENSE.md SHA 295f5e1 read live 2026-10-02) + storybookjs/storybook MIT StoryStore (LICENSE SHA c471193 read live 2026-10-02) into tools/judge.mjs (card research/cards/2026-10-02-judged-quality-vision-r1.md, DS-04/DS-07). Proof: `node tools/judge.mjs --check` (swept 2026-10-02) |
| Thumbnail readability | 0% (0/4 rubric: ds-thumb-v1 source: sprint/board.md 2026-10-02) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Bar: title readable at 256px plus listing width 315px, 4 checks (title size, contrast, box, crop). Measured: 0 covers pass; factory pilot cover fails this today (caption text unreadable as thumbnail per factory design/STUDIO.md 2026-09-27) and DS-12 rebuilds it. Rival read: Canva template and resize suite for social and store sizes on canva.com (read 2026-10-02, proprietary idea-only). Steal next: konvajs/konva MIT export plus factory LISTING_WIDTH 315px gate into tools/audit.mjs (DS-07, DS-09). Proof: audit thumb check on samples/cover (swept 2026-10-02) |
| Brand-kit consistency | 0% (0/5 rubric: ds-brand-v1 source: sprint/board.md 2026-10-02) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Bar: one tokens file per program, 0 hardcoded colors, 5 checks (vars, pairs, type, spacing, diff). Measured: 0 kits pass; od-brandkit skill ported 2026-10-02, generator unbuilt (DS-10 READY). Rival read: Figma AI brand-ish styles inside Figma Sites on figma.com (read 2026-10-02, proprietary idea-only). Steal next: style-dictionary Apache-2.0 token build plus shadcn-ui/ui MIT CSS-var theming (API read 2026-10-02) into tools/tokens.mjs (DS-02). Proof: `node tools/tokens.mjs --check` (swept 2026-10-02) |
| Hebrew RTL | 0% (0/3 rubric: ds-rtl-v1 source: sprint/board.md 2026-10-02) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Bar: dir rtl sample renders, logical properties only, 3 checks (dir attr, no physical flips, Hebrew type pair). Measured: 0 RTL samples, audit RTL gate unbuilt (DS-16 READY). Rival read: none of the 4 publishes an RTL-correctness bar (their pages read 2026-10-02, UNKNOWN until measured). Steal next: penpot MPL-2.0 idea-only direction-aware flex and grid layout into the audit RTL gate (DS-16). Proof: `node tools/audit.mjs` on a Hebrew sample (swept 2026-10-02) |
| Game UI kits | 0% (0/5 rubric: ds-game-v1 source: sprint/board.md 2026-10-02) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Bar: HUD plus menu plus button kit that imports in forge and engine2040, 5 checks (tokens, states, icons, sizes, import). Measured: 0 kits, lane unbuilt (DS-11 READY). Rival read: v0 and Lovable ship web UI only, no game HUD lane (v0.dev and lovable.dev read 2026-10-02, proprietary idea-only); Canva has generic templates, no engine import. Steal next: lucide ISC icons plus dicebear MIT placeholders plus Kenney.nl CC0 art (factory design/STUDIO.md 2026-09-27) into kits/ (DS-11, DS-20). Proof: kit import plus audit PASS (swept 2026-10-02) |
| Landing-page conversion | 0% (0/4 rubric: ds-conv-v1 source: sprint/board.md 2026-10-02) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Bar: registry block on a live page with a receipt, 4 checks (block reuse, copy, CTA, measure plan). Measured: 0 pages, registry unbuilt (DS-03 READY). Rival read: Lovable prompt-to-app publishing on lovable.dev (read 2026-10-02, proprietary idea-only); Figma Sites publishing on figma.com (read 2026-10-02, proprietary idea-only). Steal next: BuilderIO/mitosis MIT write-once blocks plus od-web-design-guidelines into the registry (DS-03, DS-17). Proof: factory page rebuilt with a publish receipt (swept 2026-10-02) |

## Plans: which plan serves which part of the vision

List the board and every active plan. Serves contains exact Scorecard row names
separated by semicolons, or `every row: reason` / `none: reason`.

| Plan | Serves (Scorecard rows) | Board prefixes and notes |
|---|---|---|
| `sprint/board.md` | every row: the executable work list | each goal needs a next task and proof |

## Research contract

Read the vision, board and prior findings before searching. Each research batch
compares competitor code, an adjacent implementation and an arXiv paper where
relevant. Read the implementation and tests, not only the abstract. Record source
revision, license, baseline, target, existing home, proof command, tradeoff and
stop rule. Unknown remains unknown. Merge duplicates into one experiment; promote
only after local measurement and independent review. No useful new evidence means
resume a pending experiment or record a dated rejection, not another catalog.

## Parts vs the best (research keeps this table true)

One row per part of the product. `Ours` is a measured percent of our bar with
rubric, source and date, or `UNKNOWN (unmeasured)` with the proof command that
would measure it, never a guess. Code is copied only under MIT, Apache-2.0, BSD, zlib or CC0, license read live.

| Part | Ours (UNKNOWN = unmeasured) | Best at it (license) | They beat us on | Steal next | Proof that measures us | Swept |
|---|---|---|---|---|---|---|
| Brief-to-render speed | 50% (1/2 rubric: ds-speed-v1 source: samples/cover/design-audit.json 2026-10-02, re-confirmed via `node tools/check.mjs` RESULT PASS 2026-10-02 render 1280x720 34186B audit 15/15) | v0 (proprietary) | hosted prompt-to-React in one box (https://v0.dev/ read 2026-10-02, idea only) | wandb/openui Apache-2.0 (LICENSE read live 2026-10-02) prompt-render-iterate loop (Prompt.tsx + HtmlAnnotator.tsx) into tools/render.mjs (card research/cards/2026-10-02-brief-render-vision-r1.md, DS-05) | one `node tools/check.mjs` run renders samples/cover plus audit PASS | 2026-10-02 |
| Judged quality | 100% (10/10 rubric: ds-quality-v1 source: samples/cover/DESIGN-REVIEW.md 2026-10-02, re-confirmed via `node tools/judge.mjs --check` JUDGE PASS 2026-10-02) | Figma AI (proprietary) | agent generation plus side-by-side compare plus MCP to production inside the editor (https://www.figma.com/ai/ read 2026-10-02, idea only) | abi/screenshot-to-code MIT (LICENSE SHA bee961c read live 2026-10-02) create-update pipeline (generate_code.py SHA 091874b) + onlook-dev/onlook Apache-2.0 (LICENSE.md SHA 295f5e1 read live 2026-10-02) oid click-to-code (gesture.tsx SHA 38eea91) + storybookjs/storybook MIT (LICENSE SHA c471193 read live 2026-10-02) StoryStore (StoryStore.ts SHA 3f5aeeb) into tools/judge.mjs (card research/cards/2026-10-02-judged-quality-vision-r1.md, DS-04/DS-07) | rubric ds-quality-v1 10 checks via `node tools/judge.mjs --check` (DS-06 built, JUDGE PASS 2026-10-02) | 2026-10-02 |
| Thumbnail readability | 0% (0/4 rubric: ds-thumb-v1 source: sprint/board.md 2026-10-02) | Canva (proprietary) | template plus resize suite for every social and store size (canva.com read 2026-10-02, idea only) | konvajs/konva MIT export plus factory LISTING_WIDTH 315px gate into tools/audit.mjs (DS-07, DS-09) | title legible at 256px via the audit thumb check (DS-07, unbuilt) | 2026-10-02 |
| Brand-kit consistency | 0% (0/5 rubric: ds-brand-v1 source: sprint/board.md 2026-10-02) | shadcn-ui/ui (MIT) | copy-paste components plus CSS-var theming, about 125k stars pushed 2026-10-01 (API read 2026-10-02) | style-dictionary Apache-2.0 token build plus od-brandkit Apache-2.0 brief shape into tools/tokens.mjs (DS-02, DS-10) | 0 hardcoded colors plus token diff via audit (DS-02, unbuilt) | 2026-10-02 |
| Hebrew RTL | 0% (0/3 rubric: ds-rtl-v1 source: sprint/board.md 2026-10-02) | UNKNOWN (no RTL rival read live yet) | UNKNOWN until swept | penpot MPL-2.0 idea-only direction-aware flex and grid layout into the audit RTL gate (DS-16) | `node tools/audit.mjs` RTL gate on a Hebrew sample (DS-16, unbuilt) | 2026-10-02 |
| Game UI kits | 0% (0/5 rubric: ds-game-v1 source: sprint/board.md 2026-10-02) | Kenney.nl (CC0 site, not a repo) | free game art no AI tool bundles (factory design/STUDIO.md 2026-09-27) | lucide ISC icons plus dicebear MIT placeholders plus Kenney CC0 into kits/ (DS-11) | HUD kit imports in forge plus audit PASS (DS-11 and DS-20, unbuilt) | 2026-10-02 |
| Landing-page conversion | 0% (0/4 rubric: ds-conv-v1 source: sprint/board.md 2026-10-02) | Lovable (proprietary) | prompt-to-app publishing in one click (lovable.dev read 2026-10-02, idea only) | BuilderIO/mitosis MIT write-once blocks plus od-web-design-guidelines into registry/ (DS-03) | registry block on a factory page with a publish receipt (DS-17, unbuilt) | 2026-10-02 |

## Open gaps (research closes these; the lead writes the answer above)

- G1 Competitors: who are the 3-5 best at what this vision promises, and what does each do better today? Evidence: their own pages, releases and numbers. Standing answer (2026-10-02, planner): Canva owns templates and resize; Figma AI owns in-editor generation via Make and Sites; v0 owns prompt-to-React; Lovable owns prompt-to-app publishing. Our edge: the loop is built for AI seats with judges and receipts, and game UI plus Hebrew RTL lanes none of the 4 publish a bar for. | sources: https://www.canva.com/ https://www.figma.com/ https://v0.dev/ https://lovable.dev/ (all read 2026-10-02) plus C:/Users/me/Desktop/center/research/DESIGN-REPO-8TH-2026-10-02.md
- G2 The bar: what does "done" measure, in numbers, for each part? Standing answer (2026-10-02, planner): Brief-to-render 2 checks (render plus audit in one run); Judged quality 10 rubric checks plus DESIGN-REVIEW.md, ship at 8; Thumbnail 4 checks at 256px and 315px; Brand-kit 5 checks with 0 hardcoded colors; Hebrew RTL 3 checks on a Hebrew sample; Game UI 5 checks ending in an engine import; Conversion 4 checks ending in a live page receipt.
- G3 The edge: where can we be the best, and why can the others not follow? Standing answer (2026-10-02, planner): four lanes the closed tools do not serve as one loop: judged quality per minute with a fixed rubric, thumbnail-first covers for real stores, Hebrew RTL as a gate not an afterthought, and game UI kits that import into forge and engine2040. They cannot follow without opening their cores to seat-driven judges.

## Steal map (scouts: what we read, oldest first)

At least 10 competitors and 10 adjacent sources, each tied to a part; the steal
researcher reads the row read longest ago and writes its date back. This map is
the initial seed: donor licenses and pushes verified live via api.github.com on
2026-10-02 per C:/Users/me/Desktop/center/research/DESIGN-REPO-8TH-2026-10-02.md;
commercial rows are their public pages read 2026-10-02, proprietary idea-only.

| ID | Kind | Sources | Part | Question | License (read live) | Last read |
|---|---|---|---|---|---|---|
| S01 | competitor | canva.com template and resize suite | Thumbnail readability | Which size matrix covers every store and social slot? | proprietary, idea only (site read 2026-10-02) | 2026-10-02 |
| S02 | competitor | figma.com Figma AI Make plus Sites | Landing-page conversion | Which publish path keeps code and design in sync? | proprietary, idea only (site read 2026-10-02) | 2026-10-02 |
| S03 | competitor | v0.dev prompt-to-React | Brief-to-render speed | Which prompt shape yields shippable blocks first try? | proprietary, idea only (site read 2026-10-02) | 2026-10-02 |
| S04 | competitor | lovable.dev prompt-to-app | Brief-to-render speed | Which one-click publish removes the handoff? | proprietary, idea only (site read 2026-10-02) | 2026-10-02 |
| S05 | competitor | onlook-dev/onlook visual edit to code | Judged quality | Which click-to-edit maps to a code diff? | Apache-2.0 (LICENSE.md read live 2026-10-02) | 2026-10-02 |
| S06 | competitor | Nutlope/llamacoder minimal v0 clone | Brief-to-render speed | Which minimal loop shows the whole builder path? | MIT (API read 2026-10-02) | 2026-10-02 |
| S07 | competitor | abi/screenshot-to-code screenshot loop | Judged quality | Which screenshot diff loop converges fastest? | MIT (API read 2026-10-02) | 2026-10-02 |
| S08 | competitor | wandb/openui prompt to live render | Brief-to-render speed | Which live-render loop fits a judge gate? | Apache-2.0 (API read 2026-10-02) | 2026-10-02 |
| S09 | competitor | penpot/penpot SVG and layout engine | Hebrew RTL | Which direction-aware layout survives RTL? | MPL-2.0 idea only (API read 2026-10-02) | 2026-10-02 |
| S10 | competitor | tldraw/tldraw canvas SDK | Game UI kits | Which shape binding fits HUD editing? | custom, patterns only (API read 2026-10-02) | 2026-10-02 |
| S11 | adjacent | shadcn-ui/ui component pattern | Brand-kit consistency | Which copy-paste registry fits our blocks? | MIT (API read 2026-10-02) | 2026-10-02 |
| S12 | adjacent | style-dictionary/style-dictionary token build | Brand-kit consistency | Which token pipeline feeds CSS and Tailwind? | Apache-2.0 (API read 2026-10-02) | 2026-10-02 |
| S13 | adjacent | konvajs/konva canvas framework | Thumbnail readability | Which scene graph exports store sizes? | MIT (API read 2026-10-02) | 2026-10-02 |
| S14 | adjacent | lucide-icons/lucide icon set | Game UI kits | Which 24px stroke set covers game UI? | ISC (API read 2026-10-02) | 2026-10-02 |
| S15 | adjacent | iconify/iconify universal icon API | Game UI kits | Which picker tracks per-set licenses? | MIT framework, per-set licenses tracked (API read 2026-10-02) | 2026-10-02 |
| S16 | adjacent | excalidraw/excalidraw whiteboard | Judged quality | Which sketch export starts a wireframe? | MIT (API read 2026-10-02) | 2026-10-02 |
| S17 | adjacent | storybookjs/storybook workshop | Judged quality | Which story plus visual-diff pattern fits blocks? | MIT (API read 2026-10-02) | 2026-10-02 |
| S18 | adjacent | fabricjs/fabric.js SVG to canvas | Thumbnail readability | Which SVG import wins for templates? | MIT (API read 2026-10-02) | 2026-10-02 |
| S19 | adjacent | dicebear/dicebear avatar API | Game UI kits | Which style-swappable art fits placeholders? | MIT (API read 2026-10-02) | 2026-10-02 |
| S20 | adjacent | BuilderIO/mitosis component compiler | Landing-page conversion | Which write-once output serves every consumer? | MIT (API read 2026-10-02) | 2026-10-02 |

Card (every steal): Source (repo@sha `path:line` or URL) and license | What it
does | Home (an existing file here; no home = reject) | Fixes (the part) | Net
lines | Proof (no proof = reject) | Effort S/M/L and risk. The research merge
seat judges every card and keeps the rejects.

## Delivery evidence

Current position (2026-10-02): rung 0 of 4 across the consumers (factory,
marketing-studio, jobhunt, forge and engine2040): 0 judged designs shipped, 0
consumer receipts, $0. Prove each rung the same way every time: R1 one judged
sample per consumer with `node tools/check.mjs` RESULT PASS; R2 every sample
opened at full size and thumbnail with notes in its DESIGN-REVIEW.md; R3 a
consumer reuse (a factory cover, a marketing creative, a portfolio page, a HUD
slice) with a dated receipt; R4 a repeat commission from the same consumer.

The 10x product bar the loop holds before it calls anything shipped: a stranger
finishes the brief-to-render path in 15 minutes (stranger-15min); the result is
compared side by side with the named reference (eyes-vs-reference); the maker
used it for a real consumer job first (dogfood); price and bundle evidence comes
from sellers' own pages, never a search snippet; every moving thing ships with a
GIF-first preview; a free Vol 0 magnet proves the checkout before any paid
claim; a bundle ships only after 3 volumes (bundle after 3); UNKNOWN views =
FAIL, never a soft pass; PREP-ONLY is not shipped: drafts and renders without a
live consumer link and a receipt prove nothing about buyers.

Per-item proofs: stranger-15min and eyes-vs-reference by the judge's timed
side-by-side review in the sprint output; dogfood by the first consumer reuse
receipt; price and bundle evidence from sellers' own pages with a dated source
line; GIF-first by the preview file in its commit; Vol 0 by a live download
receipt; bundle after 3 by three live volume links; UNKNOWN views = FAIL by the
consumer receipt check; PREP-ONLY by the absence of a live link and a receipt.
