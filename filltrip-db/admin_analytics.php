<?php
session_start();
header('Content-Type: application/json');
// Centralized CORS handling
require_once __DIR__ . '/cors.php';

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
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'metrics':
            // Get total users
            // NOTE: actual table name is `user` per schema, adjust if different.
            $totalUsersStmt = $pdo->query("SELECT COUNT(*) as count FROM user");
            $totalUsers = $totalUsersStmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Get active users today (users who created trips or refuel entries today)
            $activeUsersStmt = $pdo->query("
                SELECT COUNT(DISTINCT user_id) as count FROM (
                    SELECT user_id FROM user_trips WHERE DATE(created_at) = CURDATE()
                    UNION
                    SELECT user_id FROM fuel_history WHERE DATE(date) = CURDATE()
                ) as active_users
            ");
            $activeUsersToday = $activeUsersStmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Get total trips
            $totalTripsStmt = $pdo->query("SELECT COUNT(*) as count FROM user_trips");
            $totalTrips = $totalTripsStmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Get total fuel logs
            $totalFuelLogsStmt = $pdo->query("SELECT COUNT(*) as count FROM fuel_history");
            $totalFuelLogs = $totalFuelLogsStmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Get total distance
            $totalDistanceStmt = $pdo->query("SELECT SUM(distance_km) as total FROM user_trips");
            $totalDistance = $totalDistanceStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Get total fuel consumed
            $totalFuelStmt = $pdo->query("SELECT SUM(liters) as total FROM fuel_history");
            $totalFuelConsumed = $totalFuelStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Get total fuel cost
            $totalCostStmt = $pdo->query("SELECT SUM(total_cost) as total FROM fuel_history");
            $totalFuelCost = $totalCostStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Get most used vehicle
            $mostUsedVehicleStmt = $pdo->query("
                SELECT vehicle_label, COUNT(*) as count 
                FROM user_trips 
                WHERE vehicle_label IS NOT NULL AND vehicle_label != ''
                GROUP BY vehicle_label 
                ORDER BY count DESC 
                LIMIT 1
            ");
            $mostUsedVehicleResult = $mostUsedVehicleStmt->fetch(PDO::FETCH_ASSOC);
            $mostUsedVehicle = $mostUsedVehicleResult['vehicle_label'] ?? 'N/A';

            echo json_encode([
                'success' => true,
                'totalUsers' => intval($totalUsers),
                'activeUsersToday' => intval($activeUsersToday),
                'totalTrips' => intval($totalTrips),
                'totalFuelLogs' => intval($totalFuelLogs),
                'totalDistance' => floatval($totalDistance),
                'totalFuelConsumed' => floatval($totalFuelConsumed),
                'totalFuelCost' => floatval($totalFuelCost),
                'mostUsedVehicle' => $mostUsedVehicle
            ]);
            break;

        case 'user_growth':
            // Get user registrations grouped by date (only days with actual registrations)
            $userGrowthStmt = $pdo->query("
                SELECT 
                    DATE(created_at) as date,
                    DATE_FORMAT(created_at, '%b %d') as label,
                    COUNT(*) as newUsers
                FROM user 
                WHERE created_at IS NOT NULL
                GROUP BY DATE(created_at)
                HAVING COUNT(*) > 0
                ORDER BY DATE(created_at) ASC
            ");
            $userGrowthData = $userGrowthStmt->fetchAll(PDO::FETCH_ASSOC);

            // Convert newUsers to integers
            foreach ($userGrowthData as &$row) {
                $row['newUsers'] = (int) $row['newUsers'];
            }

            echo json_encode([
                'success' => true,
                'data' => $userGrowthData
            ]);
            break;

        case 'trips_analytics':
            $tripsStmt = $pdo->query("
                SELECT 
                    DATE_FORMAT(created_at, '%b') as month,
                    COUNT(*) as trips
                FROM user_trips 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY YEAR(created_at), MONTH(created_at)
                ORDER BY created_at ASC
            ");
            $tripsData = $tripsStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $tripsData
            ]);
            break;

        case 'fuel_analytics':
            $fuelStmt = $pdo->query("
                SELECT 
                    DATE_FORMAT(date, '%b') as month,
                    AVG(total_cost) as averageCost
                FROM fuel_history 
                WHERE date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY YEAR(date), MONTH(date)
                ORDER BY date ASC
            ");
            $fuelData = $fuelStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $fuelData
            ]);
            break;

        case 'popular_stations':
            $stationsStmt = $pdo->query("
                SELECT 
                    station as name,
                    COUNT(*) as count
                FROM fuel_history 
                WHERE station IS NOT NULL AND station != ''
                GROUP BY station
                ORDER BY count DESC
                LIMIT 5
            ");
            $stationsData = $stationsStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $stationsData
            ]);
            break;

        case 'fuel_type_distribution':
            $fuelTypesStmt = $pdo->query("
                SELECT 
                    fuel_type as name,
                    COUNT(*) as count,
                    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fuel_history WHERE fuel_type IS NOT NULL)), 1) as percentage
                FROM fuel_history 
                WHERE fuel_type IS NOT NULL AND fuel_type != ''
                GROUP BY fuel_type
                ORDER BY count DESC
            ");
            $fuelTypesData = $fuelTypesStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $fuelTypesData
            ]);
            break;

        case 'frequent_routes':
            $routesStmt = $pdo->query("
                SELECT 
                    start_location as startLocation,
                    end_location as endLocation,
                    COUNT(*) as count
                FROM user_trips 
                WHERE start_location IS NOT NULL AND end_location IS NOT NULL
                GROUP BY start_location, end_location
                ORDER BY count DESC
                LIMIT 5
            ");
            $routesData = $routesStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $routesData
            ]);
            break;

        default:
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
