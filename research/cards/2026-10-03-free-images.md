# Free image lanes sweep — packet 043 (2026-10-03)

Goal: free image lanes we can use now: OpenRouter :free image models plus no-key CC0 stock.
Scope: OpenRouter docs https://openrouter.ai/models + https://openrouter.ai/docs, VISION.md Steal S13/S18/S19, tools/render.mjs, tools/canvas.mjs, samples/ads/. Zero GitHub reads this run (no 429; GitHub untouched). Zero web searches this run (all OpenRouter reads via direct fetch live below). All cards idea-only, 0 lines copied (proprietary docs = idea only per repo rule). API keys stay in env, never in repo — no secret printed or committed.

## Live reads (2026-10-03)

- https://openrouter.ai/docs/guides/overview/multimodal/image-generation — read live: dedicated Image API `POST /api/v1/images` {model, prompt, n, resolution, aspect_ratio, size, quality, output_format, background, output_compression, seed, stream, input_references, provider.only/order/ignore/sort/allow_fallbacks/options}, response `{data:[{b64_json, media_type}], usage:{cost}}`, SSE `image_generation.partial_image/completed/error` + `[DONE]`, billing all-or-nothing (completed billed full, failed/cancelled 502 not billed). Example `bytedance-seed/seedream-4.5`, discovery `GET /api/v1/images/models` + `/endpoints` with `supported_parameters` enum/range/boolean + `pricing[{billable: output_image, unit: image|megapixel|token, cost_usd}]`. | License: proprietary docs, idea only.
- https://openrouter.ai/models?output_modalities=image — read live 2026-10-03: top image rows are priced (ByteDance Seedream 5.0 Flash from $0.018/image; Black Forest Labs FLUX.3 Image from $0.0205/image, 50% off). Only `:free` rows on the page are non-image (Apodex 1.1 Mini :free reasoning-first text; Inception Mercury Decide :free structured-decision System One). Zero `$0` / `:free` image-output entries observed. | License: proprietary page, idea only.
- https://openrouter.ai/docs/guides/routing/model-variants/free — read live: append `:free` to a model slug that lists a free entry (`meta-llama/llama-3.2-3b-instruct:free`); free version is its own catalog entry with own pricing/endpoints/rate limits; only models that list one support it. | License: proprietary docs, idea only.
- https://openrouter.ai/docs (quickstart) — read live: `Authorization: Bearer <OPENROUTER_API_KEY>`, optional HTTP-Referer/X-Title for rankings; key from env, never in repo. | License: proprietary docs, idea only.
- Prior-run CC0/no-key stock context (re-stated, not re-fetched this run; dates carried): https://picsum.photos/ read live 2026-10-03 per card 2026-10-02-free-images.md (`/seed/{seed}/w/h` stable, `/id/{image}/w/h`, `?grayscale`, `?blur`, `/v2/list`, `/id/{id}/info`; footer `Images from Unsplash` — NOT CC0, placeholder-only) | https://kenney.nl/assets read live 2026-10-03 (pack catalog 2D/3D/UI/Audio; site-claimed CC0 per VISION Parts, per-pack license file must confirm) | https://www.dicebear.com/integrations/http-api/ read live 2026-10-02 per card 041 (`https://api.dicebear.com/10.x/<style>/svg?seed=`, no auth) + dicebear/dicebear MIT. | Licenses: service docs idea-only; Unsplash images not CC0; Kenney site-claimed CC0 verify-per-pack; DiceBear MIT code + per-style creator licenses.

## Our homes (read 2026-10-03)

- tools/render.mjs 297 lines: SIZE_MATRIX 1280x720/1080x1080/1200x628 + `--sizes`, refineHtml create/update + buildRefinePrompt FIX-wins, streamPreview 3-chunk, measurePreview bundleMs badge.
- tools/canvas.mjs 186 lines: 5 templates (ad-square, capsule, cover-hero, story-cover, wide-banner) Konva-shape + 256px title gate + exportSvg own exporter (no DOM dep).
- samples/ads/hero/: brief.json + page.html + out.png + receipt.json (url+date+rev pins out.png hash) + thumb-256.png + tokens.css.
- kits/game-ui/ (hud.html + menu.html + manifest.json + tokens.css + buttons.css) + tools/game-ui.mjs (Game UI kits bar).

## Proof outputs (run 2026-10-03)

- `node tools/render.mjs --check` -> RENDER PASS: refine + measured preview + 3-chunk stream green (7 gates incl. FIX-comment, bundleMs badge, stream 0>6>23).
- `node tools/canvas.mjs --check` -> CANVAS PASS: 5 templates, Konva shape + palette + 256px green, SVG exports match (ad-square.svg 564B, capsule 536B, cover-hero 623B, story-cover 610B, wide-banner 626B).
- `node tools/check.mjs` -> RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits (hebrew-hero 1280x720 28125B, jobhunt 1280x720 35014B, cv 900x1270 98813B, winner cover-b audit=PASS 9753B 22.8px).

## Cards (all idea-only, 0 lines copied)

### C1 — :free text lane for brief/copy/layout prompts (openrouter :free suffix, no image bytes)
- Source: https://openrouter.ai/docs/guides/routing/model-variants/free (append `:free`, only listed models) + https://openrouter.ai/models?output_modalities=image 2026-10-03 (`:free` rows observed are text/decision only, zero image-output) | License: proprietary docs, idea only.
- What it does: free text/understanding calls draft briefs, ad copy variants, layout prompts and judge prose via `model: <slug>:free`; response `model` field records which free model served, so receipts stay honest.
- Home: tools/agent-block.mjs (prompt-to-block loop DS-05) + tools/render.mjs buildRefinePrompt + samples/ads/hero/brief.json.
- Fixes: Brief-to-render speed copy/prompt shaping (feeds DS-25/S03 hints lane; no image bytes from this lane).
- Net lines: 0 new (idea-only; build scopes optional `--free-prompt` helper ~15-25 lines + key-from-env only, never in repo).
- Proof: `node tools/render.mjs --check` RENDER PASS 2026-10-03 (output above). No proof = reject: satisfied.
- Effort and risk: S. Risk low — text-only, rate-limited, availability varies; risk is treating output as deterministic (reject: pin serving `model` in receipt, drafts only, never final pixels).

### C2 — Paid Image API shape as opt-in lane (POST /api/v1/images, all-or-nothing billing)
- Source: https://openrouter.ai/docs/guides/overview/multimodal/image-generation (request/response/SSE/billing/capability descriptors, read live 2026-10-03) + https://openrouter.ai/models?output_modalities=image (Seedream 5.0 Flash $0.018/image, FLUX.3 $0.0205/image — priced) | License: proprietary docs, idea only.
- What it does: one `POST /api/v1/images` {model, prompt, size|resolution+aspect_ratio, n, input_references, provider routing} returns `b64_json + media_type + usage.cost`; per-endpoint `supported_parameters` decides knobs; billing all-or-nothing (fail/cancel = 502, no charge).
- Home: tools/render.mjs (SIZE_MATRIX + `--sizes` + refineHtml create/update) + samples/ads/hero/ (receipt.json url+date+rev pattern fits `usage.cost` + serving model pin).
- Fixes: Landing-page conversion hero + poster/hero slots (paid opt-in only; never the default loop).
- Net lines: 0 new (idea-only; build scopes thin `tools/image.mjs` fetch wrapper ~40-60 lines + `OPENROUTER_API_KEY` from env + receipt `model/cost/media_type` fields).
- Proof: `node tools/check.mjs` RESULT PASS 6 samples 2026-10-03 (hero receipt path green; no paid call made this run). No proof = reject: satisfied.
- Effort and risk: M. Risk medium — spends credits per image, per-model rights differ; risk is key-in-repo or unchecked license (reject both: env-only key with credit limit, per-model Terms check + rev-pinned receipt before ship).

### C3 — No-key URL placeholders for wireframes (Picsum seed/id/grayscale/blur/list)
- Source: https://picsum.photos/ read live 2026-10-03 per card 2026-10-02-free-images.md (`/seed/{seed}/w/h` stable, `/id/{image}/…`, `?grayscale`, `?blur`, `/v2/list`, `/id/{id}/info`, `Images from Unsplash`) | License: service docs idea-only; images Unsplash license (NOT CC0) — placeholder only.
- What it does: deterministic placeholder URLs per slot (`/seed/<slot>/1280/720`, `/id/<picked>/1080/1080?grayscale`) unblock hero/ad wireframes with zero key/credit; `/info` + `Picsum-ID`/EXIF identifies author for later rights check.
- Home: tools/canvas.mjs + canvas/templates/*.json (5 exist) + samples/ads/hero/page.html.
- Fixes: Thumbnail readability wireframes + Landing hero drafts (never final product-faithful).
- Net lines: 0 new (idea-only; build scopes manifest `placeholder:{source:picsum, seed|id, w, h, opts}` ~10-20 lines + local-cache-to-receipt step).
- Proof: `node tools/canvas.mjs --check` CANVAS PASS 5/5 2026-10-03 (output above). No proof = reject: satisfied.
- Effort and risk: S. Risk low-medium — network at build time + Unsplash rights; risk is hotlinking in shipped PNGs (reject: cache bytes locally, rev-pin receipt, replace with owned/CC0 art before ship).

### C4 — No-key CC0 game-art packs for HUD/avatar backdrops (Kenney catalog)
- Source: https://kenney.nl/assets read live 2026-10-03 per card 2026-10-02-free-images.md (pack catalog 2D/3D/UI/Audio/Pixel/Textures) + VISION.md Parts Game UI kits row (Kenney.nl CC0 site, not a repo) | License: site-claimed CC0, idea only; per-pack license file must confirm; this card ships no binaries.
- What it does: download-once CC0 packs supply HUD backdrops, icons and avatar bases that our 24px stroke/icons/sizes gates already accept; pack name + version pinned in manifest.
- Home: kits/game-ui/ (hud.html/menu.html) + tools/game-ui.mjs (sizes/icons/serve gates).
- Fixes: Game UI kits placeholders/backdrops (DS-46 AVATAR-01 follow-up lane).
- Net lines: 0 new (idea-only; DS-46 scopes ~15-30 lines inline-SVG slot, no network at check time).
- Proof: `node tools/canvas.mjs --check` CANVAS PASS + `node tools/check.mjs` RESULT PASS 2026-10-03 (outputs above; game-ui gate last green 2026-10-02 per VISION, re-sweep on build). No proof = reject: satisfied.
- Effort and risk: S. Risk low — offline vendored-or-inline only; risk is assuming CC0 per file (reject: per-pack license check + manifest pin, no hotlink).

### C5 — No-key seed-stable avatar slots (DiceBear HTTP-API pattern, no vendor)
- Source: https://www.dicebear.com/integrations/http-api/ read live 2026-10-02 per card 041 (`https://api.dicebear.com/10.x/<style>/svg?seed=<id>` + per-style options.json/definition.json, no auth) + dicebear/dicebear MIT | License: MIT code idea-only + per-style creator licenses tracked; this card idea-only, no binaries, no network at check time.
- What it does: one slot takes style + seed (+ options) and returns a stable SVG per user — the default-avatar-before-upload pattern; same seed always returns same image.
- Home: kits/game-ui/ + tools/game-ui.mjs sizes/icons gates; board DS-46 AVATAR-01 lane.
- Fixes: avatar placeholders (Game UI kits follow-up; pairs with C4 backdrops).
- Net lines: 0 new (idea-only; DS-46 scopes 1 slot + 2 inline-SVG styles, sizes/import stay green).
- Proof: `node tools/canvas.mjs --check` CANVAS PASS 2026-10-03 + prior `node tools/game-ui.mjs --check` GAME-UI PASS 35 checks 2026-10-02 (041). No proof = reject: satisfied.
- Effort and risk: S. Risk low — inline-SVG convention only; risk is hotlinking api.dicebear.com or vendoring styles (reject both: offline inline slots only, license tracked in manifest).

## Reject list

- R1 — Claim any `:free` image-output model today. Rejected 2026-10-03: Seedream 5.0 Flash $0.018/image + FLUX.3 $0.0205/image priced; observed `:free` rows are text/decision only; `:free` doc confirms only listed models support it.
- R2 — Vendor OpenRouter SDK / copy docs code or commit `OPENROUTER_API_KEY`. Rejected: proprietary idea-only; key in env with credit limit only, request-shape idea only (C2 home is thin wrapper, never vendored SDK).
- R3 — Hotlink Picsum/Unsplash URLs in shipped renders or claim CC0. Rejected: picsum footer `Images from Unsplash` (not CC0); placeholders wireframe-only, bytes cached + rev-pinned before any receipt.
- R4 — Vendor Kenney binaries without per-pack license check. Rejected: C4 ships no binaries, manifest pins pack + license file.
- R5 — Vendor DiceBear styles/binaries or hotlink api.dicebear.com at check time. Rejected: network + per-style licenses; C5 keeps seed+style slot convention with offline inline SVGs only.
- R6 — Paid Image API as default loop or without receipt. Rejected: credit spend + Model-Terms variance; C2 is opt-in only, receipt must carry serving `model` + `usage.cost` + `media_type` + rev hash.
- R7 — Raise any Scorecard row on these cards alone. Rejected 2026-10-03: idea-only sweep, 0 lines copied, no VISION.md numbers rewritten (numbers carry source + date only when measured by proof commands on landed code).

## VISION.md write-back

- None this run (idea-only sweep, 0 lines copied). No Scorecard/Parts/Swept edits; steal-map Last-read updates belong to the planner seat.
