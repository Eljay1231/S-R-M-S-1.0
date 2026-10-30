<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('GET');
    api_require_auth();
    $pdo = require __DIR__ . '/../../app/config/database.php';

    $totals = $pdo->query(
        "SELECT
           (SELECT COUNT(*) FROM students) AS total_students,
           (SELECT COUNT(*) FROM courses) AS total_courses,
           (SELECT COUNT(*) FROM courses WHERE status = 'active') AS active_courses,
           (SELECT COUNT(*) FROM students WHERE course_id IS NULL) AS unassigned_students"
    )->fetch();

    $recentQuery = $pdo->query(
        'SELECT s.*, c.course_code, c.course_name
         FROM students s INNER JOIN courses c ON c.id = s.course_id
         ORDER BY s.created_at DESC, s.id DESC
         LIMIT 5'
    );
    $courseQuery = $pdo->query(
        'SELECT c.*, COALESCE(enrollment.student_count, 0) AS student_count
         FROM courses c
         LEFT JOIN (
           SELECT course_id, COUNT(*) AS student_count
           FROM students
           GROUP BY course_id
         ) enrollment ON enrollment.course_id = c.id
         ORDER BY c.course_code ASC, c.id ASC'
    );

    api_success([
        'statistics' => [
            'totalStudents' => (int) $totals['total_students'],
            'totalCourses' => (int) $totals['total_courses'],
            'activeCourses' => (int) $totals['active_courses'],
            'unassignedStudents' => (int) $totals['unassigned_students'],
        ],
        'recentStudents' => array_map('api_student_record', $recentQuery->fetchAll()),
        'courseEnrollments' => array_map('api_course_record', $courseQuery->fetchAll()),
    ]);
});
