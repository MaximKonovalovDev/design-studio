---
role: judge
title: review fix O-043 adopted status in orders.csv
chain: review
of: 133-o043-adopted-status-fix
writer: builder
attempt: 1
origin_title: fix O-043 adopted status in orders.csv
---
Review 133-o043-adopted-status-fix, built by builder. Its record: C:\Users\me\Desktop\design-studio\sprint\queue\done\133-o043-adopted-status-fix.md. Its result, cut, is at the end.

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
<task id="ses_eedc22082ffeMvmorVQj9G4RFf" state="completed"> <task_result> O-043 corrected to delivered; ORDERS back to PASS. - Goal: O-043 row true to disk + factory reality — done, delivered branch. - Scope: `orders.csv` O-043 row only (working tree, uncommitted); factory read-only; O-045/O-046 untouched. - Step 1: `node tools/orders-check.mjs --built O-043` → `BUILT PASS: O-043 (16/16 checks)`. - Step 2: factory `log -- <covers path>` = `f41b4dff` (delivery, 15 text files, no PNGs); `log -- <listing>` newest = `70a0b0e4`, whose diff repoints Images 1–2 at `covers/from-design-studio/O-043/out.png` + `out-630x500.png` — pointer present. - Step 3, delivered branch: `git log --all` for those two PNG paths is empty (no factory commit ever carried the bytes the listing names); factory `.gitignore:51` (`products/**/*.png`) ignores them; working-tree copies are byte-identical (SHA256 BED2…/D501… match `designs/O-043/`) but uncommitted → fails AGENTS.md adopted (committed identical bytes AND listing pointer). Kept `status delivered` + `delivered_path` (f41b4dff proves landing), set `adopted no`, cleared `adopted_commit`. - Proof: `node tools/orders-check.mjs` → `ORDERS PASS: 66 orders (0 open, 0 building, 32 delivered, 34 adopted, 0 rejected)`; `git diff -- orders.csv` shows O-043 row only. - Next step: factory must commit byte-identical cover PNGs (currently gitignored) and keep the listing pointer before any re-claim of adopted. RESULT: DONE - O-043 delivered | proof: node tools/orders-check.mjs ORDERS PASS: 66 orders (0 open, 0 building, 32 delivered, 34 adopted, 0 rejected) </task_result> </task>

Keeper facts: run 133-o043-adopted-status-fix (@builder), fix O-043 adopted status in orders.csv.
RESULT: DONE - O-043 delivered | proof: node tools/orders-check.mjs ORDERS PASS: 66 orders (0 open, 0 building, 32 delivered, 34 adopted, 0 rejected)
