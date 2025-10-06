<?php
session_start();
header('Content-Type: application/json');
if (file_exists(__DIR__ . '/cors.php')) require_once __DIR__ . '/cors.php';

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
                $stmt = $pdo->prepare("SELECT * FROM user_trips WHERE id = ?");
                $stmt->execute([$id]);
                $trip = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'trip' => $trip
                ]);
            } else {
                $page = intval($_GET['page'] ?? 1);
                $limit = intval($_GET['limit'] ?? 10);
                $search = $_GET['search'] ?? '';
                // Optional userId filter provided by admin interface to view a specific user's trips
                $filterUserId = isset($_GET['userId']) ? intval($_GET['userId']) : null;
                
                $offset = ($page - 1) * $limit;
                
                // Build search query
                $searchCondition = [];
                $params = [];
                if ($search) {
                    $searchCondition[] = "(start_location LIKE ? OR end_location LIKE ? OR vehicle_label LIKE ?)";
                    $searchParam = "%$search%";
                    $params[] = $searchParam; $params[] = $searchParam; $params[] = $searchParam;
                }
                if ($filterUserId !== null) { // Apply even if user id were 0
                    $searchCondition[] = "user_id = ?";
                    $params[] = $filterUserId;
                }
                $whereClause = count($searchCondition) ? ('WHERE ' . implode(' AND ', $searchCondition)) : '';
                
                // Get total count
                $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM user_trips $whereClause");
                $countStmt->execute($params);
                $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
                $totalPages = ceil($total / $limit);
                
                // Get trips
                $limitInt = max(1, (int)$limit);
                $offsetInt = max(0, (int)$offset);
                $sql = "SELECT * FROM user_trips $whereClause ORDER BY created_at DESC LIMIT $limitInt OFFSET $offsetInt";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $trips = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'trips' => $trips,
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
            
            $stmt = $pdo->prepare("UPDATE user_trips SET start_location = ?, end_location = ?, distance_km = ?, fuel_cost = ?, vehicle_label = ? WHERE id = ?");
            $stmt->execute([
                $input['start_location'],
                $input['end_location'],
                $input['distance_km'],
                $input['fuel_cost'],
                $input['vehicle_label'],
                $id
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Trip updated successfully'
            ]);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            
            $stmt = $pdo->prepare("DELETE FROM user_trips WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Trip deleted successfully'
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