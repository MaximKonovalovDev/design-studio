# ADOPT O-056
Change `listing/itch.md` ## Preview files item 1 `preview/cover.png` to `covers/from-design-studio/O-056/out-630x500.png` (banner/screenshot slot: `covers/from-design-studio/O-056/out.png`), then set that file as the itch.io cover image at publish.
Proof (factory BUILD.md/JUDGE.md): `python src/selftest.py` (product dir, SELFTEST PASS); `python engine/publish_preflight.py products/character-animation-studio/character-animation-studio` (repo root, RESULT PASS).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/character-animation-studio/character-animation-studio/covers/from-design-studio/O-056/out-630x500.png`.
