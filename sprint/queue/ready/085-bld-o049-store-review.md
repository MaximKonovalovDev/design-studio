---
role: judge
title: review build O-049 mileage-kit Gumroad cover
chain: review
of: 085-bld-o049-store
writer: builder
attempt: 1
origin_title: build O-049 mileage-kit Gumroad cover
---
Review 085-bld-o049-store, built by builder. Its record: C:\Users\me\Desktop\design-studio\sprint\queue\done\085-bld-o049-store.md. Its result, cut, is at the end.

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
<task id="ses_eeee1488fffe0EghhUbReAK7tf" state="completed"> <task_result> Card: Goal O-049 cover:gumroad/mileage-kit to beat `preview/cover-gumroad.png` | Scope `designs/O-049/`, lane note, needs (none needed) | Proof BUILT PASS 16/16, ours 20.8px vs theirs ~7.8px at 256 | Stop L45min, one order, no commit. Done — judged-ready `designs/O-049/` built end to end: - Skills loaded first: `open-design`, `od-design-brief`, `od-poster-hero`; system `clean`/`professional` → palette clean-professional; template-first `covers/sheet-fan`. - Fact sources (all gumroad.md, no invention): title/kicker from Title + short desc; claim "IRS-ready mileage log for every US state" (Description ¶1); chips "50 fillable PDFs" + "50 trip entries + YEAR TOTALS" + "Type or print — $19" (Proof ¶, Price $19); badge "$19 one-time"; stamp 50/states; tag "US Letter – fills in under 5 min" (US Letter 8.5×11, under-5-min); fine "Record-keeping aid. Not tax advice." (line 27); zero engine names. - 3 real product pictures (assets.json with sha sources): `screenshot-log.png`, `screenshot-summary.png`, `cover-etsy.png` — all three are gumroad.md Images 1–4. - Landing full-path from the start: `cover.json` landing + `DELIVERY.md` line 1 both read `products/seasonal-tax/mileage-kit/covers/from-design-studio/O-049/`. - Gates: audit PASS (22 green + 1 SKIP), judge SHIP 10/10, `compare.png` at 256/315 opened by eye — ours reads clearly bigger, theirs ~7.8px title at 256 (below 12px floor) vs ours 20.8px (wide) / 23.6px (card). - Lane note added to `knowledge/lane-store.md` (14 words, file <1KB); no `needs.md` row — nothing was missing. Desk re-run: build 11 (O-049 counted built). Touched only Scope paths, never committed, no customer file touched. Next step: keeper sends the judge via `chain/review.md`; delivery seat puts the folder into factory. RESULT: DONE - O-049 built, 3 real pictures, ours 20.8px vs theirs 7.8px at 256 | proof: node tools/orders-check.mjs --built O-049 → BUILT PASS: O-049 (16/16 checks) </task_result> </task>

Keeper facts: run 085-bld-o049-store (@builder), build O-049 mileage-kit Gumroad cover.
- Lane note added to `knowledge/lane-store.md` (14 words, file <1KB); no `needs.md` row — nothing was missing. Desk re-run: build 11 (O-049 counted built). Touched only Scope paths, never committed, no customer file touched.
RESULT: DONE - O-049 built, 3 real pictures, ours 20.8px vs theirs 7.8px at 256 | proof: node tools/orders-check.mjs --built O-049 → BUILT PASS: O-049 (16/16 checks)
