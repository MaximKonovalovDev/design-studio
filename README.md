# design-studio

Autonomous AI design studio: `brief.json` -> page -> rendered PNG -> design
audit, with no human in the loop. Goal and bars live in `VISION.md`;
agent loop lives in `AGENTS.md`.

## Quickstart (15 minutes, one command)

1. Open `samples/cover/brief.json` — the brief this run renders.
2. Run:

   ```sh
   node tools/check.mjs
   ```

3. Open `samples/cover/out.png` — the render. Also beside it:
   `thumb-256.png` (256px thumbnail) and `design-audit.json` (audit gates).

`RESULT PASS` means the loop check plus the 11 sample renders plus thumbs
plus audits are green (the default suite renders 11 samples: core 6 plus
cover-b plus ads/ad-1, ad-2, ad-3, hero). No Python needed; Node only.

## Where samples live

- `samples/cover/` — 1280x720 hero (start here)
- `samples/ad-square/` — 1080x1080 square creative
- `samples/story/` — 1080x1920 vertical story
- `samples/hebrew-hero/` — 1280x720 Hebrew RTL hero
- `samples/jobhunt/` — 1280x720 Hebrew RTL portfolio
- `samples/cv/` — 900x1270 Hebrew RTL one-page CV
- `samples/cover-b/` — 1280x720 factory pilot hero (clean hero plus 315px listing strip)
- `samples/ads/ad-1/` — 1080x1080 square creative (DESIGN THAT SELLS)
- `samples/ads/ad-2/` — 1080x1080 square creative (THUMBNAIL-FIRST ADS)
- `samples/ads/ad-3/` — 1200x628 wide creative (SHIP IT TONIGHT)
- `samples/ads/hero/` — 1280x720 landing hero (Ship the landing tonight, with `receipt.json`)

Each folder is the same shape: `brief.json` -> `page.html` -> `out.png`
-> `design-audit.json` (+ `thumb-256.png`).
