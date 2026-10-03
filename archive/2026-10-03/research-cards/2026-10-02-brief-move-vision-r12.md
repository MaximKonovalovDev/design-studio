# Steal card: Brief-to-render speed MOVE 50% -> 100% — extended render loop judged green (researcher vision-r12, 2026-10-02)

Goal: Re-sweep Brief-to-render speed for a MOVE. Round-11 hold reason (DS-05 block loop + DS-21 refine/preview + DS-30 stream built DOING awaiting judge reviews 026/027) is gone: board records 026/027 PASS in commit 4512bec/dbeb292, DS-05/DS-21/DS-30 DONE. Measure what the extended loop now does that the round-3 baseline did not, run the proofs, and move Parts + Scorecard above 50% with measured numbers.

Scope: `VISION.md` Brief-to-render speed Part + Scorecard row + this one card. Stop: L 45 min (claim + 4 proof runs + 2 test suites + this card + VISION edit; no builder work, no new donor fetch per one-deep-packet budget).

Source and license:
- v0 (proprietary, idea only): prompt-to-app agent, one-click Vercel deploy + auto-fix, https://v0.app/docs.md (lastUpdated 2026-10-01, read live 2026-10-02 per r11 carry). No code copied.
- Lovable (proprietary, idea only): Publish-button to live lovable.app URL + Quick scan, https://docs.lovable.dev/features/publish (read live 2026-10-02 per r11 carry). No code copied.
- Riser Elementor (proprietary, idea only): AI prompt full pages matched to site design system, 22M+ sites, https://elementor.com/ (read live 2026-10-02 per r11 carry). No code copied.
- Prior donors carried, SHAs verified at r2/r11, NOT re-fetched this run per one-deep-packet budget (no GitHub calls, no 429): wandb/openui Apache-2.0 (LICENSE SHA 28a356d, Prompt.tsx SHA c6d97eb + HtmlAnnotator.tsx SHA aa279c9) + Nutlope/llamacoder MIT (LICENSE SHA 9882e62, code-runner-react.tsx SHA cc357bb) + abi/screenshot-to-code MIT (LICENSE SHA bee961c, App.tsx SHA 1cbab73 + generate_code.py SHA 091874b). No GPL/AGPL touched; all ported code already landed round 10 as pattern-only, 0 new lines this card.

What it does: Round-3 baseline was one-shot Edge headless screenshot (cover 1280x720 34186B) + audit PASS, no refine, no preview timing, no stream, no block loop. The extended loop (built round 10, judged green round 11) adds four measured behaviors: (1) refine wrapper `refineHtml` create|update split with FIX-comment-wins prompt (`buildRefinePrompt`); (2) measured preview `measurePreview` logging `bundleMs` + `data-preview-*` badge + 60s watchdog (`PREVIEW_WATCHDOG_MS`); (3) 3-chunk stream `streamPreview` progressive states with pop-last-line guard so half-written tags never flash; (4) block-loop convergence `runBlockLoop` seed-shell FAILs (5/10) then full-block SHIPs (10/10) in 2 iters with `iterations.json` receipt + `DESIGN-REVIEW.md`. Hosted one-box (v0/Lovable deploy) and design-system-matched prompt (Elementor) remain their edge; our edge is the file-based judged loop with receipts.

Home (existing file here; no home = reject): `tools/render.mjs` (DS-21 lines 79-142 + DS-30 lines 90-113 + self-check 143-178) + `tools/agent-block.mjs` (DS-05 `runBlockLoop` lines 291-383 + `selfCheck` 15 checks). Both exist on disk; no new home needed.

Fixes (the part): Brief-to-render speed (VISION.md Parts row + Scorecard row), 50% (1/2 ds-speed-v1) -> 100% (2/2 ds-speed-v1).

Net lines: 0 this card (measurement only; ~100 in tools/render.mjs for DS-21+DS-30 + ~500 in tools/agent-block.mjs for DS-05 landed round 10 under 4512bec, 0 new deps).

Proof (no proof = reject, all re-run live 2026-10-02T13:41Z this run):
- `node tools/render.mjs --check` -> `RENDER PASS: refine + measured preview + 3-chunk stream green` (7/7: preview badge bundleMs=1 bytes=37, empty-HTML FAILs closed, FIX-comment update prompt, query-less FAILs closed, 3-chunk progressive 0>6>23, 1-chunk gate, create path).
- `node tools/agent-block.mjs --check` -> `AGENT-BLOCK PASS: ds-agent-block-v1 brief-in block-out, judge ds-quality-v1 floor 8, fail-closed` (15/15: default 10/10, auditBrief PASS, gate SHIP, broken 5/10 + REWORK refusal, loop 2 iters 0:5 best:10, iterations.json + DESIGN-REVIEW.md, converged true, RTL 10/10).
- `node --test tests/agent-block.test.mjs` -> pass 7 fail 0; `node --test tests/render.test.mjs` -> pass 3 fail 0.
- `node tools/check.mjs` -> `RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits` (cover 1280x720 34186B + thumb 256x144 5567B, ad-square 1080x1080 50846B + thumb 9164B, story 1080x1920 69685B, hebrew-hero 1280x720 28125B, jobhunt 1280x720 35014B, cv 900x1270 98813B; winner cover-b 22.8px over cover 19.2px). Source artifact `samples/cover/design-audit.json` (`pass: true`, all gates green, 2026-10-02).
- `node tools/judge.mjs --check` -> `JUDGE PASS: rubric ds-quality-v1 10 checks, floor 8, samples/cover ships` (harness untouched, green).
- Judge reviews 026/027 PASS landed 4512bec/dbeb292 per board (DS-05 DONE 15/15 tests 7/7 judge 026; DS-21/DS-30 DONE RENDER PASS 7/7 judge 027).
- DS-25/DS-26 brief-shape (hints + snapshot) stay DOING with judge reviews 029/030 queued round 12 as beyond-bar enhancements (same pattern as Brand-kit 100% with DS-33 DOING); they do not gate ds-speed-v1 2/2.

Effort and risk: S (measurement only). Risk low — file-based brief.json contract kept, judge floor 8 gates every iterate, streaming states reuse existing render path, fail-closed fixtures prove no silent pass. Avoid: copying OpenUI Tailwind/theme, LlamaCoder keys/prompts, screenshot-to-code model keys; avoid GPL/AGPL (none here); never fake pixels (synthetic placeholder is labelled, never a screenshot).
