<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_can_login_with_seeded_credentials(): void
    {
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\AdminUserSeeder']);

        $response = $this->post('/admin/login', [
            'email' => 'bezcutsfades@gmail.com',
            'password' => '#cuts&fades2026',
        ]);

        $response->assertRedirect('/admin/dashboard');
        $this->assertAuthenticated();
        $this->assertSame('admin', auth()->user()->role);
        $this->assertSame('bezcutsfades@gmail.com', auth()->user()->email);
    }
}
