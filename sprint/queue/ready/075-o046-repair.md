---
role: builder
title: repair O-046 FACTS invented numbers
chain: start
---

The judge failed O-046. Verdict FAIL (chain review 074, round 168): BEATS yes (17.2px vs ~10px), PICTURE yes, FIT yes, LANE yes; FACTS NO — "12 months / 40 charts / 0 logins" plus "budget-pilot.app" chrome are not in the listing. Full verdict in `designs/O-046/VERDICT.md`.

Goal: fix exactly what the verdict names — every number, claim and chrome pixel must come from the listing, nothing invented.

Scope (owned paths, working tree only, never commit): `designs/O-046/` (page/art/tokens/assets as needed; never touch VERDICT.md). Read-only: `C:/Users/me/Desktop/autonomous-factory/products/services/forge-engine2040-launch-system/listing/gumroad.md` (the ONLY facts source). Lane recipe: `sprint/queue/standing/maker-store.md`.

Steps:

1. Read the listing file end to end. List every number/claim it actually makes; list every cover element (headline, chips, badges, window chrome, fine print) NOT traceable to it — at minimum the "12 months / 40 charts / 0 logins" lines and the "budget-pilot.app" chrome.
2. Replace each invented element with a listing-true one (real product name, real claim, real screenshot already in assets/, or honest empty space). No new invented numbers to fill gaps.
3. Re-render both sizes + thumb through the lane recipe (`node tools/cover.mjs all O-046` or the render path the folder used), re-run `node tools/audit.mjs designs/O-046/brief.json` (AUDIT PASS) and `node tools/judge.mjs designs/O-046/brief.json` (SHIP 8+), re-open out.png at full size and at 256px.
4. Proof: `node tools/orders-check.mjs --built O-046` prints BUILT PASS, plus the before/after fact list (removed X, sourced Y from listing line Z).

Stop (M 30 min). One repair only: FACTS lines, nothing else.

Card, first lines: Goal (O-046 FACTS true), Scope (designs/O-046, listing read-only), Proof (--built line + fact list), Stop.

End: `RESULT: DONE - O-046 FACTS repaired, <n> invented items replaced | proof: node tools/orders-check.mjs --built O-046`
