# Tool orders (DS-81, 2026-10-05)

Center tool orders (O-038..O-041 pattern) land IN this repo, so
`--deliver` to a customer folder never applies. Delivered means:
chain-judge PASS + committed by path + one center inbox line naming
the paths. Then the row goes `delivered` with `delivered_path` the
in-repo artifact (dir or file). Adopted stays `no`: the customer is
center, adoption is a center pull, not a customer commit.
