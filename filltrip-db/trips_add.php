<?php
declare(strict_types=1);

/* --------------------------------------- CORS ----------------------------------------------*/
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#',$origin)) { header("Access-Control-Allow-Origin: {$origin}"); header('Vary: Origin'); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD']!=='POST'){ http_response_code(405); echo json_encode(['success'=>false,'error'=>'Method not allowed']); exit; }

/* ----------------------------------------- Session ---------------------------------------- */
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']==='on');
if (PHP_VERSION_ID>=70300){ session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=>'','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']); } else { session_set_cookie_params(0,'/; samesite=Lax','',$secure,true); }
session_start();
if (!isset($_SESSION['uid'])){ http_response_code(401); echo json_encode(['success'=>false,'error'=>'Not authenticated']); exit; }
$uid = (int)$_SESSION['uid'];

/* ---------------------------------------- DB ----------------------------------------------- */
const DB_HOST='127.0.0.1'; const DB_NAME='filltrip'; const DB_USER='root'; const DB_PASS='';
try{
  $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC
  ]);
}catch(Throwable $e){ http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB connection failed']); exit; }

/* ------------------------------------- Helpers ----------------------------------------------- */
function in(): array {
  if (!empty($_POST)) return $_POST;
  $raw = file_get_contents('php://input') ?: '';
  $ctype = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
  if (strpos($ctype,'application/json')!==false || (strlen($raw)&&($raw[0]=='{'||$raw[0]=='['))){
    $j = json_decode($raw,true); if (json_last_error()===JSON_ERROR_NONE && is_array($j)) return $j;
  }
  parse_str($raw,$p); return is_array($p)?$p:[];
}
function num($v): float {
  if ($v===null) return 0.0;
  $s = trim((string)$v);
  if ($s==='') return 0.0;
  // allow "1,234.56" or "₱56" etc.
  $s = preg_replace('/[^\d\.\-]+/','',$s);
  if ($s==='' || $s==='-' || $s==='.' || $s==='-.') return 0.0;
  return (float)$s;
}

/* ------------------------------------ Input -------------------------------------------- */
$x = in();

$startLoc = trim($x['startLocationName'] ?? $x['startLocation'] ?? $x['startName'] ?? '');
$endLoc   = trim($x['endLocationName']   ?? $x['endLocation']   ?? $x['endName']   ?? '');

$distanceKm    = num($x['distanceKm']      ?? 0);
$litersNeeded  = num($x['litersNeeded']    ?? 0);
$fuelCost      = num($x['fuelCost']        ?? 0);

/*----------------------------- May or may not be provided by the frontend ------------------------------------ */
$effKmPerL     = num($x['efficiencyKmPerL']   ?? ($x['efficiencyKpl'] ?? ($x['efficiency'] ?? 0)));
$pricePerLiter = num($x['pricePerLiter']      ?? ($x['fuelPricePerLiter'] ?? 0));

$currency = ($x['currency'] ?? 'PHP') ?: 'PHP';
$fuelType = trim($x['fuelType'] ?? '');
$vehicle  = trim($x['vehicleLabel'] ?? $x['vehicle'] ?? '');

/* ---------------------------------- Forward derivations (if provided) ---------------------------------------- */
if ($distanceKm > 0 && $effKmPerL > 0 && $litersNeeded <= 0) {
  $litersNeeded = $distanceKm / $effKmPerL;
}
if ($litersNeeded > 0 && $pricePerLiter > 0 && $fuelCost <= 0) {
  $fuelCost = $litersNeeded * $pricePerLiter;
}

/* ------------------------------------- Reverse derivations --------------------------------------*/
if ($effKmPerL <= 0 && $distanceKm > 0 && $litersNeeded > 0) {
  $effKmPerL = $distanceKm / $litersNeeded;
}
/* ----------------------------------- If UI sent only liters+total cost, infer price per liter ----------------------------------------- */
if ($pricePerLiter <= 0 && $litersNeeded > 0 && $fuelCost > 0) {
  $pricePerLiter = $fuelCost / $litersNeeded;
}

/* ----------------------- Normalize/round ------------------------------ */
$litersNeeded  = max(0, round($litersNeeded, 2));
$fuelCost      = max(0, round($fuelCost, 2));
$effKmPerL     = $effKmPerL > 0 ? round($effKmPerL, 2) : null;
$pricePerLiter = $pricePerLiter > 0 ? round($pricePerLiter, 2) : null;

/*  --------------------------------Validate ------------------------------ */
if ($startLoc==='' || $endLoc==='' || $distanceKm<=0 || $litersNeeded<0 || $fuelCost<0){
  http_response_code(400); echo json_encode(['success'=>false,'error'=>'Invalid input']); exit;
}

/* ------------------------------- Insert --------------------------------- */
$ins = $pdo->prepare("INSERT INTO user_trips
  (user_id, start_location, end_location, distance_km,
   efficiency_kpl, liters_needed, price_per_liter,
   fuel_cost, currency, fuel_type, vehicle_label, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

$ins->execute([
  $uid, $startLoc, $endLoc, $distanceKm,
  $effKmPerL, $litersNeeded, $pricePerLiter,
  $fuelCost, $currency, $fuelType, $vehicle
]);

/* ------------------ Return the created row ------------------------------- */
$id  = (int)$pdo->lastInsertId();
$sel = $pdo->prepare("SELECT id,
  start_location AS startLocationName,
  end_location   AS endLocationName,
  distance_km    AS distanceKm,
  efficiency_kpl AS efficiencyKmPerL,
  liters_needed  AS litersNeeded,
  price_per_liter AS pricePerLiter,
  fuel_cost      AS fuelCost,
  currency, fuel_type AS fuelType, vehicle_label AS vehicleLabel,
  created_at     AS createdAt
  FROM user_trips WHERE id=?");
$sel->execute([$id]);
$trip = $sel->fetch();

/* ---------------------- Back-compat aliases -------------------------- */
$trip['startName'] = $trip['startLocationName'];
$trip['endName']   = $trip['endLocationName'];

echo json_encode(['success'=>true,'trip'=>$trip]);