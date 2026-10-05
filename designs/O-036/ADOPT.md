# ADOPT O-036
Change `listing/itch.md` line `Cover: preview/cover-1280x720.png (thumb: cover-1280x720-thumb.png)` to `Cover: covers/from-design-studio/O-036/out-630x500.png` (banner/screenshot slot: `covers/from-design-studio/O-036/out.png`), then set that file as the itch.io cover image at publish.
Proof (factory's own, AGENTS.md): `node os/scripts/drift-check.mjs`; product gate (JUDGE.md): `python products/services/niche-playbook-etsy-printables/src/selftest.py` (SELFTEST: PASS).
Adopted when factory commits these identical bytes and points its listing at them: `git log -1 --format=%h -- products/services/niche-playbook-etsy-printables/covers/from-design-studio/O-036/out.png`.
