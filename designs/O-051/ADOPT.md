# ADOPT O-051
Change `listing/itch.md` ## Cover + screenshots Cover (itch slot) `preview/cover-1280x720.png` to `covers/from-design-studio/O-051/out-630x500.png` (banner/screenshot slot: `covers/from-design-studio/O-051/out.png`), then set that file as the itch.io cover image at publish.
Proof (factory JUDGE.md): `python src/selftest.py` (product dir, SELFTEST PASS); `python engine/publish_preflight.py products/services/aeo-geo-audit` (repo root, RESULT PASS).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/services/aeo-geo-audit/covers/from-design-studio/O-051/out-630x500.png`.
