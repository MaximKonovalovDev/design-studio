# AGENTS: design-studio

Every agent in this repo reads this first. The loop is `/sprint`
(`.opencode/commands/sprint.md`); the goal is `VISION.md`.

1. The files carry the loop: `sprint/board.md` (the work), `sprint/handoff.md`
   (where the lead is), `sprint/inbox.md` (asks from center and the owner),
   `VISION.md` (where we are going).
2. One branch, `master`. Pull before every push
   (`git pull --no-rebase --no-edit origin master`). Commit your own paths
   only (`git add <paths>`), never `git add -A`, never force-push, never rewrite
   history. Only the lead commits; helpers never commit or push.
3. A claim counts only with its proof command's one-line result in the commit
   body. An agent's report alone proves nothing.
4. Shell is pwsh. Use Glob, Grep, Read, Edit and Write for files.
5. Never print or commit a secret. Never kill a process, never remove
   `sprint/halt`.
6. The owner is never asked mid-loop: a decision only he can make is an OWNER
   row on the board, and the loop goes on.
