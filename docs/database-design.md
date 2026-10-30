# Database design

Database: `student_db`, InnoDB, `utf8mb4`, `utf8mb4_unicode_ci`.

## `admins`

| Column | Type | Constraints |
|---|---|---|
| `id` | `INT UNSIGNED` | Auto-increment primary key |
| `username` | `VARCHAR(80)` | Required, unique |
| `email` | `VARCHAR(254)` | Required, unique |
| `password` | `VARCHAR(255)` | Required password hash only |
| `created_at` | `TIMESTAMP` | Required, defaults to current timestamp |
| `updated_at` | `TIMESTAMP` | Required, updates automatically |

There is no public account registration. The CLI setup command creates the first account only.

## `courses`

| Column | Type | Constraints |
|---|---|---|
| `id` | `INT UNSIGNED` | Auto-increment primary key |
| `course_code` | `VARCHAR(20)` | Required, unique under case-insensitive collation |
| `course_name` | `VARCHAR(120)` | Required |
| `description` | `VARCHAR(240)` | Nullable |
| `status` | `ENUM('active','inactive')` | Required, defaults to `active` |
| `created_at`, `updated_at` | `TIMESTAMP` | Required; `updated_at` auto-updates |

The `status` index supports active-course filtering. Course codes are normalized to uppercase in API writes and compared case-insensitively by the database collation.

## `students`

| Column | Type | Constraints |
|---|---|---|
| `id` | `INT UNSIGNED` | Auto-increment primary key |
| `student_number` | `VARCHAR(30)` | Required, unique under case-insensitive collation |
| `first_name`, `last_name` | `VARCHAR(60)` | Required |
| `middle_name` | `VARCHAR(60)` | Nullable |
| `gender` | `ENUM('Female','Male','Non-binary','Prefer not to say')` | Required |
| `date_of_birth` | `DATE` | Required; server rejects invalid or future dates |
| `email` | `VARCHAR(120)` | Nullable; validated when supplied |
| `contact_number` | `VARCHAR(30)` | Nullable |
| `address` | `VARCHAR(240)` | Required |
| `course_id` | `INT UNSIGNED` | Required foreign key to `courses.id` |
| `year_level` | `TINYINT UNSIGNED` | Required; constraint limits values to 1-4 |
| `created_at`, `updated_at` | `TIMESTAMP` | Required; `updated_at` auto-updates |

Indexes cover student number (unique), name search, course/year filters, and recent registrations.

## Relationships and delete behavior

- One course can have many students; each student must have one course.
- `students.course_id` references `courses.id` with `ON DELETE RESTRICT` and `ON UPDATE CASCADE`.
- Course deletion is not offered by the API. Deactivate a course to prevent new assignments while retaining current students.
- Database timestamps use MySQL timestamps; API display fields expose date-only strings for the existing interface.

Import `schema.sql` before `seed.sql`. Seed rows are fictional demo data, not administrator credentials.
