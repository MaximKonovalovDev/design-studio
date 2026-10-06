# ADOPT O-047
Change `listing/Gumroad.md` ## Images item 1 `preview/cover-od-2000x2000.png` to `covers/from-design-studio/O-047/out.png` (store card: `covers/from-design-studio/O-047/out-630x500.png`), then set `out.png` as the Gumroad cover image at publish.
Proof (factory BUILD.md + AGENTS.md): `python products/niche-business-system/freelancer-launch-kit-vol1/src/selftest.py` (studio root, SELFTEST PASS); `node os/scripts/drift-check.mjs` (repo root).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/niche-business-system/freelancer-launch-kit-vol1/covers/from-design-studio/O-047/out.png`.
