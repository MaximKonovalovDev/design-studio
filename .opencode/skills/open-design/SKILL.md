---
name: open-design
description: The factory's design engine. Which Open Design design system, template and od-* skill to use for a cover, store page, landing page, preview, brand kit or product UI, and the license rules. Load before any design, cover, preview or page work.
---

# Open Design in the factory (owner 2026-09-27)

The owner: "design weak af", "make products like open design and use it".
Open Design (github.com/nexu-io/open-design, Apache-2.0, 98k stars) is the
open-source Claude Design: 154 design systems, 115 rendering templates and
165 skills. The factory uses it as its design engine. Local donor copy,
read-only and gitignored:
`research/donors/open-design/` (skills, design-systems, design-templates).
Missing? Recreate it with
`git clone --depth 1 --filter=blob:none --sparse https://github.com/nexu-io/open-design.git research/donors/open-design`
then `git -C research/donors/open-design sparse-checkout set skills design-systems design-templates`.

## The steps for every visual

1. **Brief:** load `od-design-brief` and write the 8-dimension brief into the
   product's folder before any pixel.
2. **Design system:** pick one from
   `research/donors/open-design/design-systems/<slug>/` and read its
   `DESIGN.md` and `tokens.css`. The family picks below are the default; a
   product may pick another and says why in its brief.
3. **Render:** covers and store images with `od-ecommerce-images` and
   `od-poster-hero`, device and screen shots with `od-mockup-device`, pages with
   `od-taste` and `od-web-design-guidelines`, a new brand with `od-brandkit`.
   Decks and documents: a template in `research/donors/open-design/design-templates/`.
   Turn the HTML into pixels on this PC with
   `python engine/render_html.py <page.html> <out.png> --size WxH --thumb`
   (Edge headless, no install), then open both PNGs with the Read tool.
4. **Audit:** `python engine/design_audit.py` and the art-director's review
   before the judge. The judge FAILs Preview under 7.

## Family picks

| Family | Design systems |
|---|---|
| game-dev-2d, game-dev-bundle, seasonal-3d-props, lottie-mascot-assets | `fantasy`, `retro`, `pacman`, `tetris`, `hud`, `neon`, `dithered` |
| book-forge-pro, book-maker-live, bookforge-public, print-niche | `editorial`, `warm-editorial`, `kami`, `publication`, `paper`, `vintage` |
| niche-business-system, seasonal-tax, gated-ads-funnel | `clean`, `professional`, `modern`, `refined`, `simple` |
| creator-packs, social-media-carousel, clip-repurpose, video-studio | `bold`, `vibrant`, `energetic`, `expressive`, `storytelling` |
| figma-ui-kit, keyword-steroids, github-remakes, tools and apps | `dashboard`, `mission-control`, `trading-terminal`, `bento`, `sleek`, `futuristic` |
| forge, engine2040 pages | `futuristic`, `hud`, `cosmic`, `dramatic` |

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

## Products like it

Open Design is itself the kind of product the owner wants: an engine a
coding agent drives to do skilled work, local-first, with real exports. The
factory's engine products (BookForge Pro, the video studio, a game-asset studio
on forge) follow that shape: `sprint.md` **Now**.
