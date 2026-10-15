<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BarberRatingReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_submit_a_rating_with_feedback(): void
    {
        $user = DB::table('users')->insertGetId([
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $barber = DB::table('barbers')->insertGetId([
            'user_id' => null,
            'full_name' => 'Sam Barber',
            'specialty' => 'Fade Specialist',
            'experience_years' => 8,
            'bio' => 'Experienced barber',
            'rating' => 0,
            'total_reviews' => 0,
            'is_available' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs(
            new \App\Models\User((array) DB::table('users')->find($user))
        );

        $response = $this->postJson("/api/barbers/{$barber}/rate", [
            'rating' => 5,
            'comment' => 'Loved the experience and the cut!',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('review.comment', 'Loved the experience and the cut!');

        $this->assertDatabaseHas('barber_ratings', [
            'user_id' => $user,
            'barber_id' => $barber,
            'rating' => 5,
        ]);

        $this->assertDatabaseHas('reviews', [
            'user_id' => $user,
            'barber_id' => $barber,
            'comment' => 'Loved the experience and the cut!',
        ]);
    }
}
