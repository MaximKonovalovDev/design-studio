---
role: builder
title: privacy guard gmail branch respects forbid
---

Goal: `node sprint/check.mjs` to RESULT PASS (now FAIL 20/2) by making the gmail branch of the privacy guard consult `.opencode/forbid.json` exactly like the <redacted> branch already does. The 2 remaining flags are the guard's own detection regex (`/\bgmail\.com\b/` in `sprint/check.mjs`) and its test fixture (`sprint/check.test.mjs`): meta-matches, no real address anywhere (forbid.json by the prior packet already allowlists the <redacted> meta-contexts; gmail entries for the 2 meta-lines are already there waiting).

Scope (owned paths, working tree only, never commit): `sprint/check.mjs` (gmail branch only: line-level forbid check mirroring lines 154-158; no other behavior change), `.opencode/forbid.json` (only if an entry needs adjusting for the new branch). Never touch `designs/`, `orders.csv`, `sprint/check.test.mjs` expectations (they must still pass: detection of REAL gmail addresses in fixtures must keep working — add a positive fixture assertion if missing), never add a dependency.

Proof: `node sprint/check.mjs` prints RESULT PASS with 0 fail; `node sprint/check.test.mjs` (or its test command) still green; `node tools/orders-check.mjs` ORDERS PASS.

Stop (S 15 min). Minimal diff or BLOCKED with the exact line that stops you.
