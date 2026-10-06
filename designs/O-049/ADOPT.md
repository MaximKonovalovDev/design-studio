# ADOPT O-049
Change `listing/gumroad.md` ## Images item 1 `preview/cover-gumroad.png` to `covers/from-design-studio/O-049/out.png` (store card: `covers/from-design-studio/O-049/out-630x500.png`), then set `out.png` as the Gumroad cover image at publish.
Proof (factory BUILD.md/JUDGE.md): `python src/selftest.py` (product dir, RESULT PASS); `python engine/publish_preflight.py products/seasonal-tax/mileage-kit` (repo root, RESULT PASS).
Adopted when factory commits identical bytes and points its listing at them: `git log -1 --format=%h -- products/seasonal-tax/mileage-kit/covers/from-design-studio/O-049/out.png`.
