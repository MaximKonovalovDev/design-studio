# packs/plan-assemble-o040 (O-040)

Plan-to-steps-to-assemble example: `plan.json` (ordered steps + brand-kit
ref) assembles via `node tools/assemble.mjs packs/plan-assemble-o040/plan.json`
to standalone `out.html` (tokens inlined, zero network), rendered via
`node tools/render.mjs packs/plan-assemble-o040/out.html packs/plan-assemble-o040/out.png`
to `out.png` (1280x720).

Donor: Anil-matcha/Open-AI-Design-Agent (MIT), HEAD
f029d0d708d8c581463f018cdc2b0084494ce401 (2026-10-01). Reused the
plan -> steps -> assemble + brand-kit JSON idea only (0 lines copied);
the donor's MIT LICENSE text ships in this folder as LICENSE.
Brand kit `brand-kits/engine2040-ui1.json` derives from the judged-PASS
design `designs/O-042/` (same colors as kits/game-ui/tokens.css).
