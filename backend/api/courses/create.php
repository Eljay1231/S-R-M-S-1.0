<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('POST');
    api_require_auth();
    api_require_csrf();
    $body = api_json_body();
    $pdo = require __DIR__ . '/../../app/config/database.php';
    $course = api_validate_course($pdo, $body);
    $statement = $pdo->prepare(
        'INSERT INTO courses (course_code, course_name, description)
         VALUES (:course_code, :course_name, :description)'
    );
    $statement->execute([
        'course_code' => $course['courseCode'],
        'course_name' => $course['courseName'],
        'description' => $course['description'],
    ]);

    $createdId = (int) $pdo->lastInsertId();
    $createdQuery = $pdo->prepare(
        'SELECT c.*, 0 AS student_count FROM courses c WHERE c.id = :id'
    );
    $createdQuery->execute(['id' => $createdId]);
    api_success(['course' => api_course_record($createdQuery->fetch())], 'Course created successfully.', 201);
});
