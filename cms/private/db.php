<?php
$host = "localhost";
$db = "pgknma_blog";
$password = "";
$username = "root";

$conn = new mysqli($host, $username, $password, $db);

// Проверка за грешка
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

?>