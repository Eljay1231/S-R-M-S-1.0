# Security controls

- **Passwords:** The administrator CLI accepts 12-72 byte passwords and stores only `password_hash(..., PASSWORD_DEFAULT)` output. Login uses `password_verify()`. Hashes are excluded from all API results.
- **Account provisioning:** There is no registration endpoint or UI. `backend/bin/create-admin.php` can create/update the single admin through CLI only. `backend/app/config/admin.local.php` is local and Git-ignored, but contains a plaintext password while present; keep it private and delete it when it is not needed. Only the password hash is written to the database.
- **Database configuration:** Copy `backend/app/config/database.example.php` to ignored `backend/app/config/database.local.php` and edit the local copy. Apache denies direct access to `backend/app/` and `backend/database/`.
- **Sessions:** Strict mode, cookies only, HTTP-only, SameSite=Lax, Secure when HTTPS is detected, ID regeneration on login, 30-minute idle timeout, and cookie/session destruction on logout.
- **Authorization:** Admin HTML routes pass through the root Apache rewrite/PHP session gate in `backend/public/admin-page.php`. Every data API independently checks the session and returns 401 when unauthenticated.
- **CSRF:** A random token is issued by the server, rotated after login, and required in `X-CSRF-Token` for all state-changing requests, including login/logout.
- **SQL injection/mass assignment:** PDO native prepared statements are used. Dynamic sort keys are allowlisted, accepted payload fields are allowlisted, and user values are parameterized.
- **Validation/integrity:** Every API write validates types, lengths, dates, email, course status, allowed enums, and uniqueness; database constraints enforce key relationships and ranges.
- **Output/error handling:** Frontend record content is rendered with `textContent`; API errors do not include SQL details, credentials, or stack traces. Server logs omit request values and session IDs.
- **CORS:** No cross-origin access is enabled. Same-origin cookies and Fetch credentials are used.

Configure Apache so `.htaccess` is honored and `mod_rewrite` is enabled. The page gate is an extra UI boundary; API authorization remains authoritative.

This is an academic local deployment and has not had a production configuration/security review. Do not expose it to the public internet as-is.
