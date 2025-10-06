<?php
declare(strict_types=1);

/* Shared helpers for saved_places endpoints */

function sp_cors(string $methods): void {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#',$origin)) { header("Access-Control-Allow-Origin: {$origin}"); header('Vary: Origin'); }
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Allow-Headers: Content-Type');
  header("Access-Control-Allow-Methods: {$methods}");
  header('Content-Type: application/json');
  if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }
}

function sp_session_require(): int {
  $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']==='on');
  if (PHP_VERSION_ID>=70300){ session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=>'','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']); } else { session_set_cookie_params(0,'/; samesite=Lax','',$secure,true); }
  session_start();
  if (!isset($_SESSION['uid'])){ http_response_code(401); echo json_encode(['success'=>false,'error'=>'Not authenticated']); exit; }
  return (int)$_SESSION['uid'];
}

function sp_pdo(): PDO {
  // DB config aligned with other endpoints
  $pdo = new PDO('mysql:host=127.0.0.1;dbname=filltrip;charset=utf8mb4', 'root', '', [
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
  ]);
  return $pdo;
}

function sp_in(): array {
  if (!empty($_POST)) return $_POST;
  $raw = file_get_contents('php://input') ?: '';
  $ctype = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
  if (strpos($ctype,'application/json')!==false || (strlen($raw)&&($raw[0]=='{'||$raw[0]=='['))){
    $j = json_decode($raw,true); if (json_last_error()===JSON_ERROR_NONE && is_array($j)) return $j;
  }
  parse_str($raw,$p); return is_array($p)?$p:[];
}

function sp_schema(PDO $pdo): array {
  $dbName = $pdo->query('SELECT DATABASE()')->fetchColumn();
  $cols = $pdo->prepare('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME="saved_places"');
  $cols->execute([$dbName]);
  $names = array_map(fn($r)=>$r['COLUMN_NAME'], $cols->fetchAll());
  $hasName = in_array('name',$names,true);
  $hasPlaceName = in_array('place_name',$names,true);
  if (!$hasName && !$hasPlaceName) throw new RuntimeException('saved_places missing name column');
  $nameCol = $hasName ? 'name' : 'place_name';
  $hasLat = in_array('latitude',$names,true);
  $hasLon = in_array('longitude',$names,true);
  $hasCreated = in_array('created_at',$names,true);
  return [ 'nameCol'=>$nameCol, 'hasLat'=>$hasLat, 'hasLon'=>$hasLon, 'hasCreated'=>$hasCreated ];
}
