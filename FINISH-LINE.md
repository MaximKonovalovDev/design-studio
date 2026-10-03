# Finish line: design-studio (2026-10-03)

What "done" means for the design studio, as bars. Designs other repos really use, not samples.
`node C:/Users/me/Desktop/center/finish.mjs design-studio` measures every bar; exit 0 means finished.
Maxim's GO 2026-10-03 ("others also need a finish line"); drafted by Claude Code.

`orders.csv` is the record of orders, one line per order: `date,from,what,file,adopted_commit`
(`from` is the customer repo; `adopted_commit` is the customer repo's commit that uses the file, empty until then).

## Bars

| ID | Bar | Proof |
|---|---|---|
| D1 | First order delivered and adopted by a customer repo | `lines orders.csv 1 ,[0-9a-f]{7,40}$` |
| D2 | Five orders adopted | `lines orders.csv 5 ,[0-9a-f]{7,40}$` |
| D3 | jobhunt uses a design-studio CV | `lines orders.csv 1 ^[^,]*,jobhunt,.*,[0-9a-f]{7,40}$` |
| D4 | A game UI kit in use in engine2040 or forge | `lines orders.csv 1 ^[^,]*,(engine2040|forge),.*,[0-9a-f]{7,40}$` |
| D5 | Every live factory listing has a design-studio cover | `todo factory board/scoreboard.json published products against adopted cover rows in orders.csv` |

## Rules

- Work the lowest open bar first. A `todo` proof is the first job: build it, then write the real proof here (center's vision check FAILs until every bar has one).
- Never edit a proof to make it pass. Changing a bar needs Maxim's word.
