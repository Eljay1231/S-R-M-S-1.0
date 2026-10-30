<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('PUT');
    api_require_auth();
    api_require_csrf();
    $id = api_validate_record_id($_GET['id'] ?? null);
    $body = api_json_body();
    $pdo = require __DIR__ . '/../../app/config/database.php';
    $existingQuery = $pdo->prepare('SELECT id FROM courses WHERE id = :id');
    $existingQuery->execute(['id' => $id]);
    if ($existingQuery->fetchColumn() === false) {
        throw new ApiException(404, 'The requested course was not found.');
    }

    $course = api_validate_course($pdo, $body, $id);
    $statement = $pdo->prepare(
        'UPDATE courses
         SET course_code = :course_code, course_name = :course_name, description = :description,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :id'
    );
    $statement->execute([
        'course_code' => $course['courseCode'],
        'course_name' => $course['courseName'],
        'description' => $course['description'],
        'id' => $id,
    ]);

    $updatedQuery = $pdo->prepare(
        'SELECT c.*, COALESCE(enrollment.student_count, 0) AS student_count
         FROM courses c
         LEFT JOIN (
           SELECT course_id, COUNT(*) AS student_count
           FROM students
           GROUP BY course_id
         ) enrollment ON enrollment.course_id = c.id
         WHERE c.id = :id'
    );
    $updatedQuery->execute(['id' => $id]);
    api_success(['course' => api_course_record($updatedQuery->fetch())], 'Course updated successfully.');
});
