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
- Tools `tools/*.mjs`, suite `node tools/check.mjs`. A design is `samples/<name>/` (brief.json, page.html, out.png, thumb-256.png, design-audit.json, DESIGN-REVIEW.md; no `preview/`). Library: `kits/`, `packs/`, `templates/`, `brand-kits/`, `designs/`. Skills `.opencode/skills/*/SKILL.md` (dot folder: see above). Donor `research/donors/` never cloned.
- Queue `sprint/queue/{ready,running,done,standing,chain}/`; claims `sprint/queue/claims.txt` (create if missing); `sprint/lock.txt` only while a lead holds it. Orders: `orders.csv` (next section). Center `C:/Users/me/Desktop/center`; other repos `node C:/Users/me/Desktop/center/arsenal.mjs --list` (own `arsenal.json`). Old text `archive/` (searches skip it; Read by path).

## Orders and delivery
S80 (Maxim 2026-10-03): only maker of covers, post visuals, CV layouts for the other repos. A design counts when a customer repo uses it.
- Book `orders.csv` (LF via `.gitattributes`; no comma in a field): `order_id,from_repo,product,brief,status,delivered_path,adopted,date,adopted_commit`. `product` = `cover:<itch|gumroad>/<slug>`, `post-visual:<campaign>`, `cv-layout:<name>`, `game-ui:<name>`; `status` = open, building, delivered, adopted, rejected. Inbox `ORDER from <repo>` → lead adds the row.
- Oldest open order first, before any STEAL/research row. Load the skills named in the builder prompt; a cover without its order row is not a delivery.
- Deliver to `designs/<order_id>/`: sample files (brief.json, page.html, tokens.css, out.png in every brief size, thumb-256.png, design-audit.json, DESIGN-REVIEW.md) + `DELIVERY.md` (≤10 lines: each file, its landing spot in the customer repo, that repo's proof command). Judge PASS first.
- Then lead commits the folder by path, sets `status` delivered + `delivered_path`, sends one inbox item naming it (`node C:/Users/me/Desktop/center/empire.mjs inbox <repo> add ...`, S50). Never edit customer files.
- Adopted = customer commits identical bytes and points its listing/post/tool at it; verify `git -C <customer repo> log -1 --format=%h -- <file>`, then set `adopted` yes, `status` adopted, hash in `adopted_commit`.
- Proof: `node tools/orders-check.mjs`, `--covers` for D5, `node C:/Users/me/Desktop/center/finish.mjs design-studio` for D1-D5.
