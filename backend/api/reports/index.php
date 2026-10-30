<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('GET');
    api_require_auth();
    $pdo = require __DIR__ . '/../../app/config/database.php';
    $type = $_GET['type'] ?? 'students';
    $types = ['students', 'course', 'year_level', 'enrollment_summary'];
    if (!is_string($type) || !in_array($type, $types, true)) {
        throw new ApiException(422, 'Invalid report type.', ['type' => 'Choose a supported report type.']);
    }
    $page = api_query_integer('page', 1, 1, 1000000);
    $pageSize = api_query_integer('pageSize', 25, 1, 100);

    if ($type === 'enrollment_summary') {
        $conditions = [];
        $parameters = [];
        if (isset($_GET['courseId']) && $_GET['courseId'] !== '') {
            $courseId = api_validate_record_id($_GET['courseId']);
            $courseCheck = $pdo->prepare('SELECT id FROM courses WHERE id = :id');
            $courseCheck->execute(['id' => $courseId]);
            if ($courseCheck->fetchColumn() === false) {
                throw new ApiException(422, 'Invalid query parameter.', ['courseId' => 'Choose an existing course.']);
            }
            $conditions[] = 'c.id = :course_id';
            $parameters['course_id'] = $courseId;
        }
        $where = $conditions === [] ? '' : ' WHERE ' . implode(' AND ', $conditions);
        $countQuery = $pdo->prepare('SELECT COUNT(*) FROM courses c' . $where);
        $countQuery->execute($parameters);
        $total = (int) $countQuery->fetchColumn();
        $totalPages = (int) ceil($total / $pageSize);
        $page = min($page, max(1, $totalPages));
        $statement = $pdo->prepare(
            'SELECT c.*, COALESCE(enrollment.student_count, 0) AS student_count
             FROM courses c
             LEFT JOIN (
               SELECT course_id, COUNT(*) AS student_count
               FROM students
               GROUP BY course_id
             ) enrollment ON enrollment.course_id = c.id'
             . $where
             . ' ORDER BY c.course_code ASC, c.id ASC
             LIMIT :page_size OFFSET :page_offset'
        );
        foreach ($parameters as $key => $value) {
            $statement->bindValue(':' . $key, $value, PDO::PARAM_INT);
        }
        $statement->bindValue(':page_size', $pageSize, PDO::PARAM_INT);
        $statement->bindValue(':page_offset', ($page - 1) * $pageSize, PDO::PARAM_INT);
        $statement->execute();
        api_success([
            'type' => $type,
            'items' => array_map('api_course_record', $statement->fetchAll()),
            'pagination' => [
                'page' => $page,
                'pageSize' => $pageSize,
                'totalRecords' => $total,
                'totalPages' => $totalPages,
            ],
        ]);
    }

    $search = $_GET['search'] ?? '';
    if (!is_string($search) || mb_strlen($search, 'UTF-8') > 120) {
        throw new ApiException(422, 'Invalid query parameter.', ['search' => 'Use 120 characters or fewer.']);
    }
    $conditions = [];
    $parameters = [];
    if (trim($search) !== '') {
        $conditions[] = "(s.student_number LIKE :search_number ESCAPE '!'
            OR s.first_name LIKE :search_first ESCAPE '!'
            OR s.middle_name LIKE :search_middle ESCAPE '!'
            OR s.last_name LIKE :search_last ESCAPE '!'
            OR CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) LIKE :search_full ESCAPE '!')";
        $term = api_like_term(trim($search));
        foreach (['number', 'first', 'middle', 'last', 'full'] as $key) {
            $parameters['search_' . $key] = $term;
        }
    }

    if (isset($_GET['courseId']) && $_GET['courseId'] !== '') {
        $courseId = api_validate_record_id($_GET['courseId']);
        $courseCheck = $pdo->prepare('SELECT id FROM courses WHERE id = :id');
        $courseCheck->execute(['id' => $courseId]);
        if ($courseCheck->fetchColumn() === false) {
            throw new ApiException(422, 'Invalid query parameter.', ['courseId' => 'Choose an existing course.']);
        }
        $conditions[] = 's.course_id = :course_id';
        $parameters['course_id'] = $courseId;
    }
    if (isset($_GET['yearLevel']) && $_GET['yearLevel'] !== '') {
        $yearLevel = api_query_integer('yearLevel', 1, 1, 4);
        $conditions[] = 's.year_level = :year_level';
        $parameters['year_level'] = $yearLevel;
    }

    $where = $conditions === [] ? '' : ' WHERE ' . implode(' AND ', $conditions);
    $countQuery = $pdo->prepare('SELECT COUNT(*) FROM students s' . $where);
    $countQuery->execute($parameters);
    $total = (int) $countQuery->fetchColumn();
    $totalPages = (int) ceil($total / $pageSize);
    $page = min($page, max(1, $totalPages));
    $statement = $pdo->prepare(
        'SELECT s.*, c.course_code, c.course_name
         FROM students s INNER JOIN courses c ON c.id = s.course_id'
         . $where
         . ' ORDER BY s.student_number ASC, s.id ASC
         LIMIT :page_size OFFSET :page_offset'
    );
    foreach ($parameters as $key => $value) {
        $statement->bindValue(':' . $key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }
    $statement->bindValue(':page_size', $pageSize, PDO::PARAM_INT);
    $statement->bindValue(':page_offset', ($page - 1) * $pageSize, PDO::PARAM_INT);
    $statement->execute();

    api_success([
        'type' => $type,
        'items' => array_map('api_student_record', $statement->fetchAll()),
        'pagination' => [
            'page' => $page,
            'pageSize' => $pageSize,
            'totalRecords' => $total,
            'totalPages' => $totalPages,
        ],
    ]);
});
