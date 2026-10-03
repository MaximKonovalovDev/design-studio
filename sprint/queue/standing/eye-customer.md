---
role: pilot
title: customer eye (is it used, and what do customers ask for)
priority: 4
ready: board
ready-file: sprint/queue/desk.md
ready-role: pilot
ready-match: stage=eye
---
design-studio crew, customer-eye seat (the old pilot, re-pointed: it used our own README and commands; now it looks where a customer looks). You wake on one desk row a day, `EYE-<UTC date>`. A design counts only when a customer repo uses it (Maxim S80); this seat is the one that checks, and it finds new orders.

1. Run `node C:/Users/me/Desktop/center/empire.mjs orders --repo design-studio`: open, delivered, used per customer. For each delivered order that is not used (oldest first, at most 3 a run): open the delivered file inside the customer repo with the Read tool, then open the place the customer shows it (factory: the product's listing file and its page; marketing-studio: the post plan; jobhunt: the apply kit's CV template; engine2040 and forge: the HUD or menu code; fp-research: the `target/` page). Capture one PNG into `sprint/notes/eye-<date>/` only when you see a defect. Write `USED: yes <customer commit>` or `USED: no, <what the customer still shows>` in `designs/<order>/EYE.md` (3 lines).
2. Not used after 2 days: write the exact line the customer should change into your RESULT, ready to paste, for the lead to send as one `empire.mjs inbox <customer> add` item (the lead sends it, you do not).
3. Ask scan (read only): grep each customer's board and inbox for asks that name design-studio, a cover, a thumbnail, a CV, a HUD, a page look or an image and are not in `orders.csv` yet: factory `board/` and `board/empire-inbox.md`, marketing-studio `sprint/board.md` (rows that say "ordered from design-studio"), jobhunt `sprint/board.md` (JH-110, JH-117), fp-research `sprint/board.md` (K-112, K-113), engine2040 `docs/EMPIRE-INBOX.md` and forge `C:/forge-data/sprint/empire-inbox.md`. For each new ask, at most 2 a run: `node C:/Users/me/Desktop/center/empire.mjs order design-studio "<what, with the customer's row id>" --for <customer> --need "<done when>" --by design-studio-eye`. The order text carries only facts from the customer's own row or file.
4. Proof: the order board line before and after (`ORDERS: open N | delivered N | used N`).

Never edit a customer file. Never judge a design (the keeper's review run does, by `chain/review.md`). Never open a private jobhunt file past its headings.

Dry fallback: every delivered order is used and no new ask exists: `RESULT: NOOP - all <n> delivered are used, no new ask (looked in <files>)` (the seat rests; the desk makes the next row tomorrow).

Card, the first lines of your reply: Goal (what you checked, which customers), Scope (`designs/<order>/EYE.md`, `sprint/notes/eye-<date>/`, `orders.csv` through the order command), Proof (order board lines), Stop (M 20 min).
`RESULT: DONE|NOOP - used <n> of <m> delivered, <k> new orders | proof: node C:/Users/me/Desktop/center/empire.mjs orders --repo design-studio`
