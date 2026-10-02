# 028 hero reflow — run note (2026-10-02T13:20Z)

Goal: hero ad 10/10 at every matrix size.
Fix: `samples/ads/hero/brief.json` title_px 88→78, title_box [0.08,0.3,0.92,0.55]→[0.05,0.3,0.95,0.55]; `page.html` .hero 1075px→1152px (max-width 90%), h1 88px→`clamp(60px,6.1vw,78px)` (78px at native 1280). Re-rendered out.png (1280x720, 42384B). No gate touched.
Proof: `node tools/audit.mjs samples/ads/hero/brief.json` → AUDIT PASS (all 22 green, per-size fits 1152/972/1080px vs need 936px); `node tools/judge.mjs` → SHIP 10/10; render opened by eye — same finished hero; `node tools/check.mjs` → RESULT PASS.
Note: brief.json numbers had to move with the CSS — audit's title-fits gate reads brief.json only, so a page.html-only edit could never flip it. Next: lead commits hero files only.
