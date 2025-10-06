<?php
/**
 * admin_analytics.php
 * ------------------------------------------------------------------
 * Provides aggregated metrics & analytics endpoints for admin dashboard.
 * Query param: action = metrics|user_growth|trips_analytics|fuel_analytics|popular_stations|fuel_type_distribution|frequent_routes.
 */

session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';

$host = 'localhost';
$dbname = 'filltrip';
$username = 'root';
$password = '';

try { $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password); $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); }
catch (PDOException $e) { echo json_encode(['success'=>false,'message'=>'Database connection failed: '.$e->getMessage()]); exit(); }

$action = $_GET['action'] ?? '';

try {
  switch ($action) {
    case 'metrics':
      $totalUsers = (int)$pdo->query('SELECT COUNT(*) AS count FROM user')->fetch(PDO::FETCH_ASSOC)['count'];
      $activeUsersToday = (int)$pdo->query("SELECT COUNT(DISTINCT user_id) AS count FROM (SELECT user_id FROM user_trips WHERE DATE(created_at)=CURDATE() UNION SELECT user_id FROM fuel_history WHERE DATE(date)=CURDATE()) AS active_users")->fetch(PDO::FETCH_ASSOC)['count'];
      $totalTrips = (int)$pdo->query('SELECT COUNT(*) AS count FROM user_trips')->fetch(PDO::FETCH_ASSOC)['count'];
      $totalFuelLogs = (int)$pdo->query('SELECT COUNT(*) AS count FROM fuel_history')->fetch(PDO::FETCH_ASSOC)['count'];
      $totalDistance = (float)($pdo->query('SELECT SUM(distance_km) AS total FROM user_trips')->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
      $totalFuelConsumed = (float)($pdo->query('SELECT SUM(liters) AS total FROM fuel_history')->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
      $totalFuelCost = (float)($pdo->query('SELECT SUM(total_cost) AS total FROM fuel_history')->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
      $mostUsedVehicleResult = $pdo->query("SELECT vehicle_label, COUNT(*) AS count FROM user_trips WHERE vehicle_label IS NOT NULL AND vehicle_label != '' GROUP BY vehicle_label ORDER BY count DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
      $mostUsedVehicle = $mostUsedVehicleResult['vehicle_label'] ?? 'N/A';
      echo json_encode(['success'=>true,'totalUsers'=>$totalUsers,'activeUsersToday'=>$activeUsersToday,'totalTrips'=>$totalTrips,'totalFuelLogs'=>$totalFuelLogs,'totalDistance'=>$totalDistance,'totalFuelConsumed'=>$totalFuelConsumed,'totalFuelCost'=>$totalFuelCost,'mostUsedVehicle'=>$mostUsedVehicle]);
      break;
    case 'user_growth':
      $userGrowthStmt = $pdo->query("SELECT DATE(created_at) AS date, DATE_FORMAT(created_at, '%b %d') AS label, COUNT(*) AS newUsers FROM user WHERE created_at IS NOT NULL GROUP BY DATE(created_at) HAVING COUNT(*) > 0 ORDER BY DATE(created_at) ASC");
      $data = $userGrowthStmt->fetchAll(PDO::FETCH_ASSOC); foreach ($data as &$r) { $r['newUsers'] = (int)$r['newUsers']; } unset($r);
      echo json_encode(['success'=>true,'data'=>$data]);
      break;
    case 'trips_analytics':
      $tripsData = $pdo->query("SELECT DATE_FORMAT(created_at, '%b') AS month, COUNT(*) AS trips FROM user_trips WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY created_at ASC")->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode(['success'=>true,'data'=>$tripsData]);
      break;
    case 'fuel_analytics':
      $fuelData = $pdo->query("SELECT DATE_FORMAT(date, '%b') AS month, AVG(total_cost) AS averageCost FROM fuel_history WHERE date >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY YEAR(date), MONTH(date) ORDER BY date ASC")->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode(['success'=>true,'data'=>$fuelData]);
      break;
    case 'popular_stations':
      $stationsData = $pdo->query("SELECT station AS name, COUNT(*) AS count FROM fuel_history WHERE station IS NOT NULL AND station != '' GROUP BY station ORDER BY count DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode(['success'=>true,'data'=>$stationsData]);
      break;
    case 'fuel_type_distribution':
      $fuelTypesData = $pdo->query("SELECT fuel_type AS name, COUNT(*) AS count, ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fuel_history WHERE fuel_type IS NOT NULL)), 1) AS percentage FROM fuel_history WHERE fuel_type IS NOT NULL AND fuel_type != '' GROUP BY fuel_type ORDER BY count DESC")->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode(['success'=>true,'data'=>$fuelTypesData]);
      break;
    case 'frequent_routes':
      $routesData = $pdo->query("SELECT start_location AS startLocation, end_location AS endLocation, COUNT(*) AS count FROM user_trips WHERE start_location IS NOT NULL AND end_location IS NOT NULL GROUP BY start_location, end_location ORDER BY count DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode(['success'=>true,'data'=>$routesData]);
      break;
    default:
      echo json_encode(['success'=>false,'message'=>'Invalid action']);
  }
} catch (Exception $e) {
  echo json_encode(['success'=>false,'message'=>'Server error: '.$e->getMessage()]);
}
?>
