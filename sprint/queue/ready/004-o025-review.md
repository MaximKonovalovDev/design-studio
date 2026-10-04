---
role: judge
title: review O-025 Fleet Vol 1 store art
---

Review O-025, built by builder (store lane). Its result: RESULT: PARTIAL - O-025 built, 0 real pictures, ours 19.2px vs no cover at 256 | proof: node tools/cover.mjs build O-025.

A design folder: judge designs/O-025/ against the customer skillworks' current asset (none: pack not live, no cover to beat; use the lane's newest PASS only if one exists). You build nothing. Verdict by command, never by hand.
1. `node tools/orders-check.mjs --built O-025` if landed, else verify the folder by hand: every AGENTS.md Orders file present, both sizes exact pixels, audit PASS, SHIP 8+.
2. Open with Read: out.png, out-630x500.png, thumb-256.png. No customer asset exists: note it, skip compare.
3. Five checks: BEATS (no current asset: PASS by exception if title >= 12px at 256); PICTURE (listing says screenshots needed-not-made: CSS-only honest PASS, fail only if it fakes screenshots); FACTS (every command/claim in skillworks packs/fleet-vol-1/listing.md; no invented numbers); FIT (whole at both sizes, nothing under 12px at 256); LANE store (DELIVERY.md names landing spot + skillworks proof command).
4. `node tools/orders-check.mjs --verdict O-025 PASS|FAIL --line "..."`; never edit a design file.
Reply 15 lines max: VERDICT line, five lines, revert (the one folder).
