<?php
declare(strict_types=1);

/**
 * trips_delete.php
 * ------------------------------------------------------------------
 * Deletes a user trip by id (POST). Returns deleted=true if owned row removed.
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
if (PHP_VERSION_ID >= 70300){ session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=>'','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']); } else { session_set_cookie_params(0,'/; samesite=Lax','',$secure,true); }
session_start();
if (!isset($_SESSION['uid'])) { http_response_code(401); echo json_encode(['success'=>false,'error'=>'Not authenticated']); exit; }
$uid = (int)$_SESSION['uid'];

/* ----------------------------- Database ---------------------------- */
const DB_HOST='127.0.0.1'; const DB_NAME='filltrip'; const DB_USER='root'; const DB_PASS='';
try { $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]); }
catch (Throwable $e) { http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB connection failed']); exit; }

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if ($id <= 0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Invalid id']); exit; }

$del = $pdo->prepare('DELETE FROM user_trips WHERE id=? AND user_id=?');
$del->execute([$id,$uid]);
echo json_encode(['success'=>true,'deleted'=>$del->rowCount() > 0]);
