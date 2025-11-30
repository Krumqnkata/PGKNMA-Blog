<?php
require_once __DIR__ . "/private/db.php";

// --- SETTINGS ---
$username = "admin";
$password = "admin"; // plain password — ще я хешираме

// --- HASH PASSWORD ---
$hash = password_hash($password, PASSWORD_DEFAULT);

// --- INSERT USER ---
$stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $hash);

if ($stmt->execute()) {
    echo "User created successfully!<br>";
    echo "Username: $username<br>";
    echo "Password: $password<br>";
    echo "Hash: $hash<br>";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>