<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('POST');
    api_require_auth();
    api_require_csrf();
    $body = api_json_body();
    $pdo = require __DIR__ . '/../../app/config/database.php';
    $createdId = api_transaction($pdo, function () use ($pdo, $body): int {
        $student = api_validate_student($pdo, $body);
        $statement = $pdo->prepare(
            'INSERT INTO students
              (student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, address, course_id, year_level)
             VALUES
              (:student_number, :first_name, :middle_name, :last_name, :gender, :date_of_birth, :email, :contact_number, :address, :course_id, :year_level)'
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
        ]);
        return (int) $pdo->lastInsertId();
    });
    $createdQuery = $pdo->prepare(
        'SELECT s.*, c.course_code, c.course_name
         FROM students s INNER JOIN courses c ON c.id = s.course_id
         WHERE s.id = :id'
    );
    $createdQuery->execute(['id' => $createdId]);
    api_success(['student' => api_student_record($createdQuery->fetch())], 'Student created successfully.', 201);
});
