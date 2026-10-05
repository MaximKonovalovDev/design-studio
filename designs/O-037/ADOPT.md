# ADOPT O-037
Change `listing/itch.md` line `- preview/cover-630x500.png (630x500 store cover)` to `- covers/from-design-studio/O-037/out-630x500.png (630x500 store cover)` (hero/screenshot slot: `covers/from-design-studio/O-037/out.png`), then set that file as the itch.io cover image at publish.
Proof (factory's own, AGENTS.md): `node os/scripts/drift-check.mjs`; product gate (JUDGE.md): `python products/services/niche-playbook-income-seekers/src/selftest.py` (SELFTEST: PASS).
Adopted when factory commits these identical bytes and points its listing at them: `git log -1 --format=%h -- products/services/niche-playbook-income-seekers/covers/from-design-studio/O-037/out.png`.
