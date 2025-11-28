<?php
require_once __DIR__ . "/private/db.php";
session_start();

// CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080'); // React dev server
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Helper функция за JSON response
function sendJson($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

switch($_SERVER['REQUEST_METHOD']) {

    // ======= LOGIN =======
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            sendJson(["success" => false, "error" => "Потребителят не е намерен"], 401);
        }

        $user = $result->fetch_assoc();

        if (!password_verify($password, $user['password'])) {
            sendJson(["success" => false, "error" => "Грешна парола"], 401);
        }

        $token = bin2hex(random_bytes(32));
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['token'] = $token;
        $_SESSION['username'] = $username;

        setcookie("AUTH_TOKEN", $token, [
            'httponly' => true,
            'secure' => false, // локално HTTP
            'samesite' => 'Strict'
        ]);

        sendJson(["success" => true, "userId" => $user['id']]);
        break;

    // ======= CHECK LOGIN =======
    case 'GET':
        if (isset($_SESSION['user_id'])) {
            sendJson([
                "success" => true,
                "userId" => $_SESSION['user_id'],
                "username" => $_SESSION['username']
            ]);
        } else {
            sendJson(["success" => false, "error" => "Не сте логнат"], 401);
        }
        break;

    // ======= LOGOUT =======
    case 'DELETE':
        session_destroy();
        setcookie("AUTH_TOKEN", "", time() - 3600, "/", "", false, true);
        sendJson(["success" => true]);
        break;

    default:
        sendJson(["success" => false, "error" => "Методът не е позволен"], 405);
        break;
}
