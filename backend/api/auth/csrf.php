<?php

require_once __DIR__ . '/../../app/bootstrap.php';

api_run(function (): void {
    api_bootstrap();
    api_require_method('GET');
    api_success(['csrfToken' => api_csrf_token()]);
});
