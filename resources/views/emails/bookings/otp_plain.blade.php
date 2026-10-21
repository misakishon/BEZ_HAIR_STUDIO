{{ !empty($isPasswordReset) ? 'Admin Password Reset' : 'OTP Verification' }}

{{ $subtitle ?? 'Enter this code to verify your email address for booking confirmation.' }}

{{ $otp }}

This code will expire in 5 minutes.

If you didn't request this, please ignore this email.

© {{ date('Y') }} BEZ Hair Studio
