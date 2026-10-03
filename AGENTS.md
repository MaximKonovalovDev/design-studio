# AGENTS: design-studio

Every agent in this repo reads this first. The loop is `/sprint`
(`.opencode/commands/sprint.md`); the goal is `VISION.md`.

1. The files carry the loop: `sprint/board.md` (the work), `sprint/handoff.md`
   (where the lead is), `sprint/inbox.md` (asks from center and the owner),
   `VISION.md` (where we are going; its research tables are in `VISION-TABLES.md`).
2. One branch, `master`. Pull before every push
   (`git pull --no-rebase --no-edit origin master`). Commit your own paths
   only (`git add <paths>`), never `git add -A`, never force-push, never rewrite
   history. Only the lead commits; helpers never commit or push.
3. A claim counts only with its proof command's one-line result in the commit
   body. An agent's report alone proves nothing.
4. Use Glob, Grep, Read, Edit and Write for files; shell rules: `## Shell and search`.
5. Never print or commit a secret. Never kill a process, never remove
   `sprint/halt`.
6. The owner is never asked mid-loop: a decision only he can make is an OWNER
   row on the board, and the loop goes on.

## Shell and search
- The shell is pwsh, not bash. UTC time: `Get-Date -AsUTC -Format "yyyy-MM-ddTHH:mmZ"`. No grep, head, tail, wc or sed: use the Grep tool, `Select-Object -First N` or `-Last N`, `(Get-Content f | Measure-Object -Line).Lines`.
- Code longer than one line: Write it to `$env:TEMP\opencode\<name>.mjs` (or `.py`) and run that file; never a multi-line `node -e` or `python -c`.
- Glob does not walk into dot folders from the repo root: put `.opencode` or `.lanes` in `path`, not in the pattern. Queue files (claims.txt, ready/, done/) are read by their full path.

## Where things are

Tools `tools/*.mjs` (render, audit, judge, check, thumb, registry, tokens,
brandkit, canvas, convert, game-ui, figma, workshop, agent-shot, agent-block,
image); the suite is `node tools/check.mjs`. A design is a folder
`samples/<name>/` (brief.json, page.html, out.png, thumb-256.png,
design-audit.json, DESIGN-REVIEW.md beside it; there is no `preview/` folder).
Also `kits/`, `packs/`, `templates/`, `brand-kits/`, `designs/`. Skills are
`.opencode/skills/*/SKILL.md` (a dot folder: see Shell and search). The donor copy `research/donors/` is not cloned. Queue folders are
`sprint/queue/{ready,running,done,standing,chain}/`; claims go in
`sprint/queue/claims.txt` (create if missing); `sprint/lock.txt` exists only
while a lead holds it. Orders are in `orders.csv` at the root (next section).
Center is `C:/Users/me/Desktop/center`.

Tools of the other repos: node C:/Users/me/Desktop/center/arsenal.mjs --list (this repo's own: arsenal.json).
Old text: archive/ (searches skip it; Read by path).

## Orders and delivery

S80 (Maxim 2026-10-03): this repo is the only maker of covers, post visuals and CV layouts for the other repos. A design counts when a customer repo uses it.

- Order book: `orders.csv` (kept LF by `.gitattributes`; no comma inside a field). Header `order_id,from_repo,product,brief,status,delivered_path,adopted,date,adopted_commit`. `product` is `cover:<itch|gumroad>/<slug>`, `post-visual:<campaign>`, `cv-layout:<name>` or `game-ui:<name>`. `status` is open, building, delivered, adopted or rejected. New orders come as inbox items `ORDER from <repo>`: the lead adds the row.
- Order of work: the oldest open order first, before any STEAL or research row. Load the skills named in the builder prompt; a cover without its order row is not a delivery.
- Deliver into `designs/<order_id>/`: the sample files (brief.json, page.html, tokens.css, out.png in every size the brief asks, thumb-256.png, design-audit.json, DESIGN-REVIEW.md) and `DELIVERY.md` (at most 10 lines: each file, where it lands in the customer repo, the customer's own proof command). A judge PASS comes first.
- After the PASS the lead commits the folder by path, sets `status` delivered and `delivered_path` `designs/<order_id>`, and sends the customer one inbox item naming that path: `node C:/Users/me/Desktop/center/empire.mjs inbox <repo> add ...` (S50). We never edit a customer repo's files.
- Adopted: the customer repo commits a file with the same bytes as ours and points its listing, post or tool at it. The lead checks `git -C <customer repo> log -1 --format=%h -- <that file>` and only then sets `adopted` yes, `status` adopted and that hash in `adopted_commit`.
- Proof: `node tools/orders-check.mjs` (rows), `node tools/orders-check.mjs --covers` (D5), `node C:/Users/me/Desktop/center/finish.mjs design-studio` (D1-D5).
