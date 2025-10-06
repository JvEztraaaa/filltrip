<?php
declare(strict_types=1);
require __DIR__ . '/saved_places_common.php';

/**
 * saved_places_list.php
 * ------------------------------------------------------------------
 * Lists saved places for current user; infers coordinates from name for
 * legacy rows missing latitude/longitude where possible.
 */

sp_cors('GET, OPTIONS');
$uid = sp_session_require();

try {
  $pdo    = sp_pdo();
  $schema = sp_schema($pdo);
  $nameCol= $schema['nameCol'];

  $sql = 'SELECT id, user_id, '.$nameCol.' AS name'.
    ($schema['hasLat'] ? ', latitude'   : '').
    ($schema['hasLon'] ? ', longitude'  : '').
    ($schema['hasCreated'] ? ', created_at' : '').
    ' FROM saved_places WHERE user_id=? ORDER BY '.($schema['hasCreated'] ? 'created_at DESC, id DESC' : 'id DESC');
  $st = $pdo->prepare($sql);
  $st->execute([$uid]);
  $items = $st->fetchAll();

  if ($schema['hasLat'] && $schema['hasLon']) {
    foreach ($items as &$it) {
      if ((($it['latitude'] ?? null) === null || ($it['longitude'] ?? null) === null) && isset($it['name'])) {
        if (preg_match('/^\s*(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/', $it['name'], $m)) {
          $maybeLat = (float)$m[1];
          $maybeLon = (float)$m[2];
          if ($maybeLat <= 90 && $maybeLat >= -90 && $maybeLon <= 180 && $maybeLon >= -180) {
            $it['latitude']  = $maybeLat;
            $it['longitude'] = $maybeLon;
          }
        }
      }
    }
    unset($it); // break reference
  }

  echo json_encode(['success'=>true,'items'=>$items]);
} catch (Throwable $e) {
  http_response_code(500); echo json_encode(['success'=>false,'error'=>'DB error']);
}
