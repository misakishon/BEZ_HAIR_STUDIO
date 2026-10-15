<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $confirmationNumber;

    public function __construct($booking)
    {
        $this->booking = $booking;
        
        // Use stored confirmation number if exists, otherwise generate one
        if (isset($booking->confirmation_number) && !empty($booking->confirmation_number)) {
            $this->confirmationNumber = $booking->confirmation_number;
        } else {
            $this->confirmationNumber = 'BZ-' . strtoupper(Str::random(6));
        }
    }

    public function build()
    {
        return $this->subject('BEZ Hair Studio Appointment Confirmation')
                    ->view('emails.bookings.confirmation')
                    ->with([
                        'booking' => $this->booking,
                        'confirmationNumber' => $this->confirmationNumber,
                    ]);
    }
}