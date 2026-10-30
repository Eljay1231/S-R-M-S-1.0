# Backend integration

## Implemented frontend contract

The interface remains a set of HTML pages under `frontend/`, styled by its CSS and driven by vanilla JavaScript modules. `frontend/assets/js/api.js` is the shared Fetch client. Student and course pages request server data and no longer mutate sample arrays. `frontend/assets/js/data.js` contains formatting helpers only.

The API uses integer database IDs and camelCase JSON fields. Course status is `active` or `inactive` in API/database data and is rendered as title case in the UI. A student must have a course; `courseId` is non-null and enforced by a foreign key.

## Backend structure

- `frontend/`: HTML pages, stylesheets, and scripts
- `backend/api/`: endpoint handlers grouped by authentication, students, courses, dashboard, and reports
- `backend/app/config/`: PDO connection and ignored local database configuration
- `backend/app/helpers/`: JSON responses, validation, and database-to-API record mapping
- `backend/app/middleware/`: PHP session authentication and CSRF token support
- `backend/database/`: importable schema and separate fictional demo seed data
- `backend/bin/create-admin.php`: CLI-only initial administrator provisioning
- `backend/public/admin-page.php`: session-gated handler for the admin HTML pages

Endpoint handlers use PDO directly with prepared statements; additional repository/service layers were avoided because they would add indirection without useful reuse at this project size.

## Request and authentication flow

1. Apache serves `frontend/login.html`; the root rewrite sends admin HTML requests to `backend/public/admin-page.php`.
2. The PHP page gate and each protected API verify the authenticated PHP session. API state changes also require the session CSRF token in `X-CSRF-Token`.
3. Endpoint handlers validate method, request format, parameters, and fields before issuing parameterized SQL.
4. The frontend consumes a consistent JSON envelope and handles loading, field errors, empty results, expired sessions, and network/server failures.

Full endpoint and payload details are in [api-documentation.md](api-documentation.md). Database relationships are in [database-design.md](database-design.md).

## Decisions and boundaries

- The single admin is created or updated locally via CLI from an ignored `admin.local.php` config and stored as a `password_hash()` hash. There is no registration or web-based admin-management endpoint.
- Case-insensitive uniqueness for course codes and student numbers follows `utf8mb4_unicode_ci`; course codes are normalized to uppercase by the API.
- Course deletion is not exposed. Deactivation retains enrollment links.
- Student course assignment is required to match the current frontend form.
- Apache must honor `.htaccess` and have `mod_rewrite` enabled for the HTML page gate. API authorization remains enforced independently even if Apache rewrite configuration is incorrect.
- PHP CLI is installed locally; XAMPP Apache/MySQL integration still requires execution in the user's XAMPP environment. See [../tests/backend-test-cases.md](../tests/backend-test-cases.md) for exact checks.
