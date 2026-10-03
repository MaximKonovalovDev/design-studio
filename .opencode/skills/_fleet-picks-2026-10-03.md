# Fleet picks 2026-10-03 (design-studio)

Looked at: anthropics frontend-design, canvas-design, brand-guidelines,
theme-factory (all Apache-2.0); VoltAgent ui-designer, ui-ux-tester,
accessibility-tester, visual-asset-generator, game-developer (MIT);
wshobson ui-design, accessibility-compliance, game-development (MIT);
contains-studio/agents (license unclear, skipped).
Skipped: brand-guidelines (dup of od-brandkit), canvas-design/frontend-design
(dup of od-poster-hero/od-web-design-guidelines), game code patterns (not UI).

Picked:
1. `od-wcag-audit` (wshobson wcag-audit-patterns, MIT) — WCAG 2.2 AA gate
   the audit tool cannot do; used by judge pre-PASS, builder fixes.
2. `od-ux-critique` (VoltAgent ui-ux-tester, MIT) — frustrated-user
   spacing/flow critique; used by judge/pilot before PASS.
3. `od-theme-tokens` (anthropics theme-factory, Apache-2.0) — palette +
   font-pairing discipline via tools/tokens.mjs; used by builder.
