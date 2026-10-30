<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('GET');
    api_require_auth();
    $id = api_validate_record_id($_GET['id'] ?? null);
    $pdo = require __DIR__ . '/../../app/config/database.php';
    $statement = $pdo->prepare(
        'SELECT s.*, c.course_code, c.course_name
         FROM students s
         INNER JOIN courses c ON c.id = s.course_id
         WHERE s.id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $id]);
    $student = $statement->fetch();
    if (!$student) {
        throw new ApiException(404, 'The requested student was not found.');
    }
    api_success(['student' => api_student_record($student)]);
});
