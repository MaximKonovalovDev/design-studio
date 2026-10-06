# ADOPT O-045
Change `listing/gumroad.md` ## Images item 1 `preview/cover-1280x720.png` to `covers/from-design-studio/O-045/out.png` (store card `preview/cover-630x500.png` to `covers/from-design-studio/O-045/out-630x500.png`), then set `out.png` as the Gumroad cover image at publish.
Proof (factory BUILD.md + JUDGE.md): `python products/services/content-engine-service/src/selftest.py` (repo root, SELFTEST PASS); `python src/selftest.py` (product dir, 39 passed).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/services/content-engine-service/covers/from-design-studio/O-045/out.png`.
