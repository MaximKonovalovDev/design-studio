Pair: Heebo body 400,700 + Frank Ruhl Libre headings 400,700 (hebrew,latin via `fonts.mjs add heebo frank-ruhl-libre --subsets hebrew,latin`).
CSS: `<link rel="stylesheet" href="../../fonts/fonts.css">` then `font-family: "Frank Ruhl Libre","Heebo","Noto Sans Hebrew",Arial,sans-serif` (headings) / `"Heebo","Assistant","Noto Sans Hebrew",Arial,sans-serif` (body).
Faces: 8 woff2 `font-display:swap` (heebo/frank-ruhl-libre × hebrew/latin × 400/700); O-002 adds Inter 400,700 + Rubik 700 latin.
Proof: `node tools/fonts.mjs --check` FONTS PASS (12/12 blocks, hebrew file present, 4× OFL.txt, 160.9KB < 3MB).
Licence: OFL-1.1 per family (`fonts/<slug>/OFL.txt` from @fontsource LICENSE, npm view 2026-10-04; fontsource packager MIT).
