---
role: builder
title: build O-066 roman-legion-vol3 itch cover
chain: start
cpu: heavy
---

design-studio crew, store-lane build for O-066 (cover:itch/roman-legion-vol3, customer factory). Last unbuilt order; folder `designs/O-066/` does not exist yet. Follow the lane recipe `sprint/queue/standing/maker-store.md` end to end, in order.

Goal: judged-ready `designs/O-066/` folder with BUILT PASS.

Scope (owned paths, working tree only, never commit): `designs/O-066/`, `knowledge/lane-store.md` (append one line, ≤30 words, file stays under 1 KB). Do NOT touch `orders.csv`, `sprint/needs.md`, or any `designs/O-063/`, `designs/O-064/` or `designs/O-065/` path (sibling packets own them this batch): nothing is missing on this order (preview/ holds cover.png plus product screenshots), so no needs row unless a tool truly blocks.

Brief facts (read the full row + files yourself, never trust this copy): product `C:/Users/me/Desktop/autonomous-factory/products/character-animation-studio/roman-legion-vol3/`; facts ONLY from `listing/itch.md` in that folder (Roman Legion Vol 3: 3 legionaries; 5 actions x 8 directions; plain PNG sheets; $19 one-time; read the file for the exact headline, claim, counts, contents and price; never invent a number); cover to beat `preview/cover.png` (open it: current factory cover for this product); Open Design pick clean or professional; cover shows NO engine names; sizes 1280x720 + 630x500; title readable at 256px.

Hard lessons from O-043..O-065 (do not repeat):
1. FACTS: every number, claim and chrome pixel must be traceable to the listing file. List your fact sources before rendering.
2. LANDING from the start: `cover.json` landing + `DELIVERY.md` landing lines must read the FULL product path `products/character-animation-studio/roman-legion-vol3/covers/from-design-studio/O-066/` (Maxim S84), never the repo-root short form that failed O-056/O-057's first judges.
3. Load with the skill tool first: `open-design`, `od-design-brief`, `od-poster-hero`; inputs via `node tools/assets.mjs product O-066` (real product pictures: preview/ screenshots), `node tools/donor.mjs system <slug>`, template-first via `node tools/template.mjs new`. Prefer the product's real renders over generic art. Keep the OFL font stack (NEED-15: Inter default), no system fonts.

Proof: `node tools/orders-check.mjs --built O-066` prints BUILT PASS, plus audit line, judge SHIP line, and compare numbers (ours px vs theirs px at 256).

Stop (L 45 min). One order only; at the budget report what landed and the next step. A NOOP while this BLD row exists is not allowed (dry fallback per the seat: real picture + honest limits + needs row).

Card, first lines: Goal (O-066, cover to beat), Scope (designs/O-066, lane note), Proof (--built line + compare numbers), Stop.

End: `RESULT: DONE|PARTIAL|BLOCKED - O-066 built, <n> real pictures, ours <px> vs theirs <px> at 256 | proof: node tools/orders-check.mjs --built O-066`
