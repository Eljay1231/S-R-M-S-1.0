# Backend architecture

## Components

| Path | Responsibility |
|---|---|
| `backend/api/` | Thin PHP endpoint handlers; method checks, auth/CSRF gates, validation, SQL operations, JSON responses |
| `backend/app/bootstrap.php` | Loads shared API helpers and starts secure PHP sessions |
| `backend/app/config/database.php` | Creates one PDO connection per request from ignored local configuration or the example |
| `backend/app/helpers/http.php` | Request parsing, HTTP methods, JSON envelopes, errors, IDs, pagination parameters, search escaping |
| `backend/app/helpers/validation.php` | Field allowlists and server-side student/course validation |
| `backend/app/helpers/records.php` | Maps database rows to safe camelCase API records |
| `backend/app/middleware/auth.php` | Session cookie setup, idle timeout, and admin authentication |
| `backend/app/middleware/csrf.php` | Unpredictable session CSRF token generation |
| `backend/public/admin-page.php` | Session gate for admin HTML pages |
| `frontend/assets/js/api.js` | Same-origin Fetch requests, JSON errors, credentials, CSRF header, and expired-session redirect |
| `backend/database/` | MySQL/MariaDB schema and separate demo seed |
| `backend/bin/create-admin.php` | CLI-only first administrator provisioning |

The endpoint handlers use prepared statements directly. Dedicated repositories/services were not added because they would duplicate a small amount of query logic without improving clarity at this scale.

## Request flow

1. Apache routes each admin `.html` request through `backend/public/admin-page.php`, which requires a valid session before returning the requested frontend file.
2. JavaScript calls the same-origin endpoint; PHP starts the strict, HTTP-only, SameSite=Lax session.
3. Protected endpoint verifies the session, method, and (for mutations) CSRF token.
4. JSON payload/query values are validated before SQL. PDO exceptions and unexpected errors are logged without raw query values or stack traces and return a safe JSON error.
5. `frontend/` renders returned values with DOM `textContent` and updates the relevant list/report/dashboard on navigation or after a mutation.

## Authentication flow

1. Login page requests an anonymous CSRF token.
2. Login endpoint verifies the JSON credentials with `password_verify()`.
3. On success, PHP regenerates the session ID and stores the admin ID, username, last activity, and a fresh CSRF token.
4. Admin page requests and all record APIs verify the session. Sessions expire after 30 minutes idle.
5. Logout requires authentication and CSRF, expires the cookie, and destroys the session.

The initial admin is created only with `php bin/create-admin.php` from a local CLI after importing the schema. There is no public registration route.
