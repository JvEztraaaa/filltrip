<?php
declare(strict_types=1);
require __DIR__ . '/saved_places_common.php';

sp_cors('POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD']!=='POST'){ http_response_code(405); echo json_encode(['success'=>false,'error'=>'Method not allowed']); exit; }
$uid = sp_session_require();

$x = sp_in();
$id = (int)($x['id'] ?? 0);
if ($id<=0){ http_response_code(400); echo json_encode(['success'=>false,'error'=>'Missing id']); exit; }

try {
  $pdo = sp_pdo();
  $st = $pdo->prepare('DELETE FROM saved_places WHERE id=? AND user_id=?');
  $st->execute([$id, $uid]);
  echo json_encode(['success'=>true,'deleted'=>$st->rowCount()>0]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'DB error']);
}
