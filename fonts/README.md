# fonts/
Self-hosted type for covers, pages, and CV layouts.

- `fonts.json` - manifest of the families and weights.
- `fonts.css` - @font-face bundle built from the manifest.
- `inter/`, `rubik/`, `heebo/`, `frank-ruhl-libre/` - family sources.

Open first: `fonts.json`, then `fonts.css`.
Keep sources self-hosted; no outside font URLs in designs.
See `templates/` for how the type tokens consume these faces.
