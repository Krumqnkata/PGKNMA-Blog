<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "pgknma_blog";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("DB Error: " . $conn->connect_error);
}