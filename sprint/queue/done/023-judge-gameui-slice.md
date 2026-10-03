---
role: judge
title: judge DS-20 serve plus DS-32 gap linter
---

Goal: independent verdict on the round-9 game-UI slice: DS-20 serve-forge gate (already green since DS-11, re-verified) and DS-32 equal-gap HUD linter (gapEqual plus-minus 1px, 5 new gap checks, hud data-gap wiring).

Scope: read-only. `tools/game-ui.mjs`, `kits/game-ui/hud.html`, plus the round-9 builder record.

Proof: rerun `node tools/game-ui.mjs --check` (expect gap 5/5), `node tools/game-ui.mjs --serve --check` (serve 4/4), and `node tools/check.mjs` yourself; verify the gap fixture FAILs without the fix logic (or confirm fail-closed on bad gaps); confirm Kenney CC0 plus Lucide ISC provenance, no unlicensed art.

Stop: reply only, at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, checks before and after (commands and numbers), how to revert. End with `RESULT: DONE - judged game-ui slice <VERDICT> | proof: <commands plus numbers>`.


## Result (completed)

<task id="ses_efe64290bffem0699eJKfFh7Zh" state="completed">
<task_result>
VERDICT: PASS
Changed (901625c round-9): tools/game-ui.mjs +26 gapEqual(tol 1)+5 gap checks; hud.html +data-gap="6" wiring; DS-20 serve gate untouched green.
Before: no gapEqual/gap section, .bars without data-gap; After: gap 5/5 + serve 4/4, fail-closed confirmed.
I reran: node tools/game-ui.mjs --check => GAME-UI PASS gap 5/5 exit 0
I reran: node tools/game-ui.mjs --serve --check => GAME-UI PASS +serve 4/4 exit 0
I reran: node tools/check.mjs => RESULT PASS 20/0/0 +6 samples PASS exit 0 (cover render ETIMEDOUT once, thumb/audit PASS)
Provenance: manifest Lucide ISC + Kenney CC0, CSS-shape only, 0 binaries; fail-closed: gapEqual(6,7)=true, (6,8)=false OK.
Scope: owned tools/game-ui.mjs + kits/game-ui/hud.html only, no drift/secrets/weakened gates.
Revert: git revert 901625c --no-edit (or checkout 901625c^ -- tools/game-ui.mjs kits/game-ui/hud.html)
RESULT: DONE - judged game-ui slice PASS | proof: game-ui --check 5/5 PASS, --serve --check 4/4 PASS, check.mjs 20/0/0 PASS, gapEqual 6v8 FAIL-closed OK

</task_result>
</task>
