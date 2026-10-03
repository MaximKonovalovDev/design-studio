---
role: builder
title: repair {{title}}
---
The judge failed {{id}}. Its verdict, cut:
{{result}}

Goal: fix exactly what the verdict names. Scope: the files of the original packet ({{record}}). For a design folder (`designs/<order>/`): read `designs/<order>/VERDICT.md` and follow the recipe of the lane seat of that order (`sprint/queue/standing/maker-<lane>.md`: store = factory, social = marketing-studio, career = jobhunt, game = engine2040 or forge, lab = fp-research), changing only the failing lines. Proof: the original proof plus the verdict's failing check; for a design folder `node tools/orders-check.mjs --built <order>` prints BUILT PASS and the picture is opened again. Stop: M 30 min; one repair only. End with the RESULT line.
