# ADOPT O-046
Change `listing/gumroad.md` ## Images item 1 `preview/cover-1280x720.png` to `covers/from-design-studio/O-046/out.png` (store card: `covers/from-design-studio/O-046/out-630x500.png`), then set `out.png` as the Gumroad cover image at publish.
Proof (factory BUILD.md:140-143): `python src/selftest.py` (product dir, 83 passed / SELFTEST PASS); regen `python src/generate.py` (GENERATE OK).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/services/forge-engine2040-launch-system/covers/from-design-studio/O-046/out.png`.
