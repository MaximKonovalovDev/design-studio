---
role: judge
title: review DS-80 token floor (tool, open-props MIT)
---

Review DS-80 first packet, built by builder (chain: start). Its result: `RESULT: DONE - DS-80 token floor | proof: node tools/tokens.mjs --check → TOKENS PASS`.

Case B (a tool, not a designs/ folder): rerun its proof yourself, read its diff, check its done-when. Whole reply at most 15 lines.

1. License gate first: open-props MIT reuse requires attribution — verify the MIT text sits with `tools/tokens.mjs` and the donor (`argyleink/open-props`) + pinned SHA are noted; whole-repo clone or missing attribution: FAIL. style-dictionary must be untouched (later slice).
2. Rerun yourself: `node tools/tokens.mjs --check`, `node --test tests/tokens.test.mjs`, plus recompile `brand-kits/engine2040-ui1.json` via the `build` step and open `designs/job/tokens/swatch.png` with the Read tool (unopened PNG is unverified). Fail-closed: bad clamp inputs + unknown slot must fail, never a false PASS.
3. Read the diff: appended floor only, existing sample gates untouched and still green; compiled CSS carries every kit value; `designs/job/history/render-history.jsonl` append is the tool's own history gate, nothing else.
4. Done-when (token slice only): floor + compiler + proof render exist, --check green, tests green, `node tools/orders-check.mjs` ORDERS PASS + `node sprint/check.mjs` RESULT PASS (rerun both).
5. Verdict line + how to revert (paths: `tools/tokens.mjs`, `tests/tokens.test.mjs`, `designs/job/tokens/`). Never edit a built file.

Reply (15 lines at most): `VERDICT: PASS|FAIL|BLOCKED`, what changed, the checks before and after (commands and numbers), and how to revert it.

Stop (M 15 min).
