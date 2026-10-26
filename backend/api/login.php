<?php

require_once __DIR__ . '/cors.php';
require_once dirname(__DIR__) . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Only POST requests are allowed.',
        'message' => 'Only POST requests are allowed.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawInput = file_get_contents('php://input');
if ($rawInput === '' && isset($GLOBALS['MOCK_PHP_INPUT'])) {
    $rawInput = (string)$GLOBALS['MOCK_PHP_INPUT'];
}
$input = json_decode($rawInput, true);

// Fallback to standard form POST data if JSON body was not sent
if (!is_array($input)) {
    if (!empty($_POST)) {
        $input = $_POST;
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON payload. Please send valid JSON data.',
            'message' => 'Invalid JSON payload.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Please enter a valid email address.',
        'message' => 'Please enter a valid email address.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!is_string($password) || $password === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Please enter your password.',
        'message' => 'Please enter your password.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if (!isset($pdo) || !$pdo) {
        throw new Exception('Database connection is not initialized.');
    }

    $stmt = $pdo->prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email or password.',
            'message' => 'Invalid email or password.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Initialize session and protect against session fixation
    ensure_session_started();
    session_regenerate_id(true);

    $_SESSION['user'] = [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'created_at' => $user['created_at']
    ];

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful.',
        'user' => $_SESSION['user']
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred during login: ' . $e->getMessage(),
        'message' => 'Database error occurred during login. Please try again later.'
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('Login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
