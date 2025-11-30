<?php
require_once __DIR__ . "/private/db.php";


// --- CORS headers ---
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

ini_set('session.cookie_httponly', 1);  // забранява достъп на JS до cookie
ini_set('session.cookie_secure', 1);    // само по HTTPS (за dev може да се махне)
ini_set('session.use_strict_mode', 1);  // предотвратява session fixation

session_start();
       // името на сесията
session_regenerate_id(true);    

// --- Handle OPTIONS ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Only POST allowed ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success'=>false, 'error'=>'Method not allowed']);
    exit();
}

// --- Read JSON ---
$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['success'=>false, 'error'=>'Попълнете всички полета']);
    exit();
}

// --- Fetch user ---
$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username=? LIMIT 1");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    session_regenerate_id(true); // ново session ID
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['login_time'] = time();
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'name' => $user['username']
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Невалидно потребителско име или парола']);
}

$stmt->close();
$conn->close();
