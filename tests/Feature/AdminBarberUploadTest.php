<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminBarberUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_profile_image_and_qr_code_for_existing_barber(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

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

        $profileImage = UploadedFile::fake()->image('profile.png', 300, 300);
        $qrCode = UploadedFile::fake()->image('qr.png', 300, 300);

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
                'profile_image' => $profileImage,
                'gcash_qr_code' => $qrCode,
            ]);

        $response->assertRedirect('/admin/barbers');

        $barber = DB::table('barbers')->where('id', $barberId)->first();

        $this->assertNotNull($barber->profile_image);
        $this->assertStringContainsString('/uploads/barbers/', $barber->profile_image);
        $this->assertNotNull($barber->gcash_qr_code);
        $this->assertStringContainsString('/uploads/qrcode/', $barber->gcash_qr_code);
        $this->assertFileExists(public_path($barber->profile_image));
        $this->assertFileExists(public_path($barber->gcash_qr_code));
    }
}
