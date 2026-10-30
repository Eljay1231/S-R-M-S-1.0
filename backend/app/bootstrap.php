<?php

require_once __DIR__ . '/helpers/http.php';
require_once __DIR__ . '/helpers/records.php';
require_once __DIR__ . '/helpers/validation.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/middleware/csrf.php';

function api_configure_runtime(): void
{
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
}

function api_bootstrap(): void
{
    api_configure_runtime();
    api_start_session();
}
