<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactFormTest extends TestCase
{
    public function test_contact_form_sends_email_to_configured_address(): void
    {
        Mail::fake();

        $response = $this->post('/contact', [
            'full_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+639171234567',
            'subject' => 'General Inquiry',
            'message' => 'Hello from the test suite.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);

        Mail::assertSent(function ($mail) {
            return $mail->hasTo(config('mail.from.address'));
        });
    }
}
