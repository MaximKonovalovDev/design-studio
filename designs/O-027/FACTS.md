# FACTS O-027: every number on the page and where it comes from

Sources (fp-research, read 2026-10-04): `scoreboard.md` (generated 2026-10-04T13:11:31Z) and `findings/arms-race.md`. Nothing else.

| Number on the page | Where | Source file | Line |
|---|---|---|---|
| 100/100 | stat 1 | scoreboard.md | 51 (row `all`, every class A0 to A5) |
| "challenged or blocked" | stat 1 label | scoreboard.md | 44 ("challenge or block over runs") |
| 3 own test sites | stat 1, method | scoreboard.md | 36 ("3 of 3 own targets live") |
| A0 to A5 | stat 1, proof | scoreboard.md | 7 to 12 |
| 0.0% | stat 2 | scoreboard.md | 15 (human FPR, scripted-human runs) |
| 5 scripted humans, worst score 2 | stat 2, proof, fine print | scoreboard.md | 32 (5 sessions, worst fused=2); row 13 (fused 2, allow) |
| 0.20 ms | stat 3 | scoreboard.md | 16 (p95, in-process) |
| 44 runs | stat 3 | scoreboard.md | 16 (n=44) |
| 0.10 ms | stat 3 | scoreboard.md | 16 (mean) |
| every attacker class challenged, every human allowed | proof text | scoreboard.md | 7 to 13 (action column) |
| A2 to A5 in real browsers, simulated attackers | method | scoreboard.md | 44 (A2-A5 REAL browsers; A0-A1 stdlib clients) |
| 4 October 2026 | meta, date | scoreboard.md | 3 (generated 2026-10-04) and 44 (volume runs 2026-10-04) |
| A4 and A5 missed on 1 October | what it does 3 | arms-race.md | 22 (section 2026-10-01T22:10Z), rows 30 and 31 (missed, fused 5 and 6) |
| A4 and A5 challenged on 4 October | what it does 3 | arms-race.md, scoreboard.md | arms-race 192 (section 2026-10-04T11:28Z), rows 200 and 201; scoreboard rows 11 and 12 |
| allow, slow, challenge or block | how it works 3 | scoreboard.md | 22 (lane levels allow, slow, challenge, block, unknown) |
| one layer alone can raise a challenge, never a block | how it works 2 | scoreboard.md | 31 ("single layer >= 90 caps at challenge"; the 90 is not printed on the page) |
| layers: network, script, automation, behavior, agent | how it works 1 | scoreboard.md | 5 (columns net, js, auto, behavior, agent) |

Not numbers from the sources: the step badges 1 2 3 and the section counters 01 02 03 are the template's own numbering. No price, no length of pilot, no customer name, no contact address is printed.

Honest limits printed on the page: lab results on our own test sites with simulated attackers; the 0.0% rests on 5 sessions; latency is in process (scoreboard.md line 16, VISION.md "simulated by stdlib scenarios until K-25").
