<?php
declare(strict_types=1);

/* CORS */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'error'=>'Method not allowed']); exit; }

/* Sessions */
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');
if (PHP_VERSION_ID >= 70300) { session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=>'','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']); }
else { session_set_cookie_params(0, '/; samesite=Lax', '', $secure, true); }
session_start();

/* DB */
const DB_HOST = '127.0.0.1';
const DB_NAME = 'filltrip';
const DB_USER = 'root';
const DB_PASS = '';
try {
  $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
} catch (Throwable $e) { http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB connection failed']); exit; }

/* Input */
function read_input(): array {
  if (!empty($_POST)) return $_POST;
  $raw = file_get_contents('php://input') ?: '';
  $ctype = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
  if (strpos($ctype, 'application/json') !== false || (strlen($raw) && ($raw[0]=='{' || $raw[0]=='['))) {
    $j = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($j)) return $j;
  }
  parse_str($raw, $parsed);
  return is_array($parsed) ? $parsed : [];
}
$in = read_input();

$email = trim($in['email'] ?? '');
$password = (string)($in['password'] ?? '');
$missing = [];
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $missing[] = 'email';
if ($password === '') $missing[] = 'password';
if ($missing) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Invalid credentials','missing'=>$missing]); exit; }

/* lookup */
$sel = $pdo->prepare("SELECT id, first_name AS firstName, last_name AS lastName, full_name AS fullName, username, email, user_icon AS avatarUrl, role, password_hash, created_at AS createdAt FROM user WHERE email = ? LIMIT 1");
$sel->execute([$email]);
$row = $sel->fetch();
if (!$row) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'User not found']); exit; }
if (!password_verify($password, $row['password_hash'])) { http_response_code(401); echo json_encode(['success'=>false,'error'=>'Invalid password']); exit; }
unset($row['password_hash']);

/* -------------------------- set session ------------------------------ */
$_SESSION['uid'] = $row['id'];
$_SESSION['email'] = $row['email'];

echo json_encode(['success'=>true,'user'=>$row]);