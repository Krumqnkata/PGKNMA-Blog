<?php
session_start();
session_destroy(); // унищожава сесията напълно
header("Location: index.php");
exit;
?>