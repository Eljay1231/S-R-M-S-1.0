# Student Record Management System — Frontend Prototype

A responsive, admin-only frontend prototype for managing fictional student and course records. This academic project uses browser-native HTML, CSS, and JavaScript ES modules. It does not contain a PHP backend or database.

## Technology

- HTML5, CSS3, and vanilla JavaScript (ES modules)
- No frontend framework or package dependencies
- Designed for future PHP 8+, PDO, and MySQL/MariaDB integration

## Run the prototype

Serve this folder with a static web server so the browser can load JavaScript modules. For example, with XAMPP installed, place the project under `htdocs` and open `http://localhost/<project-folder>/login.html`. Any basic static HTTP server also works. No build step or npm installation is required.

The login is a clearly labeled demonstration: any non-empty username and password opens the dashboard. It does not authenticate users or provide security.

## Pages and features

- `login.html`: demonstration login and password visibility toggle
- `admin/dashboard.html`: dynamically calculated dashboard metrics, recent registrations, and enrollment counts
- `admin/students.html`: student search, course/year filters, pagination, in-page add/edit dialogs, details links, and confirmed deletion
- `admin/student-form.html`: standalone student add/edit form with validation
- `admin/student-details.html`: student details with missing-record handling
- `admin/courses.html`: course search, add/edit, enrollment counts, status activation/deactivation, and student links
- `admin/reports.html`: complete student list, course/year reports, enrollment summary, filters, and print layout

Sample records are centralized in `assets/js/data.js`; reusable validation and rendering helpers live under `assets/js/`.

## Prototype limitations

- Student and course data is fictional and exists only in JavaScript memory.
- Add/edit/delete/status operations are temporary. Reloading or navigating to another HTML page restores the original sample data.
- No localStorage/sessionStorage, database, API, backend, real authentication, or access control is implemented.
- Client-side validation improves usability but is not a security boundary.
- A future backend must validate and authorize every operation on the server.

## Folder structure

```text
login.html
admin/
  dashboard.html
  students.html
  student-form.html
  student-details.html
  courses.html
  reports.html
assets/
  css/
  js/
docs/
tests/
```

See [docs/frontend-design.md](docs/frontend-design.md), [docs/backend-integration-plan.md](docs/backend-integration-plan.md), and [tests/frontend-test-cases.md](tests/frontend-test-cases.md).
