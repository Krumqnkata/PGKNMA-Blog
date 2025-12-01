<?php
require_once __DIR__ . "/private/db.php";
session_start();

if (!isset($_SESSION['username'], $_SESSION['session_key'])) {
    header("Location: index.php");
    exit();
}


    
// --- Търсене ---
$search = $_GET['search'] ?? '';

// --- Пейджинг ---
$perPage = 50;
$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $perPage;

// --- Основна заявка ---
$sql = "SELECT id, username, name, last_name, email, class FROM users";
$params = [];
if ($search !== '') {
    $sql .= " WHERE id LIKE ? OR username LIKE ? OR name LIKE ? OR last_name LIKE ? OR email LIKE ?";
    $searchParam = "%$search%";
    $params = [$searchParam, $searchParam, $searchParam, $searchParam, $searchParam];
}
$sql .= " ORDER BY id ASC LIMIT ?, ?";
$params[] = $offset;
$params[] = $perPage;

$stmt = $conn->prepare($sql);

$types = str_repeat('s', count($params)-2) . 'ii'; // последните две са int
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Потребители</title>
    <link href="templates/bootstrap_theme/bootstrap.css" rel="stylesheet" type="text/css">
    <link href="templates/navbar-top.css" rel="stylesheet">
</head>
<body>
<nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
    <div class="container-fluid">
        <a class="navbar-brand" href="#"><img class="logo" src="templates/logo-dark.png"></a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse">
            <ul class="navbar-nav me-auto mb-2 mb-md-0">
                <li class="nav-item"><a class="nav-link" href="#">Начало</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Меме на седмицата</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Звънец</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Програма</a></li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown">Администрация</a>
                    <ul class="dropdown-menu" aria-labelledby="adminDropdown">
                        <li><a class="dropdown-item active" href="#">Потребители</a></li>
                        <li><a class="dropdown-item" href="#">Настройки</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#">Роли и позволение</a></li>
                    </ul>
                </li>
            </ul>
            <div class="d-flex">
                <a class="nav-link" href="logout.php"><button class="btn btn-outline-danger">изход</button></a>
            </div>
        </div>
    </div>
</nav>

<main class="container">
    <h1>Потребители</h1>

    <form method="GET" class="mb-3">
        <input type="text" name="search" placeholder="Търси..." value="<?php echo htmlspecialchars($search); ?>">
        <button type="submit" class="btn btn-primary">Търси</button>
    </form>

    <table class="table table-striped">
        <thead>
        <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Име</th>
            <th>Фамилия</th>
            <th>Email</th>
            <th>Клас</th>
            <th>Действие</th>
        </tr>
        </thead>
        <tbody>
        <?php while($row = $result->fetch_assoc()): ?>
            <tr>
                <td><?php echo $row['id']; ?></td>
                <td><a href="user_edit.php?id=<?php echo $row['id']; ?>"><?php echo htmlspecialchars($row['username']); ?></a></td>
                <td><?php echo htmlspecialchars($row['name']); ?></td>
                <td><?php echo htmlspecialchars($row['last_name']); ?></td>
                <td><?php echo htmlspecialchars($row['email']); ?></td>
                <td><?php echo $row['class'] ?? '-'; ?></td>
                <td>
                    <form method="POST" action="user_delete.php" onsubmit="return confirm('Сигурни ли сте?');">
                        <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                        <button class="btn btn-sm btn-danger" type="submit">Изтрий</button>
                    </form>
                </td>
            </tr>
        <?php endwhile; ?>
        </tbody>
    </table>

    <?php
    // --- Пейджинг ---
    $countSql = "SELECT COUNT(*) as total FROM users";
    if ($search !== '') {
        $countSql .= " WHERE id LIKE ? OR username LIKE ? OR name LIKE ? OR last_name LIKE ? OR email LIKE ?";
        $countStmt = $conn->prepare($countSql);
        $countStmt->bind_param('sssss', $searchParam, $searchParam, $searchParam, $searchParam, $searchParam);
    } else {
        $countStmt = $conn->prepare($countSql);
    }
    $countStmt->execute();
    $totalResult = $countStmt->get_result()->fetch_assoc();
    $totalPages = ceil($totalResult['total'] / $perPage);
    ?>

    <nav>
        <ul class="pagination">
            <?php for($i=1; $i<=$totalPages; $i++): ?>
                <li class="page-item <?php echo $i==$page?'active':''; ?>">
                    <a class="page-link" href="?page=<?php echo $i; ?>&search=<?php echo urlencode($search); ?>"><?php echo $i; ?></a>
                </li>
            <?php endfor; ?>
        </ul>
    </nav>

</main>

<script src="templates/assets/js/popper.min.js"></script>
<script src="templates/bootstrap/js/bootstrap.min.js"></script>
</body>
</html>
