# DS-80 S60 Edge-free thumb proof (designs/job/thumbs/)

Source: the judged-PASS design `designs/O-001/` (BookForge Pro cover,
1280x720, brief gate 065 PASS 9aafa07 family).

Built with NO browser:
`node tools/thumb.mjs designs/O-001/brief.json designs/job/thumbs/thumb-256.png --sharp`
-> `thumb-256.png` 256x144 39916B via sharp (downscale of `designs/O-001/out.png`).

Edge-rendered reference: `designs/O-001/thumb-256.png` 256x144 22142B
(same brief, Edge iframe path, kept as fallback).

Comparison (same pixels, different resampling):
- dims: identical 256x144, aspect kept.
- bytes: sharp 39916B vs Edge 22142B — both far above the 1024B
  blank-floor, so the audit's title-legible gate passes on either.
- pixel diff (raw RGBA, 36864 px): mean abs 3.11/255, max 224 on a few
  text-edge pixels. Same image, same verdict: title legible at 256px.

License: sharp 0.35.5 Apache-2.0, pinned exact in package.json +
package-lock.json, installed in-repo only (node_modules/); full text in
SHARP-LICENSE.txt (copy of node_modules/sharp/LICENSE).
