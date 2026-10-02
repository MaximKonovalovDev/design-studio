# Game UI kits sweep — vision-r13 (2026-10-02)

Goal: Sweep the Game UI kits part (DS-11 kit GAME-UI PASS, DS-20 serve-forge gate, DS-32 equal-gap linter — all judged green, Scorecard row never measured) and rewrite its VISION.md rows with measured numbers.
Scope: VISION.md Game UI Scorecard row plus Parts row; research/cards/ only. No code copied (all donor/rival ideas idea-only, net 0 lines). No Thumbnail re-sweep (see claim check below).
Proof: links plus proof outputs below (all run/read 2026-10-02). Stop: L 45 min. Single deep packet (1 DeepWiki + 2 GitHub file reads + 1 branch listing + 3 web reads + local proofs; no 429 hit).

## Live reads (2026-10-02)

- Rival v0 (proprietary, idea only): https://v0.dev/ -> https://v0.app/docs.md lastUpdated 2026-10-01 fetched live 2026-10-02 (request render, markdown): AI agent prompt-to-code plus full-stack apps plus one-click Vercel deploy plus auto-fix errors. No game HUD lane, no fixed 5-check kit gate published.
- Rival Lovable (proprietary, idea only): https://docs.lovable.dev/features/publish fetched live 2026-10-02 (request render, markdown): Publish-button to live lovable.app URL plus Quick scan checks plus custom domains. Prompt-to-app web only, no HUD/menu kit that imports in forge/engine2040.
- Rival Canva (proprietary, idea only): https://www.canva.com/game/ fetched live 2026-10-02 -> No readable content extracted (JS-gated). Prior VISION read 2026-10-02: generic templates, no engine import. No fixed kit gate.
- Riser Elementor (proprietary, idea only): https://elementor.com/ fetched live 2026-10-02 (request render, markdown): 22M+ websites built, AI prompt full pages/sections matched to site design system, pixel-perfect editing, responsive assets, image optimization. No game HUD lane, no fixed kit gate.
- Adjacent donor lucide-icons/lucide (ISC, code-copyable but 0 lines copied here): LICENSE SHA 718bb3f0e44153809972abed31839375804bf652 read live via GitHub MCP 2026-10-02 (no ref = default branch); exact file tools/build-icons/cli.ts SHA 2c9fce7accb9813727fc44ba74190e35469db0c1 read live 2026-10-02. Named by deepwiki_ask_wiki_question lucide-icons/lucide 2026-10-02 -> LICENSE + icons/ (e.g. icons/building-complex-plus.svg) + tools/build-icons/cli.ts (build-icons CLI: readSvgDirectory -> renderIconsObject -> generateIconFiles + generateAliasesFiles + generateDynamicImports -> generateExportsFile). Default branch: live fetches resolved on default ref 2026-10-02; branch listing page 1 returned feature branches only (1-19-0-release, 1-20-0-release, add-angolia-search, ...), confirming pinned SHAs above. What it does: 24px stroke icon set (width=24 height=24 stroke-width=2) built via build-icons CLI into framework packages.
- Claim check 2026-10-02T13:55Z: sprint/queue/claims.txt holds no prior GameUI vision claim within 2h (only DS-20+DS-32 builder-r9a 2026-10-02T12:45Z + gameui 023-run 2026-10-02 16:02:46Z future stamp); conditional Thumbnail readability re-sweep (DS-23 + DS-12/cover-b + DS-14 ads) not triggered. Thumbnail stays as last swept 2026-10-02.

## Our kit work (read 2026-10-02)

- tools/game-ui.mjs (177 lines): 5-check bar (tokens/states/icons/sizes/import) + gap S10 C3 (bars 6px/menu 12px equal +/-1px) + serve DS-20 (forge/engine2040 + data-engine).
- kits/game-ui/manifest.json (19 lines): ds-game-ui-v1, 3 pieces (hud/menu/buttons), icons lucide-inline ISC + Kenney CC0, sizes touchMin 44 hudBarH 16 menuBtnMinW 240, engines forge + engine2040.
- kits/game-ui/tokens.css (14 lines): 9 --gui-* colors (#14161f etc) + 2 font vars.
- kits/game-ui/buttons.css (45 lines): .btn min-height 44px min-width 240px + primary + hover/active/disabled/focus-visible.
- kits/game-ui/hud.html (42 lines): data-engine forge, 2 links, .bars data-gap=6 gap 6px, .bar 16px, 3 SVGs 24x24 stroke=currentColor, 44px targets.
- kits/game-ui/menu.html (35 lines): data-engine engine2040, 2 links, .menu gap 12px, 3 SVGs 24x24 stroke=currentColor, 3 buttons incl. disabled.

## Proof outputs (run 2026-10-02)

- `node tools/game-ui.mjs --check` -> 35 PASS 0 FAIL + GAME-UI PASS: HUD + menu + button kit, tokens/states/icons/sizes/import green (tokens 9 vars, hud/menu/buttons 0 hex, states 5/5, icons 3+3 SVGs 24px stroke, sizes 44/16px, import 2 links, gap 6px/12px equal +/-1px data-gap match).
- `node tools/game-ui.mjs --serve --check` -> 39 PASS 0 FAIL + GAME-UI PASS (same 35 + serve 4/4: forge named + engine2040 named + hud data-engine + menu data-engine).
- `node tools/check.mjs` -> RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits (cover 1280x720 34186B etc, winner cover-b).
- `node tools/judge.mjs --check` -> JUDGE PASS: rubric ds-quality-v1 10 checks, floor 8, samples/cover ships.
- Board: DS-11 DONE 360bbd1 GAME-UI PASS 30/30 serve 34/34 judge 007 PASS; DS-20 DONE serve gate judge 007 serve 34/34 PASS re-verified round 9; DS-32 DONE gap 5/5 serve 4/4 judge 023 PASS 901625c.

## Cards (all idea-only, 0 lines copied)

### C1 — Inline 24px stroke icon convention (Lucide build-icons idea) already landed, keep as gate
- Source: lucide-icons/lucide@718bb3f LICENSE ISC + tools/build-icons/cli.ts@2c9fce7 (readSvgDirectory -> renderIconsObject -> generateIconFiles, read live 2026-10-02) | License: ISC, code-copyable but this card copies 0 lines, idea-only.
- What it does: every game icon ships inline as 24x24 stroke=currentColor stroke-width=2, license tracked in manifest; build CLI generates per-framework files from icons/ dir.
- Home: kits/game-ui/hud.html (exists, 42 lines) + kits/game-ui/menu.html (exists, 35 lines) + kits/game-ui/manifest.json icons block (exists); board rows DS-11/DS-20.
- Fixes: Game UI kits (icons: 24px stroke set covers game UI).
- Net lines: 0 new (already landed: 3+3 SVGs). Donor: LICENSE + cli.ts SHAs above; ours: tools/game-ui.mjs 177 lines, hud.html 42 lines, menu.html 35 lines (Read 2026-10-02).
- Proof: `node tools/game-ui.mjs --check` 35/35 PASS incl. `[PASS] icons: hud.html 24px stroke=currentColor: 3 at 24x24, 3 stroked` + same for menu, run 2026-10-02. No proof = reject: satisfied.
- Effort and risk: S. Risk low — gate already green; risk is vendoring the full build CLI (reject: keep inline-SVG convention only, no new dep).

### C2 — Engine-import drop-in (v0 one-click deploy + Lovable Publish idea, proprietary idea-only) already landed, keep as gate
- Source: https://v0.app/docs.md lastUpdated 2026-10-01 (one-click Vercel deploy + auto-fix, read live 2026-10-02) + https://docs.lovable.dev/features/publish (Publish-button + Quick scan, read live 2026-10-02) + https://elementor.com/ (22M sites AI prompt matched to design system, read live 2026-10-02) | License: proprietary, idea only (sites, not repos; no LICENSE/SHA).
- What it does: HUD + menu kit drops into forge/engine2040 via two <link> imports + data-engine tags + manifest engines map, mirroring one-click publish as a file drop-in (no hosted deploy here).
- Home: kits/game-ui/manifest.json engines (exists) + kits/game-ui/hud.html data-engine=forge (exists) + kits/game-ui/menu.html data-engine=engine2040 (exists) + tools/game-ui.mjs serve gate (exists, 177 lines); board row DS-20.
- Fixes: Game UI kits (HUD kit imports in forge plus engine2040 menu skin).
- Net lines: 0 new (already landed). Ours: manifest.json 19 lines + tools/game-ui.mjs 177 lines.
- Proof: `node tools/game-ui.mjs --serve --check` 39/39 PASS incl. `serve: forge import named` + `serve: engine2040 import named` + 2x `data-engine present`, run 2026-10-02. No proof = reject: satisfied.
- Effort and risk: S. Risk low — static import asserts; risk is claiming a live deploy (reject: file drop-in only, receipt belongs to forge consumer R3).

## Reject list
- R1 — Vendor lucide build-icons CLI or icons/ dir into this repo. Rejected: no home for a JS build pipeline (kits are static HTML+CSS); keep the 24px stroke convention + manifest license line only.
- R2 — Copy v0/Lovable/Elementor/Canva implementation or templates. Rejected: proprietary, no code public, idea-only per vision rule; home would be kits/game-ui but license fails.
- R3 — Claim dicebear placeholders or Kenney binaries as landed. Rejected 2026-10-02: manifest tracks Kenney CC0 as CSS shapes only (no binaries vendored), dicebear not vendored; next steal is dicebear style-swappable avatar slots, not claimed today.
- R4 — Keep Game UI at 0% on stale unbuilt note. Rejected 2026-10-02: 35/35 + 39/39 PASS plus DS-11/20/32 DONE plus judges 007/023 PASS measured today; moved 0%->100% with source+date.

## VISION.md write-back
- Game UI Scorecard row + Parts row rewritten 2026-10-02 with measured numbers (0%->100% 5/5 ds-game-v1, 35/35 + 39/39 PASS, DS-11/20/32 DONE judges 007/023), How cell ends with (swept 2026-10-02), Parts Swept 2026-10-02. Numbers carry source + date.
