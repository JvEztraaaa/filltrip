<?php
/**
 * admin_trips.php
 * ------------------------------------------------------------------
 * Admin listing + modification of trips (search/pagination ; basic update/delete).
 */

session_start();
header('Content-Type: application/json');
if (file_exists(__DIR__ . '/cors.php')) require_once __DIR__ . '/cors.php';

$host = 'localhost';
$dbname = 'filltrip';
$username = 'root';
$password = '';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  echo json_encode(['success'=>false,'message'=>'Database connection failed: '.$e->getMessage()]);
  exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
  switch ($method) {
    case 'GET':
      if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $stmt = $pdo->prepare('SELECT * FROM user_trips WHERE id = ?');
        $stmt->execute([$id]);
        $trip = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success'=>true,'trip'=>$trip]);
      } else {
        $page   = (int)($_GET['page'] ?? 1);
        $limit  = (int)($_GET['limit'] ?? 10);
        $search = $_GET['search'] ?? '';
        $offset = ($page - 1) * $limit;
        $searchCondition = '';
        $params = [];
        if ($search) {
          $searchCondition = 'WHERE start_location LIKE ? OR end_location LIKE ? OR vehicle_label LIKE ?';
          $searchParam = "%$search%";
          $params = [$searchParam, $searchParam, $searchParam];
        }
        $countStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM user_trips $searchCondition");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        $totalPages = (int)ceil($total / max(1, $limit));
        $limitInt  = max(1, (int)$limit);
        $offsetInt = max(0, (int)$offset);
        $sql = "SELECT * FROM user_trips $searchCondition ORDER BY created_at DESC LIMIT $limitInt OFFSET $offsetInt";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $trips = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success'=>true,'trips'=>$trips,'currentPage'=>$page,'totalPages'=>$totalPages,'total'=>$total]);
      }
      break;

    case 'PUT':
      $input = json_decode(file_get_contents('php://input'), true);
      $id = $input['id'];
      $stmt = $pdo->prepare('UPDATE user_trips SET start_location = ?, end_location = ?, distance_km = ?, fuel_cost = ?, vehicle_label = ? WHERE id = ?');
      $stmt->execute([$input['start_location'], $input['end_location'], $input['distance_km'], $input['fuel_cost'], $input['vehicle_label'], $id]);
      echo json_encode(['success'=>true,'message'=>'Trip updated successfully']);
      break;

    case 'DELETE':
      $input = json_decode(file_get_contents('php://input'), true);
      $id = $input['id'];
      $stmt = $pdo->prepare('DELETE FROM user_trips WHERE id = ?');
      $stmt->execute([$id]);
      echo json_encode(['success'=>true,'message'=>'Trip deleted successfully']);
      break;

    default:
      echo json_encode(['success'=>false,'message'=>'Method not allowed']);
  }
} catch (Exception $e) {
  echo json_encode(['success'=>false,'message'=>'Server error: '.$e->getMessage()]);
}
?>
