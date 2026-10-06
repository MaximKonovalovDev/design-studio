---
role: builder
title: build O-052 carousel-template-studio itch cover
chain: start
cpu: heavy
---

design-studio crew, store-lane build for O-052 (cover:itch/carousel-template-studio, customer factory). Oldest unbuilt order; folder `designs/O-052/` does not exist yet. Follow the lane recipe `sprint/queue/standing/maker-store.md` end to end, in order.

Goal: judged-ready `designs/O-052/` folder with BUILT PASS.

Scope (owned paths, working tree only, never commit): `designs/O-052/`, `knowledge/lane-store.md` (one line, ≤30 words, file stays under 1 KB), `sprint/needs.md` (one row only if something is genuinely missing). Never touch a customer file.

Brief facts (read the full row + files yourself, never trust this copy): product `C:/Users/me/Desktop/autonomous-factory/products/social-media-carousel/carousel-template-studio/`; facts ONLY from `listing/itch.md` in that folder; cover to beat `preview/cover-od-1280x720.png`; Open Design pick clean or professional; cover shows no engine names; sizes 1280x720 + 630x500 (itch cover plus 1280x720); title readable at 256px.

Hard lessons from O-043..O-057 (do not repeat):
1. FACTS: every number, claim and chrome pixel must be traceable to the listing file. O-046 failed its first judge on invented stickers/chrome. List your fact sources before rendering.
2. LANDING from the start: `cover.json` landing + `DELIVERY.md` landing lines must read the FULL product path `products/social-media-carousel/carousel-template-studio/covers/from-design-studio/O-052/` (Maxim S84), never the repo-root short form that failed O-056/O-057's first judges.
3. Load with the skill tool first: `open-design`, `od-design-brief`, `od-poster-hero`; inputs via `node tools/assets.mjs product O-052` (real product pictures), `node tools/donor.mjs system <slug>`, template-first via `node tools/template.mjs new`. Prefer the product's real screenshots over generic art.

Proof: `node tools/orders-check.mjs --built O-052` prints BUILT PASS, plus audit line, judge SHIP line, and compare numbers (ours px vs theirs px at 256).

Stop (L 45 min). One order only; at the budget report what landed and the next step. A NOOP while this BLD row exists is not allowed (dry fallback per the seat: real picture + honest limits + needs row).

Card, first lines: Goal (O-052, cover to beat), Scope (designs/O-052, lane note, needs), Proof (--built line + compare numbers), Stop.

End: `RESULT: DONE|PARTIAL|BLOCKED - O-052 built, <n> real pictures, ours <px> vs theirs <px> at 256 | proof: node tools/orders-check.mjs --built O-052`
