<?php

namespace App\Services;

use App\Mail\OtpCode;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class OtpService
{
    /**
     * How long the OTP remains valid (in seconds).
     */
    public const OTP_EXPIRATION_SECONDS = 300; // 5 minutes

    /**
     * Maximum failed verification attempts before the OTP is invalidated.
     */
    public const MAX_VERIFY_ATTEMPTS = 5;

    /**
     * Cooldown period between resend requests (in seconds).
     */
    public const RESEND_COOLDOWN_SECONDS = 60;

    /**
     * Generate and dispatch a 6-digit OTP code to the given email address.
     *
     * @param string $email
     * @param bool $enforceCooldown Whether to block requests within the 60-second cooldown
     * @param string $purpose Purpose of OTP ('booking' or 'password_reset')
     * @return array{success: bool, message: string, status: int}
     */
    public function sendOtp(string $email, bool $enforceCooldown = false, string $purpose = 'booking'): array
    {
        $email = trim(strtolower($email));

        if ($enforceCooldown && Cache::has('otp_cooldown_' . $email)) {
            return [
                'success' => false,
                'message' => 'Please wait before requesting another verification code.',
                'status' => 429,
            ];
        }

        // Generate cryptographically secure 6-digit code
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP and initialize attempt tracker in cache
        Cache::put('otp_' . $email, $otp, self::OTP_EXPIRATION_SECONDS);
        Cache::forget('otp_attempts_' . $email);
        Cache::put('otp_cooldown_' . $email, true, self::RESEND_COOLDOWN_SECONDS);

        try {
            Mail::to($email)->send(new OtpCode($otp, $purpose));
            Log::info("OTP successfully sent to: {$email} (purpose: {$purpose})");

            return [
                'success' => true,
                'message' => 'OTP sent successfully',
                'status' => 200,
            ];
        } catch (Throwable $e) {
            Log::error("Failed to send OTP to {$email}: " . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Failed to send OTP email. Please verify your email address or try again later.',
                'status' => 500,
            ];
        }
    }

    /**
     * Verify the user-provided OTP against the cached value.
     * Enforces attempt limits and constant-time string comparison.
     *
     * @param string $email
     * @param string $otp
     * @return array{success: bool, message: string, status: int}
     */
    public function verifyOtp(string $email, string $otp): array
    {
        $email = trim(strtolower($email));
        $otp = trim($otp);

        if (strlen($otp) !== 6 || !ctype_digit($otp)) {
            return [
                'success' => false,
                'message' => 'The OTP must be a 6-digit numeric code.',
                'status' => 422,
            ];
        }

        $attempts = (int) Cache::get('otp_attempts_' . $email, 0);

        if ($attempts >= self::MAX_VERIFY_ATTEMPTS) {
            Cache::forget('otp_' . $email);
            return [
                'success' => false,
                'message' => 'Too many failed attempts. This code has been invalidated. Please request a new one.',
                'status' => 429,
            ];
        }

        $cachedOtp = Cache::get('otp_' . $email);

        if (!$cachedOtp) {
            return [
                'success' => false,
                'message' => 'OTP expired or not found. Please request a new code.',
                'status' => 400,
            ];
        }

        // Timing-attack safe comparison
        if (!hash_equals((string) $cachedOtp, (string) $otp)) {
            $attempts++;
            Cache::put('otp_attempts_' . $email, $attempts, self::OTP_EXPIRATION_SECONDS);

            $remaining = self::MAX_VERIFY_ATTEMPTS - $attempts;

            if ($remaining <= 0) {
                Cache::forget('otp_' . $email);
                return [
                    'success' => false,
                    'message' => 'Too many failed attempts. This code has been invalidated. Please request a new one.',
                    'status' => 429,
                ];
            }

            return [
                'success' => false,
                'message' => "Invalid OTP. You have {$remaining} attempt(s) remaining.",
                'status' => 400,
            ];
        }

        // Clean up cache upon successful verification
        Cache::forget('otp_' . $email);
        Cache::forget('otp_attempts_' . $email);
        Cache::forget('otp_cooldown_' . $email);

        return [
            'success' => true,
            'message' => 'OTP verified successfully',
            'status' => 200,
        ];
    }

    /**
     * Clear any active OTP for an email address.
     *
     * @param string $email
     * @return void
     */
    public function clear(string $email): void
    {
        $email = trim(strtolower($email));
        Cache::forget('otp_' . $email);
        Cache::forget('otp_attempts_' . $email);
        Cache::forget('otp_cooldown_' . $email);
    }
}
