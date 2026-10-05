---
role: builder
title: build DS-80 brief gate (bad briefs refused, zod MIT)
chain: start
cpu: heavy
---

design-studio crew, DS-80 S60 TOKEN-100x second packet (inbox EB-2026-10-05-S60). First slice (token floor, 063) is built, awaiting its own review; THIS packet is independent files — the brief gate only (thumbs ride later).

Goal: a brief gate that refuses bad briefs before any lane builds: required fields present, sizes well-formed, facts source exists on disk, no forbidden words (engine names, scores, personal data).

Scope (owned paths, working tree only, never commit): `tools/brief.mjs` + `tests/brief.test.mjs` (new), `designs/job/brief-gate/` (gate proof: PASS report on a real brief + FAIL reports on crafted bad briefs). License rule: zod is MIT WITH attribution — if you use zod, pin it inside this repo (`tools/pylib`/`node_modules` in-repo only, never machine-wide) with its LICENSE text; a hand-rolled validator with the zod shape is also acceptable — say which in your RESULT. Never fetch unrelated deps.

Steps:

1. `node tools/orders-check.mjs --desk`. Read the DS-80 row (done-when) and 3 real briefs: `designs/O-042/brief.json`, one `samples/*/brief.json`, one `designs/O-0*/brief.json` (the schema you gate is the one lanes actually write).
2. Load skills: `open-design` (license rules) first.
3. Implement: `tools/brief.mjs` with `--check` (self-test incl. fixtures) and `gate <brief.json>` (exit 0 PASS with field report, exit 1 FAIL naming the first bad field, exit 2 SKIP for missing file — never a false PASS). Rules: required fields (product, sizes with exact pixels, facts source path that exists, headline where the lane needs one); forbidden-word scan (engine names, scores, personal data markers).
4. Prove in `designs/job/brief-gate/`: gate PASS on the real O-042 brief; gate FAIL on at least 3 crafted bad briefs (missing field, bad size, forbidden word), each naming its field.
5. Proof: `node tools/brief.mjs --check` green, new tests green, `node tools/orders-check.mjs` ORDERS PASS, `node sprint/check.mjs` RESULT PASS. F2P: bad briefs build today (no gate). P2P: the four proofs above stay green.

Stop (L 45 min). Gate only — no thumbs, no compiler changes. The keeper sends the judge (`sprint/queue/chain/review.md`) after your DONE.

Card, the first lines of your reply: Goal (DS-80 brief gate), Scope (`tools/brief.mjs`, tests, `designs/job/brief-gate/`), Proof (brief --check line), Stop.

End: `RESULT: DONE|PARTIAL|BLOCKED - DS-80 brief gate <what> | proof: node tools/brief.mjs --check`
