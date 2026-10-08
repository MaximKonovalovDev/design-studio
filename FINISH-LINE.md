# Finish line: design-studio (2026-10-03)

What "done" means for the design studio, as bars. Designs other repos really use, not samples.
`node C:/Users/me/Desktop/center/finish.mjs design-studio` measures every bar; exit 0 means finished.
Maxim's GO 2026-10-03 ("others also need a finish line"); drafted by Claude Code.

`orders.csv` is the record of orders, one line per order, header `order_id,from_repo,product,brief,status,delivered_path,adopted,date,adopted_commit`
(S80, Maxim 2026-10-03; the last column stays last because the bars below read it). `adopted_commit` is the customer repo's commit that uses the file, empty until then. How an order is taken and delivered: `AGENTS.md`, "Orders and delivery".

## Bars

| ID | Bar | Proof |
|---|---|---|
| D1 | First order delivered and adopted by a customer repo | `lines orders.csv 1 ,[0-9a-f]{7,40}$` |
| D2 | Five orders adopted | `lines orders.csv 5 ,[0-9a-f]{7,40}$` |
| D3 | jobhunt uses a design-studio CV | `lines orders.csv 1 ^[^,]*,jobhunt,.*,[0-9a-f]{7,40}$` |
| D4 | A game UI kit in use in engine2040 or forge | `lines orders.csv 1 ^[^,]*,(engine2040|forge),.*,[0-9a-f]{7,40}$` |
| D5 | Every live factory listing has a design-studio cover | `cmd node tools/orders-check.mjs --covers` |

## Rules

- Work the lowest open bar first. A `todo` proof is the first job: build it, then write the real proof here (center's vision check FAILs until every bar has one).
- A loop may RAISE a bar or fix a broken proof with a judge PASS and a written reason here (Maxim 2026-10-08). Never lower a bar, and never edit a proof to make it pass: that needs Maxim's word. `node C:/Users/me/Desktop/center/finish.mjs design-studio --lowered` exits 1 on a lower number.
