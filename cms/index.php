<?php
session_start();
require_once __DIR__ . "/private/db.php";

$errors = "";

if ($_SERVER['REQUEST_METHOD'] === "POST") {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $errors = "Моля, попълнете потребителско име и парола.";
    } else {
        $stmt = $conn->prepare("SELECT id, password, class, is_active FROM users WHERE username = ?");
        if (!$stmt) {
            die("Грешка с базата данни: " . $conn->error);
        }
        
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();

            if (password_verify($password, $row['password'])) {
                
                if ($row['is_active'] != 1) {
                    $errors = "Вашият акаунт е деактивиран.";
                } elseif ($row['class'] !== 'TEACHER' && $row['class'] !== 'ADMIN') {
                    $errors = "Нямате достъп до административния панел.";
                } else {
                    // Update last_login timestamp
                    $updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
                    $updateStmt->bind_param("i", $row['id']);
                    $updateStmt->execute();
                    $updateStmt->close();

                    // Create session
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['username'] = $username;
                    $_SESSION['ip'] = $_SERVER['REMOTE_ADDR'];
                    $_SESSION['session_key'] = bin2hex(random_bytes(32));
                    
                    header("Location: dashboard.php");
                    exit;
                }

            } else {
                $errors = "Грешна парола!";
            }
        } else {
            $errors = "Няма такъв потребител!";
        }
        $stmt->close();
    }
    $conn->close();
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Вход</title>
    <link href="templates/bootstrap_theme/bootstrap.css" rel="stylesheet" type="text/css">
    <link href="templates/sign-in.css" rel="stylesheet">
</head>
<body class="text-center">
<main class="form-signin">
    <form method="POST" action="index.php">
        <img class="mb-4" src="templates/logo-light.png" alt="" width="75" height="75">
        <h1 class="h3 mb-3 fw-normal">Вход</h1>

        <input type="text" name="username" class="form-control" placeholder="Потребителско име" required autofocus>
        <input type="password" name="password" class="form-control" placeholder="Парола" required>
        <?php
        if (!empty($errors)){
            echo "<div class='alert alert-danger'>$errors</div>";
        }
        ?>

        <button class="w-100 btn btn-lg btn-primary" type="submit">Вход</button>
        <p class="mt-5 mb-3 text-muted">© 2024-2025</p>
    </form>
</main>
</body>
</html>