# Backend integration plan

## Current frontend contract

`assets/js/data.js` exports `students` and `courses` arrays and helper functions. Student records include `id`, `studentNumber`, `firstName`, `middleName`, `lastName`, `gender`, `dateOfBirth`, `email`, `contactNumber`, `address`, `courseId`, `yearLevel`, `createdAt`, and `updatedAt`. Course records include `id`, `courseCode`, `courseName`, `description`, `status`, and `createdAt`.

The current UI mutates these arrays in memory for demonstration. The UI must not treat that behavior as persistence. Data reads/calculations are separated from page rendering so the sample data module can be replaced by an API-backed data-access module.

## Proposed relational model

- `admins`: administrator ID, unique username, password hash, status, timestamps
- `courses`: course ID, unique course code, course name, description, status, timestamps
- `students`: student ID, unique student number, names, gender, date of birth, email, contact number, address, course ID, year level, timestamps
- `students.course_id` references `courses.id`; define explicit delete/update behavior and do not cascade-delete student records when deactivating a course.

Use database constraints for unique identifiers and foreign keys. Store dates in database date/datetime types and validate all incoming values server-side.

## Integration points

1. Replace array lookups and mutations in `data.js` with an API service using `fetch`.
2. Provide PHP 8+ endpoints for administrator login/logout, student list/detail/create/update/delete, course list/detail/create/update/status changes, dashboard statistics, and report queries.
3. Use PDO prepared statements, server-side input validation, authorization checks on every admin endpoint, secure password hashing, and secure session/cookie settings.
4. Return consistent JSON and HTTP status codes. Render API-provided values using safe DOM APIs.
5. Implement server-side pagination, searching, filtering, and report totals for larger datasets.
6. Configure CSRF protection for state-changing requests and avoid exposing database credentials to the browser.

No PHP, PDO, MySQL connection, credentials, or real authentication are part of this phase.
