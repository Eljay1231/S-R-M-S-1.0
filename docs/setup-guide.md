# Windows and XAMPP setup

## Prerequisites

Use XAMPP with PHP 8.0+, Apache, and MySQL/MariaDB. This development machine has standalone PHP 8.5.12 installed at `%LOCALAPPDATA%\Programs\PHP-8.5.12`, with `pdo_mysql` and `mbstring`, and that directory is on the current Windows user's `PATH`. Open a new terminal and run `php -v` to verify it. On another machine, use XAMPP's bundled PHP CLI or install PHP 8+ and the same extensions. For Apache, make sure XAMPP's PHP configuration enables `pdo_mysql` and `mbstring`, then restart Apache. Ensure Apache has `mod_rewrite` enabled and permits `.htaccess` overrides for this project (`AllowOverride All`).

## Installation

1. Copy the entire project folder to `C:\xampp\htdocs\S-R-M-S`; keep both `frontend` and `backend` directories inside it.
2. Open XAMPP Control Panel and start **Apache** and **MySQL**.
3. Visit `http://localhost/phpmyadmin`.
4. Select **Import**, choose `backend/database/schema.sql`, and run it. This creates `student_db` and its tables.
5. Import `backend/database/seed.sql` separately if you want the fictional sample courses and students.
6. Copy the database configuration example:

   ```powershell
   Copy-Item backend\app\config\database.example.php backend\app\config\database.local.php
   ```

   Edit `backend\app\config\database.local.php` to match your local MySQL host, username, password, and database. Do not commit this ignored file.

7. Copy `backend\app\config\admin.example.php` to `backend\app\config\admin.local.php`, then edit the three values in that local PHP file:

   ```powershell
   Copy-Item backend\app\config\admin.example.php backend\app\config\admin.local.php
   ```

   Set `username`, `email`, and `password` to the credentials you want. Use a unique username, a valid email address, and a private password 12-72 bytes long. This file is ignored by Git and protected from direct web access. It contains a plaintext password locally, so do not share or commit it.

   From the project root (`C:\xampp\htdocs\S-R-M-S`), run:

   ```powershell
   C:\xampp\php\php.exe .\backend\bin\create-admin.php
   ```

   If your terminal is already in `C:\xampp\htdocs\S-R-M-S\backend`, use:

   ```powershell
   C:\xampp\php\php.exe .\bin\create-admin.php
   ```

   The command creates the admin if no admin exists, or updates the single existing admin using the edited values. The password is saved to MySQL as a `password_hash()` hash. To change credentials later, edit `admin.local.php` and run the same command again. No public registration page or web-based account setup exists.

8. Open `http://localhost/S-R-M-S/` (redirects to `frontend/login.html`) and sign in with those credentials. Admin pages should redirect to login when unauthenticated.

## Smoke checks

- Confirm login accepts the created account and rejects incorrect credentials.
- Confirm student list, search, filters, add/edit/delete, and details load from MySQL.
- Confirm courses can be created, updated, activated, and deactivated; inactive courses cannot be newly assigned.
- Confirm dashboard counts and reports change when records change.
- Confirm logout redirects to login and admin pages cannot be reopened without signing in.

## Troubleshooting

- **Database connection error:** Verify MySQL is running and local configuration matches the MySQL account. Check that the `student_db` schema was imported.
- **PDO driver missing:** Enable `pdo_mysql` in XAMPP's `php.ini` and restart Apache.
- **mbstring missing:** Enable `mbstring` in XAMPP's `php.ini` and restart Apache.
- **Admin page rewrite not working:** Confirm `mod_rewrite` is enabled, `AllowOverride All` is set for `htdocs`, and Apache has restarted. APIs still enforce their own session authorization.
- **JavaScript modules fail:** Use the `http://localhost/...` URL, not `file://`.
- **403 under `backend/app/`, `backend/bin/`, or `backend/database/`:** This is intentional; PHP includes backend files internally and phpMyAdmin imports SQL from disk.

## Runtime limitations

PHP 8.5.12 CLI with `pdo_mysql` and `mbstring` is installed in this workspace for linting and local commands. Apache and MySQL are still required from XAMPP; the backend has not yet been executed against those services. Complete the smoke checks and record actual outcomes in [backend-test-cases.md](../tests/backend-test-cases.md).
