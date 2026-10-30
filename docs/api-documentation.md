# API documentation

All paths are relative to the project root (for example, `http://localhost/S-R-M-S/backend/api/students/index.php`). API requests and responses use JSON. Protected endpoints require the PHP session cookie. Mutating requests also require `X-CSRF-Token`.

## Response envelope

Success:

```json
{"success":true,"message":"Student created successfully.","data":{"student":{"id":1,"studentNumber":"2026-0001"}}}
```

Failure:

```json
{"success":false,"message":"Validation failed.","errors":{"studentNumber":"This student number is already in use."}}
```

List responses put records in `data.items` and pagination metadata in `data.pagination` (`page`, `pageSize`, `totalRecords`, `totalPages`). Password hashes are never returned.

## Authentication

| Method and path | Auth | CSRF | Request/result |
|---|---|---|---|
| `GET /backend/api/auth/csrf.php` | No | No | Creates/returns `data.csrfToken`; use it for login |
| `POST /backend/api/auth/login.php` | No | Required | JSON `{ "username": "...", "password": "..." }`; 200 on success, 401 on invalid credentials |
| `GET /backend/api/auth/me.php` | Yes | No | Returns `data.admin.username` and a CSRF token |
| `POST /backend/api/auth/logout.php` | Yes | Required | Destroys the session |

## Students

| Method and path | Required parameters | Request/result |
|---|---|---|
| `GET /backend/api/students/index.php` | None | Optional `search`, `courseId`, `yearLevel`, `page`, `pageSize`, `sort`, `direction`; returns paginated `items` |
| `GET /backend/api/students/show.php?id=1` | `id` | Returns `data.student`, or 404 |
| `POST /backend/api/students/create.php` | JSON student fields | Creates a student; 201 |
| `PUT /backend/api/students/update.php?id=1` | `id`, JSON student fields | Updates the record; created timestamp is preserved |
| `DELETE /backend/api/students/delete.php?id=1` | `id` | Deletes the record |

Student JSON uses `studentNumber`, `firstName`, `middleName`, `lastName`, `gender`, `dateOfBirth` (`YYYY-MM-DD`), `email`, `contactNumber`, `address`, `courseId` (integer), and `yearLevel` (1-4). Course assignment is required and must be active for new assignments. An existing student may retain the same inactive course.

Search includes student number, first/middle/last name, and full name. Sort fields are allowlisted: `studentNumber`, `firstName`, `lastName`, `createdAt`; direction is `asc` or `desc`. Page size is 1-100 (default 5).

## Courses

| Method and path | Required parameters | Request/result |
|---|---|---|
| `GET /backend/api/courses/index.php` | None | Optional `search` and `status`; returns all matching courses and current `studentCount` |
| `GET /backend/api/courses/show.php?id=1` | `id` | Returns one course and enrollment count, or 404 |
| `POST /backend/api/courses/create.php` | JSON `courseCode`, `courseName`, optional `description` | Creates an active course; 201 |
| `PUT /backend/api/courses/update.php?id=1` | `id`, JSON course fields | Updates code, name, and description without changing status |
| `POST /backend/api/courses/status.php?id=1` | `id`, JSON `{ "status": "active" }` or `inactive` | Activates/deactivates; keeps current student relationships |

## Dashboard and reports

- `GET /backend/api/dashboard/index.php` returns `data.statistics`, `data.recentStudents`, and `data.courseEnrollments`.
- `GET /backend/api/reports/index.php?type=students` returns the complete student list.
- `GET /backend/api/reports/index.php?type=course&courseId=1` filters by course; the course filter is optional in the UI.
- `GET /backend/api/reports/index.php?type=year_level&yearLevel=1` filters by year level; the year filter is optional in the UI.
- `GET /backend/api/reports/index.php?type=enrollment_summary` returns all courses, including inactive courses, and enrollment counts.
- Reports accept `page` (default 1) and `pageSize` (1-100, default 25); student reports also accept `search`, `courseId`, and `yearLevel`.

## Status codes

`200` success; `201` created; `400` malformed request/ID; `401` unauthenticated or expired session; `403` invalid/missing CSRF; `404` record not found; `405` wrong method; `409` database uniqueness/relationship conflict; `415` wrong content type; `422` validation failure; `500` unexpected server error.
