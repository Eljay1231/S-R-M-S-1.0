<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('DELETE');
    api_require_auth();
    api_require_csrf();
    $id = api_validate_record_id($_GET['id'] ?? null);
    $pdo = require __DIR__ . '/../../app/config/database.php';
    $statement = $pdo->prepare('DELETE FROM students WHERE id = :id');
    $statement->execute(['id' => $id]);
    if ($statement->rowCount() === 0) {
        throw new ApiException(404, 'The requested student was not found.');
    }
    api_success([], 'Student deleted successfully.');
});
