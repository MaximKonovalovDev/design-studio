---
role: judge
title: review store maker (factory covers, product pages, free-tool pages) #1
chain: review
of: maker-store-r1
writer: builder
attempt: 1
origin_title: store maker (factory covers, product pages, free-tool pages) #1
---
Review maker-store-r1, built by builder. Its record: C:\Users\me\Desktop\design-studio\sprint\queue\done\maker-store-r1.md. Its result, cut, is at the end.

A. A design folder (the result names an order id like `O-007` and `designs/<order>/` exists): you judge ours against the customer's own current asset. You build nothing, you judge that one folder, and the verdict is written by a command, never by hand. If `node tools/orders-check.mjs --built` or `--verdict` is not there yet (the tool sprint's packet 0b), end `VERDICT: BLOCKED - tool 0b not landed`.
1. `node tools/orders-check.mjs --built <order>`: the folder is complete (every file `AGENTS.md` "Orders and delivery" lists, both sizes at exact pixels, audit PASS, SHIP at 8 or more, every real image it uses listed in `assets.json`). It prints a FAIL: write the verdict FAIL with that first failing line and stop.
2. Open the pictures yourself with the Read tool (an unopened PNG is unverified): `out.png`, the second size, `thumb-256.png`, and the customer's current asset the brief names (the store cover to beat; a lane with none: the lane's newest PASS in `designs/`). Then `node tools/compose.mjs compare <ours> <theirs> --widths 256,315 --out designs/<order>/compare.png` and open `compare.png`. Until that tool lands (tool sprint, first 24 h) put the two files side by side by eye at 256 px wide.
3. Judge only these five, each with a number or a plain yes or no:
   - BEATS: at 256 px wide is our headline larger or clearer than the customer's current asset? Write both heights in px (ours from `design-audit.json`; theirs "about", from your eyes on `compare.png`). Not better: FAIL, unless there is no current asset.
   - PICTURE: it shows a real picture of the product (a screenshot, sheet, page or scene from the product's own files) when the product has any (`assets.json`). Text and boxes only where pictures exist: FAIL.
   - FACTS: every number and claim is in the listing file the brief names; every word the brief forbids (engine names, scores, personal data) is absent. One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut at an edge, nothing under 12 px at 256 px wide.
   - LANE: cv = real text in the PDF text layer and Hebrew reads right to left; game = the files the engine loads exist, not only HTML; lab = no real brand name, logo or exact brand colour; social = the headline in the brief appears word for word; store = the cover to beat is named in `DELIVERY.md` and delivery goes to `covers/from-design-studio/`.
4. Write the verdict: `node tools/orders-check.mjs --verdict <order> PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. It writes `designs/<order>/VERDICT.md`, and refuses a PASS unless `--built` passes. Partly is FAIL. Never edit a design file.
Reply (15 lines at most): `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder).

B. Anything else (a tool, a pack, a doc, a seat file): rerun its proof yourself, read its diff and check its done-when as written. Your whole reply is at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, the checks before and after (commands and numbers), and how to revert it.

Its result, cut:
<task id="ses_ef1cc84ddffe0D86XolMKRIC6z" state="completed"> <task_result> Goal: O-043 (Gumroad cover for AEO GEO Audit kit) to beat factory `preview/cover-1280x720.png` (dark-navy, stale $29 badge). Scope: `designs/O-043/`, `knowledge/lane-store.md`, `sprint/needs.md` (no row needed — every tool landed). Proof: `BUILT PASS: O-043 (16/16 checks)`; audit PASS, judge SHIP 10/10, title 17.6px vs theirs ~7px at 256px; desk now build 18 / deliver 1. Stop: L 45 min, well inside; next step is the keeper's judge via `chain/review.md` (never my own). What landed: light `clean-professional` app-window cover — product name at 88px, claim "150 dated probes plus 20-point fix plan plus 3 worked reports", 3 chips, correct `$19 one-time` badge (theirs shows $29), honest SEARCH-PROXY fine print, one real product picture (`shot-report.png`, the HubSpot sample audit) as the window with 150/20/3 stickers, Inter embedded via `cover.mjs fonts`, `brief.json` carries `assets` + `system`, `DELIVERY.md` points at `covers/from-design-studio/`, compare.png shows ours clearly more legible at 256px and 315px. No customer file touched, no second Blender run, no keys printed. RESULT: DONE - O-043 built, 1 real picture, ours 17.6px vs theirs ~7px at 256 | proof: node tools/orders-check.mjs --built O-043 → BUILT PASS: O-043 (16/16 checks) </task_result> </task>

Keeper facts: run maker-store-r1 (seat maker-store, @builder), store maker (factory covers, product pages, free-tool pages) #1.
RESULT: DONE - O-043 built, 1 real picture, ours 17.6px vs theirs ~7px at 256 | proof: node tools/orders-check.mjs --built O-043 → BUILT PASS: O-043 (16/16 checks)
