# Frontend test cases and verification record

> Historical note: the results below describe the in-memory frontend prototype before backend integration. They do not verify the current Fetch/PHP implementation. Retest through Apache/XAMPP; backend test status is tracked in [backend-test-cases.md](backend-test-cases.md).

The application has no automated-test dependency. Use these manual acceptance checks in a browser served over HTTP (ES modules do not reliably run from `file://`). Record only outcomes actually verified.

## Test cases

| Area | Test | Expected result | Result |
|---|---|---|---|
| Login | Submit with empty username/password | Field errors and summary appear; no navigation | Passed in browser |
| Login | Toggle password visibility | Password changes between masked and visible; state is announced | Passed in browser |
| Login | Submit non-empty credentials | Opens dashboard; page explicitly says this is a demo | Passed in browser |
| Dashboard | Load with sample data | Counts, recent registrations, course enrollment all derive from `data.js` | Passed: 8 students, 4 courses, 4 active; enrollments 3/2/2/1 |
| Dashboard | Follow each quick action | Link opens the corresponding implemented admin page | Links resolve; not all quick actions individually clicked |
| Students | Search by number and by name | Matching records appear; case does not matter | Passed: name search returned one record |
| Students | Combine course and year filters; clear filters | Results honor both filters; clear restores all records | Passed: BSIT + Year 2 returned 2; clear restored 8 |
| Students | Change pages and filter down | Page controls update and disable at boundaries | Initial page count and disabled boundary observed; next-page click pending |
| Students | Add/edit valid record and duplicate number | Valid save updates current-page list; duplicate is rejected | Passed: required error, duplicate rejected, valid add increased 8 to 9; edit pending |
| Students | Invalid required field, date, email, year, or course | Field-level feedback appears; no record is saved | Required and duplicate checked; date-only value passed after timezone-safe fix; other invalid cases pending |
| Students | Cancel then confirm deletion | Cancel preserves record; confirm removes it from current page only | Passed: cancel retained 9; confirm reduced to 8 |
| Details | Open valid and invalid student IDs | Details show readable course/name or a not-found state | Valid detail record passed; missing ID pending |
| Courses | Search, add/edit, and duplicate code | Search and saves work; duplicate code is rejected | Passed: search, duplicate rejection, and add; edit pending |
| Courses | Deactivate/activate course | Deactivation requires confirmation; existing enrollment remains | Passed: cancel preserved Active; confirm changed to Inactive and kept count 3; activation pending |
| Courses | Attempt new student registration in inactive course | Inactive course is unavailable for new records | Code path present; cross-page state test pending |
| Reports | Switch all report types and filter | Report content and matching totals update from sample data | Passed: course 3, course+year 2, year 3, enrollment 4 courses |
| Reports | Print preview | Report title, filters, date, and contents print without navigation/actions | Passed: print media hides sidebar/controls and displays report metadata; browser print dialog pending |
| Responsive | Test desktop, tablet, and narrow mobile widths | No page-level horizontal overflow; menu, controls, and forms remain usable | At 390px, body width matched 375px viewport; menu interaction pending |
| Accessibility | Keyboard through page and dialogs | Visible focus, labeled fields, usable dialogs, and announced feedback | Labels, live regions, and dialog confirmation observed; full keyboard pass pending |
| Limitations | Reload after an in-memory mutation | Original sample dataset returns; no storage-backed persistence is implied | Reload after test setup showed original 8 sample students |

## Actual run record

- JavaScript module syntax check: passed for all 10 JavaScript files.
- Local HTML navigation/asset link check: passed.
- Browser smoke checks: login validation/toggle/demo navigation, dashboard data, combined student filters, student add/duplicate/delete flows, course search/add/duplicate/deactivation, report calculations/print styles, and valid student details.
- A timezone-related date validation defect was found during the first browser pass, fixed, and retested successfully.
- Items marked pending above require additional manual verification; this is not a full automated or cross-device test suite.
