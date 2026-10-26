<?php

require_once __DIR__ . '/cors.php';
require_once dirname(__DIR__) . '/db.php';

ensure_session_started();

// Strictly authenticate via PHP server session - never trust client-supplied user ID
$currentUser = $_SESSION['user'] ?? null;
if (!is_array($currentUser) || empty($currentUser['id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required. Please sign in.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = (int)$currentUser['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare(
            'SELECT id, user_id, service_id, service_name, plan_id, plan_name, price, price_display, billing_cycle, status, renewal_date, created_at 
             FROM subscriptions 
             WHERE user_id = ? 
             ORDER BY id ASC'
        );
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format numerical fields
        $formatted = array_map(function ($row) {
            return [
                'id' => (int)$row['id'],
                'user_id' => (int)$row['user_id'],
                'service_id' => (int)$row['service_id'],
                'service_name' => $row['service_name'],
                'plan_id' => $row['plan_id'],
                'plan_name' => $row['plan_name'],
                'price' => (float)$row['price'],
                'price_display' => $row['price_display'],
                'billing_cycle' => $row['billing_cycle'],
                'status' => $row['status'],
                'renewal_date' => $row['renewal_date'],
                'created_at' => $row['created_at']
            ];
        }, $rows);

        http_response_code(200);
        echo json_encode($formatted, JSON_UNESCAPED_UNICODE);
        exit;
    } catch (PDOException $e) {
        error_log('Error retrieving subscriptions: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Unable to retrieve subscriptions.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    $serviceId = (int)($input['service_id'] ?? 0);
    $serviceName = trim($input['service_name'] ?? '');
    $planId = trim($input['plan_id'] ?? '');
    $planName = trim($input['plan_name'] ?? '');
    $price = (float)($input['price'] ?? 0);
    $priceDisplay = trim($input['price_display'] ?? '');
    $billingCycle = trim($input['billing_cycle'] ?? 'Yearly');
    $status = 'active';
    $renewalDate = trim($input['renewal_date'] ?? '');

    if ($serviceId <= 0 || empty($serviceName) || empty($planId) || empty($planName)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required subscription fields.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($priceDisplay)) {
        $priceDisplay = '₹' . number_format($price, 0);
    }

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO subscriptions (user_id, service_id, service_name, plan_id, plan_name, price, price_display, billing_cycle, status, renewal_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               service_name = VALUES(service_name),
               plan_id = VALUES(plan_id),
               plan_name = VALUES(plan_name),
               price = VALUES(price),
               price_display = VALUES(price_display),
               billing_cycle = VALUES(billing_cycle),
               status = VALUES(status),
               renewal_date = VALUES(renewal_date),
               created_at = CURRENT_TIMESTAMP'
        );

        $stmt->execute([
            $userId,
            $serviceId,
            $serviceName,
            $planId,
            $planName,
            $price,
            $priceDisplay,
            $billingCycle,
            $status,
            $renewalDate
        ]);

        // Return updated subscription record
        $fetchStmt = $pdo->prepare(
            'SELECT id, user_id, service_id, service_name, plan_id, plan_name, price, price_display, billing_cycle, status, renewal_date, created_at 
             FROM subscriptions 
             WHERE user_id = ? AND service_id = ?'
        );
        $fetchStmt->execute([$userId, $serviceId]);
        $saved = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Demonstration plan subscription confirmed.',
            'subscription' => [
                'id' => (int)$saved['id'],
                'user_id' => (int)$saved['user_id'],
                'service_id' => (int)$saved['service_id'],
                'service_name' => $saved['service_name'],
                'plan_id' => $saved['plan_id'],
                'plan_name' => $saved['plan_name'],
                'price' => (float)$saved['price'],
                'price_display' => $saved['price_display'],
                'billing_cycle' => $saved['billing_cycle'],
                'status' => $saved['status'],
                'renewal_date' => $saved['renewal_date'],
                'created_at' => $saved['created_at']
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (PDOException $e) {
        error_log('Error saving subscription: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Unable to save subscription.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed.'], JSON_UNESCAPED_UNICODE);
