---
role: builder
title: build O-024 social visual (marketing-studio devlog header)
chain: start
---

Goal: build desk row BLD-O-024 (stage=build-social): 1200x630 devlog header for marketing-studio post-visual:aeo-visibility-audit-kit.
Scope: `designs/O-024/`, `knowledge/lane-social.md`, `sprint/needs.md`. Follow `sprint/queue/standing/maker-social.md` recipe: read brief in orders.csv + campaign folder (read only), load open-design/od-design-brief/od-poster-hero/od-theme-tokens, same page.html every size via tools/render.mjs, thumb-256.png, audit, judge (SHIP 8+), compose compare vs marketing-studio's last image of that kind, DELIVERY.md with the `visual: order:O-024` line.
Proof: `node tools/orders-check.mjs --built O-024` BUILT PASS (or ORDERS PASS + file list if --built not landed); `node sprint/check.mjs` RESULT PASS.
Stop: L 45 min; one order end to end; dry fallback per seat file (never NOOP while BLD row exists).
Done when: designs/O-024/ holds brief.json, page.html, tokens.css, out.png + second size, thumb-256.png, design-audit.json, DESIGN-REVIEW.md, DELIVERY.md.
Owned paths: designs/O-024, knowledge/lane-social.md, sprint/needs.md.
