# ADOPT O-060
Change `listing/itch.md` ## Preview files item 1 `preview/cover_1920x1080.png` to `covers/from-design-studio/O-060/out-630x500.png` (banner/screenshot slot: `covers/from-design-studio/O-060/out.png`), then set that file as the itch.io cover image at publish.
Proof (factory BUILD.md/JUDGE.md, repo root): `python products/seasonal-3d-props/fall-65-prop-pack/src/selftest.py` (SELFTEST PASS); `python engine/publish_preflight.py products/seasonal-3d-props/fall-65-prop-pack` (RESULT PASS).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/seasonal-3d-props/fall-65-prop-pack/covers/from-design-studio/O-060/out-630x500.png`.
