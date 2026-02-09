<?php
// m1_project/api/upload_json.php
header('Content-Type: application/json; charset=UTF-8');

/**
 * CORS（audio.phpと同じ流儀）
 */
$allowedOrigins = [
  'https://YOUR_DOMAIN.example',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header("Vary: Origin");
  header("Access-Control-Allow-Credentials: true");
  header("Access-Control-Allow-Methods: POST, OPTIONS");

  // ★ここ重要：ブラウザが要求してきたヘッダを許可する
  $reqHeaders = $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] ?? '';
  if ($reqHeaders) {
    header("Access-Control-Allow-Headers: {$reqHeaders}");
  } else {
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
  }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

function json_error($msg, $code = 400, $extra = []) {
  http_response_code($code);
  echo json_encode(array_merge(['ok' => false, 'error' => $msg], $extra), JSON_UNESCAPED_UNICODE);
  exit;
}

/** ファイル名に使える文字だけにする（日本語OK、危険記号除去） */
function sanitize($s) {
  $s = trim((string)$s);
  if ($s === '') return '';

  // ★ 空白だけを _ にする（半角・全角スペース）
  $s = preg_replace('/[ \x{3000}]+/u', '_', $s);

  // ★ 危険な記号だけ除去（ー は含めない）
  $s = preg_replace('/[\/\\\\:\*\?"<>\|\#\&\%]+/u', '', $s);

  return mb_substr($s, 0, 80, 'UTF-8');
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('POST only', 405);
}

// JSON受け取り
$raw = file_get_contents('php://input');
if ($raw === false || $raw === '') json_error('Empty body', 400);

$data = json_decode($raw, true);
if ($data === null) json_error('Invalid JSON', 400);

// 保存先：flagLog
$dir = __DIR__ . '/../data/flagLog';
if (!is_dir($dir)) {
  if (!mkdir($dir, 0755, true)) json_error('failed to create save directory', 500);
}
if (!is_writable($dir)) {
  json_error('save directory is not writable', 500, ['dir' => $dir]);
}

// ファイル名：sessionIdが来たらそれ優先
$sessionId = sanitize($data['sessionId'] ?? '');
$ts = date('Ymd_His');

$status = $data['meta']['status'] ?? ($data['status'] ?? 'ok');
$status = is_string($status) ? $status : 'ok';
$isAborted = ($status === 'aborted');

if ($sessionId !== '') {
  // 衝突回避にサーバ時刻も足す（不要なら外してOK）
  $filename = $isAborted
  ? "{$sessionId}_ABORTED_{$ts}.json"
  : "{$sessionId}_{$ts}.json";
} else {
  $rand = bin2hex(random_bytes(4));
  $filename = "session_{$ts}_{$rand}.json";
}

$path = $dir . '/' . $filename;

// ★最低限の必須チェック（ゴミ保存防止）
if (($data['set'] ?? null) === null) json_error('missing set', 400);
if ($sessionId === '') json_error('missing sessionId', 400);

// ★受け取ったJSONをそのまま保存（events / meta も全部残る）
$ok = file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
if ($ok === false) json_error('failed to save json', 500);

echo json_encode([
  'ok' => true,
  'filename' => $filename,
  'bytes' => filesize($path),
  'saved_to' => 'data/flagLog',
], JSON_UNESCAPED_UNICODE);
