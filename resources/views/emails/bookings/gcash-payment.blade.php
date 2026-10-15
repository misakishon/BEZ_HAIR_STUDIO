<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GCash Payment Required</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; }
        .logo { font-size: 24px; font-weight: 800; color: #000; text-align: center; margin-bottom: 30px; }
        .logo span { color: #c9a84c; }
        .section-title { font-size: 18px; font-weight: 600; color: #000; margin-top: 25px; margin-bottom: 15px; }
        .details-box { background: #f9f9f9; border-left: 4px solid #c9a84c; padding: 15px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .detail-label { color: #666; font-weight: 500; }
        .detail-value { color: #000; font-weight: 600; }
        .payment-button { display: inline-block; background: #c9a84c; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
        .button-container { text-align: center; }
        .instructions { background: #fffbf0; border: 1px solid #e8dcc4; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .instructions ol { margin: 10px 0; padding-left: 20px; }
        .instructions li { margin: 8px 0; color: #555; }
        .text { color: #666; line-height: 1.6; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">BEZ<span>.</span></div>
        
        <h2 style="text-align: center; color: #000;">Payment Required</h2>
        <p class="text" style="text-align: center;">Thank you for booking with BEZ Hair Studio! Please complete your payment via GCash.</p>

        <div class="section-title">Booking Details</div>
        <div class="details-box">
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
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">₱{{ number_format($booking->total_price, 2) }}</span>
            </div>
        </div>

        <div class="section-title">Payment Instructions</div>
        <div class="instructions">
            <ol>
                <li>Click the payment button below or visit the payment link</li>
                <li>Send payment via GCash to the merchant account</li>
                <li>Take a screenshot of the payment receipt</li>
                <li>Submit the receipt screenshot using the link provided</li>
                <li>Your booking will be confirmed once payment is verified</li>
            </ol>
        </div>

        <div class="button-container">
            <a href="{{ $gcashLink ?? '#' }}" class="payment-button">Complete Payment via GCash</a>
        </div>

        <p class="text" style="text-align: center; margin-top: 20px; font-size: 14px; color: #999;">
            If you cannot click the button above, copy and paste this link in your browser:<br>
            <span style="word-break: break-all; color: #666;">{{ $gcashLink ?? '' }}</span>
        </p>

        <div class="footer">
            <p>If you have any questions, please contact us at BEZ Hair Studio</p>
            <p>© {{ date('Y') }} BEZ Hair Studio</p>
        </div>
    </div>
</body>
</html>
