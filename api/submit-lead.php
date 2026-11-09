<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    $data = $_POST;
}

$fullName = trim($data['fullName'] ?? $data['lastName'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$model = trim($data['model'] ?? '');
$showroom = trim($data['showroom'] ?? $data['areaReceptions'] ?? '');
$planTime = trim($data['planTime'] ?? '');

if (empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Vui lòng nhập số điện thoại']);
    exit;
}

$lead = [
    'fullName' => $fullName,
    'phone' => $phone,
    'email' => $email,
    'model' => $model,
    'showroom' => $showroom,
    'planTime' => $planTime,
    'submitted_at' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
];

$dataFile = __DIR__ . '/../data/leads.json';
$leads = [];
if (file_exists($dataFile)) {
    $content = file_get_contents($dataFile);
    $leads = json_decode($content, true) ?: [];
}

$leads[] = $lead;
file_put_contents($dataFile, json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// Optional: Gửi email về hòm thư công ty
// $to = "hotro@vinfasttaysaigon.vn";
// $subject = "Khách hàng mới đăng ký lái thử: " . $fullName . " (" . $phone . ")";
// mail($to, $subject, json_encode($lead, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'success' => true,
    'message' => 'Đăng ký thành công! Chuyên viên VinFast Tây Sài Gòn sẽ liên hệ lại với Quý khách trong vòng 5 phút.',
    'lead' => $lead
]);

