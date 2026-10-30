<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('GET');
    api_require_auth();
    $pdo = require __DIR__ . '/../../app/config/database.php';
    $search = $_GET['search'] ?? '';
    if (!is_string($search) || mb_strlen($search, 'UTF-8') > 120) {
        throw new ApiException(422, 'Invalid query parameter.', ['search' => 'Use 120 characters or fewer.']);
    }

    $conditions = [];
    $parameters = [];
    if (trim($search) !== '') {
        $conditions[] = "(c.course_code LIKE :search_code ESCAPE '!'
            OR c.course_name LIKE :search_name ESCAPE '!'
            OR c.description LIKE :search_description ESCAPE '!')";
        $term = api_like_term(trim($search));
        $parameters = [
            'search_code' => $term,
            'search_name' => $term,
            'search_description' => $term,
        ];
    }
    if (isset($_GET['status']) && $_GET['status'] !== '') {
        $status = $_GET['status'];
        if (!is_string($status) || !in_array($status, ['active', 'inactive'], true)) {
            throw new ApiException(422, 'Invalid query parameter.', ['status' => 'Choose active or inactive.']);
        }
        $conditions[] = 'c.status = :status';
        $parameters['status'] = $status;
    }
    $where = $conditions === [] ? '' : ' WHERE ' . implode(' AND ', $conditions);
    $statement = $pdo->prepare(
        'SELECT c.*, COALESCE(enrollment.student_count, 0) AS student_count
         FROM courses c
         LEFT JOIN (
           SELECT course_id, COUNT(*) AS student_count
           FROM students
           GROUP BY course_id
         ) enrollment ON enrollment.course_id = c.id'
         . $where
         . ' ORDER BY c.course_code ASC, c.id ASC'
    );
    $statement->execute($parameters);
    api_success(['items' => array_map('api_course_record', $statement->fetchAll())]);
});
