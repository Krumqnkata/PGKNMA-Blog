<?php
session_start();
require_once __DIR__ . "/private/db.php";

// 1. Проверка за логнат потребител
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php"); // или login.php
    exit;
}

// 2. Валидация на ID от URL
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    die("Липсва или е невалидно потребителско ID.");
}
$user_id = intval($_GET['id']);

$message = ''; // За съобщения за успех или грешка

// 3. Обработка на POST заявка за обновяване
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update'])) {

    $name = trim($_POST['name']);
    $last_name = trim($_POST['last_name']);
    $email = trim($_POST['email']);
    $class = trim($_POST['class']);
    $created_at = trim($_POST['created_at']); // Retrieve created_at

    // Валидация на данни (примерна)
    if (empty($name) || empty($last_name) || empty($email) || empty($class) || empty($created_at)) {
        $message = "<p class='alert alert-danger'>Моля, попълнете всички задължителни полета.</p>";
    } else {
        $sql = "UPDATE users SET name = ?, last_name = ?, email = ?, class = ?, created_at = ? WHERE id = ?";
        $params = [$name, $last_name, $email, $class, $created_at, $user_id];
        $types = "sssssi"; // s for each string, i for user_id
        
        if (empty($message)) {
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $stmt->bind_param($types, ...$params);
                if ($stmt->execute()) {
                    $message = "<p class='alert alert-success'>Потребителят е обновен успешно!</p>";
                } else {
                    $message = "<p class='alert alert-danger'>Грешка при обновяване: " . $stmt->error . "</p>";
                }
                $stmt->close();
            } else {
                $message = "<p class='alert alert-danger'>Грешка при подготовка на заявката: " . $conn->error . "</p>";
            }
        }
    }
}

// 5. Вземане на текущите данни на потребителя с подготвена заявка
$stmt = $conn->prepare("SELECT name, last_name, email, class, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("Потребител с такова ID не е намерен.");
}
$user = $result->fetch_assoc();
$stmt->close();

$conn->close();
?>
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Редакция на потребител</title>
    <link href="templates/bootstrap_theme/bootstrap.css" rel="stylesheet">
    <link href="templates/navbar-top.css" rel="stylesheet">
    <style>
        .profile-pic {
            max-width: 150px;
            margin-top: 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
        <div class="container-fluid">
            <a class="navbar-brand" href="dashboard.php"><img class="logo" src="templates/logo-dark.png"></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
                <ul class="navbar-nav me-auto mb-2 mb-md-0">
                    <li class="nav-item"><a class="nav-link" href="dashboard.php">Начало</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle active" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown">Администрация</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="users.php">Потребители</a></li>
                            <li><a class="dropdown-item" href="#">Настройки</a></li>
                        </ul>
                    </li>
                </ul>
                <div class="d-flex">
                    <a class="nav-link" href="logout.php"><button class="btn btn-outline-danger">Изход</button></a>
                </div>
            </div>
        </div>
    </nav>

    <main class="container">
        <h2>Редакция на потребител #<?= htmlspecialchars($user_id) ?></h2>
        <h4>В опасна зона сте! Внимавайте какво правите!</h4>
        <?php if (!empty($message)) echo $message; ?>

        <form method="POST" class="mt-4">
            <div class="mb-3">
                <label for="name" class="form-label">Име:</label>
                <input type="text" id="name" name="name" class="form-control" value="<?= htmlspecialchars($user['name']) ?>" required>
            </div>

            <div class="mb-3">
                <label for="last_name" class="form-label">Фамилия:</label>
                <input type="text" id="last_name" name="last_name" class="form-control" value="<?= htmlspecialchars($user['last_name']) ?>" required>
            </div>

            <div class="mb-3">
                <label for="email" class="form-label">Имейл:</label>
                <input type="email" id="email" name="email" class="form-control" value="<?= htmlspecialchars($user['email']) ?>" required>
            </div>

            <div class="mb-3">
                <label for="class" class="form-label">Клас:</label>
                <input type="text" id="class" name="class" class="form-control" value="<?= htmlspecialchars($user['class']) ?>" required>
            </div>

            <div class="mb-3">
                <label for="created_at" class="form-label">Дата на създаване:</label>
                <input type="datetime-local" id="created_at" name="created_at" class="form-control" value="<?= date('Y-m-d\TH:i', strtotime($user['created_at'])) ?>" required>
            </div>
            
            <button type="submit" name="update" class="btn btn-primary">Обнови</button>
            <a href="users.php" class="btn btn-secondary">Назад към списъка</a>
        </form>
    </main>

    <script src="templates/assets/js/popper.min.js"></script>
    <script src="templates/bootstrap/js/bootstrap.min.js"></script>
</body>
</html>