---
role: judge
title: chain review O-049 mileage-kit cover
chain: review
of: 085-bld-o049-store
writer: builder
attempt: 1
origin_title: build O-049 mileage-kit Gumroad cover
---

Review 085-bld-o049-store, built by builder. Its record: `designs/O-049/` (new folder, BUILT PASS 16/16; never judged). Its result, cut, is at the end.

A design folder: judge ours against the customer's own current asset. Build nothing, judge that one folder, verdict by command, never by hand.

1. `node tools/orders-check.mjs --built O-049` must print BUILT PASS. FAIL: verdict FAIL with that first failing line, stop.
2. Open with the Read tool (unopened PNG unverified): `designs/O-049/out.png`, `designs/O-049/out-630x500.png`, `designs/O-049/thumb-256.png`, and the cover to beat `C:/Users/me/Desktop/autonomous-factory/products/seasonal-tax/mileage-kit/preview/cover-gumroad.png`. Then `node tools/compose.mjs compare designs/O-049/out.png <that cover> --widths 256,315 --out designs/O-049/compare.png` and open `designs/O-049/compare.png`.
3. Judge only these five, each with a number or plain yes/no:
   - BEATS: at 256px wide is our headline larger/clearer? Both heights in px (ours from design-audit.json; theirs about, from compare.png). Not better: FAIL, unless no current asset.
   - PICTURE: real picture of the product from its own files when any exist (assets.json). Text/boxes only where pictures exist: FAIL.
   - FACTS: every number/claim in `C:/Users/me/Desktop/autonomous-factory/products/seasonal-tax/mileage-kit/listing/gumroad.md` (watch: $19 one-time; no engine names on the cover). One invented fact: FAIL.
   - FIT: both sizes whole, nothing cut, nothing under 12px at 256px wide.
   - LANE (store): cover to beat named in DELIVERY.md, landing is the FULL product path `products/seasonal-tax/mileage-kit/covers/from-design-studio/O-049/`.
4. `node tools/orders-check.mjs --verdict O-049 PASS|FAIL --line "BEATS ...; PICTURE ...; FACTS ...; FIT ...; LANE ..."`. Refuses PASS unless --built passes. Partly is FAIL. Never edit a design file.

Reply, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, the five lines, and how to revert (the one folder). A FAIL gets one repair run from the chain (not from you).

Its result, cut: DONE - O-049 built, 3 real pictures, ours 20.8px vs theirs 7.8px at 256 | proof: node tools/orders-check.mjs --built O-049 -> BUILT PASS: O-049 (16/16 checks). Fact sources: title/kicker + IRS-ready claim + 50 PDFs + 50 trips + $19 + US Letter + not-tax-advice line, all gumroad.md; no engine names.

End: `RESULT: DONE - O-049 judged <PASS|FAIL> | proof: node tools/orders-check.mjs --verdict O-049 <...>`
