# ADOPT O-063: cover:itch/game-dev-duo (factory)
1. Set the itch.io cover image to `out-630x500.png` (630x500); use `out.png` (1280x720) for the banner / 16:9 screenshot slot.
2. Commit only: `git -C C:/Users/me/Desktop/autonomous-factory add products/game-dev-2d/game-dev-duo/covers/from-design-studio/O-063`.
3. Proof in factory: `git log -1 --format=%h -- products/game-dev-2d/game-dev-duo/covers/from-design-studio/O-063/out.png`.
4. Here: `node tools/orders-check.mjs --deliver O-063 --check` must print DELIVER CHECK PASS.
