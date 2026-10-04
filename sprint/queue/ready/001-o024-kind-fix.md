---
role: builder
title: fix O-024 product kind so the orders gate passes
chain: start
---

Goal: `node tools/orders-check.mjs` prints ORDERS PASS again. O-024 (marketing-studio visual) was filed with product `visual:aeo-visibility-audit-kit`, which the gate rejects.
Scope: `orders.csv` only (one field of the O-024 row). Read the eye seat's source ask in marketing-studio first and pick the closest legal kind (`post-visual:<campaign>` for a header visual; `order:<slug>` only if `empire.mjs order` wrote it). Change nothing else.
Proof: `node tools/orders-check.mjs` ORDERS PASS (24 orders, 1 open O-024, 0 problems); `node sprint/check.mjs` RESULT PASS.
Stop: M 10 min; one row, one field, no redesign.
Done when: O-024 row has a legal product kind and the gate passes.
Owned paths: orders.csv.
