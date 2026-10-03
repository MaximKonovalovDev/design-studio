# design-studio needs

What the lane makers lack, one row each. The scout (Role `researcher`) wakes on a READY researcher row and lands licensed files into `packs/donors/`; the toolsmith (Role `builder`) wakes on a READY builder row and lands one tool. A maker who lacks an image, template, font, scene or command adds one row here naming its order and goes on with what it has. Status: READY, LATER (waits for the tool sprint, `sprint/queue/ready/000-tool-sprint.md`, whose last packet sets it READY), DONE (with the proof), BLOCKED (with the reason). A row is never deleted.

| ID | Status | Role | Order | Need | Tried first |
|---|---|---|---|---|---|
| NEED-01 | READY | researcher | O-005,O-007 | An icon pack: land the 3 open steal lines (heroicons 616b7a4, tabler v3.48.0, feather 3dc050d) as ONE `packs/donors/icons/` with licences. | `sprint/steals.md` open lines (donor and licence read, no files on disk yet) |
| NEED-02 | READY | researcher | O-004,O-012,O-015,O-016 | Real Kenney CC0 pack files pinned in `packs/donors/kenney-<pack>/` (the game kit has CSS shapes only) and two CC0 texture sets (neon grid, paper) for backdrops. | `kits/game-ui/LICENSE-kenney.txt` names the pack, the files were never fetched |
| NEED-03 | LATER | builder | O-007 | `tools/pdfcheck.mjs`: the text layer of a PDF (pdfjs-dist, Apache-2.0): real text, Hebrew order, page count. | none: the career maker has no PDF check |
| NEED-04 | LATER | builder | O-011 | `tools/atlas.mjs`: a PNG atlas plus JSON packer (maxrects-packer, MIT). | none: the game maker packs with Pillow by hand |
