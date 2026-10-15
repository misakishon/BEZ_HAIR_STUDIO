<?php
/**
 * booking/get_slots.php
 *
 * Returns a JSON list of already-booked time slots for a given barber+date.
 * Called via GET from step3.php JavaScript.
 *
 * Query params:
 *   date      – YYYY-MM-DD
 *   barber_id – int (0 = "any available" — still checks all barbers)
 */
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../database/connection.php';

/* ── Input ── */
$date      = $_GET['date']      ?? '';
$barber_id = intval($_GET['barber_id'] ?? 0);

/* ── Validate date format ── */
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    echo json_encode(['success' => false, 'message' => 'Invalid date format.']);
    exit;
}

// Refuse past dates
$today = (new DateTime('today'))->format('Y-m-d');
if ($date < $today) {
    echo json_encode(['success' => false, 'message' => 'Date is in the past.']);
    exit;
}

/* ── Query booked appointments ──────────────────────────────────────────
   We look for appointments that are NOT cancelled.
   If barber_id = 0 (any available), we return slots booked by ALL barbers
   so the user still sees them as unavailable (a different barber may take it).
   In a real system "any available" would pick the first free barber server-side;
   for now we block already-taken slots across the board.
────────────────────────────────────────────────────────────────────────── */
$booked_times = [];

if ($barber_id > 0) {
    // Specific barber — only their bookings matter
    $stmt = mysqli_prepare($conn,
        "SELECT TIME_FORMAT(appointment_time, '%H:%i') AS t
         FROM   appointments
         WHERE  barber_id        = ?
           AND  appointment_date = ?
           AND  status           NOT IN ('cancelled')");
    mysqli_stmt_bind_param($stmt, 'is', $barber_id, $date);
} else {
    // Any available — show slots booked on that date across ALL barbers
    // (In production you'd instead dynamically assign a free barber.)
    $stmt = mysqli_prepare($conn,
        "SELECT DISTINCT TIME_FORMAT(appointment_time, '%H:%i') AS t
         FROM   appointments
         WHERE  appointment_date = ?
           AND  status           NOT IN ('cancelled')");
    mysqli_stmt_bind_param($stmt, 's', $date);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
while ($row = mysqli_fetch_assoc($result)) {
    $booked_times[] = $row['t'];   // e.g. "10:30"
}
mysqli_stmt_close($stmt);

/* ── Also check time_slots table if the shop uses it ──────────────────
   Some setups store manual blocks (lunch breaks, holidays) there.
────────────────────────────────────────────────────────────────────────── */
if ($barber_id > 0) {
    $stmt2 = mysqli_prepare($conn,
        "SELECT TIME_FORMAT(start_time, '%H:%i') AS t
         FROM   time_slots
         WHERE  barber_id   = ?
           AND  slot_date   = ?
           AND  is_available = 0");
    mysqli_stmt_bind_param($stmt2, 'is', $barber_id, $date);
    mysqli_stmt_execute($stmt2);
    $result2 = mysqli_stmt_get_result($stmt2);
    while ($row = mysqli_fetch_assoc($result2)) {
        $booked_times[] = $row['t'];
    }
    mysqli_stmt_close($stmt2);
}

// Deduplicate
$booked_times = array_values(array_unique($booked_times));

echo json_encode([
    'success'      => true,
    'date'         => $date,
    'barber_id'    => $barber_id,
    'booked_times' => $booked_times,
]);