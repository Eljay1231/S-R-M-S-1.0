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
    $page = api_query_integer('page', 1, 1, 1000000);
    $pageSize = api_query_integer('pageSize', 5, 1, 100);
    $sortOptions = [
        'studentNumber' => 's.student_number',
        'firstName' => 's.first_name',
        'lastName' => 's.last_name',
        'createdAt' => 's.created_at',
    ];
    $sort = $_GET['sort'] ?? 'studentNumber';
    if (!is_string($sort) || !isset($sortOptions[$sort])) {
        throw new ApiException(422, 'Invalid query parameter.', ['sort' => 'Choose an allowed sort field.']);
    }
    $direction = $_GET['direction'] ?? 'asc';
    if (!is_string($direction) || !in_array(strtolower($direction), ['asc', 'desc'], true)) {
        throw new ApiException(422, 'Invalid query parameter.', ['direction' => 'Choose asc or desc.']);
    }
    $direction = strtolower($direction);

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
    $countStatement = $pdo->prepare('SELECT COUNT(*) FROM students s' . $where);
    $countStatement->execute($parameters);
    $total = (int) $countStatement->fetchColumn();
    $totalPages = (int) ceil($total / $pageSize);
    $page = min($page, max(1, $totalPages));
    $offset = ($page - 1) * $pageSize;

    $statement = $pdo->prepare(
        'SELECT s.*, c.course_code, c.course_name
         FROM students s
         INNER JOIN courses c ON c.id = s.course_id'
         . $where
         . ' ORDER BY ' . $sortOptions[$sort] . ' ' . strtoupper($direction) . ', s.id ASC
         LIMIT :page_size OFFSET :page_offset'
    );
    foreach ($parameters as $key => $value) {
        $statement->bindValue(':' . $key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }
    $statement->bindValue(':page_size', $pageSize, PDO::PARAM_INT);
    $statement->bindValue(':page_offset', $offset, PDO::PARAM_INT);
    $statement->execute();
    $items = array_map('api_student_record', $statement->fetchAll());

    api_success([
        'items' => $items,
        'pagination' => [
            'page' => $page,
            'pageSize' => $pageSize,
            'totalRecords' => $total,
            'totalPages' => $totalPages,
        ],
    ]);
});
