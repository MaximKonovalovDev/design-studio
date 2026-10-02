# Loop kernel v2

Rules every loop shares. Center owns this file: `node loopkit.mjs update` copies it into every repo as `.opencode/kernel.md`, so a change here is a change in the template. Never edit the copy in a repo. Rules only one repo has stay in its `/sprint` and `AGENTS.md`; where they differ, the repo wins.

## Start and lock
- After a compaction the files, not memory, carry the loop: redo Start.
- One lock token per session, kept in the handoff. Another fresh token: stop unless `takeover` and the old session is closed. Release only your own lock.
- A halt or `STOP` file means stop. Never remove it; the owner does.
- `.opencode/knobs.json` values win over numbers in `/sprint`. Never edit it; propose a change with a `KNOB PROPOSAL:` line in the handoff.

## The batch
- The keeper names each batch: chain steps and one-offs first, then seats in fair turns, at most `heavy_max` CPU-heavy. The list is also in the queue's `batch.md`.
- Send the whole list as ONE message of Task calls: `subagent_type` the role, `description` the title, `prompt` exactly `packet: <name>`. The keeper fills each call's text, so every helper runs at once, live in this session, foreground. Never `background: true`. Send the full width while eligible work exists; seats the keeper holds for readiness rest, and a sent seat with nothing to do ends `RESULT: NOOP - <reason>` with proof, never filler work.
- A packet has Goal, Scope, Proof and Stop, owned paths and a done-when, or the keeper refuses it. Every helper ends with `RESULT: DONE|PARTIAL|BLOCKED|NOOP - <what> | proof: <where>`; BLOCKED and NOOP name the cause.
- When the batch returns, collect every result, then send the next batch in the same turn. A question you need answered now is one more Task in the batch. Never redo a helper's work yourself.

## The chain
- A writer seat carries `chain: start`. Its DONE gets the judge's review, which tops the next batch.
- Every writer is judged independently before it lands. A FAIL gets one repair by the writer; a second FAIL or a BLOCKED comes to you. A PASS comes to you to commit: by path, never `-A`, the proof's one-line result in the commit body.
- A round that moved nothing says why. A finding is a packet, not an essay. Research lands only with source, license, the row it feeds and a spike.

## Commit
- Commit verified paths only. Never `git add -A`, another session's files, a secret, or a force-push.

## Stop
- Ending a turn is not a stop. `[loop-keeper]` messages are not the owner.
- Stop only for the stop reasons in `/sprint`. Then write the handoff (lock token, what moved with SHAs, blockers, next), say PASS, PARTIAL or BLOCKED, release your own lock and end with `LOOP STOP: <reason>`.
- The keeper asks for a review before a stop is final: follow its GO, FIX, PIVOT or STOP.
