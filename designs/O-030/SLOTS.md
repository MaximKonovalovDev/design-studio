# SLOTS: O-030 portfolio card (Hebrew rtl A4 + EN ltr twin)

One A4 page, one column, real text only, no pictures. `page.html` (he, rtl) and `page-en.html` (en, ltr) carry the same 52 slots in the same order; `tokens.css` is the only colour and type source of both. Placeholders only in this folder: the person, the four projects and every contact line are made up (a `.example` address, a 555 number). No personal data.

How jobhunt fills a slot
- Each slot is one element `<bdi data-slot="NAME">sample text</bdi>`. Replace the text inside it with the real value (HTML-escaped). `LANG` and `DIR` are the two attributes on `<html>`. `TITLE` also sits once more in the page's `<title>` tag (no data-slot there): change it too.
- An empty value collapses its element by CSS (status, intro, project chips, skills, phone, link, place); the other slots must hold text.
- Limits: the name fits one line up to 22 characters; a project number stays under 7 characters; a project paragraph up to about 150 characters. Latin names, emails and numbers inside Hebrew keep their own direction (each slot sits in a `bdi`).
- Print: Edge headless print-to-PDF of the page gives one A4 page with a real text layer (the page sets `@page` A4, margin 0). The type is the system Hebrew and Latin stack from `tokens.css`: an embedded Heebo web font was tried and flips the Hebrew word order in the PDF text layer, so none is used.

| # | Slot | Where | What jobhunt puts in it | Sample (en) | Sample (he) |
|---|---|---|---|---|---|
| 1 | `LANG` | html lang | `he` on page.html, `en` on page-en.html; never changes | en | he |
| 2 | `DIR` | html dir | `rtl` on page.html, `ltr` on page-en.html; never changes | ltr | rtl |
| 3 | `KICKER` | small label above the name | the word for portfolio, as the language wants it | Portfolio | תיק עבודות |
| 4 | `STATUS` | status pill, top corner | availability in a few words (for example open to remote roles); empty removes the pill | Open to remote roles | פתוחה למשרות מרחוק |
| 5 | `TITLE` | h1 and the page title | the person's full name, one line, up to 22 characters | Noa Ravenel | נועה רבנל |
| 6 | `ROLE` | role line under the name | one sentence: the role and what the person builds | Automation engineer. I build tools that check their own work. | מהנדסת אוטומציה. בונה כלים שבודקים את העבודה של עצמם. |
| 7 | `INTRO` | intro paragraph | one or two sentences about the work shown; empty removes it | Four projects from the last three years. Each one ships with tests and one number you can verify. | ארבעה פרויקטים משלוש השנים האחרונות. כל אחד מגיע עם בדיקות ועם מספר אחד שאפשר לאמת. |
| 8 | `WORK_HEADING` | heading above the 4 cards | the words for selected work | Selected work | עבודות נבחרות |
| 9 | `WORK_META` | right side of the work heading | the years the projects cover, for example 2023 to 2026 | 2023 to 2026 | 2023 עד 2026 |
| 10 | `PROJECT_1_KIND` | card 1, small label | the kind of project in two or three words (tool, web app, pipeline, kit) | Command-line tool | כלי שורת פקודה |
| 11 | `PROJECT_1_TITLE` | card 1, heading | the project's own name | Ledger Lint | Ledger Lint |
| 12 | `PROJECT_1_WHAT` | card 1, paragraph | what it is and does, up to about 150 characters (four lines, then cut) | Finds mismatched totals in exported invoices before they reach the accountant. Runs on a folder and prints the rows that do not add up. | מוצא סכומים שלא מתאימים בחשבוניות מיוצאות לפני שהן מגיעות לרואה החשבון. רץ על תיקייה ומדפיס את השורות שלא מסתכמות. |
| 13 | `PROJECT_1_PROOF_VALUE` | card 1, big number | one real number from jobhunt's profile, under 7 characters | 412 | 412 |
| 14 | `PROJECT_1_PROOF_LABEL` | card 1, under the number | what the number counts, in a few words | tests, all passing on every commit | בדיקות, כולן עוברות בכל קומיט |
| 15 | `PROJECT_1_CHIP_1` | card 1, chip 1 | one tool or language of the project; empty removes the chip | TypeScript | TypeScript |
| 16 | `PROJECT_1_CHIP_2` | card 1, chip 2 | one tool or language of the project; empty removes the chip | Node.js | Node.js |
| 17 | `PROJECT_1_CHIP_3` | card 1, chip 3 | one tool or language of the project; empty removes the chip | SQLite | SQLite |
| 18 | `PROJECT_2_KIND` | card 2, small label | the kind of project in two or three words (tool, web app, pipeline, kit) | Web app | אפליקציית רשת |
| 19 | `PROJECT_2_TITLE` | card 2, heading | the project's own name | Shift Board | לוח משמרות |
| 20 | `PROJECT_2_WHAT` | card 2, paragraph | what it is and does, up to about 150 characters (four lines, then cut) | A scheduling page for a 30-person clinic. Swaps are approved in one tap and written to the shared calendar. | עמוד שיבוץ למרפאה של 30 עובדים. החלפות מאושרות בלחיצה אחת ונכתבות ליומן המשותף. |
| 21 | `PROJECT_2_PROOF_VALUE` | card 2, big number | one real number from jobhunt's profile, under 7 characters | 1.8 s | 1.8 שנ׳ |
| 22 | `PROJECT_2_PROOF_LABEL` | card 2, under the number | what the number counts, in a few words | to a usable screen on a mid-range phone | עד למסך שמיש בטלפון בינוני |
| 23 | `PROJECT_2_CHIP_1` | card 2, chip 1 | one tool or language of the project; empty removes the chip | React | React |
| 24 | `PROJECT_2_CHIP_2` | card 2, chip 2 | one tool or language of the project; empty removes the chip | PWA | PWA |
| 25 | `PROJECT_2_CHIP_3` | card 2, chip 3 | one tool or language of the project; empty removes the chip | Postgres | Postgres |
| 26 | `PROJECT_3_KIND` | card 3, small label | the kind of project in two or three words (tool, web app, pipeline, kit) | Data pipeline | צינור נתונים |
| 27 | `PROJECT_3_TITLE` | card 3, heading | the project's own name | Quiet Alerts | התראות שקטות |
| 28 | `PROJECT_3_WHAT` | card 3, paragraph | what it is and does, up to about 150 characters (four lines, then cut) | Turns a day of noisy server logs into one summary with the three lines that matter, sent every morning. | הופך יום של לוגים רועשים לסיכום אחד עם שלוש השורות שחשובות, שנשלח כל בוקר. |
| 29 | `PROJECT_3_PROOF_VALUE` | card 3, big number | one real number from jobhunt's profile, under 7 characters | 96% | 96% |
| 30 | `PROJECT_3_PROOF_LABEL` | card 3, under the number | what the number counts, in a few words | fewer alerts in a 30-day side-by-side test | פחות התראות בבדיקה של 30 יום, זה מול זה |
| 31 | `PROJECT_3_CHIP_1` | card 3, chip 1 | one tool or language of the project; empty removes the chip | Python | Python |
| 32 | `PROJECT_3_CHIP_2` | card 3, chip 2 | one tool or language of the project; empty removes the chip | Regex | Regex |
| 33 | `PROJECT_3_CHIP_3` | card 3, chip 3 | one tool or language of the project; empty removes the chip | Cron | Cron |
| 34 | `PROJECT_4_KIND` | card 4, small label | the kind of project in two or three words (tool, web app, pipeline, kit) | Template kit | ערכת תבניות |
| 35 | `PROJECT_4_TITLE` | card 4, heading | the project's own name | Right-to-Left PDF Kit | ערכת PDF מימין לשמאל |
| 36 | `PROJECT_4_WHAT` | card 4, paragraph | what it is and does, up to about 150 characters (four lines, then cut) | Invoices and letters in Hebrew from plain HTML, with real selectable text and page breaks that hold. | חשבוניות ומכתבים בעברית מתוך HTML רגיל, עם טקסט אמיתי שאפשר לסמן ומעברי עמוד שמחזיקים. |
| 37 | `PROJECT_4_PROOF_VALUE` | card 4, big number | one real number from jobhunt's profile, under 7 characters | 14 | 14 |
| 38 | `PROJECT_4_PROOF_LABEL` | card 4, under the number | what the number counts, in a few words | templates, each with its own print test | תבניות, לכל אחת בדיקת הדפסה משלה |
| 39 | `PROJECT_4_CHIP_1` | card 4, chip 1 | one tool or language of the project; empty removes the chip | HTML | HTML |
| 40 | `PROJECT_4_CHIP_2` | card 4, chip 2 | one tool or language of the project; empty removes the chip | Print CSS | Print CSS |
| 41 | `PROJECT_4_CHIP_3` | card 4, chip 3 | one tool or language of the project; empty removes the chip | Hebrew | עברית |
| 42 | `SKILLS_HEADING` | label of the skills strip | the word for skills | Skills | כישורים |
| 43 | `SKILL_1` | skills strip, chip 1 | one skill from the profile; empty removes the chip | TypeScript | TypeScript |
| 44 | `SKILL_2` | skills strip, chip 2 | one skill from the profile; empty removes the chip | Python | Python |
| 45 | `SKILL_3` | skills strip, chip 3 | one skill from the profile; empty removes the chip | SQL | SQL |
| 46 | `SKILL_4` | skills strip, chip 4 | one skill from the profile; empty removes the chip | Test design | תכנון בדיקות |
| 47 | `SKILL_5` | skills strip, chip 5 | one skill from the profile; empty removes the chip | Print CSS | Print CSS |
| 48 | `SKILL_6` | skills strip, chip 6 | one skill from the profile; empty removes the chip | Automation | אוטומציה |
| 49 | `SKILL_7` | skills strip, chip 7 | one skill from the profile; empty removes the chip | Hebrew and English | עברית ואנגלית |
| 50 | `SKILL_8` | skills strip, chip 8 | one skill from the profile; empty removes the chip | Technical writing | כתיבה טכנית |
| 51 | `CONTACT_EMAIL` | contact line, bold | the person's email | noa@ravenel.example | noa@ravenel.example |
| 52 | `CONTACT_PHONE` | contact line | phone number; empty removes it | 050-555-0100 | 050-555-0100 |
| 53 | `CONTACT_LINK` | contact line | site or profile address without https://; empty removes it | ravenel.example/work | ravenel.example/work |
| 54 | `CONTACT_PLACE` | contact line | city or remote with a time zone; empty removes it | Remote, UTC+2 | מרחוק, UTC+2 |
