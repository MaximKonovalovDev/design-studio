---
role: judge
title: review verify O-060 O-061 O-065 factory adoptions in orders.csv
chain: review
of: 134-o060-o061-o065-adopted-verify
writer: builder
attempt: 1
origin_title: verify O-060 O-061 O-065 factory adoptions in orders.csv
---
Review 134-o060-o061-o065-adopted-verify, built by builder. Its record: C:\Users\me\Desktop\design-studio\sprint\queue\done\134-o060-o061-o065-adopted-verify.md. Its result, cut, is at the end.

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
<task id="ses_eedba85eaffeJw1GhgOCpWfMn2" state="completed"> <task_result> Adoption-verify done — all three named factory commits check out under AGENTS.md adopted rule (committed identical bytes + listing pointer at the from-design-studio files): - **O-060** (fall-65-prop-pack): PNGs tracked in factory (`git ls-files` lists out.png + out-630x500.png), sha256 identical to `designs/O-060/` for both sizes, and `HEAD:` committed blob hashes match too (not just working tree). Listing pointer carried by 543ca7d8's diff (preview slot → `covers/from-design-studio/O-060/out-630x500.png`, banner slot → `out.png`). → **adopted, 543ca7d8**. - **O-061** (freelancer-launch-kit-vol1): bytes committed under 543ca7d8, identical sha256 both sizes, pointer committed later by 192e6ce0's diff (images slot → `covers/from-design-studio/O-061/...`). → **adopted, 192e6ce0**. - **O-065** (ui-kit-vol1): bytes committed under cde38818, identical sha256 both sizes, pointer committed by b6ebb8fb's diff (adoption note naming both files + committing hash cde38818). → **adopted, b6ebb8fb**. - O-043 untouched (still delivered/no); delivered_path values all proved correct, left as-is. No tool edits, no customer edits, no commit (working tree only). Proof: - `node tools/orders-check.mjs` → ORDERS PASS: 66 orders (0 open, 0 building, 29 delivered, 37 adopted, 0 rejected) - `node tools/orders-check.mjs --covers` → COVERS OPEN: 26 of 64 live factory listings have an adopted design-studio cover; 17 of the missing ones have an order (O-015 delivered, O-043 delivered, O-044 delivered, O-047 delivered, O-048 delivered) - `git diff -- orders.csv` → exactly the 3 rows above (delivered/no/empty → adopted/yes/hash). RESULT: DONE - O-060 adopted 543ca7d8, O-061 adopted 192e6ce0, O-065 adopted b6ebb8fb | proof: node tools/orders-check.mjs ORDERS PASS: 66 orders (0 open, 0 building, 29 delivered, 37 adopted, 0 rejected), COVERS OPEN: 26 of 64 live factory listings have an adopted design-studio cover </task_result> </task>

Keeper facts: run 134-o060-o061-o065-adopted-verify (@builder), verify O-060 O-061 O-065 factory adoptions in orders.csv.
RESULT: DONE - O-060 adopted 543ca7d8, O-061 adopted 192e6ce0, O-065 adopted b6ebb8fb | proof: node tools/orders-check.mjs ORDERS PASS: 66 orders (0 open, 0 building, 29 delivered, 37 adopted, 0 rejected), COVERS OPEN: 26 of 64 live factory listings have an adopted design-studio cover
