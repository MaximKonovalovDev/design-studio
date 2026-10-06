---
role: builder
title: build O-058 coaches-carousel-studio itch cover
chain: start
cpu: heavy
---

design-studio crew, store-lane build for O-058 (cover:itch/coaches-carousel-studio, customer factory). Oldest unbuilt order; folder `designs/O-058/` does not exist yet. Follow the lane recipe `sprint/queue/standing/maker-store.md` end to end, in order.

Goal: judged-ready `designs/O-058/` folder with BUILT PASS.

Scope (owned paths, working tree only, never commit): `designs/O-058/`, `knowledge/lane-store.md` (one line, ≤30 words, file stays under 1 KB), `sprint/needs.md` (one row only if something is genuinely missing). Never touch a customer file.

Brief facts (read the full row + files yourself, never trust this copy): product `C:/Users/me/Desktop/autonomous-factory/products/social-media-carousel/coaches-carousel-studio/`; facts ONLY from `listing/itch.md` in that folder (Coaching Carousel Templates: 120 branded slides, $25 one-time; 120 PNG + 120 SVG; 12 layouts, 10 colorways, 4 treatments; 120 captions + 3 guides; Instagram/Facebook/LinkedIn; honest limit: manual SVG retype rebrand); cover to beat `preview/cover.png` (featured, 1280x720); Open Design pick clean or professional; cover shows no engine names; sizes 1280x720 + 630x500; title readable at 256px.

Hard lessons from O-043..O-057 (do not repeat):
1. FACTS: every number, claim and chrome pixel must be traceable to the listing file. O-046 failed its first judge on invented stickers/chrome. List your fact sources before rendering. Sibling O-052 corrected a stale $39 + fake testimonial with listing facts ($25, honest limits): verify price and claims against itch.md, not memory.
2. LANDING from the start: `cover.json` landing + `DELIVERY.md` landing lines must read the FULL product path `products/social-media-carousel/coaches-carousel-studio/covers/from-design-studio/O-058/` (Maxim S84), never the repo-root short form that failed O-056/O-057's first judges.
3. Load with the skill tool first: `open-design`, `od-design-brief`, `od-poster-hero`; inputs via `node tools/assets.mjs product O-058` (real product pictures), `node tools/donor.mjs system <slug>`, template-first via `node tools/template.mjs new`. Prefer the product's real screenshots over generic art.

Proof: `node tools/orders-check.mjs --built O-058` prints BUILT PASS, plus audit line, judge SHIP line, and compare numbers (ours px vs theirs px at 256).

Stop (L 45 min). One order only; at the budget report what landed and the next step. A NOOP while this BLD row exists is not allowed (dry fallback per the seat: real picture + honest limits + needs row).

Card, first lines: Goal (O-058, cover to beat), Scope (designs/O-058, lane note, needs), Proof (--built line + compare numbers), Stop.

End: `RESULT: DONE|PARTIAL|BLOCKED - O-058 built, <n> real pictures, ours <px> vs theirs <px> at 256 | proof: node tools/orders-check.mjs --built O-058`
