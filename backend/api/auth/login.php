<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('POST');
    $body = api_json_body();
    api_reject_unknown_fields($body, ['username', 'password']);

    $errors = [];
    $username = api_validate_string($body, 'username', 'Username', 80, true, $errors);
    $password = $body['password'] ?? null;
    if (!is_string($password) || $password === '') {
        $errors['password'] = 'Password is required.';
    } elseif (strlen($password) > 72) {
        $errors['password'] = 'Password is too long (maximum 72 bytes).';
    }
    if ($errors !== []) {
        throw new ApiException(422, 'Validation failed.', $errors);
    }
    api_require_csrf();

    $pdo = require __DIR__ . '/../../app/config/database.php';
    $statement = $pdo->prepare('SELECT id, username, password FROM admins WHERE username = :username LIMIT 1');
    $statement->execute(['username' => $username]);
    $admin = $statement->fetch();
    if (!$admin || !password_verify($password, $admin['password'])) {
        throw new ApiException(401, 'The username or password is incorrect.');
    }

    if (!session_regenerate_id(true)) {
        throw new RuntimeException('Unable to regenerate the session identifier.');
    }
    $_SESSION = [
        'admin_id' => (int) $admin['id'],
        'username' => $admin['username'],
        'last_activity' => time(),
        'csrf_token' => bin2hex(random_bytes(32)),
    ];

    api_success([
        'admin' => ['username' => $admin['username']],
        'csrfToken' => $_SESSION['csrf_token'],
    ], 'Signed in successfully.');
});
