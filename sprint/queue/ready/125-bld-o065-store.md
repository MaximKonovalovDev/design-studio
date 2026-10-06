---
role: builder
title: build O-065 ui-kit-vol1 itch cover
chain: start
cpu: heavy
---

design-studio crew, store-lane build for O-065 (cover:itch/ui-kit-vol1, customer factory). Oldest unbuilt order after O-064; folder `designs/O-065/` does not exist yet. Follow the lane recipe `sprint/queue/standing/maker-store.md` end to end, in order.

Goal: judged-ready `designs/O-065/` folder with BUILT PASS.

Scope (owned paths, working tree only, never commit): `designs/O-065/`, `knowledge/lane-store.md` (append one line, ≤30 words, file stays under 1 KB). Do NOT touch `orders.csv`, `sprint/needs.md`, or any `designs/O-062/`, `designs/O-063/` or `designs/O-064/` path (sibling packets own them this batch): nothing is missing on this order (preview/ holds cover.png plus product screenshots), so no needs row unless a tool truly blocks.

Brief facts (read the full row + files yourself, never trust this copy): product `C:/Users/me/Desktop/autonomous-factory/products/game-dev-bundle/ui-kit-vol1/`; facts ONLY from `listing/itch.md` in that folder (Game UI Kit Vol 1; read the file for the exact headline, claim, counts, contents and price; never invent a number); cover to beat `preview/cover.png` (open it: current factory cover for this product); Open Design pick clean or professional; cover shows NO engine names; sizes 1280x720 + 630x500; title readable at 256px.

Hard lessons from O-043..O-064 (do not repeat):
1. FACTS: every number, claim and chrome pixel must be traceable to the listing file. List your fact sources before rendering.
2. LANDING from the start: `cover.json` landing + `DELIVERY.md` landing lines must read the FULL product path `products/game-dev-bundle/ui-kit-vol1/covers/from-design-studio/O-065/` (Maxim S84), never the repo-root short form that failed O-056/O-057's first judges.
3. Load with the skill tool first: `open-design`, `od-design-brief`, `od-poster-hero`; inputs via `node tools/assets.mjs product O-065` (real product pictures: preview/ screenshots), `node tools/donor.mjs system <slug>`, template-first via `node tools/template.mjs new`. Prefer the product's real renders over generic art. Keep the OFL font stack (NEED-15: Inter default), no system fonts.

Proof: `node tools/orders-check.mjs --built O-065` prints BUILT PASS, plus audit line, judge SHIP line, and compare numbers (ours px vs theirs px at 256).

Stop (L 45 min). One order only; at the budget report what landed and the next step. A NOOP while this BLD row exists is not allowed (dry fallback per the seat: real picture + honest limits + needs row).

Card, first lines: Goal (O-065, cover to beat), Scope (designs/O-065, lane note), Proof (--built line + compare numbers), Stop.

End: `RESULT: DONE|PARTIAL|BLOCKED - O-065 built, <n> real pictures, ours <px> vs theirs <px> at 256 | proof: node tools/orders-check.mjs --built O-065`
