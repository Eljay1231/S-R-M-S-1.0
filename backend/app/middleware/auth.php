<?php

const SRMS_SESSION_IDLE_TIMEOUT = 1800;

function api_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_trans_sid', '0');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function api_require_auth(): int
{
    api_start_session();
    $adminId = $_SESSION['admin_id'] ?? null;
    $lastActivity = $_SESSION['last_activity'] ?? null;
    if (!is_int($adminId) || !is_int($lastActivity) || time() - $lastActivity > SRMS_SESSION_IDLE_TIMEOUT) {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax',
            ]);
        }
        session_destroy();
        throw new ApiException(401, 'Your session has expired. Sign in again.');
    }
    $_SESSION['last_activity'] = time();
    return $adminId;
}
