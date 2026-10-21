<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpCode extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;
    public $purpose;

    public function __construct(string $otp, string $purpose = 'booking')
    {
        $this->otp = $otp;
        $this->purpose = $purpose;
    }

    public function build()
    {
        $fromAddress = config('mail.from.address');
        $fromName = config('mail.from.name');

        $isPasswordReset = $this->purpose === 'password_reset';
        $subject = $isPasswordReset
            ? 'BEZ Hair Studio - Admin Password Reset Code'
            : 'BEZ Hair Studio - OTP Verification Code';

        $subtitle = $isPasswordReset
            ? 'Enter this verification code to reset your admin password.'
            : 'Enter this code to verify your email address for booking confirmation.';

        return $this->from($fromAddress, $fromName)
                    ->replyTo($fromAddress, $fromName)
                    ->subject($subject)
                    ->view('emails.bookings.otp')
                    ->text('emails.bookings.otp_plain')
                    ->with([
                        'otp' => $this->otp,
                        'isPasswordReset' => $isPasswordReset,
                        'subtitle' => $subtitle,
                    ]);
    }
}
