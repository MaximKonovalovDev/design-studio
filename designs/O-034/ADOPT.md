# ADOPT O-034: cover:itch/gameplay-data-kit (factory)
1. Change: in the itch dashboard set the cover image to `covers/from-design-studio/O-034/out-630x500.png` (16:9 slot: `out.png`); mirror `listing/itch.md` Images line 47 (`preview/cover-630x500.png`).
2. Stage only this folder: `git -C <factory> add products/engine-data/gameplay-data-kit/covers/from-design-studio/O-034` (touch nothing outside it).
3. Proof: `git -C <factory> log -1 --format=%h -- products/engine-data/gameplay-data-kit/covers/from-design-studio/O-034/out-630x500.png` (AGENTS.md Adopted rule).
4. Placeholders only; no personal data in this pack.
