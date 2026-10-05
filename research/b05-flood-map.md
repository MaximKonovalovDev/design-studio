# B-05 dup-flood map: 58x page.html

Date: 2026-10-05. Map only. No deletes. No moves. No action taken.

## Scope

All 58 tracked `page.html` files (disk count matches git count: 58).

- designs/: 35 (O-001 to O-037 minus gaps, O-042, factory-gumroad-cover)
- samples/: 11 (ad-square, ads x5, cover, cover-b, cv, hebrew-hero, jobhunt, story)
- templates/: 12 (email x1, game x2, print x4, social x1, web x3)

## Method

SHA-256 over raw file bytes. Same hash = identical bytes = one group.

## Result

- Files: 58. Unique hashes: 58. Identical-byte groups: 0.
- Total: 402.8 KB. Wasted on byte dupes: 0.0 KB (0 bytes).
- There is no dup flood by identical bytes. Each page.html is its own file.

## Keep-one per group

No groups, so no keep-one pick. Nothing to remove. A later pass could look at near-same files (not this job).

Note: closest sizes are designs/O-023 (3540 B) and designs/O-042 (3539 B). Hashes differ, so not identical. No action.

## Full hash table (short sha, size, path)

| sha12 | bytes | path |
|---|---|---|
| 90f83a8cc0ea | 19670 | templates/web/landing/page.html |
| 6a24fa6b6002 | 19515 | templates/game/hud/page.html |
| 397a46c5db56 | 16824 | designs/O-028/page.html |
| 3c5e1fad7b9e | 16790 | templates/print/report/page.html |
| 09e1e0c83c98 | 16101 | templates/print/deck/page.html |
| 8411dd6cdcc8 | 14050 | templates/web/press-kit/page.html |
| 50562d3618dc | 12640 | designs/O-030/page.html |
| 72686c63aaec | 11775 | designs/O-029/page.html |
| 7eccd787e86c | 11699 | designs/O-027/page.html |
| 63ada72ed954 | 10814 | templates/print/one-pager/page.html |
| faa641d45d8b | 10598 | templates/game/menu/page.html |
| cb5dc49ea5b1 | 10485 | templates/print/portfolio-card/page.html |
| e0d857d744ef | 9592 | designs/O-037/page.html |
| e98cbf1524cf | 9394 | designs/O-007/page.html |
| 402a67571892 | 8952 | designs/O-034/page.html |
| e33bf96d06a4 | 8612 | designs/O-033/page.html |
| f0e31446d27a | 8539 | templates/email/announce/page.html |
| 6a4dfa3490a3 | 8398 | designs/O-036/page.html |
| c29d309b72b6 | 8373 | designs/O-035/page.html |
| c7b4bd003c54 | 8100 | templates/social/card/page.html |
| b3c5796667ac | 7546 | designs/O-025/page.html |
| 35e507efe5c1 | 7331 | designs/O-026/page.html |
| 4ffc1c2fd34e | 7190 | designs/O-016/page.html |
| c338893bf6eb | 6709 | designs/O-018/page.html |
| 9e13868ceb30 | 6540 | designs/O-021/page.html |
| c27a5f5b72c1 | 6479 | designs/O-022/page.html |
| 0a444fe05594 | 6352 | designs/O-005/page.html |
| d41deb0b90ee | 6243 | designs/O-014/page.html |
| 7704e56abfce | 6238 | designs/O-015/page.html |
| b5f2aade7a3b | 6190 | designs/O-017/page.html |
| ed76e60f64fa | 6116 | designs/O-020/page.html |
| f31ba0d849bc | 6044 | designs/O-001/page.html |
| affe1be86405 | 5976 | designs/O-013/page.html |
| 9fc91269b138 | 5959 | designs/O-012/page.html |
| af22e8aedb83 | 5917 | designs/O-003/page.html |
| 68ab89f408d0 | 5862 | designs/O-019/page.html |
| 2bcd69689507 | 5835 | designs/O-002/page.html |
| d5006d510a9b | 5569 | samples/cv/page.html |
| b342b5c5a99b | 5380 | designs/O-004/page.html |
| 6fab3e63e741 | 4703 | designs/O-024/page.html |
| 41f89b5071b0 | 4470 | designs/O-031/page.html |
| 5b52a9a8275f | 4163 | designs/O-006/page.html |
| 3bbe01dbe92f | 3633 | templates/web/site/page.html |
| 7e9dac3a45a1 | 3540 | designs/O-023/page.html |
| 0f4f111c745e | 3539 | designs/O-042/page.html |
| 717429904dad | 2584 | samples/cover-b/page.html |
| 49f44100675b | 2545 | designs/O-032/page.html |
| 0c958878fe82 | 2484 | samples/ad-square/page.html |
| e2e39e78cdb4 | 2392 | samples/ads/ad-1/page.html |
| b70716c4cbd9 | 2374 | samples/ads/ad-2/page.html |
| e7afc6170898 | 2285 | samples/jobhunt/page.html |
| 36720efa8ea8 | 2282 | designs/factory-gumroad-cover/page.html |
| 7df6bf6386ec | 1981 | samples/ads/hero/page.html |
| 78bb2a30dd26 | 1963 | samples/ads/ad-3/page.html |
| 268b3bcffed9 | 1958 | samples/story/page.html |
| b35cb3752dff | 1836 | samples/ads/hero-b/page.html |
| 76b6fbc3bef1 | 1777 | samples/hebrew-hero/page.html |
| db42ccfd38dd | 1515 | samples/cover/page.html |

## Check

`node tools/check.mjs` → RESULT PASS (loop check + 11 sample renders + thumbs + audits). Run read-only: no source files changed.
