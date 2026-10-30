# Backend test cases and verification record

## Environment

PHP 8.5.12 CLI and the `pdo_mysql`/`mbstring` extensions are installed in the current environment. Apache and MySQL are unavailable, so schema import, endpoint execution, session behavior, and database-backed integration tests are **not run** here. Do not treat the expected results below as passed tests.

## Checks actually run

| Check | Result | Scope |
|---|---|---|
| `php -v` and `php -m` | Passed: PHP 8.5.12; `pdo_mysql` and `mbstring` loaded | Local CLI runtime; Apache still uses XAMPP's configured PHP |
| PHP syntax check | Passed: all PHP files under `backend/` | PHP `-l`; does not test endpoint execution |
| `node --check` on all JavaScript files | Passed: 11 files | Syntax only; not browser behavior |
| API client smoke test with mocked Fetch | Passed | Confirms backend URL, same-origin credentials, JSON/CSRF headers, and expired-session redirect; does not execute PHP |
| PHP HTTP smoke test on local PHP server | Passed | CSRF endpoint response, 405 method guard, 415 content-type guard, and missing-token 403; no database used |
| Local HTML references and JS imports | Passed | Confirms files/imports exist; does not verify Apache rewriting |
| Workspace diagnostics | No errors reported | Does not substitute for browser/database tests |
| `git diff --check` | Passed | Whitespace/error-marker check |

| Area | Test | Expected result | Actual result |
|---|---|---|---|
| Setup | Import schema, then seed in phpMyAdmin | Tables/constraints/data import successfully | Not run - XAMPP/MySQL unavailable |
| Admin | Run CLI setup with local config | One admin created or updated with password hash; multiple existing admins are rejected | Not run - MySQL unavailable |
| Auth | Valid/invalid credentials, CSRF, session renewal, idle timeout, logout | Correct success/status codes; no hashes; rotated session; expired session denied | CSRF denial checked; credential/session tests not run - MySQL unavailable |
| Access | Request each admin page/API without session | Admin page redirects; API returns 401 JSON | Direct PHP page handler returned 302; API auth path not run; Apache rewrite not run |
| Students | CRUD, duplicate number, invalid date/email/course/year, inactive course | Valid operations persist; invalid requests return field errors; inactive reassignment rejected | Not run - MySQL unavailable |
| Student listing | Search full name/number, filters, sorting, page boundaries | Correct stable records and totals; bounded page sizes | Not run - MySQL/PHP unavailable |
| Courses | Create/update/duplicate/status/enrollment counts | Case-insensitive duplicate rejected; status changes preserve enrollments | Not run - MySQL/PHP unavailable |
| Dashboard | Counts, recent records, course enrollment, empty data | Results match database state | Not run - MySQL/PHP unavailable |
| Reports | Complete, by-course, by-year, enrollment summary and pagination | Filters, totals, and page results match database state | Not run - MySQL/PHP unavailable |
| Frontend integration | Login, CRUD, refreshes, report print, expiration | Fetch flows work through Apache without in-memory persistence | Not run - Apache/PHP unavailable |
| Security | Attempt SQL-like search, unknown fields, wrong method/content type, missing CSRF | No injection/mass assignment; consistent 4xx responses | Wrong method, content type, and missing CSRF checked; DB-dependent and unknown-field cases not run |

No database-dependent or Apache integration test is claimed as passed in this file.
