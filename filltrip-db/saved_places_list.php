<?php
declare(strict_types=1);
require __DIR__ . '/saved_places_common.php';

sp_cors('GET, OPTIONS');
$uid = sp_session_require();

try {
  $pdo = sp_pdo();
  $schema = sp_schema($pdo);
  $nameCol = $schema['nameCol'];

  $sql = "SELECT id, user_id, {$nameCol} AS name".
         ($schema['hasLat']?", latitude":"").
         ($schema['hasLon']?", longitude":"").
         ($schema['hasCreated']?", created_at":"").
         " FROM saved_places WHERE user_id=? ORDER BY ".($schema['hasCreated']?"created_at DESC, id DESC":"id DESC");
  $st = $pdo->prepare($sql);
  $st->execute([$uid]);
  $items = $st->fetchAll();
  echo json_encode(['success'=>true,'items'=>$items]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'DB error']);
}
