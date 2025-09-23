<?php
declare(strict_types=1);
require __DIR__ . '/saved_places_common.php';

sp_cors('POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD']!=='POST'){ http_response_code(405); echo json_encode(['success'=>false,'error'=>'Method not allowed']); exit; }
$uid = sp_session_require();

$x = sp_in();
$name = trim(($x['name'] ?? $x['place_name'] ?? ''));
$lat = isset($x['latitude']) ? (float)$x['latitude'] : null;
$lon = isset($x['longitude']) ? (float)$x['longitude'] : null;
if ($name===''){ http_response_code(400); echo json_encode(['success'=>false,'error'=>'Missing name']); exit; }

try {
  $pdo = sp_pdo();
  $schema = sp_schema($pdo);
  $nameCol = $schema['nameCol'];

  // Prevent duplicates per user/name
  $dup = $pdo->prepare("SELECT id FROM saved_places WHERE user_id=? AND {$nameCol}=? LIMIT 1");
  $dup->execute([$uid, $name]);
  if ($dup->fetchColumn()){
    echo json_encode(['success'=>true,'duplicate'=>true]);
    exit;
  }

  if ($schema['hasLat'] && $schema['hasLon']){
    $ins = $pdo->prepare("INSERT INTO saved_places (user_id, {$nameCol}, latitude, longitude".($schema['hasCreated']?", created_at":"").") VALUES (?, ?, ?, ?".($schema['hasCreated']?", NOW()":"").")");
    $ins->execute([$uid, $name, $lat, $lon]);
  } else {
    $ins = $pdo->prepare("INSERT INTO saved_places (user_id, {$nameCol}".($schema['hasCreated']?", created_at":"").") VALUES (?, ?".($schema['hasCreated']?", NOW()":"").")");
    $ins->execute([$uid, $name]);
  }

  $id = (int)$pdo->lastInsertId();
  $st = $pdo->prepare("SELECT id, user_id, {$nameCol} AS name".
                      ($schema['hasLat']?", latitude":"").
                      ($schema['hasLon']?", longitude":"").
                      ($schema['hasCreated']?", created_at":"").
                      " FROM saved_places WHERE id=? AND user_id=?");
  $st->execute([$id, $uid]);
  $row = $st->fetch();
  echo json_encode(['success'=>true,'place'=>$row]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'DB error']);
}
