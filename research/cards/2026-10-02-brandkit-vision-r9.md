# Brand-kit consistency sweep — vision-r9 (2026-10-02)

Goal: Priority sweep the Brand-kit consistency part (DS-02 tokens pipeline, DS-10 brandkit gate plus studio kit, DS-18 taste 20-exemplar library, DS-33 fixpoint READY — all still 0% unmeasured in VISION.md) by reading the part's rivals plus one riser live, reading our kit work, running the row's proofs, then rewriting the Brand-kit Parts row and Scorecard row with measured numbers ending the How cell with `(swept 2026-10-02)`.

Scope: `VISION.md` Brand-kit Scorecard row + Parts row only, plus this card in `research/cards/`. No builder code changed. One deep packet: S11 shadcn-ui/ui theming/registry via one DeepWiki call + 3 GitHub reads (branches, LICENSE, themes.ts), zero 429s; rivals/riser via plain web reads (no GitHub). Style-dictionary detail reused from today's S12 card (no re-read). Our kit work read: `tools/tokens.mjs` (296 lines), `tools/brandkit.mjs`, `tools/taste.mjs`, `brand-kits/registry.json` + `studio.json`, `taste/library.json`, `research/cards/2026-10-02-s12.md`.

Proof (links plus proof outputs):
- Donor live 2026-10-02: https://github.com/shadcn-ui/ui — License MIT (`LICENSE.md` SHA fad4d887 read live via GitHub); default branch `main` SHA 295a1f114a138f23b5dfee0e0c6812394dfeb90c (from 100-branch list 2026-10-02, protected:true); exact file `apps/v4/registry/themes.ts` SHA 80fdfba3a7d0dc2cb8ebe6234a608778b2ed8c07 read live (neutral/stone/zinc themes, `cssVars: {light, dark}` pairs e.g. `primary`/`primary-foreground`, `type: registry:theme`). DeepWiki file-naming first: `deepwiki_ask_wiki_question` on `shadcn-ui/ui` 2026-10-02 named `apps/v4/registry/themes.ts` + `packages/shadcn/src/utils/updaters/update-css-vars.ts` + `apps/v4/scripts/build-registry.mts` + `apps/v4/registry/config.ts`; only themes.ts read (budget).
- Theming docs live 2026-10-02: https://ui.shadcn.com/docs/theming — semantic background/foreground pairs (`--primary` + `--primary-foreground`), Tailwind maps to `bg-background text-foreground`, dark mode overrides same tokens inside `.dark`; MIT copyable.
- Rival live 2026-10-02: https://www.figma.com/ai/ — "Figma AI: Your Creativity, unblocked", agent generation_directions/diagrams/image-edit/file-search; no fixed rubric/gate published; proprietary idea-only.
- Rival note: Canva Magic Studio https://www.canva.com/magic-studio/ fetch 2026-10-02 returned no readable content; prior VISION G1 read 2026-10-02 stands (templates+resize, proprietary idea-only) — not re-cited as fresh.
- Riser live 2026-10-02: https://elementor.com/ — "22M+ websites built", "AI how you want it: prompt full pages and sections", "matched to your site's design system", global styles/pixel-perfect editing; proprietary idea-only.
- Sibling donor (reused, not re-read): style-dictionary/style-dictionary Apache-2.0 per `research/cards/2026-10-02-s12.md` (LICENSE SHA 8318dc07, `lib/StyleDictionary.js` SHA a96ac6d5, main SHA a5b1a8a9 read live 2026-10-02) — transform/resolve fixpoint stays the DS-33 steal-next.
- Local proofs run 2026-10-02 in `C:\empire\design-studio`:
  - `node tools/tokens.mjs --check` → `TOKENS PASS: tokens.json -> tokens.css + docs, 0 hardcoded colors` (16/16: 6 colors, ink/paper 16.27:1, muted/paper 7.13:1, on-accent/accent 5.18:1, dark 6 overrides + dark pairs 16.35/7.73:1, diff in sync).
  - `node tools/brandkit.mjs --check` → `BRANDKIT PASS: name to palette, type, voice, lockup plus tokens export` (16/16: 1 kit `studio`, pairs 16.27/7.13/5.18, lockup var(--*) no hex, tokens.colors == palette).
  - `node tools/taste.mjs --check` → `TASTE PASS: 20 exemplars with tokens` (20/20 ids unique, each 5+ hex + 2 pairs ≥4.5:1 + type + spacing).
  - `node tools/check.mjs` → `RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits` (cover 1280x720, jobhunt 35014B, cv 900x1270; every `samples/*/tokens.json` present: cover/ad-square/cv/hebrew-hero/jobhunt/story; `Select-String '#[0-9a-fA-F]{6}' samples/*/page.html` → zero hits = 0 hardcoded colors).
- VISION.md write-back 2026-10-02: Scorecard Brand-kit 0% → 100% (5/5 rubric ds-brand-v1 source samples/cover/tokens.json + brand-kits/studio.json + taste/library.json); Parts Brand-kit 0% → 100% with donor SHAs; both How/Proof cells end `(swept 2026-10-02)`.

Stop: L 45 min. Claim `Brand-kit | vision-r9 | 2026-10-02T12:44Z | VISION.md` in `sprint/queue/claims.txt`. Research + card + two VISION row edits only; no builder ports (ports belong to DS-33).

## Cards (best-first, patterns only, net-new lines only here)

### C1 — Semantic light/dark cssVars pair convention (background/foreground + .dark override)
- Source: `shadcn-ui/ui@main` `apps/v4/registry/themes.ts: neutral cssVars.light/dark` (e.g. `primary: oklch(0.205 0 0)` + `primary-foreground: oklch(0.985 0 0)` light, swapped dark; `type: registry:theme`), file SHA 80fdfba3, license MIT (LICENSE.md SHA fad4d887 read live 2026-10-02).
- What it does: every surface token ships as a background/foreground pair and dark mode redefines the same names (`.dark` override), so components use `bg-primary text-primary-foreground` without rewriting classes; our equivalent is `:root` + `[data-theme="dark"]` plus `ink/paper`, `muted/paper`, `on-accent/accent` pairs already gated ≥4.5:1.
- Home: `tools/tokens.mjs` (exists, `buildCss` :root + dark block + pair checks) + `tools/brandkit.mjs` (exists, pair gates per kit); board rows DS-02 DONE / DS-10 DONE (pair-convention extension, docs naming).
- Fixes: Scorecard row Brand-kit consistency (vars + pairs + diff checks; keeps 0-hardcoded-colors bar while adding named-pair discipline).
- Net lines: ~10-20 new lines here (pair-name lint: every `--X` with a `--X-foreground` or documented exception + dark-override presence check). wc: donor themes.ts ~large multi-theme registry (live read 2026-10-02); ours tokens.mjs 296 lines.
- Proof: `node tools/tokens.mjs --check` TOKENS PASS 16/16 + `node tools/brandkit.mjs --check` BRANDKIT PASS 16/16 run 2026-10-02; extension proof is the same commands with a missing-foreground fixture FAILing. No proof = reject: satisfied.
- Effort and risk: S. Risk low — check-only; risk is over-strict naming (keep exception list, warn not fail on chart/sidebar extras).

### C2 — Registry build merge (base + theme → one theme item)
- Source: `shadcn-ui/ui@main` `apps/v4/scripts/build-registry.mts` (compile registry, `inlineColors` + `cssVars` light/dark JSON) + `apps/v4/registry/config.ts: buildRegistryTheme` (merge base-color cssVars + theme cssVars + chart/radius transforms → `registry:theme` item), via DeepWiki naming 2026-10-02, license MIT (SHA fad4d887 read live 2026-10-02). Patterns only; files not re-read (budget).
- What it does: base palette and theme deltas compose by merge into one shippable theme artifact with light/dark cssVars, so N programs share one base and differ by overlay; our equivalent is `brand-kits/registry.json` (1 kit `studio` today) + per-sample `tokens.json` merging toward one `tokens.css`.
- Home: `brand-kits/registry.json` (exists) consumed by `tools/brandkit.mjs`; board row DS-10 DONE (registry-merge extension) / DS-18 taste library as N-theme consumer.
- Fixes: Scorecard row Brand-kit consistency (one-tokens-file-per-program bar scales to N kits without drift; tokens export mirrors palette gate stays green).
- Net lines: ~20-30 new lines here (base+overlay merge + collision count, mirroring S12-C3 precedence). wc: ours registry.json 120B + studio.json 1856B 2026-10-02.
- Proof: `node tools/brandkit.mjs --check` BRANDKIT PASS 16/16 run 2026-10-02; extension proof is a two-kit fixture asserting overlay wins + 1 collision warning. No proof = reject: satisfied.
- Effort and risk: S. Risk low — merge order only; risk is silent overwrite (keep collision count, never silent).

### C3 — Deferred transform/resolve fixpoint (DS-33 ready)
- Source: `style-dictionary/style-dictionary@a5b1a8a9` `lib/StyleDictionary.js:_exportPlatform` deferred-set loop (reused from `research/cards/2026-10-02-s12.md` C1, Apache-2.0 LICENSE SHA 8318dc07 read live 2026-10-02; no re-read this run).
- What it does: transitive `{refs}` (brand → button.base → button.hover) converge without ordering hacks; stalled count = circular error instead of hang.
- Home: `tools/tokens.mjs` (`normalizeTokens`/`buildCss`); board row DS-33 READY (F2P: ref-chain fixture FAIL today).
- Fixes: Scorecard row Brand-kit consistency (alias tokens resolve deterministically; future-proofs the 100% bar).
- Net lines: ~30-45 new lines (per S12-C1). Proof today: `node tools/tokens.mjs --check` TOKENS PASS 16/16 on flat shape (ref-chain still FAIL by design); full proof after DS-33 build. Effort S, risk low (keep stall guard).

## Reject list
- R1 — Copying `themes.ts` OKLCH values verbatim as our palette. Rejected: no home for OKLCH import (our gates assert `#rrggbb` + 4.5:1 pairs; OKLCH→hex conversion unbuilt); keep the pair/override shape, never the literal values.
- R2 — Vendoring `update-css-vars.ts` PostCSS/Tailwind-v4 plugin path (`updateCssVarsPluginV4`, `@theme inline`). Rejected: no home (no Tailwind/PostCSS here; `node:fs` sync css emit only); keep `:root`/`.dark` emit shape.
- R3 — Figma AI / Elementor behavior clones. Rejected: proprietary idea-only (no fixed gate published on either page 2026-10-02); shapes noted, nothing copied.
- R4 — GPL/AGPL-adjacent token code. None encountered; rule observed (ideas only from proprietary/reference-only; code only from MIT/Apache-2.0 with SHAs above).
