---
role: builder
title: build O-059 content-engine-service itch cover
chain: start
cpu: heavy
---

design-studio crew, store-lane build for O-059 (cover:itch/content-engine-service, customer factory). Oldest unbuilt order; folder `designs/O-059/` does not exist yet. Follow the lane recipe `sprint/queue/standing/maker-store.md` end to end, in order.

Goal: judged-ready `designs/O-059/` folder with BUILT PASS.

Scope (owned paths, working tree only, never commit): `designs/O-059/`, `knowledge/lane-store.md` (one line, ≤30 words, file stays under 1 KB), `sprint/needs.md` (one row only if something is genuinely missing). Never touch a customer file.

Brief facts (read the full row + files yourself, never trust this copy): product `C:/Users/me/Desktop/autonomous-factory/products/services/content-engine-service/`; facts ONLY from `listing/itch.md` in that folder (Content Repurposing Kit: 12 outputs, 3 scripts, 7 posts, $19 one-time; 1 flagship in, 12 outputs out; 3 shorts scripts + newsletter + 7 captions + matrix + 7-day calendar + measure sheet + 5-stage manual; no fake was-price, gig prices UNKNOWN never quoted); cover to beat `preview/cover-1280x720.png`; Open Design pick clean or professional; cover shows no engine names; sizes 1280x720 + 630x500; title readable at 256px. Sibling O-045 built the gumroad cover for this same product: reuse its fact discipline, never its look.

Hard lessons from O-043..O-058 (do not repeat):
1. FACTS: every number, claim and chrome pixel must be traceable to the listing file. O-046 failed its first judge on invented stickers/chrome. List your fact sources before rendering. O-052/O-058 corrected stale prices with listing facts: verify price ($19) and claims against itch.md, not memory, not the sibling.
2. LANDING from the start: `cover.json` landing + `DELIVERY.md` landing lines must read the FULL product path `products/services/content-engine-service/covers/from-design-studio/O-059/` (Maxim S84), never the repo-root short form that failed O-056/O-057's first judges.
3. Load with the skill tool first: `open-design`, `od-design-brief`, `od-poster-hero`; inputs via `node tools/assets.mjs product O-059` (real product pictures), `node tools/donor.mjs system <slug>`, template-first via `node tools/template.mjs new`. Prefer the product's real screenshots over generic art.

Proof: `node tools/orders-check.mjs --built O-059` prints BUILT PASS, plus audit line, judge SHIP line, and compare numbers (ours px vs theirs px at 256).

Stop (L 45 min). One order only; at the budget report what landed and the next step. A NOOP while this BLD row exists is not allowed (dry fallback per the seat: real picture + honest limits + needs row).

Card, first lines: Goal (O-059, cover to beat), Scope (designs/O-059, lane note, needs), Proof (--built line + compare numbers), Stop.

End: `RESULT: DONE|PARTIAL|BLOCKED - O-059 built, <n> real pictures, ours <px> vs theirs <px> at 256 | proof: node tools/orders-check.mjs --built O-059`
