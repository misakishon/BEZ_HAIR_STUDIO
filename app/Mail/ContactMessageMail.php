<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function build(): self
    {
        $subject = 'New Contact Message: ' . ($this->data['subject'] ?? 'General Inquiry');

        return $this->subject($subject)
            ->replyTo($this->data['email'] ?? config('mail.from.address'))
            ->view('emails.contact-message')
            ->with([
                'data' => $this->data,
            ]);
    }
}
