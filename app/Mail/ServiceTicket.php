<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class ServiceTicket extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $barber;
    public $hairstyle;
    public $confirmationNumber;

    public function __construct($booking, $barber = null, $hairstyle = null)
    {
        $this->booking = $booking;
        $this->barber = $barber;
        $this->hairstyle = $hairstyle;
        
        // Use service ticket confirmation number from booking (different from booking confirmation)
        if (isset($booking->service_ticket_confirmation_number) && !empty($booking->service_ticket_confirmation_number)) {
            $this->confirmationNumber = $booking->service_ticket_confirmation_number;
        } else {
            $this->confirmationNumber = 'ST-' . strtoupper(Str::random(6));
        }
    }

    public function build()
    {
        \Log::info('Building ServiceTicket email with service ticket confirmation: ' . $this->confirmationNumber, [
            'booking_id' => $this->booking->id ?? null,
            'email' => $this->booking->email ?? null,
        ]);

        return $this->subject('Your Service Ticket — BEZ Hair Studio')
                    ->view('emails.bookings.service-ticket')
                    ->with([
                        'booking' => $this->booking,
                        'barber' => $this->barber,
                        'hairstyle' => $this->hairstyle,
                        'confirmationNumber' => $this->confirmationNumber,
                        'status' => 'confirmed',
                    ]);
    }
}