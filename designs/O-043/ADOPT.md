# ADOPT O-043
Change `listing/gumroad.md` ## Images item 1 `preview/cover-1280x720.png` to `covers/from-design-studio/O-043/out.png` (store card: `covers/from-design-studio/O-043/out-630x500.png`), then set that file as the Gumroad cover image at publish.
Proof (factory JUDGE.md): `python src/selftest.py` (product dir, SELFTEST PASS); `python engine/publish_preflight.py products/services/aeo-geo-audit` (repo root, RESULT PASS).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/services/aeo-geo-audit/covers/from-design-studio/O-043/out.png`.
