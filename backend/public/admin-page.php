<?php

require_once __DIR__ . '/../app/bootstrap.php';

api_configure_runtime();
api_start_session();
try {
    api_require_auth();
} catch (ApiException) {
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    $scriptSuffix = '/backend/public/admin-page.php';
    $projectPath = is_string($scriptName) && str_ends_with($scriptName, $scriptSuffix)
        ? substr($scriptName, 0, -strlen($scriptSuffix))
        : '';
    header('Location: ' . $projectPath . '/frontend/login.html?expired=1', true, 302);
    exit;
}

$page = $_GET['page'] ?? '';
if (is_string($page)) {
    $page = strtolower($page);
}
$allowedPages = [
    'dashboard.html',
    'students.html',
    'student-form.html',
    'student-details.html',
    'courses.html',
    'reports.html',
];
if (!is_string($page) || !in_array($page, $allowedPages, true)) {
    http_response_code(404);
    exit;
}

$pagePath = dirname(__DIR__, 2) . '/frontend/admin/' . $page;
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
readfile($pagePath);
