<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use App\Models\User;

class AdminBarberQrCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_gcash_qr_code_for_barber(): void
    {
        $user = User::factory()->create();

        $barberId = DB::table('barbers')->insertGetId([
            'full_name' => 'Test Barber',
            'specialty' => 'Cuts',
            'experience_years' => 3,
            'bio' => 'Test bio',
            'profile_image' => '',
            'is_available' => 1,
            'rating' => 0,
            'total_reviews' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $file = UploadedFile::fake()->image('gcash-qr.png', 300, 300);

        $response = $this->actingAs($user)
            ->post("/admin/barbers/{$barberId}", [
                'id' => $barberId,
                'action' => 'edit',
                'full_name' => 'Test Barber',
                'specialty' => 'Cuts',
                'experience_years' => 3,
                'bio' => 'Test bio',
                'introduction' => '',
                'certifications' => '',
                'is_available' => 1,
                'gcash_qr_code' => $file,
            ]);

        $response->assertRedirect('/admin/barbers');

        $barber = DB::table('barbers')->where('id', $barberId)->first();
        $this->assertNotNull($barber->gcash_qr_code);
        $this->assertStringContainsString('/uploads/qrcode/', $barber->gcash_qr_code);
    }
}
