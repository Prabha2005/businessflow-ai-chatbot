<?php

header("Content-Type: application/json; charset=UTF-8");

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");

if (($_SERVER["REQUEST_METHOD"] ?? '') === "OPTIONS") {
    http_response_code(204);
    exit;
}

/**
 * Helper to ensure a secure session is started with appropriate cookie parameters.
 */
function ensure_session_started() {
    if (session_status() === PHP_SESSION_NONE) {
        $cookieParams = [
            'lifetime' => 86400, // 24 hours
            'path' => '/',
            'domain' => '',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax'
        ];
        session_set_cookie_params($cookieParams);
        session_start();
    }
}