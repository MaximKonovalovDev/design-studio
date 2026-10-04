# SLOTS: O-007 CV layout (Hebrew-first RTL A4 + EN LTR twin)

One A4 page, one column, real text only. `page.html` (he, rtl) and `page-en.html` (en, ltr) carry the same slots in the same order. The styles are `cv.css` (inlined in both pages). Colors and fonts come only from `tokens.css`; `--scale` (1 down to 0.8) shrinks the type when a fill is long.

| Order | Slot (`data-slot`) | Element | What goes in |
|---|---|---|---|
| 1 | `header.kicker` | `.kicker` | city and target role |
| 1 | `header.name` | `h1` | full name |
| 1 | `header.headline` | `.tagline` | one professional headline |
| 1 | `header.contact` | `.contact` span per item | email (link), phone, profile link, city |
| 2 | `summary.text` | `p.summary` | two or three sentences |
| 3 | `stack.items` | `.skills` > `.pill` | one pill per tool, 8 to 14 |
| 4 | `proofs.items` | `.job` x 5 | `.role` project, `.years` year or metric, `.desc` one sentence with one number |
| 5 | `role-fit.items` | `.job` x 3 | score, matches, gaps to close |
| 6 | `next-learning.items` | `ul.learn` > `li` | topic: why and when |
| 6 | `next-learning.status` | `p.langs` | draft or waiting for approval |

Rules the layout keeps
- Mixed Hebrew and English: every Latin run inside Hebrew text (a tool, a company, an email, a URL) sits in `<bdi dir="ltr">...</bdi>`, the HTML form of LRI ... PDI. Punctuation next to it never jumps sides.
- Logical CSS only (`inline-start`, `block-end`), no `left` or `right`, no `row-reverse`, no text in images, no tables, no columns.
- Print: `@page { size: A4; margin: 0 }`; `node tools/render.mjs --pdf page.html cv-he.pdf` (Edge headless) gives one page with a real text layer (`pdf-check.txt`).
- Class names are the ones `tools/cv-render.mjs` in jobhunt already writes: `page`, `kicker`, `h1`, `tagline`, `h2`, `job`, `job-head`, `role`, `years`, `desc`, `skills`, `pill`, `langs`, `contact`; `cv.css` can replace its `cv-kit.css`.
- Placeholders only in this folder: no name, email, phone or employer of a real person.
