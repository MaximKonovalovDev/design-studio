# AGENTS: design-studio

Every agent reads this first. Loop `/sprint` (`.opencode/commands/sprint.md`); goal `VISION.md`.

1. Files carry the loop: `sprint/board.md` (work), `sprint/handoff.md` (lead position), `sprint/inbox.md` (asks), `VISION.md` + `VISION-TABLES.md` (direction).
2. One branch `master`: pull first (`git pull --no-rebase --no-edit origin master`). Only the lead commits, own paths only (`git add <paths>`); never `-A`, force-push, or rewrite history; helpers never commit/push.
3. A claim counts only with its proof command's one-line result in the commit body; an agent report alone proves nothing.
4. Files via Glob/Grep/Read/Edit/Write; shell per `## Shell and search`.
5. Never print/commit a secret, kill a process, or remove `sprint/halt`.
6. Never ask the owner mid-loop: his decision becomes an OWNER board row, loop goes on.

## Shell and search
- Shell is pwsh. UTC: `Get-Date -AsUTC -Format "yyyy-MM-ddTHH:mmZ"`. No grep/head/tail/wc/sed: Grep tool, `Select-Object -First/-Last N`, `(Get-Content f | Measure-Object -Line).Lines`.
- Code >1 line: write `$env:TEMP\opencode\<name>.mjs` (or `.py`) and run the file; never multi-line `node -e`/`python -c`.
- Glob skips dot folders from root: put `.opencode`/`.lanes` in `path`, not pattern. Queue files (claims.txt, ready/, done/) by full path.

## Where things are
- Tools `tools/*.mjs`, suite `node tools/check.mjs`. A design is `samples/<name>/` (brief.json, page.html, out.png, thumb-256.png, design-audit.json, DESIGN-REVIEW.md; no `preview/`). Library: `kits/`, `packs/`, `templates/`, `brand-kits/`, `designs/`. Skills `.opencode/skills/*/SKILL.md` (dot folder: see above). Donor `research/donors/open-design/` is a sparse clone that `node tools/donor.mjs open-design` makes (tool sprint, gitignored; never clone the whole repo, it is 3.5 GB). Tool installs stay inside this folder (`node_modules/`, `tools/pylib/`, `tools/bin/`); never machine-wide, never a model that runs on this PC.
- Queue `sprint/queue/{ready,running,done,standing,chain}/`; claims `sprint/queue/claims.txt` (create if missing); `sprint/lock.txt` only while a lead holds it. Orders: `orders.csv` (next section). Center `C:/empire/center`; other repos `node C:/empire/center/arsenal.mjs --list` (own `arsenal.json`). Old text `archive/` (searches skip it; Read by path).

## Orders and delivery
S80 (Maxim 2026-10-03): only maker of covers, post visuals, CV layouts for the other repos. A design counts when a customer repo uses it.
- Book `orders.csv` (LF via `.gitattributes`; no comma in a field): `order_id,from_repo,product,brief,status,delivered_path,adopted,date,adopted_commit`. `product` = `cover:<itch|gumroad>/<slug>`, `post-visual:<campaign>`, `cv-layout:<name>`, `game-ui:<name>` (after tool sprint packet 0a also `site-look`, `page`, `portfolio`, `short-frame`, `thumbnail` and `order:<slug>`, which `empire.mjs order` writes; `from_repo` also `fp-research`); `status` = open, building, delivered, adopted, rejected. Inbox `ORDER from <repo>` → lead adds the row (the customer-eye seat files orders for asks it reads in the customers' own boards, through `empire.mjs order`).
- Oldest open order first, before any STEAL/research row. Load the skills named in the builder prompt; a cover without its order row is not a delivery.
- Deliver to `designs/<order_id>/`: sample files (brief.json, page.html, tokens.css, out.png in every brief size, thumb-256.png, design-audit.json, DESIGN-REVIEW.md) + `DELIVERY.md` (≤10 lines: each file, its landing spot in the customer repo, that repo's proof command). Judge PASS first.
- Judge PASS comes from the keeper's review (`chain/review.md`, five checks, `VERDICT.md`). Then the deliverer seat runs `node tools/orders-check.mjs --deliver <id>` (Maxim 2026-10-04: delivered = a file in the customer repo): it copies the folder into the customer repo under `from-design-studio/<id>/` (factory: `<product folder>/covers/from-design-studio/<id>/`, Maxim S84), writes `DELIVERED.json` and sets `status` delivered + `delivered_path`. The lead commits `designs/<id>` and `orders.csv` here and that customer folder by path, and sends one inbox item naming it (`node C:/empire/center/empire.mjs inbox <repo> add ...`, S50). Until `--deliver` lands (tool sprint packet 0b) the lead does these steps by hand. Never edit a customer file outside `from-design-studio/`.
- Adopted = customer commits identical bytes and points its listing/post/tool at it; verify `git -C <customer repo> log -1 --format=%h -- <file>`, then set `adopted` yes, `status` adopted, hash in `adopted_commit`.
- Proof: `node tools/orders-check.mjs`, `--covers` for D5, `node C:/empire/center/finish.mjs design-studio` for D1-D5.

## Stage (Maxim 2026-10-08)

The empire is at its START. Never cite sales, revenue or "0 sales" as a finding, verdict, score or reason (audits, Lead 2, steals, reviews, inbox plans). Judge work by what it builds and whether it works.
