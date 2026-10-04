# ADOPT O-027 (fp-research): the bot-detection datasheet
1. No route serves it: it is a document. Send `from-design-studio/O-027/out.pdf` (A4, one page); `out.png` is its preview.
2. The numbers are the 2026-10-04 scoreboard: when `node tools/drill.mjs` moves one, change that slot in `page.html` and print again (`FACTS.md` lists each number and its line).
3. Two lines wait for you: the title "Bot detection" (change when the service has a name) and the contact line "Pilot requests: fp-research" (put a real address there; none exists in the sources).
4. Your proof: `node tools/drill.mjs --selftest` (the numbers on the page come from its scoreboard).
