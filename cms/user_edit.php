<?php
session_start();
require_once __DIR__ . "/private/db.php";

// 1. Проверка за логнат потребител и валидация на ID
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    die("Липсва или е невалидно потребителско ID.");
}
$user_id = intval($_GET['id']);
$admin_id = $_SESSION['user_id'];

$message = '';

// Показване на съобщение за успех след редирект
if (isset($_SESSION['update_message'])) {
    $message = $_SESSION['update_message'];
    unset($_SESSION['update_message']);
}

// 3. Обработка на POST заявка за обновяване (Post/Redirect/Get Pattern)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update'])) {

    // Вземане на всички данни от формата
    $name = trim($_POST['name']);
    $last_name = trim($_POST['last_name']);
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $class = trim($_POST['class']);
    $created_at = trim($_POST['created_at']);
    $is_active = intval($_POST['is_active']);
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    // Зареждане на текущия username за сравнение
    $currentUserStmt = $conn->prepare("SELECT username FROM users WHERE id = ?");
    $currentUserStmt->bind_param("i", $user_id);
    $currentUserStmt->execute();
    $currentUsername = $currentUserStmt->get_result()->fetch_assoc()['username'];
    $currentUserStmt->close();

    // Валидация на основните полета
    if (empty($name) || empty($last_name) || empty($username) || empty($email) || !isset($_POST['class']) || empty($created_at)) {
        $message = "<p class='alert alert-danger'>Моля, попълнете всички задължителни полета (без парола).</p>";
    }

    $update_fields = [
        "name = ?", "last_name = ?", "email = ?", "class = ?", "created_at = ?", "is_active = ?",
        "updated_at = ?", "updated_by = ?"
    ];
    $params = [$name, $last_name, $email, $class, $created_at, $is_active, date("Y-m-d H:i:s"), $admin_id];
    $types = "sssssisi";

    // Проверка и добавяне на USERNAME за обновяване
    if (empty($message) && $username !== $currentUsername) {
        $checkUserStmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $checkUserStmt->bind_param("s", $username);
        $checkUserStmt->execute();
        if ($checkUserStmt->get_result()->num_rows > 0) {
            $message = "<p class='alert alert-danger'>Потребителското име е заето.</p>";
        } else {
            $update_fields[] = "username = ?";
            $params[] = $username;
            $types .= "s";
        }
        $checkUserStmt->close();
    }

    // Проверка и добавяне на ПАРОЛА за обновяване
    if (empty($message) && !empty($new_password)) {
        if ($new_password !== $confirm_password) {
            $message = "<p class='alert alert-danger'>Паролите не съвпадат.</p>";
        } else {
            $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
            $update_fields[] = "password = ?";
            $params[] = $hashed_password;
            $types .= "s";
        }
    }

    // Изпълнение на заявката, ако няма грешки
    if (empty($message)) {
        $sql = "UPDATE users SET " . implode(", ", $update_fields) . " WHERE id = ?";
        $params[] = $user_id;
        $types .= "i";
        
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param($types, ...$params);
            if ($stmt->execute()) {
                $_SESSION['update_message'] = "<p class='alert alert-success'>Потребителят е обновен успешно!</p>";
            } else {
                $_SESSION['update_message'] = "<p class='alert alert-danger'>Грешка при обновяване: " . $stmt->error . "</p>";
            }
            $stmt->close();
        } else {
            $_SESSION['update_message'] = "<p class='alert alert-danger'>Грешка при подготовка на заявката: " . $conn->error . "</p>";
        }
        
        header("Location: " . $_SERVER['PHP_SELF'] . "?id=" . $user_id);
        exit;
    }
}

// Вземане на данни за GET заявка
$stmt = $conn->prepare("SELECT username, name, last_name, email, class, created_at, is_active, last_login, updated_at, updated_by FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    die("Потребител с такова ID не е намерен.");
}
$user = $result->fetch_assoc();
$stmt->close();

// Вземане на всички уникални класове
$class_options = ['STUDENT','TEACHER','ADMIN'];

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
        .section-divider { border-top: 1px solid #ccc; margin-top: 20px; padding-top: 20px; }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
        <!-- Navbar content -->
    </nav>

    <main class="container">
        <h2>Редакция на потребител #<?= htmlspecialchars($user_id) ?></h2>
        <h4>В опасна зона сте! Внимавайте какво правите!</h4>
        <?php if (!empty($message)) echo $message; ?>

        <form method="POST" action="user_edit.php?id=<?= $user_id ?>" class="mt-4">
            
            <div class="mb-3">
                <label class="form-label">Статус:</label>
                <div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="is_active" id="status_active" value="1" <?= ($user['is_active'] == 1) ? 'checked' : '' ?> required>
                        <label class="form-check-label" for="status_active">Активен</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="is_active" id="status_inactive" value="0" <?= ($user['is_active'] == 0) ? 'checked' : '' ?> required>
                        <label class="form-check-label" for="status_inactive">Неактивен</label>
                    </div>
                </div>
            </div>

            <!-- User details -->
            <div class="mb-3">
                <label for="username" class="form-label">Потребителско име:</label>
                <input type="text" id="username" name="username" class="form-control" value="<?= htmlspecialchars($user['username']) ?>" required>
            </div>
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
                <label class="form-label">Клас:</label>
                <div>
                    <?php foreach ($class_options as $class_option): ?>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="class" id="class_<?= htmlspecialchars($class_option) ?>" value="<?= htmlspecialchars($class_option) ?>" <?= ($user['class'] == $class_option) ? 'checked' : '' ?> required>
                            <label class="form-check-label" for="class_<?= htmlspecialchars($class_option) ?>"><?= htmlspecialchars($class_option) ?></label>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Password section -->
            <div class="section-divider">
                <h5>Промяна на парола</h5>
                <p class="text-muted">Оставете полетата празни, ако не желаете да променяте паролата.</p>
                <div class="mb-3">
                    <label for="new_password" class="form-label">Нова парола:</label>
                    <input type="password" id="new_password" name="new_password" class="form-control">
                </div>
                <div class="mb-3">
                    <label for="confirm_password" class="form-label">Потвърди нова парола:</label>
                    <input type="password" id="confirm_password" name="confirm_password" class="form-control">
                </div>
            </div>

            <!-- Audit Trail Section -->
            <div class="section-divider">
                <h5>Информация за акаунта</h5>
                <div class="mb-3">
                    <label for="created_at" class="form-label">Дата на създаване:</label>
                    <input type="datetime-local" id="created_at" name="created_at" class="form-control" value="<?= date('Y-m-d\TH:i', strtotime($user['created_at'])) ?>" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Последно влизане:</label>
                    <input type="text" class="form-control" value="<?= $user['last_login'] ? htmlspecialchars($user['last_login']) : 'Никога' ?>" readonly>
                </div>
                <div class="mb-3">
                    <label class="form-label">Последна промяна:</label>
                    <input type="text" class="form-control" value="<?= $user['updated_at'] ? htmlspecialchars($user['updated_at']) : 'Никога' ?>" readonly>
                </div>
                 <div class="mb-3">
                    <label class="form-label">Променен последно от ID(USER):</label>
                    <input type="text" class="form-control" value="<?= $user['updated_by'] ? htmlspecialchars($user['updated_by']) : 'N/A' ?>" readonly>
                </div>
            </div>

            <button type="submit" name="update" class="btn btn-primary mt-3">Обнови</button>
            <a href="users.php" class="btn btn-secondary mt-3">Назад към списъка</a>
        </form>
    </main>

    <script src="templates/assets/js/popper.min.js"></script>
    <script src="templates/bootstrap/js/bootstrap.min.js"></script>
</body>
</html>