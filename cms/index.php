<?php

require_once __DIR__ . "\private\db.php";

session_start();

$errors = "";

if ($_SERVER['REQUEST_METHOD'] === "POST") {

    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
    if(!$stmt){
        die("Грешка с датабазата" . $conn->error);
    }

    $stmt->bind_param("s", $username);

    $stmt->execute();

    $result = $stmt->get_result();

     if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();

        // 4. Проверяваме паролата
        if (password_verify($password, $row['password'])) {

            // 5. Създаваме сесия
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $username;
            $_SESSION['ip'] = $_SERVER['REMOTE_ADDR'];
            $_SESSION['session_key'] = bin2hex(random_bytes(32)); // уникален 64-символен ключ

            header("Location: dashboard.php");
            exit;

        } else {
            $errors = "Грешна парола!";
        }
    } else {
        $errors = "Няма такъв потребител!";
    }

    $stmt->close();
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
    echo "<div class='alert alert-danger'>
        $errors
    </div>";
}
?>

        <button class="w-100 btn btn-lg btn-primary" type="submit">Вход</button>
        <p class="mt-5 mb-3 text-muted">© 2024-2025</p>
    </form>
</main>
</body>
</html>
