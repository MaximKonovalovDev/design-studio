# Free image lanes sweep — packet 043 (2026-10-03)

Goal: free image lanes we can use now: OpenRouter :free image models plus no-key CC0 stock.
Scope: OpenRouter docs https://openrouter.ai/models + https://openrouter.ai/docs, VISION.md Steal S13/S18/S19, tools/render.mjs, tools/canvas.mjs, samples/ads/. One narrow search max (used: `OpenRouter free image generation models :free output_modalities image` 2026-10-03, 5 hits). No GitHub reads this run (no 429; GitHub untouched). All OpenRouter/CC0 reads via webfetch live below. All cards idea-only, 0 lines copied (proprietary docs = idea only per repo rule).

## Live reads (2026-10-03 unless noted)

- https://openrouter.ai/docs/guides/overview/multimodal/image-generation.md — read live: dedicated Image API `POST /api/v1/images` {model, prompt, n, resolution, aspect_ratio, size, quality, output_format, background, output_compression, seed, stream, input_references, provider.only/order/ignore/sort/allow_fallbacks/options}, response `{data:[{b64_json, media_type}], usage:{cost}}`, SSE `image_generation.partial_image/completed/error` + `[DONE]`, billing all-or-nothing (completed billed full, failed/cancelled 502 not billed). Example `bytedance-seed/seedream-4.5`, discovery `GET /api/v1/images/models` + `/endpoints` with `supported_parameters` enum/range/boolean + `pricing[{billable: output_image, unit: image|megapixel|token, cost_usd}]`. | License: proprietary docs, idea only.
- https://openrouter.ai/collections/image-models — read live Oct 2026 ranking: top 12 image models ALL priced (Seedream 4.5 from $0.04/image, Meta Muse $0.01/image, GPT Image 2.5 / Nano Banana token-per-M etc.), zero `$0` / `:free` image entries observed. | License: proprietary page, idea only.
- https://openrouter.ai/collections/free-models — read live Oct 2026: top 16 free models all `$0/M input+output`, all text/understanding (Space Bunny Alpha, Nemotron 3 Ultra :free, Laguna S 2.1 :free, Nemotron 3.5 Lightning :free, Inkling :free multimodal-understanding, Nemotron 3 Nano Omni text-in/image-in/text-out, etc.), zero image-output entries. | License: proprietary page, idea only.
- https://openrouter.ai/models?pricing=free&output_modalities=image + https://openrouter.ai/models — read live 2026-10-03: filtered view returns no image-output rows; unfiltered top rows are text/decisions/TTS/video (Seedream 5.0 Flash from $0.018/image, FLUX.3 from $0.0205/image — both priced). Confirms: no :free image lane today. | License: proprietary page, idea only.
- https://openrouter.ai/docs/guides/routing/model-variants/free.md — read live: `:free` append-to-slug catalog variant (`meta-llama/llama-3.2-3b-instruct:free`), own pricing/endpoints/rate limits, only models that list one support it. | License: proprietary docs, idea only.
- https://openrouter.ai/docs/guides/routing/routers/free-router.md — read live: `openrouter/free` random free-model router, filters by request capabilities, response `model` names pick; pricing free; limits apply. | License: proprietary docs, idea only.
- https://openrouter.ai/docs/faq.md — read live: free-tier 50 req/day with 0 credits, 1000 req/day if >=$10 purchased credits; new users small free allowance; `openrouter/free` zero-cost; credits expire 365d; no markup on provider pricing. | License: proprietary docs, idea only.
- https://openrouter.ai/docs/api_reference/authentication.md + https://openrouter.ai/docs/quickstart — read live: Bearer `<OPENROUTER_API_KEY>`, key via https://openrouter.ai/keys with credit limit, env var, never in repo; GitHub secret-scanning partner; optional HTTP-Referer/X-Title. | License: proprietary docs, idea only.
- https://openrouter.ai/terms — read live 2026-08-31 rev: §5 Model Terms flow-down (per-model terms list, provider availability as-available, suspension on violation), §6 User Content (Input/Output license, training opt-out per Model Terms), §4 Credits pre-paid. Verdict: generated-image ownership/retention governed per Model Terms — check per model before commercial ship. | License: proprietary terms, idea only.
- https://picsum.photos/ — read live: no-key URL placeholders `https://picsum.photos/200/300`, `/200`, `/id/{image}/200/300`, `/seed/{seed}/200/300` (stable), `?grayscale`, `?blur[=1-10]`, `.jpg`/`.webp`, `/v2/list?page&limit` + `Link` header, `/id/{id}/info`, `Picsum-ID` header/EXIF; footer `Images from Unsplash`, `Source https://github.com/DMarby/picsum-photos`. Verdict: placeholder-only, NOT CC0 (Unsplash-sourced) — author via /info, verify Unsplash terms before ship. | License: service docs proprietary idea-only; images Unsplash license (not CC0).
- https://kenney.nl/assets — read live: no-key game-asset pack catalog (2D/3D/UI/Audio/Pixel/Textures, e.g. Skyboxes, Tiny Factory, City Kit). | License: site-claimed CC0 per VISION Parts (factory design/STUDIO.md 2026-09-27); terms page https://kenney.nl/terms-of-service read live 2026-10-03 states site-copyright boilerplate without per-asset CC0 line — verify per-pack license file before ship; this card ships no binaries.
- Prior 041 donor context (not re-read): dicebear/dicebear MIT + https://www.dicebear.com/integrations/http-api/ (style URL `https://api.dicebear.com/10.x/<style>/svg?seed=`, no auth) for avatar slots — reused as C5, idea-only, offline inline-SVG only.

## Our homes (read 2026-10-03)

- tools/render.mjs 297 lines: SIZE_MATRIX 1280x720/1080x1080/1200x628 + `--sizes`, refineHtml create/update + buildRefinePrompt FIX-wins, streamPreview 3-chunk, measurePreview bundleMs badge.
- tools/canvas.mjs 186 lines: 5 templates Konva-shape + 256px title gate + exportSvg own exporter (no DOM dep).
- samples/ads/hero/: brief.json + page.html + out.png + receipt.json (url+date+rev pins out.png hash) + thumb-256.png + tokens.css.
- kits/game-ui/ + tools/game-ui.mjs: HUD/menu inline-SVG lane (Game UI kits bar).

## Proof outputs (run 2026-10-03)

- `node tools/render.mjs --check` -> RENDER PASS: refine + measured preview + 3-chunk stream green (7 gates incl. FIX-comment, bundleMs badge).
- `node tools/canvas.mjs --check` -> CANVAS PASS: 5 templates, Konva shape + palette + 256px green, SVG exports match.
- `node tools/check.mjs` -> RESULT PASS: loop check plus 6 sample renders plus thumbs plus audits (cover 1280x720, ad-square 1080x1080, hero receipt path green).
- `node tools/check.mjs` variant `sprint/check.mjs` -> board 50 rows / vision 7 rows x 4 competitors / steal 10+10 green (context, not claimed as image proof).

## Cards (all idea-only, 0 lines copied)

### C1 — :free text lane for brief/copy/layout prompts (openrouter/free router + :free suffix)
- Source: https://openrouter.ai/docs/guides/routing/routers/free-router.md + https://openrouter.ai/docs/guides/routing/model-variants/free.md + https://openrouter.ai/collections/free-models (top 16 all $0/M, e.g. Nemotron 3 Ultra :free / Laguna S 2.1 :free / Inkling :free, read live 2026-10-03) + https://openrouter.ai/docs/faq.md (50 req/day no-credits / 1000 req/day >=$10 credits) | License: proprietary docs, idea only.
- What it does: free text/understanding calls draft briefs, ad copy variants, layout prompts and judge prose via `model: openrouter/free` or `model: <slug>:free`; response `model` field records which free model served, so receipts stay honest under random routing.
- Home: tools/agent-block.mjs (exists, prompt-to-block loop DS-05) + tools/render.mjs buildRefinePrompt (exists) + samples/ads/hero/brief.json (exists).
- Fixes: Brief-to-render speed copy/prompt shaping (feeds DS-25/S03 hints lane; no image bytes from this lane).
- Net lines: 0 new (idea-only; build scopes optional `--free-prompt` helper ~15-25 lines + key-from-env only, never in repo).
- Proof: `node tools/render.mjs --check` RENDER PASS 2026-10-03 (output above). No proof = reject: satisfied.
- Effort and risk: S. Risk low — text-only, rate-limited (50/1000 RPD), availability varies; risk is treating random-router output as deterministic (reject: pin serving `model` in receipt, keep free lane to drafts, never to final pixels).

### C2 — Paid Image API shape as opt-in lane (POST /api/v1/images, all-or-nothing billing)
- Source: https://openrouter.ai/docs/guides/overview/multimodal/image-generation.md (request/response/SSE/billing/capability descriptors, read live 2026-10-03) + https://openrouter.ai/collections/image-models (top 12 all priced, e.g. Seedream 4.5 $0.04/image, Muse $0.01/image) + https://openrouter.ai/terms (§5 Model Terms flow-down, 2026-08-31 rev) | License: proprietary docs/terms, idea only.
- What it does: one `POST /api/v1/images` {model, prompt, size|resolution+aspect_ratio, n, input_references, provider routing} returns `b64_json + media_type + usage.cost`; per-endpoint `supported_parameters` decides knobs; billing all-or-nothing (fail/cancel = 502, no charge); Model Terms govern ownership/retention per model.
- Home: tools/render.mjs (exists: SIZE_MATRIX + `--sizes` + refineHtml create/update) + samples/ads/hero/ (exists: receipt.json url+date+rev pattern fits `usage.cost` + serving model pin).
- Fixes: Landing-page conversion hero + poster/hero slots (paid opt-in only; never the default loop).
- Net lines: 0 new (idea-only; build scopes thin `tools/image.mjs` fetch wrapper ~40-60 lines + `OPENROUTER_API_KEY` from env + receipt `model/cost/media_type` fields).
- Proof: `node tools/check.mjs` RESULT PASS 6 samples 2026-10-03 (hero receipt path green; no paid call made this run). No proof = reject: satisfied.
- Effort and risk: M. Risk medium — spends credits per image, provider availability as-available, per-model rights differ; risk is key-in-repo or unchecked license (reject both: env-only key with credit limit, per-model Terms check + rev-pinned receipt before ship).

### C3 — No-key URL placeholders for wireframes (Picsum seed/id/grayscale/blur/list)
- Source: https://picsum.photos/ read live 2026-10-03 (`/200/300`, `/seed/{seed}/200/300` stable, `/id/{image}/…`, `?grayscale`, `?blur=1-10`, `.jpg/.webp`, `/v2/list`, `/id/{id}/info`, `Images from Unsplash`) | License: service docs idea-only; images Unsplash license (NOT CC0) — placeholder only.
- What it does: deterministic placeholder URLs per slot (`/seed/<slot>/1280/720`, `/id/<picked>/1080/1080?grayscale`) unblock hero/ad wireframes with zero key/credit; `/info` + `Picsum-ID`/EXIF identifies author for later rights check.
- Home: tools/canvas.mjs (exists) + canvas/templates/*.json (5 exist) + samples/ads/hero/page.html (exists).
- Fixes: Thumbnail readability wireframes + Landing hero drafts (never final product-faithful).
- Net lines: 0 new (idea-only; build scopes manifest `placeholder:{source:picsum, seed|id, w, h, opts}` ~10-20 lines + local-cache-to-receipt step).
- Proof: `node tools/canvas.mjs --check` CANVAS PASS 5/5 2026-10-03 (output above). No proof = reject: satisfied.
- Effort and risk: S. Risk low-medium — network at build time + Unsplash rights; risk is hotlinking in shipped PNGs (reject: cache bytes locally, rev-pin receipt, replace with owned/CC0 art before ship).

### C4 — No-key CC0 game-art packs for HUD/avatar backdrops (Kenney catalog)
- Source: https://kenney.nl/assets read live 2026-10-03 (pack catalog 2D/3D/UI/Audio/Pixel/Textures) + VISION.md Parts Game UI kits row (Kenney.nl CC0 site, not a repo, cited 2026-10-02) | License: site-claimed CC0, idea only; per-pack license file must confirm (terms page 2026-10-03 is site boilerplate, no per-asset line — verify before ship); this card ships no binaries.
- What it does: download-once CC0 packs supply HUD backdrops, icons and avatar bases that our 24px stroke/icons/sizes gates already accept; pack name + version pinned in manifest.
- Home: kits/game-ui/ (exists: hud.html/menu.html) + tools/game-ui.mjs (exists: sizes/icons/serve gates).
- Fixes: Game UI kits placeholders/backdrops (DS-46 AVATAR-01 follow-up lane).
- Net lines: 0 new (idea-only; DS-46 scopes ~15-30 lines inline-SVG slot, no network at check time).
- Proof: `node tools/canvas.mjs --check` CANVAS PASS + `node tools/check.mjs` RESULT PASS 2026-10-03 (outputs above; game-ui gate last green 2026-10-02 per VISION, re-sweep on build). No proof = reject: satisfied.
- Effort and risk: S. Risk low — offline vendored-or-inline only; risk is assuming CC0 per file (reject: per-pack license check + manifest pin, no hotlink).

### C5 — No-key seed-stable avatar slots (DiceBear HTTP-API pattern, no vendor)
- Source: https://www.dicebear.com/integrations/http-api/ read live 2026-10-02 per card 041 (`https://api.dicebear.com/10.x/<style>/svg?seed=<id>` + per-style options.json/definition.json, no auth) + dicebear/dicebear MIT LICENSE live 2026-10-02 (041) | License: MIT code idea-only + per-style creator licenses tracked; this card idea-only, no binaries, no network at check time.
- What it does: one slot takes style + seed (+ options) and returns a stable SVG per user — the default-avatar-before-upload pattern; same seed always returns same image.
- Home: kits/game-ui/ (exists) + tools/game-ui.mjs sizes/icons gates (exist); board DS-46 AVATAR-01 lane.
- Fixes: avatar placeholders (Game UI kits follow-up; pairs with C4 backdrops).
- Net lines: 0 new (idea-only; DS-46 scopes 1 slot + 2 inline-SVG styles, sizes/import stay green).
- Proof: `node tools/canvas.mjs --check` CANVAS PASS 2026-10-03 + prior `node tools/game-ui.mjs --check` GAME-UI PASS 35 checks 2026-10-02 (041). No proof = reject: satisfied.
- Effort and risk: S. Risk low — inline-SVG convention only; risk is hotlinking api.dicebear.com or vendoring styles (reject both: offline inline slots only, license tracked in manifest).

## Reject list

- R1 — Claim any `:free` image-output model today. Rejected 2026-10-03: top 12 image models all priced + top 16 free models all text/understanding + `?pricing=free&output_modalities=image` returns no image rows; free lanes are C1 text + C3/C4/C5 no-key stock only.
- R2 — Vendor OpenRouter SDK / copy docs code or commit `OPENROUTER_API_KEY`. Rejected: proprietary idea-only + Terms §3.2/API Credentials; key in env with credit limit only, request-shape idea only (C2 home is thin wrapper, never vendored SDK).
- R3 — Hotlink Picsum/Unsplash URLs in shipped renders or claim CC0. Rejected 2026-10-03: picsum footer `Images from Unsplash` (not CC0); placeholders wireframe-only, bytes cached + rev-pinned before any receipt.
- R4 — Vendor Kenney binaries without per-pack license check. Rejected: terms page is site boilerplate; C4 ships no binaries, manifest pins pack + license file.
- R5 — Vendor DiceBear styles/binaries or hotlink api.dicebear.com at check time. Rejected: network + per-style licenses; C5 keeps seed+style slot convention with offline inline SVGs only (041 R4 carried).
- R6 — Paid Image API as default loop or without receipt. Rejected: credit spend + Model-Terms variance; C2 is opt-in only, receipt must carry serving `model` + `usage.cost` + `media_type` + rev hash.
- R7 — Raise any Scorecard row on these cards alone. Rejected 2026-10-03: idea-only sweep, 0 lines copied, no VISION.md numbers rewritten (numbers carry source + date only when measured by proof commands on landed code).

## VISION.md write-back

- None this run (idea-only sweep, 0 lines copied). No Scorecard/Parts/Swept edits; steal-map Last-read updates belong to the planner seat.
