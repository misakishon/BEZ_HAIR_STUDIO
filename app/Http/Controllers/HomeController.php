<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index()
    {
        // Fetch barbers
        $barbers = DB::table('barbers')
            ->where('is_available', 1)
            ->orderBy('rating', 'desc')
            ->get()
            ->map(function ($barber) {
                $barber->rating = (float) $barber->rating;
                if ($barber->rating <= 0) {
                    $barber->rating = 4.9;
                }
                $barber->total_reviews = (int) $barber->total_reviews;
                $barber->introduction = $barber->introduction ?? $barber->bio;
                $barber->profile_image = $this->normalizeBarberImage($barber->profile_image);
                return $barber;
            });
        
        // Fetch popular hairstyles
        $popularHairstyles = DB::table('hairstyles')
            ->leftJoin('bookings', function ($join) {
                $join->on('hairstyles.id', '=', 'bookings.hairstyle_id')
                     ->where('bookings.status', '!=', 'cancelled');
            })
            ->where('hairstyles.is_active', 1)
            ->select(
                'hairstyles.id',
                'hairstyles.name',
                'hairstyles.price',
                'hairstyles.duration_minutes',
                'hairstyles.image_path',
                DB::raw('COUNT(bookings.id) as booking_count'),
            )
            ->groupBy(
                'hairstyles.id',
                'hairstyles.name',
                'hairstyles.price',
                'hairstyles.duration_minutes',
                'hairstyles.image_path',
            )
            ->orderByDesc('booking_count')
            ->orderByDesc('hairstyles.created_at')
            ->limit(5)
            ->get()
            ->map(function ($hairstyle) {
                // Cast price to float
                $hairstyle->price = (float) $hairstyle->price;
                $hairstyle->duration_minutes = (int) $hairstyle->duration_minutes;
                $hairstyle->booking_count = (int) ($hairstyle->booking_count ?? 0);

                // Normalize image path so frontend can reliably resolve it.
                $img = $hairstyle->image_path ?? null;
                if (! $img || trim($img) === '') {
                    $hairstyle->image_path = '/assets/default.jpg';
                } else {
                    $lower = strtolower(trim($img));
                    if (
                        $lower === 'default.jpg' ||
                        $lower === 'default.jpeg' ||
                        $lower === 'default.png' ||
                        str_ends_with($lower, '/default.jpg') ||
                        str_ends_with($lower, '/default.jpeg') ||
                        str_ends_with($lower, '/default.png')
                    ) {
                        $hairstyle->image_path = '/assets/default.jpg';
                    } elseif (preg_match('#^(https?:)?//#i', $img) || str_starts_with($img, '/uploads/') || str_starts_with($img, '/storage/')) {
                        // leave as-is, but append file mtime for uploads to bust cache when file changes
                        $path = $img;
                        if (str_starts_with($img, '/uploads/')) {
                            $full = public_path(ltrim($img, '/'));
                            if (file_exists($full)) {
                                $path = $img . '?v=' . filemtime($full);
                            }
                        }
                        $hairstyle->image_path = $path;
                    } else {
                        // treat it as a bare filename and prepend uploads folder
                        $hairstyle->image_path = '/uploads/hairstyle/' . ltrim($img, '/');
                    }
                }

                return $hairstyle;
            });

        return Inertia::render('Home', [
            'popularHairstyles' => $popularHairstyles,
            'barbers' => $barbers,
        ]);
    }

    public function getBarbers()
    {
        $userId = auth()->id();
        $ratedBarberIds = [];

        if ($userId) {
            $ratedBarberIds = DB::table('barber_ratings')
                ->where('user_id', $userId)
                ->pluck('barber_id')
                ->toArray();
        }

        $barbers = DB::table('barbers')
            ->where('is_available', 1)
            ->orderBy('rating', 'desc')
            ->get()
            ->map(function ($barber) use ($ratedBarberIds) {
                $barber->rating = (float) $barber->rating;
                if ($barber->rating <= 0) {
                    $barber->rating = 4.9;
                }
                $barber->total_reviews = (int) $barber->total_reviews;
                $barber->introduction = $barber->introduction ?? $barber->bio;
                $barber->profile_image = $this->normalizeBarberImage($barber->profile_image);
                $barber->has_rated = in_array($barber->id, $ratedBarberIds, true);
                return $barber;
            });

        return response()->json($barbers);
    }

    private function normalizeBarberImage(?string $imagePath): ?string
    {
        if (!$imagePath || trim($imagePath) === '') {
            return '/uploads/barbers/defaultBarber.jpg';
        }

        $imagePath = trim($imagePath);

        if (preg_match('#^(https?:)?//#i', $imagePath)) {
            return $imagePath;
        }

        if (str_starts_with($imagePath, '/uploads/')) {
            return $imagePath;
        }

        if (str_starts_with($imagePath, 'uploads/')) {
            return '/' . $imagePath;
        }

        return '/uploads/barbers/' . ltrim($imagePath, '/');
    }

    public function getTestimonials()
    {
        $reviews = DB::table('reviews as r')
            ->join('barbers as b', 'b.id', '=', 'r.barber_id')
            ->leftJoin('users as u', 'u.id', '=', 'r.user_id')
            ->select(
                'r.id',
                'r.rating',
                'r.comment',
                'r.created_at',
                'b.full_name as barber_name',
                DB::raw("COALESCE(NULLIF(TRIM(u.first_name || ' ' || u.last_name), ''), 'Guest') as reviewer_name"),
            )
            ->whereNotNull('r.comment')
            ->where('r.comment', '!=', '')
            ->orderByDesc('r.created_at')
            ->limit(6)
            ->get();

        return response()->json($reviews);
    }

    public function rateBarber(Request $request, $id)
    {
        if (! auth()->check()) {
            return response()->json([
                'message' => 'You must be logged in to rate a barber.',
            ], 401);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $userId = auth()->id();

        $existingRating = DB::table('barber_ratings')
            ->where('user_id', $userId)
            ->where('barber_id', $id)
            ->first();

        if ($existingRating) {
            return response()->json([
                'message' => 'You have already rated this barber.',
            ], 403);
        }

        $barber = DB::table('barbers')->where('id', $id)->first();

        if (! $barber) {
            return response()->json(['message' => 'Barber not found'], 404);
        }

        $ratingValue = (int) $request->input('rating');
        $comment = trim((string) $request->input('comment', ''));

        DB::transaction(function () use ($userId, $id, $ratingValue, $barber, $comment) {
            DB::table('barber_ratings')->insert([
                'user_id' => $userId,
                'barber_id' => $id,
                'rating' => $ratingValue,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $currentRating = (float) $barber->rating;
            $currentReviews = (int) $barber->total_reviews;

            $newTotalReviews = $currentReviews + 1;
            $newRating = $newTotalReviews > 0
                ? round((($currentRating * $currentReviews) + $ratingValue) / $newTotalReviews, 1)
                : $ratingValue;

            DB::table('barbers')
                ->where('id', $id)
                ->update([
                    'rating' => $newRating,
                    'total_reviews' => $newTotalReviews,
                ]);

            DB::table('reviews')->insert([
                'barber_id' => $id,
                'user_id' => $userId,
                'rating' => $ratingValue,
                'comment' => $comment !== '' ? $comment : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $updatedBarber = DB::table('barbers')->where('id', $id)->first();

        $review = DB::table('reviews')
            ->where('barber_id', $id)
            ->where('user_id', $userId)
            ->latest('created_at')
            ->first();

        return response()->json([
            'success' => true,
            'rating' => (float) $updatedBarber->rating,
            'total_reviews' => (int) $updatedBarber->total_reviews,
            'has_rated' => true,
            'review' => $review,
        ]);
    }
}