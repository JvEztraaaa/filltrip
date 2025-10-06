<?php
/**
 * admin_fuel_history.php
 * ------------------------------------------------------------------
 * Admin listing + CRUD (partial) for fuel_history records.
 */

session_start();
header('Content-Type: application/json');
if (file_exists(__DIR__ . '/cors.php')) require_once __DIR__ . '/cors.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
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

  switch ($method) {
    case 'GET':
      if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $stmt = $pdo->prepare('SELECT * FROM fuel_history WHERE id = ?');
        $stmt->execute([$id]);
        $entry = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success'=>true,'fuelHistoryEntry'=>$entry]);
      } else {
        $page   = (int)($_GET['page'] ?? 1);
        $limit  = (int)($_GET['limit'] ?? 10);
        $search = $_GET['search'] ?? '';
        $offset = ($page - 1) * $limit;
        $searchCondition = '';
        $params = [];
        if ($search) {
          $searchCondition = 'WHERE vehicle_name LIKE ? OR station LIKE ? OR fuel_type LIKE ?';
          $searchParam = "%$search%"; $params = [$searchParam,$searchParam,$searchParam];
        }
        $countStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM fuel_history $searchCondition");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        $totalPages = (int)ceil($total / max(1, $limit));
        $limitInt = max(1,(int)$limit); $offsetInt = max(0,(int)$offset);
        $sql = "SELECT * FROM fuel_history $searchCondition ORDER BY date DESC LIMIT $limitInt OFFSET $offsetInt";
        $stmt = $pdo->prepare($sql); $stmt->execute($params); $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success'=>true,'fuelHistory'=>$history,'currentPage'=>$page,'totalPages'=>$totalPages,'total'=>$total]);
      }
      break;

    case 'PUT':
      $input = json_decode(file_get_contents('php://input'), true);
      $id = $input['id'];
      $stmt = $pdo->prepare('UPDATE fuel_history SET vehicle_name = ?, station = ?, fuel_type = ?, liters = ?, price_per_liter = ?, total_cost = ?, date = ? WHERE id = ?');
      $stmt->execute([$input['vehicle_name'],$input['station'],$input['fuel_type'],$input['liters'],$input['price_per_liter'],$input['total_cost'],$input['date'],$id]);
      echo json_encode(['success'=>true,'message'=>'Fuel history entry updated successfully']);
      break;

    case 'DELETE':
      $input = json_decode(file_get_contents('php://input'), true);
      $id = $input['id'];
      $stmt = $pdo->prepare('DELETE FROM fuel_history WHERE id = ?');
      $stmt->execute([$id]);
      echo json_encode(['success'=>true,'message'=>'Fuel history entry deleted successfully']);
      break;

    default:
      echo json_encode(['success'=>false,'message'=>'Method not allowed']);
  }
} catch (Exception $e) {
  echo json_encode(['success'=>false,'message'=>'Server error: '.$e->getMessage()]);
}
?>
