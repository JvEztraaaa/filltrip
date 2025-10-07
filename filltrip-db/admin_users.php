<?php
session_start();
header('Content-Type: application/json');
// Central CORS include
if (file_exists(__DIR__ . '/cors.php')) require_once __DIR__ . '/cors.php';

// Minimal authz guard: require logged-in admin
if (!isset($_SESSION['uid'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

// Lazy role check (fetch once); safe lightweight query
try {
    $authPdo = new PDO('mysql:host=localhost;dbname=filltrip', 'root', '');
    $authPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $rStmt = $authPdo->prepare('SELECT role FROM user WHERE id = ? LIMIT 1');
    $rStmt->execute([ (int)$_SESSION['uid'] ]);
    $roleRow = $rStmt->fetch(PDO::FETCH_ASSOC);
    if (!$roleRow || ($roleRow['role'] ?? '') !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit();
    }
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'message' => 'Auth check failed']);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'filltrip';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $id = intval($_GET['id']);
                $stmt = $pdo->prepare("SELECT * FROM `user` WHERE id = ?");
                $stmt->execute([$id]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'user' => $user
                ]);
            } else {
                $page = intval($_GET['page'] ?? 1);
                $limit = intval($_GET['limit'] ?? 10);
                $search = $_GET['search'] ?? '';
                
                $offset = ($page - 1) * $limit;
                
                // Build search query
                $searchCondition = '';
                $params = [];
                if ($search) {
                    $searchCondition = "WHERE full_name LIKE ? OR email LIKE ? OR username LIKE ?";
                    $searchParam = "%$search%";
                    $params = [$searchParam, $searchParam, $searchParam];
                }
                
                // Get total count
                $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM `user` $searchCondition");
                $countStmt->execute($params);
                $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
                $totalPages = ceil($total / $limit);
                
                // Get users
                // MySQL will not accept bound params for LIMIT/OFFSET in some modes; sanitize and interpolate ints only
                $limitInt = max(1, (int)$limit);
                $offsetInt = max(0, (int)$offset);
                $sql = "SELECT id, first_name, last_name, full_name, username, email, role, created_at FROM `user` $searchCondition ORDER BY created_at DESC LIMIT $limitInt OFFSET $offsetInt";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'users' => $users,
                    'currentPage' => $page,
                    'totalPages' => $totalPages,
                    'total' => $total
                ]);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("INSERT INTO `user` (first_name, last_name, full_name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $hashedPassword = password_hash($input['password'] ?? 'password123', PASSWORD_DEFAULT);
            $fullName = ($input['first_name'] ?? '') . ' ' . ($input['last_name'] ?? '');
            
            $stmt->execute([
                $input['first_name'] ?? '',
                $input['last_name'] ?? '',
                $fullName,
                $input['username'] ?? '',
                $input['email'] ?? '',
                $hashedPassword,
                $input['role'] ?? 'user'
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'User created successfully',
                'id' => $pdo->lastInsertId()
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            
            $fullName = ($input['first_name'] ?? '') . ' ' . ($input['last_name'] ?? '');
            
            $stmt = $pdo->prepare("UPDATE `user` SET first_name = ?, last_name = ?, full_name = ?, email = ?, role = ? WHERE id = ?");
            $stmt->execute([
                $input['first_name'],
                $input['last_name'],
                $fullName,
                $input['email'],
                $input['role'],
                $id
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully'
            ]);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            
            $stmt = $pdo->prepare("DELETE FROM `user` WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
            break;

        default:
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>