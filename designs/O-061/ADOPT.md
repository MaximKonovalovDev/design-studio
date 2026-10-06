# ADOPT O-061
Change `listing/itch.md` ## Images item 1 `preview/cover-od-2000x2000.png` to `covers/from-design-studio/O-061/out-630x500.png` (banner/screenshot slot: `covers/from-design-studio/O-061/out.png`), then set that file as the itch.io cover image at publish.
Proof (factory BUILD.md + AGENTS.md): `python products/niche-business-system/freelancer-launch-kit-vol1/src/selftest.py` (studio root, SELFTEST PASS); `node os/scripts/drift-check.mjs` (repo root).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/niche-business-system/freelancer-launch-kit-vol1/covers/from-design-studio/O-061/out-630x500.png`.
