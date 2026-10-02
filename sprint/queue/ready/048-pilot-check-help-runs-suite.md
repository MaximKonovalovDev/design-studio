---
role: builder
title: check --help runs the full suite instead of usage
---

Goal: a stranger probing the CLI gets guidance, not a render run: `node tools/check.mjs --help` today ignores the flag and executes the entire suite (sprint/check 20/20 plus 6 sample renders plus winner line, ending RESULT PASS), so a user asking "how do I use this" waits through a full build and learns nothing about the single-sample form (`node tools/check.mjs samples/ads/hero/brief.json`) that actually exists.

Scope: `sprint/queue/ready/`, `sprint/notes/` (this packet); fix touches only `tools/check.mjs` arg handling (print one-line usage for --help/-h listing the no-arg suite form plus the single-brief form plus receipt behavior, exit 0 without rendering); explicitly NOT suite membership (owned by 047), NOT `tools/render.mjs`/`tools/audit.mjs`/`tools/judge.mjs` usage lines (all already print usage), NOT README.md (owned by 046), NOT any gate.

Proof: `node tools/check.mjs --help` output opens with "--- sprint/check.mjs ---" and ends "RESULT PASS: loop check plus 6 sample renders" (full run, zero usage lines); `Select-String tools/check.mjs "--help|usage"` 0 hits (no handling); contrast `node tools/render.mjs --help` prints "usage: node tools/render.mjs <page.html> <out.png> ..." and `node tools/audit.mjs --help` / `node tools/judge.mjs --help` print usage; P2P `node tools/check.mjs` stays RESULT PASS.

Stop: M 30 min; at the budget report what landed and the next step.

What the user sees differently: today the user types --help and gets a minutes-long render suite as the answer; after the fix the same flag prints what the tool does and how to point it at one brief, matching every sibling tool.
