<?php
header('Content-Type: application/json; charset=UTF-8');

// ===== CORS（upload_audio.php と同じ）=====
$allowedOrigins = [
  'https://YOUR_DOMAIN.example',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header("Vary: Origin");
  header("Access-Control-Allow-Credentials: true");
  header("Access-Control-Allow-Methods: POST, OPTIONS");

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

/** ファイル名に使える文字だけにする */
function sanitize_filename($s) {
  $s = trim((string)$s);
  if ($s === '') return '';
  $s = preg_replace('/\s+/u', '_', $s);
  $s = preg_replace('/[\/\\\\:\*\?"<>\|\#\&\%]+/u', '', $s);
  return mb_substr($s, 0, 120, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('POST only', 405);
}

// ===== JSON受け取り =====
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  json_error('invalid json', 400);
}

$filename = sanitize_filename($data['filename'] ?? '');
$payload  = $data['payload'] ?? null;

if ($filename === '' || $payload === null) {
  json_error('missing filename or payload', 400);
}

// 保存先
$saveDir = __DIR__ . '/../data/text';
if (!is_dir($saveDir)) {
  if (!mkdir($saveDir, 0755, true)) {
    json_error('failed to create save directory', 500);
  }
}
if (!is_writable($saveDir)) {
  json_error('save directory is not writable', 500, ['dir' => $saveDir]);
}

$path = $saveDir . '/' . $filename;

// .json 強制（安全）
if (!preg_match('/\.json$/', $path)) {
  json_error('filename must end with .json', 400, ['filename' => $filename]);
}

$json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if ($json === false) {
  json_error('failed to encode payload', 500);
}

if (file_put_contents($path, $json) === false) {
  json_error('failed to write file', 500, ['path' => $path]);
}

echo json_encode([
  'ok' => true,
  'filename' => $filename,
  'bytes' => filesize($path),
  'saved_to' => 'data/text',
], JSON_UNESCAPED_UNICODE);
