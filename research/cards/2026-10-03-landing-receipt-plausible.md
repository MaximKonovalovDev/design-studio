# DS-43 LAND-03: live-page beacon receipt (idea-only from Plausible AGPL)

Source: plausible/analytics@f8b669c7 tracker/src/plausible.js (init/track beacon, `u=location.href` POST `/api/event`); license AGPL-3.0 LICENSE.md SHA 0ad25db re-read live 2026-10-03 via GitHub (take=idea only, avoid=copy). DeepWiki named files in one call 2026-10-03.
What it does: tiny beacon on live page POSTs {url, rev} to receipt endpoint; server validates url+rev and writes receipt.json (url+date+rev); verification polls until first hit then marks live.
Home: tools/convert.mjs (exists, CONVERT PASS) + convert/plan.json + tools/check.mjs receipt gate (no home reject avoided).
Fixes: Landing-page conversion 0% DS-43 factory live-page receipt (local receipt only today, no live factory hit).
Net lines: ~25 (beacon snippet + receipt write + verify poll; reuses DS-24 rev==out.png pin).
Proof: `node tools/convert.mjs --check` CONVERT PASS 2026-10-03; `node tools/check.mjs` RESULT PASS 11 samples.
Effort: S, risk low (offline fail-closed, no network in --check, AGPL idea-only reimplemented, no vendor lock).
