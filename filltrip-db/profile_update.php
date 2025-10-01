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

// Input
function read_in(): array {
  if (!empty($_POST)) return $_POST;
  $raw = file_get_contents('php://input') ?: '';
  $ctype = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
  if (strpos($ctype,'application/json')!==false || (strlen($raw)&&($raw[0]=='{'||$raw[0]=='['))) {
    $j = json_decode($raw,true); if (json_last_error()===JSON_ERROR_NONE && is_array($j)) return $j;
  }
  parse_str($raw,$p); return is_array($p)?$p:[];
}
$in = read_in();

$firstName = trim($in['firstName'] ?? '');
$lastName = trim($in['lastName'] ?? '');
$fullName = trim($firstName . ' ' . $lastName);
$username = trim($in['username'] ?? '');
$email    = trim($in['email'] ?? '');

$missing = [];
if ($firstName === '') $missing[] = 'firstName';
if ($lastName === '') $missing[] = 'lastName';
if ($username === '') $missing[] = 'username';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $missing[] = 'email';
if ($missing) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Invalid input','missing'=>$missing]); exit; }

// Uniqueness check excluding self
$dup = $pdo->prepare('SELECT id FROM user WHERE (email = :email OR username = :username) AND id <> :id LIMIT 1');
$dup->execute([':email'=>$email, ':username'=>$username, ':id'=>$uid]);
if ($dup->fetch()) { http_response_code(409); echo json_encode(['success'=>false,'error'=>'Email or username already in use']); exit; }

// Update
$upd = $pdo->prepare('UPDATE user SET first_name = ?, last_name = ?, full_name = ?, username = ?, email = ? WHERE id = ?');
$upd->execute([$firstName, $lastName, $fullName, $username, $email, $uid]);

// Update session email if changed
$_SESSION['email'] = $email;

$sel = $pdo->prepare('SELECT id, first_name AS firstName, last_name AS lastName, full_name AS fullName, username, email, user_icon AS avatarUrl, role, created_at AS createdAt FROM user WHERE id = ?');
$sel->execute([$uid]);
$user = $sel->fetch();

echo json_encode(['success'=>true, 'user'=>$user]);
