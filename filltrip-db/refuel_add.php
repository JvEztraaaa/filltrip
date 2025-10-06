<?php
declare(strict_types=1);

/**
 * refuel_add.php
 * ------------------------------------------------------------------
 * Adds a new fuel history entry for the authenticated user.
 * Accepts client-provided timestamp (UTC/ISO) or defaults to current UTC.
 */

/* ----------------------------- CORS -------------------------------- */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#',$origin)) { header("Access-Control-Allow-Origin: {$origin}"); header('Vary: Origin'); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'error'=>'Method not allowed']); exit; }

/* --------------------------- Session Guard ------------------------- */
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');
if (PHP_VERSION_ID >= 70300) { session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=>'','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']); } else { session_set_cookie_params(0, '/; samesite=Lax', '', $secure, true); }
session_start();
if (!isset($_SESSION['uid'])) { http_response_code(401); echo json_encode(['success'=>false,'error'=>'Not authenticated']); exit; }
$uid = (int)$_SESSION['uid'];

/* ----------------------------- Database ---------------------------- */
const DB_HOST='127.0.0.1'; const DB_NAME='filltrip'; const DB_USER='root'; const DB_PASS='';
try {
  $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC
  ]);
} catch (Throwable $e) { http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB connection failed']); exit; }

/* ----------------------------- Helpers ----------------------------- */
function in(): array {
  if (!empty($_POST)) return $_POST;
  $raw = file_get_contents('php://input') ?: '';
  $ctype = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
  if (strpos($ctype,'application/json') !== false || (strlen($raw) && ($raw[0]=='{' || $raw[0]=='['))) {
    $j = json_decode($raw, true); if (json_last_error() === JSON_ERROR_NONE && is_array($j)) return $j;
  }
  parse_str($raw, $p); return is_array($p) ? $p : [];
}
function num($v): float {
  if ($v === null) return 0.0;
  $s = trim((string)$v);
  if ($s === '') return 0.0;
  $s = preg_replace('/[^\d\.\-]+/','',$s);
  if ($s === '' || $s === '-' || $s === '.' || $s === '-.') return 0.0;
  return (float)$s;
}

/* ------------------------------ Input ------------------------------- */
$x = in();
$entryAtClient = trim($x['createdAt'] ?? $x['date'] ?? '');
$createdAtUtc = null; // will hold UTC date-time string
if ($entryAtClient !== '') {
  try {
    $dt = new DateTime($entryAtClient);
    $dt->setTimezone(new DateTimeZone('UTC'));
    $createdAtUtc = $dt->format('Y-m-d H:i:s');
  } catch (Throwable $e) { $createdAtUtc = null; }
}
if ($createdAtUtc === null) $createdAtUtc = gmdate('Y-m-d H:i:s');

$vehicleName   = trim($x['vehicleName'] ?? '');
$odometerKm    = num($x['odometerKm'] ?? 0);
$distanceUnit  = ($x['distanceUnit'] ?? 'km') ?: 'km';
$liters        = num($x['liters'] ?? 0);
$fuelUnit      = ($x['fuelUnit'] ?? 'liters') ?: 'liters';
$pricePerLiter = num($x['pricePerLiter'] ?? 0);
$totalCost     = num($x['totalCost'] ?? 0);
$fuelType      = trim($x['fuelType'] ?? 'Gasoline / Unleaded (91)');
$station       = trim($x['station'] ?? '');
$currency      = ($x['currency'] ?? 'PHP') ?: 'PHP';

/* ----------------------- Derive totalCost if missing --------------- */
if ($totalCost <= 0 && $liters > 0 && $pricePerLiter > 0) $totalCost = $liters * $pricePerLiter;

/* ----------------------------- Validation -------------------------- */
if ($vehicleName === '' || $odometerKm <= 0 || $liters <= 0 || $pricePerLiter <= 0) {
  http_response_code(400); echo json_encode(['success'=>false,'error'=>'Invalid input']); exit; }

/* ------------------------------ Insert ------------------------------ */
$ins = $pdo->prepare('INSERT INTO fuel_history (user_id, vehicle_name, odometer_km, distance_unit, liters, fuel_unit, price_per_liter, total_cost, fuel_type, station, currency, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$ins->execute([$uid, $vehicleName, $odometerKm, $distanceUnit, $liters, $fuelUnit, $pricePerLiter, $totalCost, $fuelType, $station, $currency, $createdAtUtc]);

$id  = (int)$pdo->lastInsertId();
$sel = $pdo->prepare("SELECT id, CONCAT(DATE_FORMAT(date, '%Y-%m-%dT%H:%i:%s'), 'Z') AS createdAt, vehicle_name AS vehicleName, odometer_km AS odometerKm, distance_unit AS distanceUnit, liters, fuel_unit AS fuelUnit, price_per_liter AS pricePerLiter, total_cost AS totalCost, fuel_type AS fuelType, station, currency FROM fuel_history WHERE id=? AND user_id=?");
$sel->execute([$id, $uid]);
$row = $sel->fetch();

echo json_encode(['success'=>true,'entry'=>$row]);
