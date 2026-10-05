---
role: builder
title: build DS-80 token floor (fluid tokens, open-props MIT)
chain: start
cpu: heavy
---

design-studio crew, DS-80 S60 TOKEN-100x first packet (inbox EB-2026-10-05-S60; overlaps parked DS-51 open-props + DS-33 style-dictionary — this packet lands the first slice, it does not unpark them).

Order context: fluid tokens plus brief gate plus thumbs. THIS packet: the token floor only (brief gate + thumbs are later packets).

Goal: `tools/tokens.mjs` with a fluid token floor (open-props MIT pattern: fluid spacing/type scales via clamp) that every lane can build on, plus one compiled `tokens.css` proving it works on a real design.

Scope (owned paths, working tree only, never commit): `tools/tokens.mjs` + `tests/tokens.test.mjs` (new), `designs/job/tokens/` (floor proof: compiled tokens.css + one rendered swatch PNG). License rule: open-props is MIT WITH attribution — keep the LICENSE text with the tool, note donor + SHA; style-dictionary (Apache-2.0) is OUT of scope for this packet (later slice). Never clone whole donor repos.

Steps:

1. `node tools/orders-check.mjs --desk`. Read DS-80 + DS-51 rows on `sprint/board.md` (what is parked and why). Read `tools/assemble.mjs --help` and `brand-kits/engine2040-ui1.json` (the token consumer shape: palette/fonts/voice).
2. Load skills: `open-design` (license rules), `od-theme-tokens` (the lane skill for landing tokens.css via tools/tokens.mjs) first.
3. Implement: `tools/tokens.mjs` with `--check` (fluid floor: spacing scale, type scale with clamp, palette slots; all values resolve, no NaN/empty) and a `build <kit.json> --out tokens.css` step compiling a brand kit to CSS custom properties. Prove on a real kit: compile `brand-kits/engine2040-ui1.json` (or a judged-PASS design's tokens) into `designs/job/tokens/tokens.css` + render one swatch sheet PNG through `tools/render.mjs`.
4. Tests: fluid values match clamp math; unknown slot fails closed; compiled CSS parses with every kit value present.
5. Proof: `node tools/tokens.mjs --check` green, new tests green, `node tools/orders-check.mjs` ORDERS PASS, `node sprint/check.mjs` RESULT PASS. F2P: no token floor exists today. P2P: the four proofs above stay green.

Stop (L 45 min). Token floor only — no brief gate, no thumbs, no compiler. The keeper sends the judge (`sprint/queue/chain/review.md`) after your DONE.

Card, the first lines of your reply: Goal (DS-80 token floor), Scope (`tools/tokens.mjs`, tests, `designs/job/tokens/`), Proof (tokens --check line), Stop.

End: `RESULT: DONE|PARTIAL|BLOCKED - DS-80 token floor <what> | proof: node tools/tokens.mjs --check`
