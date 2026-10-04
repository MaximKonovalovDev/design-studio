---
role: judge
title: review toolsmith-r3 NEED-08
---

Review toolsmith-r3, built by builder. Its record: sprint/needs.md NEED-08 (tools/donor.mjs system + tools/mockup.mjs, first use O-026). Its result, cut, is at the end.

B. A tool (not a design folder): rerun its proof yourself, read its diff and check its done-when as written. Your whole reply is at most 15 lines: `VERDICT: PASS|FAIL|BLOCKED`, what changed, the checks before and after (commands and numbers), and how to revert it.

Rerun yourself (never trust the builder's log): `node tools/donor.mjs system clean --json <tmp>` (expect DONOR PASS), `node tools/mockup.mjs --help` plus one real `--shot` render if the fixture picture exists, `node --test tests/donor.test.mjs tests/mockup.test.mjs`, `node tools/orders-check.mjs --built O-026` if designs/O-026 exists. Check: arsenal.json has exactly ONE entry per new tool with first_job O-026; the first-use files (designs/O-026/system.json, mockup.png, compare.png) exist on disk with nonzero bytes; NEED-08 row in sprint/needs.md names the proof. Uncommitted files for this packet (lead commits only on your PASS): tools/donor.mjs, tools/mockup.mjs, tests/donor.test.mjs, tests/mockup.test.mjs, arsenal.json, sprint/needs.md, designs/O-026/system.json + mockup.png + compare.png. Revert = `git checkout -- <those paths>` plus `git clean -n` check (lead runs it, you only name it). Partly is FAIL.

Its result, cut:
RESULT: DONE - donor + mockup landed, used on O-026 | proof: DONOR PASS 8/8 + MOCKUP PASS 7/7, tests 16/16, mockup.png 232370B + system.json on disk
