# HANDOFF factory — template pack Vol 0 (DS-47)

Free magnet, rung 0 ($0). Proves checkout before paid Vol 1–3 bundle-after-3.

## What
- `packs/vol0/pack.html` — one sellable page composing all 10 registry blocks
  (hero, feature-grid, pricing, cta, testimonial, faq, stats, gallery,
  newsletter, footer). Colors/type only via `tokens.css` `var(--*)`, 0 hex.
- `packs/vol0/receipt.json` — publish receipt `{url,date,rev}`, rev pins
  `pack.html` sha256.
- `packs/vol0/tokens.css` — generated copy (edit `tokens.json`, not this file).

## Pull (factory)
Copy `packs/vol0/` into the factory offer and sell Vol 0 free. Queue paid
bundle only after 3 free checkouts (VISION Delivery evidence).

## Proof
`node tools/registry.mjs --check` stays REGISTRY PASS (pack adds no registry
row, single source untouched). `node sprint/check.mjs` PASS.
