---
role: builder
title: fix 3 arsenal names so center's gate passes
chain: start
---

Goal: `node C:/Users/me/Desktop/center/arsenal.mjs --check design-studio` prints 12 pass 0 fail (today 9 pass 3 fail).
Scope: `arsenal.json` only, 3 name fields (flags and tools untouched):
1. tool `free-image` -> `free_image` (checker wants /^[a-z0-9_]{2,30}$/; no other repo file references the old name: only arsenal.json line 222).
2. tool `orders` test `["node","--test","tests/orders-check.test.mjs"]` -> `["node","tests/orders-check.test.mjs"]` (checker reads test[1] as the file; the test file exists and exits 0 direct: 9 pass 0 fail).
3. pdfcheck arg `expect-pages` -> `expect_pages` (checker name rule; the CLI `--expect-pages` flag, tools/pdfcheck.mjs and tests stay as-is).
Proof: `node C:/Users/me/Desktop/center/arsenal.mjs --check design-studio` RESULT 12 pass 0 fail; `node sprint/check.mjs` RESULT PASS.
Stop: M 10 min; names only, no tool behavior change.
Done when: arsenal check prints 0 fail and the diff touches only arsenal.json name fields.
Owned paths: arsenal.json.
