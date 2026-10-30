# Student Record Management System

An admin-only student record system using PHP 8+, PDO, MySQL/MariaDB, HTML, CSS, and vanilla JavaScript modules. The existing page layout is retained; records and authentication are now provided by same-origin PHP APIs.

## Features

- Single administrator account with PHP password hashing and session authentication
- CSRF-protected student and course changes
- Student search, course/year filters, sorting, and server-side pagination
- Course activation/deactivation with enrollment counts
- Database-driven dashboard and paginated reports
- Server-side validation, prepared statements, and consistent JSON responses

## Requirements

- XAMPP with PHP 8.0 or later, Apache, and MySQL/MariaDB
- PHP extensions `pdo_mysql` and `mbstring`
- Apache `mod_rewrite` enabled and `.htaccess` overrides allowed for the project
- PHP CLI for creating the initial administrator; this workspace has PHP 8.5.12 installed under `%LOCALAPPDATA%\Programs\PHP-8.5.12`

No Composer dependencies are required; the backend uses native PHP/PDO.

## Run locally

Follow [docs/setup-guide.md](docs/setup-guide.md) for the complete Windows/XAMPP steps. In brief:

1. Copy the project folder into `C:\xampp\htdocs\S-R-M-S`.
2. Start Apache and MySQL in the XAMPP Control Panel.
3. Import `backend/database/schema.sql`, then `backend/database/seed.sql`, through phpMyAdmin.
4. Copy `backend/app/config/database.example.php` to `backend/app/config/database.local.php` and set your local MySQL credentials. The local file is ignored by Git and denied by Apache.
5. To set credentials by editing local PHP config strings, copy `backend/app/config/admin.example.php` to `backend/app/config/admin.local.php`, replace its username, email, and password, then run `php backend\bin\create-admin.php` from the project root (or `php .\bin\create-admin.php` from `backend`). If `php` is not recognized, use `C:\xampp\php\php.exe .\backend\bin\create-admin.php` from the project root. The local config is ignored by Git. The command creates the sole admin if none exists or updates it if one exists.
6. Open `http://localhost/S-R-M-S/`; the project redirects to `frontend/login.html`.

Do not open the HTML files through `file://`; the application needs Apache/PHP and same-origin session cookies.

## Database and API

- Database name: `student_db`
- SQL schema and fictional sample records: [backend/database/](backend/database)
- Frontend pages and assets: [frontend/](frontend)
- PHP APIs and application logic: [backend/](backend)
- Endpoint details and response shapes: [docs/api-documentation.md](docs/api-documentation.md)
- Security design: [docs/security.md](docs/security.md)
- Architecture: [docs/backend-architecture.md](docs/backend-architecture.md)

## Project layout

```text
frontend/
  login.html
  admin/       Admin-only pages
  assets/      CSS styles and JavaScript modules
backend/
  api/         Authentication, student, course, dashboard, and report endpoints
  app/         PDO configuration, shared helpers, and session/CSRF middleware
  bin/         CLI-only administrator setup
  database/    Schema and optional fictional seed data
  public/      Session-gated admin page handler
docs/          Setup, API, architecture, database, and security guides
tests/         Verification records and test cases
```

The seed file contains fictional demonstration courses and students; remove those records if they are not wanted. The schema requires students to have a course, and courses with student records cannot be deleted; deactivate them instead.

## Known limitations

- The PHP CLI and required extensions are installed and linted locally, but the project has not been run against Apache or MySQL; confirm integration tests using XAMPP as described in [docs/setup-guide.md](docs/setup-guide.md).
- The CLI command manages only one administrator and is not exposed as a web endpoint. Keep the local plaintext-password config private and never commit it.
- This academic project has not received a production deployment/security review and should not be described as production-ready.
