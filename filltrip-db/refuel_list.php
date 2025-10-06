<?php
declare(strict_types=1);

/* ------------------------------- CORS ------------------------------------*/
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#',$origin)) { header("Access-Control-Allow-Origin: {$origin}"); header('Vary: Origin'); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }

/* --------------------------------- Session --------------------------------- */
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']==='on');
if (PHP_VERSION_ID>=70300){ session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=>'','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']); } else { session_set_cookie_params(0,'/; samesite=Lax','',$secure,true); }
session_start();
if (!isset($_SESSION['uid'])){ echo json_encode(['success'=>true,'items'=>[]]); exit; }
$uid = (int)$_SESSION['uid'];

/* ----------------------------------- DB --------------------------------------- */
const DB_HOST='127.0.0.1'; const DB_NAME='filltrip'; const DB_USER='root'; const DB_PASS='';
try{
  $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC
  ]);
}catch(Throwable $e){ http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB connection failed']); exit; }

$sql = "SELECT
  id,
  CONCAT(DATE_FORMAT(date, '%Y-%m-%dT%H:%i:%s'), 'Z') AS createdAt,
  vehicle_name    AS vehicleName,
  odometer_km     AS odometerKm,
  distance_unit   AS distanceUnit,
  liters,
  fuel_unit       AS fuelUnit,
  price_per_liter AS pricePerLiter,
  total_cost      AS totalCost,
  fuel_type       AS fuelType,
  station,
  currency
FROM fuel_history
WHERE user_id=?
ORDER BY date DESC, id DESC";
$st = $pdo->prepare($sql);
$st->execute([$uid]);
$items = $st->fetchAll();

echo json_encode(['success'=>true,'items'=>$items]);