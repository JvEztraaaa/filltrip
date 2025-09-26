<?php
declare(strict_types=1);

/* ----------------------------- CORS -------------------------- */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?$#',$origin)) { header("Access-Control-Allow-Origin: {$origin}"); header('Vary: Origin'); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD']!=='POST'){ http_response_code(405); echo json_encode(['success'=>false,'error'=>'Method not allowed']); exit; }

/* ----------------------------- Session ----------------------------- */
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']==='on');
if (PHP_VERSION_ID>=70300){ session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=>'','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']); } else { session_set_cookie_params(0,'/; samesite=Lax','',$secure,true); }
session_start();
if (!isset($_SESSION['uid'])){ http_response_code(401); echo json_encode(['success'=>false,'error'=>'Not authenticated']); exit; }
$uid = (int)$_SESSION['uid'];

/* ----------------------------- DB ------------------------------------ */
const DB_HOST='127.0.0.1'; const DB_NAME='filltrip'; const DB_USER='root'; const DB_PASS='';
try{
  $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC
  ]);
}catch(Throwable $e){ http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB connection failed']); exit; }

/* ----------------------------- Validate upload ----------------------------- */
if (!isset($_FILES['avatar']) || !is_array($_FILES['avatar']) || !is_uploaded_file($_FILES['avatar']['tmp_name'])){
  http_response_code(400); echo json_encode(['success'=>false,'error'=>'No file uploaded']); exit;
}
$f = $_FILES['avatar'];
if (!empty($f['error']) && $f['error'] !== UPLOAD_ERR_OK){ http_response_code(400); echo json_encode(['success'=>false,'error'=>'Upload error']); exit; }

// 5 MB limit
$maxBytes = 5 * 1024 * 1024;
if ((int)$f['size'] > $maxBytes){ http_response_code(413); echo json_encode(['success'=>false,'error'=>'File too large (max 5 MB)']); exit; }

// MIME and extension
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($f['tmp_name']) ?: '';
$allowed = [ 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'image/avif' => 'avif' ];
if (!isset($allowed[$mime])){ http_response_code(400); echo json_encode(['success'=>false,'error'=>'Unsupported file type']); exit; }
$ext = $allowed[$mime];

/* ----------------------------- Save file ----------------------------- */
$baseDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads';
if (!is_dir($baseDir)) @mkdir($baseDir, 0775, true);
$userDir = $baseDir . DIRECTORY_SEPARATOR . $uid;
if (!is_dir($userDir)) @mkdir($userDir, 0775, true);

$name = 'avatar_' . $uid . '_' . date('YmdHis') . '_' . bin2hex(random_bytes(3)) . '.' . $ext;
$destAbs = $userDir . DIRECTORY_SEPARATOR . $name;

if (!@move_uploaded_file($f['tmp_name'], $destAbs)){
  http_response_code(500); echo json_encode(['success'=>false,'error'=>'Failed to save file']); exit;
}

// Normalize relative URL path
$relative = 'uploads/' . $uid . '/' . $name;

/* ----------------------------- Update user record ----------------------------- */
$upd = $pdo->prepare('UPDATE user SET user_icon = ? WHERE id = ?');
$upd->execute([$relative, $uid]);

echo json_encode(['success'=>true, 'avatarUrl'=>$relative]);
?>
