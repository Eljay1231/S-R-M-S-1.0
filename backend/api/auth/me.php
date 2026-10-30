<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('GET');
    $adminId = api_require_auth();
    $pdo = require __DIR__ . '/../../app/config/database.php';
    $statement = $pdo->prepare('SELECT username FROM admins WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $adminId]);
    $username = $statement->fetchColumn();
    if ($username === false) {
        $_SESSION = [];
        session_destroy();
        throw new ApiException(401, 'Your session has expired. Sign in again.');
    }

    api_success([
        'admin' => ['username' => $username],
        'csrfToken' => api_csrf_token(),
    ]);
});
