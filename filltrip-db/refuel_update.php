<?php
declare(strict_types=1);

/* ------------------------------------ CORS -------------------------------------- */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#',$origin)) { header("Access-Control-Allow-Origin: {$origin}"); header('Vary: Origin'); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD']!=='POST'){ http_response_code(405); echo json_encode(['success'=>false,'error'=>'Method not allowed']); exit; }

/* ------------------------------------ Session -------------------------------------------- */
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']==='on');
if (PHP_VERSION_ID>=70300){ session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=>'','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']); } else { session_set_cookie_params(0,'/; samesite=Lax','',$secure,true); }
session_start();
if (!isset($_SESSION['uid'])){ http_response_code(401); echo json_encode(['success'=>false,'error'=>'Not authenticated']); exit; }
$uid = (int)$_SESSION['uid'];

/* ------------------------------------- DB ------------------------------------------------- */
const DB_HOST='127.0.0.1'; const DB_NAME='filltrip'; const DB_USER='root'; const DB_PASS='';
try{
  $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC
  ]);
}catch(Throwable $e){ http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB connection failed']); exit; }

/*--------------------------------------- Helpers ------------------------------------------- */
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
  $s = preg_replace('/[^\d\.\-]+/','',$s);
  if ($s==='' || $s==='-' || $s==='.' || $s==='-.') return 0.0;
  return (float)$s;
}

$x = in();
$id = (int)($x['id'] ?? 0);
if ($id<=0){ http_response_code(400); echo json_encode(['success'=>false,'error'=>'Missing id']); exit; }

// If client passes createdAt/date, parse and update date in UTC
$entryAt = null;
if (array_key_exists('createdAt',$x)){
  $raw = trim((string)$x['createdAt']);
  if ($raw !== '') {
    try{
      $dt = new DateTime($raw);
      $dt->setTimezone(new DateTimeZone('UTC'));
      $entryAt = $dt->format('Y-m-d H:i:s');
    }catch(Throwable $e){ $entryAt = null; }
  } else {
    $entryAt = null;
  }
}
$vehicleName   = array_key_exists('vehicleName',$x)   ? trim($x['vehicleName'])   : null;
$odometerKm    = array_key_exists('odometerKm',$x)    ? num($x['odometerKm'])    : null;
$distanceUnit  = array_key_exists('distanceUnit',$x)  ? (($x['distanceUnit'] ?: 'km')) : null;
$liters        = array_key_exists('liters',$x)        ? num($x['liters'])        : null;
$fuelUnit      = array_key_exists('fuelUnit',$x)      ? (($x['fuelUnit'] ?: 'liters')) : null;
$pricePerLiter = array_key_exists('pricePerLiter',$x) ? num($x['pricePerLiter']) : null;
$totalCost     = array_key_exists('totalCost',$x)     ? num($x['totalCost'])     : null;
$fuelType      = array_key_exists('fuelType',$x)      ? trim($x['fuelType'])     : null;
$station       = array_key_exists('station',$x)       ? trim($x['station'])      : null;
$currency      = array_key_exists('currency',$x)      ? (($x['currency'] ?: 'PHP')) : null;

/* -------------------- derive total cost if not provided but liters & price are --------------------------------- */
if (($totalCost===null || $totalCost<=0) && $liters!==null && $liters>0 && $pricePerLiter!==null && $pricePerLiter>0){
  $totalCost = $liters * $pricePerLiter;
}

/* --------------------------------  UPDATE ------------------------------------ */
$fields = [];
$args = [];
if ($entryAt!==null)      { $fields[]='date=?';            $args[]=$entryAt; }
if ($vehicleName!==null)   { $fields[]='vehicle_name=?';    $args[]=$vehicleName; }
if ($odometerKm!==null)    { $fields[]='odometer_km=?';     $args[]=$odometerKm; }
if ($distanceUnit!==null)  { $fields[]='distance_unit=?';   $args[]=$distanceUnit; }
if ($liters!==null)        { $fields[]='liters=?';          $args[]=$liters; }
if ($fuelUnit!==null)      { $fields[]='fuel_unit=?';       $args[]=$fuelUnit; }
if ($pricePerLiter!==null) { $fields[]='price_per_liter=?'; $args[]=$pricePerLiter; }
if ($totalCost!==null)     { $fields[]='total_cost=?';      $args[]=$totalCost; }
if ($fuelType!==null)      { $fields[]='fuel_type=?';       $args[]=$fuelType; }
if ($station!==null)       { $fields[]='station=?';         $args[]=$station; }
if ($currency!==null)      { $fields[]='currency=?';        $args[]=$currency; }

if (!$fields){ echo json_encode(['success'=>true,'updated'=>0]); exit; }

$args[] = $id;
$args[] = $uid;

$sql = "UPDATE fuel_history SET ".implode(', ',$fields)." WHERE id=? AND user_id=?";
$st = $pdo->prepare($sql);
$st->execute($args);

echo json_encode(['success'=>true,'updated'=>$st->rowCount()]);