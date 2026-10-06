# ADOPT O-052
Change `listing/itch.md` **Images** item 1 `preview/cover.png` to `covers/from-design-studio/O-052/out-630x500.png` (banner/screenshot slot: `covers/from-design-studio/O-052/out.png`), then set that file as the itch.io cover image at publish.
Proof (factory BUILD.md/JUDGE.md): `python src/selftest.py` (product dir, SELFTEST PASS); `python engine/publish_preflight.py products/social-media-carousel/carousel-template-studio` (repo root, RESULT PASS).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/social-media-carousel/carousel-template-studio/covers/from-design-studio/O-052/out-630x500.png`.
