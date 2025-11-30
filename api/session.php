<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Credentials: true');

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'session' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['username'] ?? ''
        ]
    ]);
} else {
    echo json_encode(['session' => false]);
}
