<?php
/**
 * Global CORS helper for admin endpoints.
 * Allows localhost origins (dev) and provides a permissive fallback (*) so UI can call APIs.
 * NOTE: Tighten the fallback for production (explicit origin whitelist only).
 */

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback: wide open (safe only for local/dev)
    header('Access-Control-Allow-Origin: *');
}

header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight short‑circuit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
