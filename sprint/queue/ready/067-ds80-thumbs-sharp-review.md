---
role: judge
title: review build DS-80 thumbs without Edge (sharp Apache-2.0)
chain: review
of: 067-ds80-thumbs-sharp
writer: builder
attempt: 1
origin_title: build DS-80 thumbs without Edge (sharp Apache-2.0)
---
Review 067-ds80-thumbs-sharp, built by builder. Its record: C:\Users\me\Desktop\design-studio\sprint\queue\done\067-ds80-thumbs-sharp.md. Its result, cut, is at the end.

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
<task id="ses_ef368a201ffeZu939iRBO1xUqK" state="completed"> <task_result> Goal (DS-80 Edge-free thumbs), Scope (`tools/thumb.mjs`, `tools/sharp.mjs`, `tests/thumb-sharp.test.mjs`, `designs/job/thumbs/`), Proof (`THUMB PASS: 256px math + sharp downscale green (Edge fallback kept)`), Stop (thumbs only, no token/gate changes, uncommitted). What landed: - `tools/sharp.mjs` (new): `sharpThumb()` downscales an existing `out.png` to 256px wide, aspect kept, 1024B blank-floor kept; fail-closed (missing/non-PNG source or sub-floor result throws and leaves no file). Header carries the Apache-2.0 attribution; sharp 0.35.5 pinned exact in `package.json` + lock, installed in-repo only. - `tools/thumb.mjs` (extended): new async `thumbAuto()` prefers sharp when `out.png` sits next to the brief, Edge iframe path otherwise; `--sharp` forces it, `--edge` forces the browser, both together rejected. Sync `thumbBrief()` kept as the Edge path so `cover.mjs`/`template.mjs` consumers are untouched; `--check` now also proves sharp load + real downscale + fail-closed, no browser. - `tests/thumb-sharp.test.mjs` (new, 12 tests): pin + LICENSE vendored, downscale, fail-closed ×2, routing ×5, sharp-vs-Edge parity (same 256x144 dims, mean diff assertion). - `designs/job/thumbs/`: `thumb-256.png` (sharp, 256x144, 39916B, zero browser) + `COMPARE.md` (vs Edge `designs/O-001/thumb-256.png` 22142B: identical dims, mean abs diff 3.11/255, same title-legible verdict) + `SHARP-LICENSE.txt`. Proofs, all green: `node tools/thumb.mjs --check` → THUMB PASS (8/8); `node --test tests/thumb-sharp.test.mjs tests/thumb.test.mjs` → 14 pass 0 fail; consumers `cover/template/render` → 32 pass 0 fail; `node tools/orders-check.mjs` → ORDERS PASS (42 orders); `node sprint/check.mjs` → RESULT PASS (21 pass, 0 fail). Nothing committed (helper rule); working tree touches only the packet paths plus the required sharp pin. Next step: keeper sends the judge (`sprint/queue/chain/review.md`). RESULT: DONE - DS-80 thumbs Edge-free via pinned in-repo sharp, Edge kept as fallback | proof: THUMB PASS: 256px math + sharp downscale green (Edge fallback kept) </task_result> </task>

Keeper facts: run 067-ds80-thumbs-sharp (@builder), build DS-80 thumbs without Edge (sharp Apache-2.0).
RESULT: DONE - DS-80 thumbs Edge-free via pinned in-repo sharp, Edge kept as fallback | proof: THUMB PASS: 256px math + sharp downscale green (Edge fallback kept)
