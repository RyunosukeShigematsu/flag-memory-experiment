<?php
// m1_project/api/time.php
header('Content-Type: application/json; charset=UTF-8');

$allowedOrigins = [
  'https://YOUR_DOMAIN.example',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header("Vary: Origin");
  header("Access-Control-Allow-Methods: GET, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

// preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$nowMs = (int) round(microtime(true) * 1000);

echo json_encode([
  'ok' => true,
  'server_time_ms' => $nowMs,
], JSON_UNESCAPED_UNICODE);
