<?php
session_start();
header('Content-Type: application/json');
if (file_exists(__DIR__ . '/cors.php')) require_once __DIR__ . '/cors.php';

if (!isset($_SESSION['uid'])) { echo json_encode(['success'=>false,'message'=>'Not authenticated']); exit(); }
try {
    $authPdo = new PDO('mysql:host=localhost;dbname=filltrip', 'root', '');
    $authPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $rStmt = $authPdo->prepare('SELECT role FROM user WHERE id=? LIMIT 1');
    $rStmt->execute([(int)$_SESSION['uid']]);
    $row = $rStmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || ($row['role'] ?? '') !== 'admin') { echo json_encode(['success'=>false,'message'=>'Forbidden']); exit(); }
} catch (Throwable $e) { echo json_encode(['success'=>false,'message'=>'Auth check failed']); exit(); }

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
                $stmt = $pdo->prepare("SELECT * FROM saved_places WHERE id = ?");
                $stmt->execute([$id]);
                $place = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'savedPlace' => $place
                ]);
            } else {
                $page = intval($_GET['page'] ?? 1);
                $limit = intval($_GET['limit'] ?? 10);
                $search = $_GET['search'] ?? '';
                // Optional userId filter provided by admin interface to view a specific user's saved places
                $filterUserId = isset($_GET['userId']) ? intval($_GET['userId']) : null;
                
                $offset = ($page - 1) * $limit;
                
                // Build search query
                $searchConditions = [];
                $params = [];
                if ($search) {
                    $searchConditions[] = "place_name LIKE ?";
                    $searchParam = "%$search%";
                    $params[] = $searchParam;
                }
                if ($filterUserId !== null) { // Apply even if user id were 0
                    $searchConditions[] = "user_id = ?";
                    $params[] = $filterUserId;
                }
                $whereClause = count($searchConditions) ? ('WHERE ' . implode(' AND ', $searchConditions)) : '';
                
                // Get total count
                $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM saved_places $whereClause");
                $countStmt->execute($params);
                $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
                $totalPages = ceil($total / $limit);
                
                // Get saved places
                $limitInt = max(1, (int)$limit);
                $offsetInt = max(0, (int)$offset);
                $sql = "SELECT * FROM saved_places $whereClause ORDER BY created_at DESC LIMIT $limitInt OFFSET $offsetInt";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $places = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'savedPlaces' => $places,
                    'currentPage' => $page,
                    'totalPages' => $totalPages,
                    'total' => $total,
                    'appliedFilter' => $filterUserId !== null ? 'user_id' : null,
                    'filteredUserId' => $filterUserId
                ]);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            
            $stmt = $pdo->prepare("UPDATE saved_places SET place_name = ?, latitude = ?, longitude = ? WHERE id = ?");
            $stmt->execute([
                $input['place_name'],
                $input['latitude'],
                $input['longitude'],
                $id
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Saved place updated successfully'
            ]);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            
            $stmt = $pdo->prepare("DELETE FROM saved_places WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Saved place deleted successfully'
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