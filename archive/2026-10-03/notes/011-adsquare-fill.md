# 011 ad-square fill — run note (2026-10-03)

Goal: square creative reads finished at 1080x1080 and 256px, like the other three samples.
State on disk: proof strip + accent footer (dcc2d73) already grounded the
canvas bottom, but `.main` used `justify-content: center`, pooling ~140px of
dead paper above the kicker and below the CTA — hero floated mid-canvas.
Fix (`samples/ad-square/page.html` CSS only, no text touched):
`.main { justify-content: center; padding: 48px 86px 40px; }` →
`.main { justify-content: space-evenly; padding: 56px 86px; }`.
Slack now distributes evenly between kicker/title/sub/CTA instead of pooling
at the edges; title DESIGN THAT SELLS + sub + CTA Get the kit verbatim,
colors still 100% var(--*) via tokens.css. No audit gate added (pixel-fill
gate would risk the other five samples; judge 017 needs none).
Proof: `node tools/check.mjs` → RESULT PASS (loop 20/20; ad-square
1080x1080 50914B thumb 256x256 9134B); `node tools/audit.mjs
samples/ad-square/brief.json` → AUDIT PASS (22.8px at 256px, need ~816px in
907px box, matrix green); out.png + thumb-256.png opened: kicker → title →
sub → CTA step evenly down the canvas, proof strip + footer ground the
bottom, no blank band at either size.
Next: lead commits samples/ad-square/page.html only (plus regenerated
out.png/thumb/design-audit.json from the check run).
