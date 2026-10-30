<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('POST');
    api_require_auth();
    api_require_csrf();
    $id = api_validate_record_id($_GET['id'] ?? null);
    $body = api_json_body();
    api_reject_unknown_fields($body, ['status']);
    $status = $body['status'] ?? null;
    if (!is_string($status) || !in_array($status, ['active', 'inactive'], true)) {
        throw new ApiException(422, 'Validation failed.', ['status' => 'Choose active or inactive.']);
    }

    $pdo = require __DIR__ . '/../../app/config/database.php';
    $statement = $pdo->prepare('UPDATE courses SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
    $statement->execute(['status' => $status, 'id' => $id]);
    if ($statement->rowCount() === 0) {
        $exists = $pdo->prepare('SELECT id FROM courses WHERE id = :id');
        $exists->execute(['id' => $id]);
        if ($exists->fetchColumn() === false) {
            throw new ApiException(404, 'The requested course was not found.');
        }
    }

    $courseQuery = $pdo->prepare(
        'SELECT c.*, COALESCE(enrollment.student_count, 0) AS student_count
         FROM courses c
         LEFT JOIN (
           SELECT course_id, COUNT(*) AS student_count
           FROM students
           GROUP BY course_id
         ) enrollment ON enrollment.course_id = c.id
         WHERE c.id = :id'
    );
    $courseQuery->execute(['id' => $id]);
    api_success(['course' => api_course_record($courseQuery->fetch())], 'Course status updated successfully.');
});
