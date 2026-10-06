# ADOPT O-057
Change `listing/itch.md` ## Preview files item 1 `preview/cover.png` to `covers/from-design-studio/O-057/out-630x500.png` (banner/screenshot slot: `covers/from-design-studio/O-057/out.png`), then set that file as the itch.io cover image at publish.
Proof (factory BUILD.md/JUDGE.md): `python products/character-animation-studio/sci-fi-crew-vol2/src/selftest.py` (repo root, SELFTEST PASS); `python engine/publish_preflight.py products/character-animation-studio/sci-fi-crew-vol2` (repo root, RESULT PASS).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/character-animation-studio/sci-fi-crew-vol2/covers/from-design-studio/O-057/out-630x500.png`.
