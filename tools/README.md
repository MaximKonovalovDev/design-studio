# tools

The scripts that build, render, audit, judge and ship the designs.
Each file does one job. The file name says which one.

Run the suite (the proof, 11 samples): `node tools/check.mjs`. It ends with RESULT PASS or exits 1.
Node only. Python is optional.

Open these first:
- `check.mjs`: the suite. Runs the loop check, then renders and audits every sample.
- `render.mjs`: brief HTML to PNG, using the Edge or Chrome on this PC.
- `audit.mjs`: the design audit (contrast and parity checks).
- `orders-check.mjs`: order book checks and delivery to customer repos.
- `donor.mjs`: makes the Open Design donor clone (`node tools/donor.mjs open-design`).

Subfolders: `pil/` and `brand-cards/` are Python helpers. `ps/` and `figma/` hold short notes.

Tests for these scripts are in `tests/`. Tool installs stay in this folder, never machine-wide.
