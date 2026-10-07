# S19 parked-steal consumers (DS-82, 2026-10-07)

0 open orders today (ORDERS PASS 66: 27 delivered, 39 adopted), so consumers are the delivered covers O-059..O-066. 3 parked needs are landed and serving them; 4 steals stay parked with no consumer.

## Landed (serving named delivered orders)

- DS-51 open-props fluid tokens -> LANDED via DS-80 token floor (tools/tokens.mjs fluid floor, open-props MIT pattern). Serves kit builds repo-wide (TOKENS PASS: tokens.json -> tokens.css + docs, 0 hardcoded colors); covers stamp the same clean-professional tokens (O-066 tokens.css). Proof: `node tools/tokens.mjs --check` TOKENS PASS.
- DS-50 og-image thumb pipeline -> NEED landed, steal rejected: sharp 0.35.5 in-repo thumbs (DS-80 8e75b05) beat the og-image template pipeline with no browser. Serves every cover: O-066 thumb-256.png + O-001 256x144 legible. Proof: `node tools/thumb.mjs --check` THUMB PASS.
- DS-53 puppeteer viewport matrix -> NEED landed, steal rejected: SIZE_MATRIX in tools/render.mjs (Edge headless) already renders every brief size. Serves O-066: out.png 1280x720 + out-630x500.png from one page. Proof: both files on disk per delivered cover.

## Still parked (no consumer, unpark condition stands)

- DS-49 satori SVG-to-PNG: no order needs it; Edge renders every size.
- DS-52 tailwind block port: tailwind only as CDN in skills; no order needs it.
- DS-62 image slot manifest: no open brief needs image slots.
- DS-63 device-frame wrapper: no open brief needs a device frame.

## Verdict

Steal the needs, not the packages: 3 of 7 parked needs serve delivered orders through our own tools (tokens, sharp, SIZE_MATRIX). Keep 4 parked until an open order brief names them.
