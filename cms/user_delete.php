<?php
require_once __DIR__ . "/private/db.php";
session_start();

// Проверка дали е логнат администратор
if (!isset($_SESSION['username'], $_SESSION['session_key'])) {
    header("Location: index.php");
    exit();
}

// Проверка дали е изпратено ID чрез POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
    $userId = (int)$_POST['id']; // принуждаваме към int за безопасност

    // Пропускаме изтриването на себе си (по желание)
    if ($userId === $_SESSION['user_id']) {
        die("Не може да изтриете себе си!");
    }

    // Подготвяме заявка за изтриване
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    if (!$stmt) {
        die("Грешка при подготовка на заявката: " . $conn->error);
    }

    $stmt->bind_param('i', $userId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $stmt->close();
        header("Location: users.php?deleted=1"); // връщаме обратно с параметър
        exit();
    } else {
        $stmt->close();
        die("Потребителят не съществува или вече е изтрит.");
    }

} else {
    die("Невалидна заявка.");
}
