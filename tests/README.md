# tests/
Node built-in test suite for tools and workflows.

Run one file:
  `node --test tests/brief.test.mjs`
Run all:
  `node --test tests/`

Open first: `brief.test.mjs` for the smallest example.
Add `<topic>.test.mjs` for new tool checks; keep them hermetic.
`.gitkeep` keeps the folder tracked when empty.
