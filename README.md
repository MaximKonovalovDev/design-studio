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

`RESULT PASS` means the loop check plus all 4 sample renders plus thumbs
plus audits are green. No Python needed; Node only.

## Where samples live

- `samples/cover/` — 1280x720 hero (start here)
- `samples/ad-square/` — 1080x1080 square creative
- `samples/story/` — 1080x1920 vertical story
- `samples/hebrew-hero/` — 1280x720 Hebrew RTL hero

Each folder is the same shape: `brief.json` -> `page.html` -> `out.png`
-> `design-audit.json` (+ `thumb-256.png`).
