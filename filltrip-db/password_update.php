<?php
declare(strict_types=1);

// CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\\d+)?$#', $origin)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'error'=>'Method not allowed']); exit; }

// Session
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');
if (PHP_VERSION_ID >= 70300) { session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=>'','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']); }
else { session_set_cookie_params(0, '/; samesite=Lax', '', $secure, true); }
session_start();
if (!isset($_SESSION['uid'])) { http_response_code(401); echo json_encode(['success'=>false,'error'=>'Not authenticated']); exit; }
$uid = (int)$_SESSION['uid'];

// DB
try {
  $pdo = new PDO('mysql:host=127.0.0.1;dbname=filltrip;charset=utf8mb4', 'root', '', [
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
  ]);
} catch (Throwable $e) { http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB connection failed']); exit; }

function read_in(): array {
  if (!empty($_POST)) return $_POST;
  $raw = file_get_contents('php://input') ?: '';
  $ctype = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
  if (strpos($ctype,'application/json')!==false || (strlen($raw)&&($raw[0]=='{'||$raw[0]=='['))) { $j=json_decode($raw,true); if (json_last_error()===JSON_ERROR_NONE && is_array($j)) return $j; }
  parse_str($raw,$p); return is_array($p)?$p:[];
}
$in = read_in();

$current = (string)($in['currentPassword'] ?? '');
$new = (string)($in['newPassword'] ?? '');
if (strlen($new) < 6) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'New password too short']); exit; }

$sel = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
$sel->execute([$uid]);
$row = $sel->fetch();
if (!$row || !password_verify($current, $row['password_hash'])) { http_response_code(401); echo json_encode(['success'=>false,'error'=>'Current password incorrect']); exit; }

$hash = password_hash($new, PASSWORD_DEFAULT);
$upd = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
$upd->execute([$hash, $uid]);

echo json_encode(['success'=>true]);
