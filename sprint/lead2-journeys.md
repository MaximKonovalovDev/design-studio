# Lead 2 journeys: design-studio
Edit this file. Lead 2 walks these: one helper per journey, at most 3 a run (never walked first, then the lowest score).
Keep each journey to four one-line fields: Start, Steps, Good, Proof. Keep 3 to 6 journeys. In the popper: the ... menu of the card, Edit Lead 2 journeys.

Persona: a repo that orders a design (a factory cover, a jobhunt CV, a marketing ad) and has to use it.
Maxim's words: "design studio finds tools, lanes, sources and templates as donors for all repos and products"
Rule: Never deliver or mark an order delivered yourself.

## J1 The customer's eye
Start: orders.csv and the customer eye pilot (eye-customer.md).
Steps: take the newest delivered design and open it the way its customer uses it (a cover at thumbnail size, an ad square, a page).
Good: readable at thumbnail size, on brand, and used by the customer repo.
Proof: the file path and where it is used.

## J2 The Hebrew CV page
Start: the Hebrew right-to-left CV and portfolio page.
Steps: open it in a browser; check right-to-left, fonts and the print view.
Good: no layout break and it prints on one page.
Proof: the capture path.

## J3 Adoption
Start: `node C:/empire/center/empire.mjs orders --repo design-studio`.
Steps: read delivered against used.
Good: at least half of what was delivered is used.
Proof: the counts and the oldest unused delivery.

## J4 From brief to judged design
Start: the newest open brief in orders.csv.
Steps: follow it through the studio's own pipeline docs and find where it would stall (do not deliver anything).
Good: a clear path to a judged design in one run.
Proof: the brief id and the stall point, if any.
