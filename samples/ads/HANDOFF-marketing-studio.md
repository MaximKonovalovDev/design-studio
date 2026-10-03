# HANDOFF marketing-studio — creative set (DS-48)

Dated receipts for the DS-14 3-ads-plus-hero set, ready to run as creatives.

## What
- `samples/ads/ad-1/` `ad-2/` `ad-3/` — 1080x1080 feed squares, each now with
  `receipt.json` `{url,date,rev}` where rev pins that dir's `out.png` sha256.
- `samples/ads/hero/` — 1280x720 landing hero (receipt already pinned
  2026-10-02, untouched).
- Audit: titles/descriptions unchanged, so existing `design-audit.json`
  verdicts still hold; receipts only declare publish.

## Pull (marketing-studio)
Copy `samples/ads/{ad-1,ad-2,ad-3,hero}/page.html` + `tokens.css` + `out.png`
as the 4-creative set. Receipts at each `receipt.json`.

## Proof
`node tools/check.mjs` RESULT PASS (6-sample suite untouched).
Single-sample spot check: `node tools/check.mjs samples/ads/ad-1/brief.json`.
