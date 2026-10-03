# pilot-view 2026-10-02 r9 (conversion-path stranger run)

Walked the conversion path as a stranger: registry templates (blocks+pages), convert A/B + plan.json, game-UI kit (hud/menu/buttons), ads set renders. Ran the three packet checks; opened every capture below.

## Proof commands (pasted one-line results)

- `node tools/registry.mjs --check` REGISTRY PASS: 10 blocks + 4 templates, 0 hardcoded colors
- `node tools/convert.mjs --check` CONVERT PASS: 2 variants differ, click plan covers A+B, metric named
- `node tools/game-ui.mjs --serve --check` GAME-UI PASS: HUD + menu + button kit, tokens/states/icons/sizes/import green

## Captures opened (all verified intentional)

- templates/blocks/hero.html + cta.html: slots KICKER/TITLE/SUBTITLE + single ACTION link, var(--*) only.
- templates/pages/cover.html (1280x720 hero+cta) + ad-square.html (1080x1080) + story.html (1080x1920 hero+feature-grid+cta) + capsule.html (616x353): all dir set, size tags match registry, 0 hex.
- convert/variants/a.html (control "Ship the landing tonight" + Get the kit href) vs b.html (challenger proof bar + "Every pixel earns its place" + Start from this page href): headlines differ, single .cta link each, plan.json 6 steps covers a:h1/.sub/.cta + b:.proof/h1/.cta with metric named.
- kits/game-ui/hud.html (health+mana+score+pause, 44px targets, 3 inline 24px stroke SVGs) + menu.html (ENGINE 2040 Start/Options/Quit-locked, 3 SVGs) + buttons.css (base/primary/hover/active/disabled/focus-visible) + manifest.json (3 pieces, Lucide ISC + Kenney CC0 tracked, touchMin 44, forge+engine2040 imports): serve tags data-engine present, two-link imports present.
- samples/ads/ad-1/out.png (DESIGN THAT SELLS + Get the kit + 4:4/256px/Judged strip) + ad-2/out.png (THUMBNAIL-FIRST ADS + See the proof + 22px/0/10-10 strip) + ad-3/out.png (SHIP IT TONIGHT 1200x628 + sidebar) + hero/out.png (Ship the landing tonight + Get the kit): all full-bleed, CTA visible, titles bold. Thumbs ad-1/thumb-256.png + hero/thumb-256.png opened: miniatures readable, CTA survives at 256px.

## Regression verify (do-not-refile list — all verified, none re-filed)

- 002 thumb sliver / 011 ad-square blank / 014 cv blank / 015 no-thumb / 018 readme-stale: prior r8 note verified FIXED/LANDED; this run's thumbs are real miniatures and checks stay green, so none re-filed.
- 008 missing commands: out of this packet's scope; the three packet commands exist and pass, stubs not probed this round.
- Known non-defect noted but NOT filed: templates/pages cover + ad-square + story + capsule CTAs are spans (pattern placeholders) while convert variants carry real hrefs — registry gate counts them as actions and convert is the clickable lane, so no stranger-facing break; filing would be a gate-tightening enhancement, not a new defect.

## New defects filed (0)

No new packets in `sprint/queue/ready/`. Every conversion-path pixel reads intentional at full size and at 256px; all three proof commands PASS.
