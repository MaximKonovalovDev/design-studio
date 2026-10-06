# ADOPT O-062
Change `listing/itch.md` ## Images item 2 `preview/cover-630x500.png` to `covers/from-design-studio/O-062/out-630x500.png` (banner/screenshot slot: `covers/from-design-studio/O-062/out.png`), then set that file as the itch.io cover image at publish.
Proof (factory BUILD.md): `python src/selftest.py` (product dir, SELFTEST PASS); `python engine/publish_preflight.py products/game-dev-bundle/game-dev-asset-bundle` (repo root, RESULT PASS).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/game-dev-bundle/game-dev-asset-bundle/covers/from-design-studio/O-062/out-630x500.png`.
