<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; }
        .logo { font-size: 24px; font-weight: 800; color: #000; text-align: center; }
        .logo span { color: #c9a84c; }
        .otp-code { font-size: 36px; font-weight: 700; color: #c9a84c; text-align: center; letter-spacing: 8px; padding: 20px 0; }
        .text { color: #666; text-align: center; line-height: 1.6; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">BEZ<span>.</span></div>
        <h2 style="text-align: center;">OTP Verification</h2>
        <p class="text">Enter this code to verify your email address for booking confirmation.</p>
        <div class="otp-code">{{ $otp }}</div>
        <p class="text">This code will expire in 5 minutes.</p>
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            If you didn't request this, please ignore this email.
        </div>
        <div class="footer">© {{ date('Y') }} BEZ Hair Studio</div>
    </div>
</body>
</html>