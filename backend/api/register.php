<?php

require_once __DIR__ . '/cors.php';
require_once dirname(__DIR__) . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawInput = file_get_contents('php://input');
if ($rawInput === '' && isset($GLOBALS['MOCK_PHP_INPUT'])) {
    $rawInput = (string)$GLOBALS['MOCK_PHP_INPUT'];
}
$input = json_decode($rawInput, true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$name = trim($input['name'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

// Validation
if ($name === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Please enter your full name.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (mb_strlen($name) > 100) {
    http_response_code(400);
    echo json_encode(['error' => 'Name cannot exceed 100 characters.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please enter a valid email address.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (mb_strlen($email) > 255) {
    http_response_code(400);
    echo json_encode(['error' => 'Email cannot exceed 255 characters.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!is_string($password) || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters long.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Check for duplicate email
    $checkStmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $checkStmt->execute([$email]);
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'This email address is already registered.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Secure password hashing
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Insert user record
    $insertStmt = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    $insertStmt->execute([$name, $email, $passwordHash]);
    $newId = (int)$pdo->lastInsertId();

    // Retrieve created record
    $fetchStmt = $pdo->prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
    $fetchStmt->execute([$newId]);
    $user = $fetchStmt->fetch();

    if (!$user) {
        throw new Exception('Failed to retrieve newly created user profile.');
    }

    // Auto-login: initialize secure session
    ensure_session_started();
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'created_at' => $user['created_at']
    ];

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful.',
        'user' => $_SESSION['user']
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    // Catch unique constraint violation in case of race condition (SQLSTATE 23000)
    if ($e->getCode() === '23000') {
        http_response_code(409);
        echo json_encode(['error' => 'This email address is already registered.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    error_log('Registration error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred during registration. Please try again later.'], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('Registration error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred during registration. Please try again later.'], JSON_UNESCAPED_UNICODE);
}
