---
name: open-design
description: The design engine of design-studio. Which Open Design design system, template and od-* skill to use for a factory cover, a marketing-studio ad or landing hero, a jobhunt CV or portfolio page, a forge or engine2040 game UI kit, or a brand kit, and the license rules. Load before any design, cover, ad or page work.
---

# Open Design in design-studio (owner 2026-09-27)

The owner: "design weak af", "make products like open design and use it".
Open Design (github.com/nexu-io/open-design, Apache-2.0, 98k stars) is the
open-source Claude Design: 154 design systems, 115 rendering templates and
165 skills. The design engine here. Local donor copy, read-only and gitignored:
`research/donors/open-design/` (skills, design-systems, design-templates).
It is NOT cloned by default (the folder `research/donors/` does not exist):
do not read it before you clone it. To recreate it use
`git clone --depth 1 --filter=blob:none --sparse https://github.com/nexu-io/open-design.git research/donors/open-design`
then `git -C research/donors/open-design sparse-checkout set skills design-systems design-templates`.

## The steps for every visual

1. **Brief:** load `od-design-brief` and write the 8-dimension brief into the
   product's folder before any pixel.
2. **Design system:** pick one from
   `research/donors/open-design/design-systems/<slug>/` and read its
   `DESIGN.md` and `tokens.css`. The customer picks below are the default; an
   order may pick another and says why in its brief.
3. **Render:** covers and store images with `od-ecommerce-images` and
   `od-poster-hero`, device and screen shots with `od-mockup-device`, pages with
   `od-taste` and `od-web-design-guidelines`, a new brand with `od-brandkit`.
   Decks and documents: a template in `research/donors/open-design/design-templates/`.
   Turn the HTML into pixels on this PC with
   `node tools/render.mjs <page.html> <out.png> --size WxH`
   (Edge headless, no install), then open the PNG with the Read tool.
4. **Audit:** `node tools/audit.mjs samples/<name>/brief.json`, then
   `node tools/judge.mjs`. The judge FAILs Preview under 7.

## Customer picks (who orders, what we make, the default design systems)

| Customer repo | What we make for it | Design systems |
|---|---|---|
| factory | listing covers and store images (book, tool and template products) | `editorial`, `warm-editorial`, `kami`, `publication`, `paper`, `vintage`; business tools: `clean`, `professional`, `modern`, `refined`, `simple` |
| marketing-studio | ad squares, landing heroes, social carousels | `bold`, `vibrant`, `energetic`, `expressive`, `storytelling` |
| jobhunt | Hebrew RTL CV and portfolio page (logical properties, Hebrew type pair) | `clean`, `professional`, `refined`, `simple`, `editorial` |
| forge, engine2040 | game UI kits: HUD, menu, buttons | `hud`, `fantasy`, `retro`, `neon`, `futuristic`, `cosmic`, `dramatic` |

## License rules

- Open Design is Apache-2.0; a folder's own LICENSE wins (the MIT skills keep
  theirs). The seven `od-*` skills here carry a `NOTICE.md` with the source.
- Never port `docx`, `pdf`, `pptx` or `xlsx` from it: they are Anthropic's
  proprietary skills. Skills that call paid APIs (`fal-*`, `venice-*`,
  `replicate`, `imagen`, `sora`) need the owner's key: not used.
- Design systems named after real companies (airbnb, apple, stripe, notion...)
  are style references only. A product never takes their name, logo,
  trademark or look-alike branding.
- A shipped product credits Open Design only where it ships Open Design code
  or templates (Apache-2.0 NOTICE); styles learned from a DESIGN.md need no credit.
