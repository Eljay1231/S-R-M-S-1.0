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

    api_transaction($pdo, function () use ($pdo, $body, $id): void {
        $existingQuery = $pdo->prepare('SELECT course_id FROM students WHERE id = :id FOR UPDATE');
        $existingQuery->execute(['id' => $id]);
        $existingCourseId = $existingQuery->fetchColumn();
        if ($existingCourseId === false) {
            throw new ApiException(404, 'The requested student was not found.');
        }
        $student = api_validate_student($pdo, $body, $id, (int) $existingCourseId);
        $statement = $pdo->prepare(
            'UPDATE students SET
              student_number = :student_number,
              first_name = :first_name,
              middle_name = :middle_name,
              last_name = :last_name,
              gender = :gender,
              date_of_birth = :date_of_birth,
              email = :email,
              contact_number = :contact_number,
              address = :address,
              course_id = :course_id,
              year_level = :year_level,
              updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        );
        $statement->execute([
            'student_number' => $student['studentNumber'],
            'first_name' => $student['firstName'],
            'middle_name' => $student['middleName'],
            'last_name' => $student['lastName'],
            'gender' => $student['gender'],
            'date_of_birth' => $student['dateOfBirth'],
            'email' => $student['email'],
            'contact_number' => $student['contactNumber'],
            'address' => $student['address'],
            'course_id' => $student['courseId'],
            'year_level' => $student['yearLevel'],
            'id' => $id,
        ]);
    });

    $updatedQuery = $pdo->prepare(
        'SELECT s.*, c.course_code, c.course_name
         FROM students s INNER JOIN courses c ON c.id = s.course_id
         WHERE s.id = :id'
    );
    $updatedQuery->execute(['id' => $id]);
    api_success(['student' => api_student_record($updatedQuery->fetch())], 'Student updated successfully.');
});
