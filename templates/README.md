# Templates (v1, 2026-10-04)

Start every order from a template. Never type a palette, a page shell or an art layer from an empty file.

1. See what exists: `node tools/template.mjs list` (14 templates, 8 palettes; pictures: `templates/palettes.png` and each `preview.png`).
2. Stamp an order: `node tools/template.mjs new <order> --template <family>/<id> --palette <id> TITLE="..." KICKER="..." --asset <name>=<the customer's own picture>`. It writes `designs/<order>/` and never overwrites a folder. It prints the slots that still hold sample text and the placeholder pictures still to replace.
3. Build: a cover with `node tools/cover.mjs all <order>`, a page with `node tools/template.mjs build <order>` (every size, PDFs, thumb, audit, judge).
4. After a change here: `node tools/template.mjs --check` and `node --test tests/template.test.mjs`; new pictures with `node tools/template.mjs preview --all`.

| Family | Templates | For |
|---|---|---|
| `covers` | `app-window`, `sheet-fan`, `item-board` (store covers 1280x720 + 630x500) | factory, skillworks, marketing-studio, forge, engine2040 |
| `social` | `card` (link card, square, story from one page) | marketing-studio, factory, all |
| `web` | `landing`, `site` (hub, guide, tool, privacy + one stylesheet), `press-kit` | factory sites, marketing-studio, forge, engine2040 |
| `email` | `announce` (600px, literal colours in the stamped copy) | marketing-studio, factory |
| `print` | `one-pager`, `deck` (8 slides), `report` (4 A4 pages), `portfolio-card` (all with a PDF) | fp-research, skillworks, jobhunt, factory |
| `game` | `hud`, `menu` (1280x720 + the 640x360 pixel reference at 2x; lengths in rem, 1rem = 10 reference px; `PICTURE` = a screenshot of the customer's own game; `ACTIVE_SLOT` and `FOCUS` pick the lit slot and button) | forge, engine2040, design-studio, marketing-studio |

Contract for a new template (`templates/<family>/<id>/`): `template.json` (id, family, kind page or cover, title, what, for, donor, palette, sizes, files, slots, and for a page the `brief` body), the source files, `preview.png`. Slots are `{{UPPER_SNAKE}}` with a default each; no loops, an empty optional element collapses by CSS. Colour only through `--bg --bg-2 --ink --muted --accent --accent-ink --on-accent --chip-bg --chip-ink --chip-line`, type through `--font-display --font-body --font-mono --font-hebrew`; the tool writes `tokens.css` from `templates/palettes.json`. Logical CSS properties, `<html lang="{{LANG}}" dir="{{DIR}}">`, no outside URLs.

A new palette goes into `palettes.json` and must pass 4.5:1 on the 7 pairs the check names. The old `templates/pages`, `templates/blocks` and `registry.json` are the earlier starters (other colour names, used by no order); they are archived with `workshop/` under `archive/2026-10-04/old-starters/` and are not part of this system.
