<?php
require_once __DIR__ . "/private/db.php";

// Маси за случайни имена и фамилии
$firstNames = ['Ivan', 'Georgi', 'Petar', 'Maria', 'Elena', 'Nikola', 'Viktoria', 'Dimitar', 'Anna', 'Sofia'];
$lastNames = ['Ivanov', 'Petrov', 'Georgieva', 'Dimitrov', 'Nikolov', 'Popova', 'Kolev', 'Marinova', 'Stoyanov', 'Petrova'];
$classes = [8,9,10,11,12, null];

for ($i=1; $i<=100; $i++) {
    $username = "user$i";
    $password = "admin";
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $name = $firstNames[array_rand($firstNames)];
    $last_name = $lastNames[array_rand($lastNames)];
    $email = strtolower($username . "@example.com");
    $class = $classes[array_rand($classes)];

    $stmt = $conn->prepare("INSERT INTO users (username, password, name, last_name, email, class) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssi", $username, $hash, $name, $last_name, $email, $class);
    $stmt->execute();
}

echo "100 тестови потребители са създадени успешно!";
?>
