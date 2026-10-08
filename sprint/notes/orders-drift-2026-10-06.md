# Orders drift verify-only — 2026-10-06 (factory disk check, O-015 / O-056 / O-057)

Verify-only. No edit to `orders.csv`, no customer file touched. Working tree only.
Read-only sources: `orders.csv` rows below + factory disk under `C:/empire/autonomous-factory`.

## orders.csv claims (read 2026-10-06, NOT edited)
- O-015: `cover:itch/medieval-warriors-vol4`, status=adopted, delivered_path=designs/O-015, adopted=yes, adopted_commit=disk
- O-056: `cover:itch/character-animation-studio`, status=open, delivered_path=(empty), adopted=yes, adopted_commit=`disk (product PNGs gitignored by design)`
- O-057: `cover:itch/sci-fi-crew-vol2`, status=open, delivered_path=(empty), adopted=yes, adopted_commit=`disk (product PNGs gitignored by design)`

## Factory disk — cover PNGs (name + bytes + sha256; ALL gitignored by design)
`git check-ignore -v` (autonomous-factory):
- `.gitignore:51:products/**/*.png` matches every `covers/from-design-studio/*.png`
- `.gitignore:60:products/**/preview/*` matches every `preview/cover.png`
`git status --porcelain -- <three product dirs>` = clean (ignored files do not show). So "disk" can never become a commit hash for a PNG — by repo design.

### O-015 — products/character-animation-studio/medieval-warriors-vol4
- covers/from-design-studio/O-015-cover-1280x720.png — 79866 bytes — sha256 7F92CBC30A8DCBE5C59A61A7EF7FD27BC2260DA7771E97A3081A27C4F77F6AAE
- covers/from-design-studio/O-015-cover-630x500.png — 38250 bytes — sha256 31216FACA935F4240553653175B33FA229B0C469E03D921C3A2E6986C1D088BB
- covers/from-design-studio/O-015/out.png — 80084 bytes — sha256 4312CE7C2C155FDD0EFCBCDB822C5A3B39ADE40AE982E9FBF7560B1E3D985362
- covers/from-design-studio/O-015/out-630x500.png — 38402 bytes — sha256 F2A47A373D1A8AB81568930EFDF6465C3CA0A50F7FA27848138092A5AE4EADA2
- preview/cover.png — 38402 bytes — sha256 F2A47A373D1A8AB81568930EFDF6465C3CA0A50F7FA27848138092A5AE4EADA2 (= out-630x500.png byte-identical; DIFFERS from O-015-cover-630x500.png by 152 bytes / different hash)
- preview/cover-pre-O015.png (old cover kept) — sha256 21F8F7C31A512814C330B42CE687D4CCA762F57E92E447BA58669D7D89342161
- listing/itch.md ## Preview files item 1: `preview/cover.png — 630x500 cover first, O-015 re-cover (design-studio delivered 2026-10-04)... old cover kept as preview/cover-pre-O015.png` + `coveradopt 2026-10-04 (lister LS-10): O-015 re-cover delivered ... adopted to preview/cover.png`.
- Listing points at: preview/cover.png (design-studio bytes via O-015/out-630x500.png path, NOT via the top-level O-015-cover-630x500.png copy).

### O-056 — products/character-animation-studio/character-animation-studio
- covers/from-design-studio/O-056-cover-1280x720.png — 234466 bytes — sha256 D41E45757F30E1212BB81381EEC93F6B07F8A54F65EC366DDBDDE0C0DD455258
- covers/from-design-studio/O-056-cover-630x500.png — 113445 bytes — sha256 3B01785F89C5567BB758D1B02C55C84CB4A597C1A1136E58B85FC8FFAF6ECEBD
- preview/cover.png — 43298 bytes — sha256 47606231A053AB2BC90862599B0C0CA578ACBA3F4580BCCFE1BDED4435194FD6 (matches NEITHER delivered file; also differs from preview/cover-od-a-630x500.png C978449E... and cover-od-b-630x500.png 2608E366... and cover-v1-shipped.png 56DABEAE...)
- listing/itch.md ## Preview files item 1: `preview/cover.png — 630x500 cover first, 8 walk directions labeled plus 3-char strip` — no O-056 mention, no design-studio credit, no coveradopt line anywhere in the file.
- Listing points at: preview/cover.png (factory file, NOT either O-056 delivered PNG).

### O-057 — products/character-animation-studio/sci-fi-crew-vol2
- covers/from-design-studio/O-057-cover-1280x720.png — 230244 bytes — sha256 F8199EC47C0B8D1107400837CBA2574E7CCE7038E5407777F935D751512B11B2
- covers/from-design-studio/O-057-cover-630x500.png — 110705 bytes — sha256 BC4707629AE3783B22E0F5AB30338BD4632A6E0AF3E9E925F612D59DD35EA962
- preview/cover.png — 29911 bytes — sha256 74A7F47305093ADC6F010B63CB6642C4CFB6A0DA33E736964507BE267E3ED31B (= preview/cover-od-630x500.png byte-identical, factory od cover; DIFFERS from O-057-cover-630x500.png; also differs from cover-pre-od.png BE746F5F...)
- listing/itch.md ## Preview files item 1: `preview/cover.png — 630x500 cover first, 8 walk directions labeled plus 3-crew strip` — no O-057 mention, no design-studio credit, no coveradopt line anywhere in the file.
- Listing points at: preview/cover.png (factory od file, NOT either O-057 delivered PNG).

## Verdicts (disk-claim check)
- O-015: ADOPTED-DISK PARTIAL — design-studio bytes ARE live at preview/cover.png (via O-015/out-630x500.png, sha256 F2A47A37...), listing explicitly credits O-015 re-cover; BUT the canonical from-design-studio top-level copy O-015-cover-630x500.png (31216FAC...) is NOT byte-identical to what the listing points at. `orders.csv` adopted_commit=disk is not a commit hash (and cannot be: PNGs gitignored).
- O-056: ADOPTED-DISK no — delivered O-056 PNGs exist on factory disk (hashes above) but listing/itch.md points at preview/cover.png (47606231...), a factory file byte-different from both delivered PNGs; no O-056/coveradopt reference in the listing. Plus orders.csv status=open contradicts adopted=yes.
- O-057: ADOPTED-DISK no — delivered O-057 PNGs exist on factory disk (hashes above) but listing/itch.md points at preview/cover.png (74A7F473... = factory cover-od-630x500.png), byte-different from both delivered PNGs; no O-057/coveradopt reference in the listing. Plus orders.csv status=open contradicts adopted=yes.

## Proof (unchanged, expected)
`node tools/orders-check.mjs` (run 2026-10-06, design-studio tree):
`ORDERS FAIL: 65 orders (17 open, 0 building, 15 delivered, 33 adopted, 0 rejected), 5 problems`
Full FAIL lines: O-015 adopted-needs-commit-hash; O-056 adopted-yes-vs-status-open; O-056 adopted_commit-while-open; O-057 adopted-yes-vs-status-open; O-057 adopted_commit-while-open. All five are pre-existing Maxim-wave rows; nothing edited.

## Lead decision (no action taken here)
- OPTION A (OWNER row): correct the three rows by hand (O-015 adopted_commit → real customer commit or back to delivered; O-056/O-057 status open + adopted/adopted_commit cleared until a real listing-point + commit exists).
- OPTION B (tool change): teach orders-check/judge a "disk" lane for gitignored product PNGs (hash + listing-points-at equality instead of commit hash). Until then ORDERS PASS stays blocked and judges will keep flagging it.
