---
role: builder
title: default check suite skips 5 shipped samples
---

Goal: the stranger's one documented command verifies every shipped sample: default `node tools/check.mjs` renders and audits only 6 samples (cover, ad-square, story, hebrew-hero, jobhunt, cv per tools/check.mjs SAMPLES line 106-108) while 5 finished sample dirs ship beside them — samples/cover-b plus samples/ads/ad-1, ad-2, ad-3 plus samples/ads/hero — so the factory pilot cover and the whole marketing ad set pass or fail silently outside the gate the README promises.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `tools/check.mjs` SAMPLES membership (cover-b plus ads/* join the default suite, or an explicit second suite line the README names) plus re-render; explicitly NOT `tools/audit.mjs` gates (no weakening to pass), NOT `samples/*` content (028 owns hero reflow), NOT README.md wording (owned by 046), NOT receipt gate semantics (DS-24/DS-36 judged-good).

Proof: `node tools/check.mjs` RESULT PASS "loop check plus 6 sample renders plus thumbs plus audits" (cover-b appears only as informational winner line, ads/* never); `node tools/check.mjs samples/ads/hero/brief.json` RESULT PASS proves hero passes when asked explicitly with receipt https://design-studio.local/ads/hero rev pinned; `samples/ads/ad-1/out.png` opened finished but unverified by the default run; `Select-String tools/check.mjs SAMPLES` shows the hardcoded 6; P2P `node tools/check.mjs` stays RESULT PASS after.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user trusts RESULT PASS and believes the whole studio is green while 5 shipped samples were never checked; after the fix the same command covers all 11, and a regression in any ad or the pilot cover fails loudly.
