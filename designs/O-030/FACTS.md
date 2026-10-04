# FACTS O-030: no real fact is on this page

This is a layout with placeholders. The person (Noa Ravenel, נועה רבנל), the four projects and every number are made up by the template (`templates/print/portfolio-card`, sample slots) so that jobhunt fills its own. Nothing was read from `jobhunt/private`, and no source file of jobhunt was needed.

| Number on the page | Where | What it is |
|---|---|---|
| 412, 1.8 s (1.8 שנ׳), 96%, 14 | the proof number of cards 1 to 4 | sample values, replaced by one real number per project (slots `PROJECT_n_PROOF_VALUE`) |
| 30 (a 30-person clinic), 30 days | card 2 and card 3 text | sample words inside `PROJECT_2_WHAT`, `PROJECT_3_PROOF_LABEL` |
| 2023 to 2026 | work heading | sample `WORK_META` |
| 050-555-0100 | contact line | a 555 test number, sample `CONTACT_PHONE` |
| UTC+2 | contact line | sample `CONTACT_PLACE` |
| 01 02 03 04 | card badges | the template's own numbering |

Contact lines use `.example` addresses (`noa@ravenel.example`). Real values go in only inside jobhunt (private); SLOTS.md names every slot.
