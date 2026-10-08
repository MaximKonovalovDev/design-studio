# Rot scan — design-studio — 2026-10-08 (lead2, read-only scan, no sprint, no commit)

Ages vs today 2026-10-08 (UTC). One line per item: age + verdict (keep/fix/close).

## Stale docs (older than 7d rule: confusing if older than 7d; near-stale flagged)

- docs/TOOLCHAIN.md (2026-10-03, 5d) — export matrix promises out.svg (satori lane) + out.pdf (print-to-pdf) "when the lane lands"; probes today: satori-in-render False, no satori/og-image/tailwind refs in tools; pipeline says Figma-ready via tools/figma.mjs mapping but figma --check = mapping retired DS-78c verdict-gate only; image lane (tools/image.mjs) exists but line 29 "Not used by any code path yet" — verdict: FIX (update export matrix + figma line, mark svg/pdf unparked-or-dropped).
- VISION.md (2026-10-03, 5d) + VISION-TABLES.md (2026-10-04, 4d) Parts Swept 2026-10-02/2026-10-03 (5-6d) — freshness rule needs a Parts sweep within 3d; every Parts row is 5-6d stale — verdict: FIX (re-sweep oldest row first or record why-not).
- Steal map S05-S20 Last read 2026-10-02 (6d), S01-S04 2026-10-03 (5d) — 7d read rule nearly breached on 16 rows — verdict: FIX (researcher reads oldest row S05 next).
- G1/G3 edge claims sourced 2026-10-02/2026-10-03 (5-6d) — rivals moved since (v0 docs/agents.md 2026-10-06, Figma code-to-canvas 2026-10-07); board DS-87 + DS-101 open to re-read — verdict: FIX via DS-87/DS-101 (evidence to refresh, not to delete).
- FINISH-LINE.md (2026-10-03, 5d) bars D1-D5, no U1 — DS-90 (2026-10-07, 1d) wants USED-bar U1; U1/USED probe 0 hits — verdict: KEEP (fresh row owns it, doc not yet stale).

## Promises with no code (rg each promise name in tools/ — probes run 2026-10-08)

- DS-49 satori SVG-to-PNG (PARKED 2026-10-03, 5d) — 0 refs (satori probe False) — verdict: KEEP PARKED (unpark only on open-order need).
- DS-50 og-image template pipeline (PARKED 2026-10-03, 5d) — 0 refs (og-image probe False); need met by sharp thumbs DS-80 8e75b05 — verdict: KEEP PARKED (or CLOSE as superseded).
- DS-52 tailwind block port (PARKED 2026-10-03, 5d) — 0 refs (tailwind probe False, CDN-in-skills only) — verdict: KEEP PARKED.
- DS-62 image slot manifest / DS-63 device-frame wrapper (PARKED 2026-10-03, 5d) — card 2026-10-03-images-041b.md C2/C3 judged, homes exist but no order needs them — verdict: KEEP PARKED.
- DS-54..DS-61 self-dev loop (PARKED 2026-10-03, 5d) — Test-Path tools/part-score.mjs False, no team/ dir; parked on center pilot scope — verdict: KEEP PARKED (close only if center never extends pilot).
- DS-70 live factory receipt (PARKED 2026-10-04, 4d) — 0 non-local URLs, blocked on Cloudflare token (not owner approval) — verdict: KEEP PARKED.
- DS-93 claims gate (READY 2026-10-07, 1d) — Test-Path tools/claims-check.mjs False — verdict: KEEP (fresh, not rot).
- DS-95 SHIP-needs-USED (READY 2026-10-07, 1d) — used/orders.csv probe in tools/judge.mjs 0 hits — verdict: KEEP (fresh, not rot).
- tools/image.mjs free lane (DS-66/DS-84/DS-91) — file comments "Not used by any code path yet", paid refused at budget 0 by design — verdict: FIX (attach to a named cover order or park explicitly).

## Research cards naming actions nobody took

- research/cards/2026-10-02-*.md 6 cards (2026-10-02, 6d) — steals either landed (tokens/game-ui) or parked (DS-49..53); loose-card shape vs DS-58 one-scout rule — verdict: KEEP (dated evidence, do not delete; stop new loose cards per contract).
- research/cards/2026-10-03-*.md 4 cards (2026-10-03, 5d) — 2026-10-03-images-041b.md C2/C3 still PARKED as DS-62/63; rival-measure r1 folded into G1 — verdict: KEEP.
- research/cards/2026-10-07-s19-parked-steal-consumers.md (2026-10-06, 2d) — 3 needs landed-or-rejected with proof lines, 4 parked with unpark conditions — verdict: KEEP (fresh closure note).

## sprint/notes older than 7 days still blocking

- NONE older than 7d: oldest notes are 5d (pilot-view-2026-10-03-r36/r41/r42.md, out-untrack-2026-10-03.md) + r44/r45 (4-5d) — all record verified-fixed defects (046/047/048/049/050/052), no open action — verdict: CLOSE (archive-safe, no blocker).
- sprint/notes/orders-drift-2026-10-06.md (2026-10-06, 2d) — O-015 since flipped adopted (DS-98 DONE 9a4c58e); O-056/O-057 open-vs-adopted contradictions pre-existing Maxim-wave rows — verdict: FIX (re-verify O-056/O-057 only, note otherwise spent).
- sprint/notes/trim-plan-2026-10-07.md (2026-10-07, 1d) — live working plan for DS-100 P1-P5, numbers current — verdict: KEEP.

## Confusing-but-fresh (flagged, not rot)

- sprint/inbox.md Open section (2026-10-07, 1d) — every EB line ticked [x] yet most map to board READY rows (DS-85..DS-102), so open-plus-checked reads as done-while-READY — verdict: FIX (convention: tick = rowed not done; or untick until DONE).