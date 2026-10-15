<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Mail\BookingConfirmation;

class BookingController extends Controller
{
    public function getSlots(Request $request)
    {
        $date = $request->get('date');
        $barberId = $request->get('barber_id');

        if (!$date || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return response()->json(['success' => false, 'message' => 'Invalid date.'], 400);
        }

        $bookedQuery = DB::table('bookings')
            ->where('booking_date', $date)
            ->where('status', '!=', 'cancelled');

        if ($barberId && $barberId != 0) {
            $bookedQuery->where('barber_id', $barberId);
        }

        $bookedTimes = $bookedQuery->pluck('booking_time')
            ->map(fn ($time) => is_string($time) ? substr($time, 0, 5) : null)
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $unavailableQuery = DB::table('time_slots')
            ->where('slot_date', $date)
            ->where('is_available', 0);

        if ($barberId && $barberId != 0) {
            $unavailableQuery->where('barber_id', $barberId);
        }

        $unavailableTimes = $unavailableQuery->pluck('slot_time')
            ->map(fn ($time) => is_string($time) ? substr($time, 0, 5) : null)
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        return response()->json([
            'success' => true,
            'booked_times' => $bookedTimes,
            'unavailable_times' => $unavailableTimes,
            'disabled_times' => array_values(array_unique(array_merge($bookedTimes, $unavailableTimes))),
        ]);
    }

    /**
     * Step 1: Select Barber
     */
    public function step1()
    {
        $barbers = DB::table('barbers')
            ->where('is_available', 1)
            ->orderBy('rating', 'desc')
            ->orderBy('total_reviews', 'desc')
            ->get();

        return Inertia::render('BookingStep1', [
            'barbers' => $barbers
        ]);
    }

    /**
     * Step 2: Select Service / Hairstyle
     */
    public function step2(Request $request)
    {
        $barberId = $request->get('barber_id') ?? session('booking_barber_id');

        if (!$barberId) {
            return redirect('/booking/step-1');
        }

        session(['booking_barber_id' => $barberId]);

        $barber = DB::table('barbers')
            ->where('id', $barberId)
            ->where('is_available', 1)
            ->first();

        if (!$barber) {
            return redirect('/booking/step-1');
        }

        $hairstyles = DB::table('hairstyles')
            ->where('is_active', 1)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        $groupedHairstyles = [];
        foreach ($hairstyles as $style) {
            $category = $style->category ?: 'Other';
            if (!isset($groupedHairstyles[$category])) {
                $groupedHairstyles[$category] = [];
            }
            $groupedHairstyles[$category][] = $style;
        }

        return Inertia::render('BookingStep2', [
            'barber' => $barber,
            'barberId' => (int) $barberId,
            'hairstyles' => $hairstyles,
            'groupedHairstyles' => $groupedHairstyles,
        ]);
    }

    /**
     * Step 3: Date, Time & Customer Details
     */
    public function step3(Request $request)
    {
        // Handle GET request - store query params in session
        if ($request->isMethod('get')) {
            if ($request->has(['barber_id', 'date', 'time'])) {
                $hairstyleId = $request->input('hairstyle_id');
                $hairstyle = null;

                if ($hairstyleId) {
                    $hairstyle = DB::table('hairstyles')
                        ->where('id', (int) $hairstyleId)
                        ->first();
                }

                if (!$hairstyle) {
                    $hairstyle = session('booking_hairstyle');
                    if (!$hairstyle) {
                        $hairstyle = DB::table('hairstyles')
                            ->where('is_active', 1)
                            ->first();
                    }
                }

                session([
                    'booking_barber_id' => (int) $request->input('barber_id'),
                    'booking_hairstyle_id' => $hairstyle ? $hairstyle->id : null,
                    'booking_hairstyle' => $hairstyle,
                    'booking_date' => $request->input('date'),
                    'booking_time' => $request->input('time'),
                ]);

                return redirect('/booking/step-3');
            }

            if (!session('booking_barber_id') || !session('booking_date') || !session('booking_time')) {
                return redirect('/booking/step-1');
            }

            $barber = DB::table('barbers')
                ->where('id', session('booking_barber_id'))
                ->first();

            if (!$barber) {
                return redirect('/booking/step-1');
            }

            $hairstyleId = session('booking_hairstyle_id');
            $hairstyle = null;

            if ($hairstyleId) {
                // Refresh hairstyle from DB to ensure latest admin updates are shown
                $hairstyle = DB::table('hairstyles')
                    ->where('id', $hairstyleId)
                    ->first();

                if ($hairstyle) {
                    session(['booking_hairstyle' => $hairstyle]);
                }
            }

            if (!$hairstyle && session('booking_hairstyle')) {
                $hairstyle = session('booking_hairstyle');
            }

            if (!$hairstyle) {
                // Fallback to any active hairstyle only when nothing else is available
                $hairstyle = DB::table('hairstyles')
                    ->where('is_active', 1)
                    ->first();
                session(['booking_hairstyle' => $hairstyle]);
            }

            // If the barber has a default_price configured, prefer showing the
            // most-recent inactive hairstyle record. This is the admin-set
            // default-price style and should reflect edits to the 6th item.
            if ($barber && isset($barber->default_price) && $barber->default_price !== null) {
                $matching = DB::table('hairstyles')
                    ->where('price', (float) $barber->default_price)
                    ->where('is_active', 0)
                    ->orderBy('updated_at', 'desc')
                    ->first();

                if (!$matching) {
                    $matching = DB::table('hairstyles')
                        ->where('price', (float) $barber->default_price)
                        ->orderBy('updated_at', 'desc')
                        ->first();
                }

                if ($matching) {
                    $hairstyle = $matching;
                    session([
                        'booking_hairstyle' => $hairstyle,
                        'booking_hairstyle_id' => $matching->id,
                    ]);
                    $hairstyleId = $matching->id;
                }
            }

            // Determine a display price: prefer barber.default_price if set,
            // otherwise fall back to the hairstyle price.
            $displayPrice = 250;
            if ($barber && isset($barber->default_price) && $barber->default_price !== null) {
                $displayPrice = (float) $barber->default_price;
            } elseif ($hairstyle && isset($hairstyle->price)) {
                $displayPrice = (float) $hairstyle->price;
            }

            return Inertia::render('BookingStep3', [
                'barber' => $barber,
                'barberId' => (int) session('booking_barber_id'),
                'hairstyle' => $hairstyle,
                'hairstyleId' => $hairstyleId,
                'bookingDate' => session('booking_date', ''),
                'bookingTime' => session('booking_time', ''),
                'displayPrice' => $displayPrice,
            ]);
        }

        // Handle POST request - Save details and trigger OTP
        if ($request->isMethod('post')) {
            $request->validate([
                'barber_id' => 'required|integer',
                'hairstyle_id' => 'nullable|integer',
                'date' => 'required|date_format:Y-m-d',
                'time' => 'required|date_format:H:i',
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'notes' => 'nullable|string|max:1000',
            ]);

            $email = $request->input('email');
            $hairstyleId = $request->input('hairstyle_id');

            $hairstyle = null;
            if ($hairstyleId) {
                $hairstyle = DB::table('hairstyles')
                    ->where('id', (int) $hairstyleId)
                    ->first();
            }

            if (!$hairstyle) {
                $barber = DB::table('barbers')
                    ->where('id', session('booking_barber_id'))
                    ->first();

                if ($barber && isset($barber->default_price) && $barber->default_price !== null) {
                    $matching = DB::table('hairstyles')
                        ->where('price', (float) $barber->default_price)
                        ->where('is_active', 0)
                        ->orderBy('updated_at', 'desc')
                        ->first();

                    if (!$matching) {
                        $matching = DB::table('hairstyles')
                            ->where('price', (float) $barber->default_price)
                            ->orderBy('updated_at', 'desc')
                            ->first();
                    }

                    if ($matching) {
                        $hairstyle = $matching;
                    }
                }
            }

            if (!$hairstyle) {
                $hairstyle = DB::table('hairstyles')
                    ->where('is_active', 1)
                    ->first();
            }

            $resolvedHairstyleId = $hairstyle ? $hairstyle->id : null;

            session([
                'booking_barber_id' => (int) $request->input('barber_id'),
                'booking_hairstyle_id' => $resolvedHairstyleId,
                'booking_hairstyle' => $hairstyle,
                'booking_date' => $request->input('date'),
                'booking_time' => $request->input('time'),
                'booking_full_name' => $request->input('full_name'),
                'booking_email' => $email,
                'booking_phone' => $request->input('phone'),
                'booking_notes' => $request->input('notes'),
                'booking_otp_sent' => true,
            ]);

            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            Cache::put('otp_' . $email, $otp, 300);

            try {
                // Use a dedicated Mailable with plain-text alternative and explicit from/reply-to
                Mail::to($email)->send(new \App\Mail\OtpCode($otp));
                Log::info('OTP sent to: ' . $email);
            } catch (\Swift_TransportException $e) {
                // Common SMTP transport errors surfaced by SwiftMailer
                Log::error('OTP send transport error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send OTP due to mail transport error. Please check mail settings.'
                ], 500);
            } catch (\Exception $e) {
                Log::error('OTP send error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send OTP. Please try again.'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'OTP sent successfully',
            ]);
        }
    }

    /**
     * Step 4: OTP Verification & Payment Selection
     */
    public function step4(Request $request)
    {
        if ($request->isMethod('post')) {
            // Check if request is OTP verification
            if ($request->has('otp')) {
                $request->validate([
                    'otp' => 'required|string|size:6',
                ]);

                $email = session('booking_email');
                if (!$email) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Session expired. Please start over.'
                    ], 400);
                }

                $cachedOtp = Cache::get('otp_' . $email);
                $providedOtp = $request->input('otp');

                if (!$cachedOtp || $cachedOtp !== $providedOtp) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid OTP. Please try again.'
                    ], 400);
                }

                Cache::forget('otp_' . $email);
                session(['booking_otp_verified' => true]);

                return response()->json([
                    'success' => true,
                    'message' => 'OTP verified successfully',
                    'redirect' => route('booking.step4'),
                ]);
            }

            if (!session('booking_otp_verified')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please verify your email first.'
                ], 400);
            }

            $request->validate([
                'payment_method' => 'required|in:cash,gcash',
            ]);

            $paymentMethod = $request->input('payment_method');

            if ($paymentMethod === 'gcash') {
                return response()->json([
                    'success' => false,
                    'message' => 'Please use the "Pay with GCash" button to complete payment.',
                ], 400);
            }

            if ($paymentMethod !== 'cash') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid payment method selected. Use cash for studio payment or GCash for QR PH.',
                ], 400);
            }

            session(['booking_payment_method' => 'cash']);

            return $this->createBooking($request);
        }

        // GET request - Show payment view
        if (!session('booking_otp_verified')) {
            return redirect('/booking/step-3');
        }

        if (!session('booking_email')) {
            return redirect('/booking/step-1');
        }

        $barber = DB::table('barbers')
            ->where('id', session('booking_barber_id'))
            ->first();

        $hairstyle = null;
        $hairstyleId = session('booking_hairstyle_id');

        if ($hairstyleId) {
            // Always refresh hairstyle from DB to reflect the latest admin edits
            $hairstyle = DB::table('hairstyles')
                ->where('id', $hairstyleId)
                ->first();

            if ($hairstyle) {
                session(['booking_hairstyle' => $hairstyle]);
            } else {
                // If the selected hairstyle was removed or inactive, fall back to any active hairstyle
                $hairstyle = DB::table('hairstyles')
                    ->where('is_active', 1)
                    ->first();
                session(['booking_hairstyle' => $hairstyle]);
            }
        } elseif (session('booking_hairstyle')) {
            // No explicit hairstyle id in session, use the session copy
            $hairstyle = session('booking_hairstyle');
        }

        // If barber has a default_price, try to show the most-recent hairstyle
        // record that matches that price (including inactive ones) so the
        // admin-set 6th hairstyle is visible for display in the summary.
        if ($barber && isset($barber->default_price) && $barber->default_price !== null) {
            $matching = DB::table('hairstyles')
                ->where('price', (float) $barber->default_price)
                ->where('is_active', 0)
                ->orderBy('updated_at', 'desc')
                ->first();

            if (!$matching) {
                $matching = DB::table('hairstyles')
                    ->where('price', (float) $barber->default_price)
                    ->orderBy('updated_at', 'desc')
                    ->first();
            }

            if ($matching) {
                $hairstyle = $matching;
                session([
                    'booking_hairstyle' => $hairstyle,
                    'booking_hairstyle_id' => $matching->id,
                ]);
                $hairstyleId = $matching->id;
            }
        }

        $displayPrice = 250;
        if ($barber && isset($barber->default_price) && $barber->default_price !== null) {
            $displayPrice = (float) $barber->default_price;
        } elseif ($hairstyle && isset($hairstyle->price)) {
            $displayPrice = (float) $hairstyle->price;
        }

        return Inertia::render('BookingStep4', [
            'barber' => $barber,
            'hairstyle' => $hairstyle,
            'barberId' => (int) session('booking_barber_id'),
            'hairstyleId' => $hairstyleId,
            'bookingDate' => session('booking_date', ''),
            'bookingTime' => session('booking_time', ''),
            'paymentMethod' => session('booking_payment_method', 'cash'),
            'fullName' => session('booking_full_name', ''),
            'email' => session('booking_email', ''),
            'phone' => session('booking_phone', ''),
            'paymentError' => session('booking_payment_error', null),
            'displayPrice' => $displayPrice,
        ]);
    }

    /**
     * Helper for PayMongo Headers
     */
    private function paymongoHeaders(): array
    {
        $secretKey = config('services.paymongo.secret_key') ?: env('PAYMONGO_SECRET_KEY');

        if (!$secretKey) {
            throw new \RuntimeException('PayMongo secret key is not configured.');
        }

        return [
            'Authorization' => 'Basic ' . base64_encode($secretKey . ':'),
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
        ];
    }

    /**
     * Initiate PayMongo QR PH Payment
     */
    public function initiatePaymongoGcash(Request $request)
    {
        if (!session('booking_otp_verified')) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email first.',
            ], 400);
        }

        $hairstyle = session('booking_hairstyle');
        $bookingPrice = ($hairstyle && isset($hairstyle->price)) ? (float) $hairstyle->price : 250;
        $amountInCents = (int) round($bookingPrice * 100);

        if ($amountInCents < 100) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum payment amount is ₱1.00.',
            ], 400);
        }

        session(['booking_payment_method' => 'gcash']);

        $baseUrl = config('services.paymongo.base_url') ?: env('PAYMONGO_BASE_URL', 'https://api.paymongo.com/v1');

        try {
            // Create Payment Intent
            $intentResponse = Http::withHeaders($this->paymongoHeaders())
                ->post($baseUrl . '/payment_intents', [
                    'data' => [
                        'attributes' => [
                            'amount' => $amountInCents,
                            'currency' => 'PHP',
                            'payment_method_allowed' => ['qrph'],
                            'capture_type' => 'automatic',
                            'description' => 'BEZ Hair Studio Booking',
                            'metadata' => [
                                'booking_reference' => 'bez-' . now()->timestamp,
                            ],
                        ],
                    ],
                ]);

            if (!$intentResponse->successful()) {
                Log::error('PayMongo create intent error: ' . $intentResponse->body());
                return response()->json([
                    'success' => false,
                    'message' => 'Could not start payment. Please try again.',
                ], 500);
            }

            $intentId = $intentResponse->json('data.id');
            $clientKey = $intentResponse->json('data.attributes.client_key');

            // Create Payment Method
            $pmResponse = Http::withHeaders($this->paymongoHeaders())
                ->post($baseUrl . '/payment_methods', [
                    'data' => [
                        'attributes' => [
                            'type' => 'qrph',
                            'billing' => [
                                'name' => session('booking_full_name', $request->input('name', 'Customer')),
                                'email' => session('booking_email', $request->input('email', 'customer@example.com')),
                                'phone' => session('booking_phone', $request->input('phone', '')),
                            ],
                        ],
                    ],
                ]);

            if (!$pmResponse->successful()) {
                Log::error('PayMongo create payment method error: ' . $pmResponse->body());
                return response()->json([
                    'success' => false,
                    'message' => 'Could not start payment. Please try again.',
                ], 500);
            }

            $paymentMethodId = $pmResponse->json('data.id');

            // Attach Payment Method to Payment Intent
            $attachResponse = Http::withHeaders($this->paymongoHeaders())
                ->post($baseUrl . "/payment_intents/{$intentId}/attach", [
                    'data' => [
                        'attributes' => [
                            'payment_method' => $paymentMethodId,
                            'client_key' => $clientKey,
                        ],
                    ],
                ]);

            if (!$attachResponse->successful()) {
                Log::error('PayMongo attach error: ' . $attachResponse->body());
                return response()->json([
                    'success' => false,
                    'message' => 'Could not generate QR code. Please try again.',
                ], 500);
            }

            $qrImage = $attachResponse->json('data.attributes.next_action.code.image_url');

            if (!$qrImage) {
                Log::error('PayMongo attach succeeded but no QR image returned: ' . $attachResponse->body());
                return response()->json([
                    'success' => false,
                    'message' => 'QR PH is not available on this account yet.',
                ], 500);
            }

            session(['paymongo_payment_intent_id' => $intentId]);

            return response()->json([
                'success' => true,
                'qr_code' => $qrImage,
                'status' => $attachResponse->json('data.attributes.status'),
            ]);
        } catch (\Exception $e) {
            Log::error('PayMongo QR PH Exception: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Could not initiate payment. Please try again.',
            ], 500);
        }
    }

    /**
     * Initiate QR Ph Payment (Payment Intents API)
     */
    public function initiateQrPhPayment(Request $request)
    {
        if (!session('booking_otp_verified')) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email first.',
            ], 400);
        }

        if (!session('booking_barber_id') || !session('booking_date') || !session('booking_time')) {
            return response()->json([
                'success' => false,
                'message' => 'Booking session expired. Please start over.',
            ], 400);
        }

        $hairstyle = session('booking_hairstyle');
        $amountPesos = ($hairstyle && isset($hairstyle->price)) ? (float) $hairstyle->price : 250;
        $amountCentavos = (int) round($amountPesos * 100);

        if ($amountCentavos < 100) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum payment amount is ₱1.00.',
            ], 400);
        }

        session(['booking_payment_method' => 'gcash']);

        $baseUrl = config('services.paymongo.base_url') ?: env('PAYMONGO_BASE_URL', 'https://api.paymongo.com/v1');

        try {
            // 1. Create Payment Intent
            $intentResponse = Http::withHeaders($this->paymongoHeaders())
                ->post($baseUrl . '/payment_intents', [
                    'data' => [
                        'attributes' => [
                            'amount' => $amountCentavos,
                            'currency' => 'PHP',
                            'payment_method_allowed' => ['qrph'],
                            'capture_type' => 'automatic',
                            'description' => 'BEZ Hair Studio Booking',
                            'metadata' => [
                                'booking_reference' => 'bez-' . now()->timestamp,
                            ],
                        ],
                    ],
                ]);

            if (!$intentResponse->successful()) {
                Log::error('PayMongo create intent error: ' . $intentResponse->body());
                return response()->json([
                    'success' => false,
                    'message' => 'Could not start payment. Please try again.',
                ], 500);
            }

            $intentId = $intentResponse->json('data.id');
            $clientKey = $intentResponse->json('data.attributes.client_key');

            // 2. Create Payment Method
            $pmResponse = Http::withHeaders($this->paymongoHeaders())
                ->post($baseUrl . '/payment_methods', [
                    'data' => [
                        'attributes' => [
                            'type' => 'qrph',
                            'billing' => [
                                'name'  => session('booking_full_name'),
                                'email' => session('booking_email'),
                                'phone' => session('booking_phone'),
                            ],
                        ],
                    ],
                ]);

            if (!$pmResponse->successful()) {
                Log::error('PayMongo create payment method error: ' . $pmResponse->body());
                return response()->json([
                    'success' => false,
                    'message' => 'Could not start payment. Please try again.',
                ], 500);
            }

            $paymentMethodId = $pmResponse->json('data.id');

            // 3. Attach Intent & Method
            $attachResponse = Http::withHeaders($this->paymongoHeaders())
                ->post($baseUrl . "/payment_intents/{$intentId}/attach", [
                    'data' => [
                        'attributes' => [
                            'payment_method' => $paymentMethodId,
                            'client_key' => $clientKey,
                        ],
                    ],
                ]);

            if (!$attachResponse->successful()) {
                Log::error('PayMongo attach error: ' . $attachResponse->body());
                return response()->json([
                    'success' => false,
                    'message' => 'Could not generate QR code. Please try again.',
                ], 500);
            }

            $status = $attachResponse->json('data.attributes.status');
            $qrImage = $attachResponse->json('data.attributes.next_action.code.image_url');

            if (!$qrImage) {
                Log::error('PayMongo attach succeeded but no QR image returned: ' . $attachResponse->body());
                return response()->json([
                    'success' => false,
                    'message' => 'QR Ph is not available on this account yet.',
                ], 500);
            }

            session(['paymongo_payment_intent_id' => $intentId]);

            return response()->json([
                'success' => true,
                'qr_code' => $qrImage,
                'status' => $status,
                'amount' => $amountPesos,
            ]);
        } catch (\Exception $e) {
            Log::error('PayMongo QR Ph exception: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong. Please try again.',
            ], 500);
        }
    }

    /**
     * Poll QR Ph Payment Status
     */
    public function checkQrPhStatus(Request $request)
    {
        $intentId = session('paymongo_payment_intent_id');

        if (!$intentId) {
            return response()->json([
                'success' => false,
                'message' => 'No active payment found.',
            ], 400);
        }

        $baseUrl = config('services.paymongo.base_url') ?: env('PAYMONGO_BASE_URL', 'https://api.paymongo.com/v1');

        try {
            $response = Http::withHeaders($this->paymongoHeaders())
                ->get($baseUrl . "/payment_intents/{$intentId}");
        } catch (\Exception $e) {
            Log::error('PayMongo status check exception: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Could not check payment status.',
            ], 500);
        }

        if (!$response->successful()) {
            Log::error('PayMongo status check error: ' . $response->body());
            return response()->json([
                'success' => false,
                'message' => 'Could not check payment status.',
            ], 500);
        }

        $status = $response->json('data.attributes.status');

        if ($status === 'succeeded') {
            session(['gcash_reference' => $intentId]);
            session()->forget('paymongo_payment_intent_id');

            $bookingId = $this->createBookingRecord($request);

            return response()->json([
                'success' => true,
                'paid' => true,
                'booking_id' => $bookingId,
                'redirect_url' => $this->getBookingSuccessUrl($bookingId),
            ]);
        }

        return response()->json([
            'success' => true,
            'paid' => false,
            'status' => $status,
        ]);
    }

    /**
     * Handle Cash Booking Redirection
     */
    private function createBooking(Request $request)
    {
        $bookingId = $this->createBookingRecord($request);

        if (!$bookingId) {
            return redirect('/booking/step-1')->with('error', 'We could not complete your booking. Please try again.');
        }

        return redirect($this->getBookingSuccessUrl($bookingId));
    }

    /**
     * Build encrypted booking success URL.
     */
    private function getBookingSuccessUrl(int $bookingId): string
    {
        return route('booking.success', ['token' => Crypt::encryptString((string) $bookingId)]);
    }

    /**
     * Save Booking to Database
     */
    private function createBookingRecord(Request $request)
    {
        $fullName = session('booking_full_name');
        $email = session('booking_email');
        $phone = session('booking_phone');
        $notes = session('booking_notes');
        $paymentMethod = session('booking_payment_method', 'cash');

        if (!$fullName || !$email || !$phone) {
            return null;
        }

        $barberId = session('booking_barber_id');
        $date = session('booking_date');
        $time = session('booking_time');

        if (!$barberId || !$date || !$time) {
            return null;
        }

        $totalPrice = 250;

        $hairstyleId = session('booking_hairstyle_id');
        $hairstyle = null;

        if ($hairstyleId) {
            $hairstyle = DB::table('hairstyles')
                ->where('id', $hairstyleId)
                ->first();
        }

        if (!$hairstyle) {
            $hairstyle = DB::table('hairstyles')
                ->where('is_active', 1)
                ->first();
        }

        if ($hairstyle) {
            $hairstyleId = $hairstyle->id;
            $totalPrice = isset($hairstyle->price) ? (float) $hairstyle->price : $totalPrice;
        } else {
            return null;
        }

        $confirmationNumber = 'BZ-' . strtoupper(Str::random(6));
        $paymentStatus = $paymentMethod === 'gcash' ? 'paid' : 'unpaid';

        $bookingData = [
            'barber_id' => $barberId,
            'hairstyle_id' => $hairstyleId,
            'booking_date' => $date,
            'booking_time' => $time,
            'payment_method' => $paymentMethod,
            'payment_source_id' => session('gcash_reference'),
            'payment_status' => $paymentStatus,
            'total_price' => $totalPrice,
            'full_name' => $fullName,
            'email' => $email,
            'phone' => $phone,
            'notes' => $notes,
            'confirmation_number' => $confirmationNumber,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        if (auth()->check()) {
            $bookingData['user_id'] = auth()->id();
        }

        $bookingId = DB::table('bookings')->insertGetId($bookingData);

        // Send booking confirmation email to the customer
        try {
            $booking = DB::table('bookings')
                ->where('id', $bookingId)
                ->first();

            if ($booking) {
                Mail::to($booking->email)->send(new BookingConfirmation($booking));
                Log::info('Booking confirmation email sent to: ' . $booking->email);
            }
        } catch (\Exception $e) {
            Log::error('Booking confirmation email failed: ' . $e->getMessage());
        }

        // Clear booking session state after insertion
        $request->session()->forget([
            'booking_barber_id',
            'booking_hairstyle_id',
            'booking_hairstyle',
            'booking_date',
            'booking_time',
            'booking_payment_method',
            'booking_full_name',
            'booking_email',
            'booking_phone',
            'booking_notes',
            'booking_otp_sent',
            'booking_otp_verified',
            'gcash_reference',
            'gcash_source_id',
            'paymongo_payment_intent_id',
        ]);

        return $bookingId;
    }

    /**
     * Render Booking Success Page
     */
    public function success(Request $request)
    {
        $token = $request->get('token');
        if (!$token) {
            return redirect('/booking/step-1');
        }

        try {
            $bookingId = Crypt::decryptString($token);
        } catch (\Exception $e) {
            return redirect('/booking/step-1');
        }

        if (!$bookingId || !is_numeric($bookingId)) {
            return redirect('/booking/step-1');
        }

        $booking = DB::table('bookings as b')
            ->leftJoin('barbers as br', 'b.barber_id', '=', 'br.id')
            ->leftJoin('hairstyles as h', 'b.hairstyle_id', '=', 'h.id')
            ->select(
                'b.*',
                'br.full_name as barber_name',
                'h.name as hairstyle_name'
            )
            ->where('b.id', $bookingId)
            ->first();

        if (!$booking) {
            return redirect('/booking/step-1');
        }

        return Inertia::render('BookingSuccess', [
            'booking' => $booking,
        ]);
    }

    /**
     * Standalone Send OTP
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = $request->input('email');
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put('otp_' . $email, $otp, 300);

        try {
            Mail::to($email)->send(new \App\Mail\OtpCode($otp));
            Log::info('OTP sent to: ' . $email);
            return response()->json(['success' => true, 'message' => 'OTP sent successfully']);
        } catch (\Swift_TransportException $e) {
            Log::error('OTP send transport error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to send OTP due to mail transport error. Please check mail settings.'], 500);
        } catch (\Exception $e) {
            Log::error('OTP send error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to send OTP'], 500);
        }
    }

    /**
     * Standalone Verify OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'otp' => 'required|string|size:6',
        ]);

        $email = $request->input('email');
        $otp = $request->input('otp');
        $cachedOtp = Cache::get('otp_' . $email);

        if (!$cachedOtp || $cachedOtp !== $otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP. Please try again.'
            ], 400);
        }

        Cache::forget('otp_' . $email);
        session(['booking_otp_verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully',
        ]);
    }
}