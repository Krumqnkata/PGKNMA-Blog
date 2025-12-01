<?php

require_once __DIR__ . "/private/db.php";
session_start();

// Проверка за логнат потребител
if(!isset($_SESSION['user_id'])){
    header("Location: login.php");
    exit;
}


if($conn->connect_error){
    die("Connection failed: " . $conn->connect_error);
}

// Взимаме ID от URL
if(!isset($_GET['id'])){
    die("Missing user ID");
}
$user_id = intval($_GET['id']);

// Ако формата е подадена – обновяване
if(isset($_POST['update'])){

    $full_name = $_POST['full_name'];
    $email = $_POST['email'];
    $class = $_POST['class'];
    $created_at = $_POST['created_at'];

    // Смяна на снимка
    $photo_name = null;

    if(isset($_FILES['photo']) && $_FILES['photo']['size'] > 0){
        $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $photo_name = "user_".$user_id.".".$ext;
        move_uploaded_file($_FILES['photo']['tmp_name'], "uploads/$photo_name");

        $update_photo_sql = ", photo = '$photo_name'";
    } else {
        $update_photo_sql = "";
    }

    $sql = "
        UPDATE users 
        SET full_name='$full_name',
            email='$email',
            class='$class',
            created_at='$created_at'
            $update_photo_sql
        WHERE id=$user_id
    ";

    if($conn->query($sql)){
        echo "<p style='color:green'>Потребителят е обновен успешно!</p>";
    } else {
        echo "<p style='color:red'>Грешка: ".$conn->error."</p>";
    }
}

// Вземаме текущите данни
$result = $conn->query("SELECT * FROM users WHERE id=$user_id");
$user = $result->fetch_assoc();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Edit User</title>
</head>
<body>

<h2>Редакция на потребител</h2>

<form method="POST" enctype="multipart/form-data">

    <label>Две имена:</label><br>
    <input type="text" name="full_name" value="<?= $user['full_name'] ?>" required><br><br>

    <label>Имейл:</label><br>
    <input type="email" name="email" value="<?= $user['email'] ?>" required><br><br>

    <label>Клас:</label><br>
    <input type="text" name="class" value="<?= $user['class'] ?>" required><br><br>

    <label>Дата на създаване:</label><br>
    <input type="datetime-local" name="created_at" 
           value="<?= date('Y-m-d\TH:i', strtotime($user['created_at'])) ?>"><br><br>

    <label>Профилна снимка:</label><br>
    <input type="file" name="photo"><br>
    
    <?php if($user['photo']): ?>
        <p>Текуща снимка:</p>
        <img src="uploads/<?= $user['photo'] ?>" width="120">
    <?php endif; ?>

    <br><br>
    <button type="submit" name="update">Обнови</button>
</form>

</body>
</html>
