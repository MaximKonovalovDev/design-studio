# ADOPT O-048
Change `listing/gumroad.md` ## Images item 1 `preview/cover-1280x720.png` to `covers/from-design-studio/O-048/out.png` (store card: `covers/from-design-studio/O-048/out-630x500.png`), then set that file as the Gumroad cover image at publish.
Proof (factory board/lines.md GG-01): `python products/game-suite/indie-game-suite/src/selftest.py` (product dir `python src/selftest.py`, N/N pass); `python engine/publish_preflight.py products/game-suite/indie-game-suite` (repo root, RESULT PASS).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/game-suite/indie-game-suite/covers/from-design-studio/O-048/out.png`.
