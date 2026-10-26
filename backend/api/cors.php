<?php

header("Content-Type: application/json; charset=UTF-8");

$origin = rtrim($_SERVER['HTTP_ORIGIN'] ?? '', '/');

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://businessflowai.freedev.app',

];

$isAllowed = in_array($origin, $allowedOrigins, true);

if ($isAllowed) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With, Origin");
header("Access-Control-Max-Age: 86400");

// Respond to browser preflight requests immediately
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/**
 * Helper to ensure a secure session is started with cross-site cookie parameters.
 */
function ensure_session_started(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $isHttps = (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) ||
            (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
            (isset($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] === 'on') ||
            str_starts_with($origin, 'https://')
        );

        $cookieParams = [
            'lifetime' => 86400,
            'path' => '/',
            'secure' => $isHttps,
            'httponly' => true,
            'samesite' => $isHttps ? 'None' : 'Lax'
        ];

        session_set_cookie_params($cookieParams);
        @session_start();
    }
}
