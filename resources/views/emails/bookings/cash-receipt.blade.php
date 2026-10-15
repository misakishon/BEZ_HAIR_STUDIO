<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; }
        .logo { font-size: 24px; font-weight: 800; color: #000; text-align: center; margin-bottom: 30px; }
        .logo span { color: #c9a84c; }
        .success-badge { background: #d4edda; border: 2px solid #28a745; color: #155724; padding: 12px 20px; border-radius: 6px; text-align: center; font-weight: 600; margin-bottom: 20px; }
        .section-title { font-size: 18px; font-weight: 600; color: #000; margin-top: 25px; margin-bottom: 15px; }
        .details-box { background: #f9f9f9; border-left: 4px solid #c9a84c; padding: 15px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .detail-label { color: #666; font-weight: 500; }
        .detail-value { color: #000; font-weight: 600; }
        .receipt-box { background: #fffbf0; border: 1px solid #e8dcc4; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .receipt-header { text-align: center; font-weight: 600; color: #000; margin-bottom: 15px; font-size: 16px; }
        .receipt-line { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px dashed #ddd; }
        .receipt-total { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-top: 2px solid #c9a84c; font-weight: 600; font-size: 16px; }
        .info-box { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .info-text { color: #0c5aa0; line-height: 1.6; margin: 5px 0; }
        .text { color: #666; line-height: 1.6; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">BEZ<span>.</span></div>
        
        <h2 style="text-align: center; color: #000;">Booking Confirmed!</h2>
        <div class="success-badge">✓ Your booking has been confirmed</div>
        <p class="text" style="text-align: center;">Thank you for choosing BEZ Hair Studio. Your appointment is confirmed for cash payment.</p>

        <div class="section-title">Booking Details</div>
        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#{{ $booking->id }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">{{ $booking->full_name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Barber:</span>
                <span class="detail-value">{{ $booking->barber_name ?? 'Any Available' }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->booking_time)->format('h:i A') }}</span>
            </div>
        </div>

        <div class="section-title">Receipt</div>
        <div class="receipt-box">
            <div class="receipt-header">BEZ Hair Studio - Booking Receipt</div>
            <div class="receipt-line">
                <span>Service</span>
                <span>₱{{ number_format($booking->total_price, 2) }}</span>
            </div>
            <div class="receipt-total">
                <span>Total Amount Due:</span>
                <span>₱{{ number_format($booking->total_price, 2) }}</span>
            </div>
            <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #999;">
                Payment Method: <strong>Cash</strong>
            </div>
        </div>

        <div class="info-box">
            <div class="info-text">📍 <strong>Please arrive 10 minutes early</strong> to complete your check-in.</div>
            <div class="info-text">💰 <strong>Payment Due:</strong> At the time of service (Cash)</div>
            <div class="info-text">🛑 <strong>Cancellation Policy:</strong> Please notify us 24 hours in advance if you need to reschedule.</div>
        </div>

        <div class="section-title">Contact Information</div>
        <p class="text">
            <strong>Phone:</strong> {{ $booking->phone }}<br>
            <strong>Email:</strong> {{ $booking->email }}
        </p>

        <div class="footer">
            <p>If you have any questions or need to reschedule, please contact BEZ Hair Studio</p>
            <p>© {{ date('Y') }} BEZ Hair Studio</p>
        </div>
    </div>
</body>
</html>
