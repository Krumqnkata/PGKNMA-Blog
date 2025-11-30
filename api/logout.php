<?php
// --- Start secure session ---
session_start();

// --- Destroy session data ---
$_SESSION = [];

// --- Destroy session cookie ---
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000, // минус време за изтичане
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// --- Destroy session ---
session_destroy();

// --- Return JSON response ---
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
