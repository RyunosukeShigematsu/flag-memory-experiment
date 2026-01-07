<?php
// m1_project/api/upload_audio.php
header('Content-Type: application/json; charset=UTF-8');

/**
 * CORS（ローカル→サーバへPOSTするため）
 * ※必要に応じて localhost:3000 だけ許可にしてる
 */
  $allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://shigematsu.nkmr.io',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header("Vary: Origin");
  header("Access-Control-Allow-Credentials: true");
  header("Access-Control-Allow-Methods: POST, OPTIONS");
  // ★ここを変更：ブラウザが要求してきたヘッダを許可する
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

/** 5桁のランダムID（英大文字+数字） */
function rand_id($len = 5) {
  $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字除外
  $out = '';
  for ($i=0; $i<$len; $i++) {
    $out .= $chars[random_int(0, strlen($chars)-1)];
  }
  return $out;
}

/** ファイル名に使える文字だけにする（日本語はOKだが記号は落とす） */
function sanitize($s) {
  $s = trim((string)$s);
  if ($s === '') return '';
  // スペース→_
  $s = preg_replace('/\s+/u', '_', $s);
  // 危険な文字を除去（/ \ : * ? " < > | など）
  $s = preg_replace('/[\/\\\\:\*\?"<>\|\#\&\%]+/u', '', $s);
  // 長すぎ防止
  return mb_substr($s, 0, 50, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('POST only', 405);
}

if (!isset($_FILES['audio'])) {
  json_error('missing file field: audio', 400);
}

$f = $_FILES['audio'];
if ($f['error'] !== UPLOAD_ERR_OK) {
  json_error('upload error', 400, ['php_upload_error' => $f['error']]);
}

// 保存先ディレクトリ
$saveDir = __DIR__ . '/../data/audio';
if (!is_dir($saveDir)) {
  if (!mkdir($saveDir, 0755, true)) {
    json_error('failed to create save directory', 500);
  }
}
if (!is_writable($saveDir)) {
  json_error('save directory is not writable', 500, ['dir' => $saveDir]);
}

// 受け取るフィールド（任意）
$participant = sanitize($_POST['participant'] ?? ''); // 将来: 名前入力など
$set = sanitize($_POST['set'] ?? '');                 // 将来: 1,2,...
$sessionId = sanitize($_POST['sessionId'] ?? '');     // クライアントから来る場合
$runLabel = sanitize($_POST['runLabel'] ?? '');       // ★追加："check" | "A" | "B"

// 暫定ID（無ければ5桁ID）
$tmpId = rand_id(5);

// ファイル名ルール
// 1) participant がある → participant_set
// 2) participant がない → 5桁ID_set
// set がないなら setなしでもOK（付けた方が後で楽）
$base = '';
if ($participant !== '') {
  $base = $participant;
} else if ($sessionId !== '') {
  $base = $sessionId; // 既に "AAAAA_set1" 等ならそれを尊重
} else {
  $base = $tmpId;
}
// ★ runLabel を付与（check/A/B）
if ($runLabel !== '') {
  // 既に末尾に _check/_A/_B が付いてたら二重にしない
  if (!preg_match('/_(check|A|B)$/', $base)) {
    $base .= "_{$runLabel}";
  }
}

if ($set !== '') {
  // sessionId側に set が入ってそうなら二重に付けない
  if (!preg_match('/_set\d+$/', $base)) {
    $base .= "_set{$set}";
  }
}

$ts = date('Ymd_His');
$ext = 'webm';

// mime から拡張子を変えたいならここで分岐できる（今はwebm固定でOK）
$filename = "{$base}_{$ts}.{$ext}";
$path = $saveDir . '/' . $filename;

// move_uploaded_file で保存
if (!move_uploaded_file($f['tmp_name'], $path)) {
  json_error('failed to save file', 500);
}

echo json_encode([
  'ok' => true,
  'filename' => $filename,
  'bytes' => filesize($path),
  'saved_to' => 'data/audio',
], JSON_UNESCAPED_UNICODE);
