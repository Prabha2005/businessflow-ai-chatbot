<?php

require_once __DIR__ . '/cors.php';

ensure_session_started();

if (isset($_SESSION['user']) && is_array($_SESSION['user'])) {
    http_response_code(200);
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => (int)$_SESSION['user']['id'],
            'name' => $_SESSION['user']['name'],
            'email' => $_SESSION['user']['email'],
            'created_at' => $_SESSION['user']['created_at']
        ]
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(200);
    echo json_encode([
        'authenticated' => false,
        'user' => null
    ], JSON_UNESCAPED_UNICODE);
}
