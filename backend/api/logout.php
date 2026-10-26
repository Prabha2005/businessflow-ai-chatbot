<?php

require_once __DIR__ . '/cors.php';

ensure_session_started();

$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    header_remove('Set-Cookie');
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => $params["path"] ?: '/',
        'domain' => $params["domain"] ?: '',
        'secure' => $params["secure"] ?? false,
        'httponly' => $params["httponly"] ?? true,
        'samesite' => $params["samesite"] ?? 'Lax'
    ]);
}

session_destroy();

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully.'
], JSON_UNESCAPED_UNICODE);
