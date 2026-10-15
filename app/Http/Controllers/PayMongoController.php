<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PayMongoController extends Controller
{
    /**
     * Generate dynamic QR Ph Code via Payment Intent Workflow
     */
    public function generateQrPh(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'email'  => 'required|email',
                'name'   => 'required|string|max:255',
                'phone'  => 'required|string|max:20',
            ]);

            $secret = config('services.paymongo.secret_key') ?: env('PAYMONGO_SECRET_KEY');
            if (!$secret) {
                return response()->json(['success' => false, 'message' => 'PayMongo key missing.'], 500);
            }

            $amountPhp = (float) $request->input('amount');
            $amountCentavos = (int) round($amountPhp * 100);

            // 1. Create pending booking record first
            $bookingId = DB::table('bookings')->insertGetId([
                'user_id'           => auth()->id(),
                'barber_id'         => session('booking_barber_id') ?: null,
                'hairstyle_id'      => session('booking_hairstyle_id'),
                'booking_date'      => session('booking_date'),
                'booking_time'      => session('booking_time'),
                'payment_method'    => 'qrph',
                'total_price'       => $amountPhp,
                'full_name'         => $request->input('name'),
                'email'             => $request->input('email'),
                'phone'             => $request->input('phone'),
                'notes'             => session('booking_notes'),
                'payment_status'    => 'pending',
                'status'            => 'pending',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            // 2. Step A - Create Payment Intent
            $intentResponse = Http::withBasicAuth($secret, '')
                ->post('https://api.paymongo.com/v1/payment_intents', [
                    'data' => [
                        'attributes' => [
                            'amount' => $amountCentavos,
                            'payment_method_allowed' => ['qrph'],
                            'currency' => 'PHP',
                            'description' => "Booking #{$bookingId}",
                        ]
                    ]
                ]);

            if (!$intentResponse->successful()) {
                return response()->json(['success' => false, 'message' => 'Failed to create payment intent.'], 400);
            }

            $intentData = $intentResponse->json()['data'];
            $paymentIntentId = $intentData['id'];
            $clientKey = $intentData['attributes']['client_key'];

            // 3. Step B - Create QR Ph Payment Method
            $methodResponse = Http::withBasicAuth($secret, '')
                ->post('https://api.paymongo.com/v1/payment_methods', [
                    'data' => [
                        'attributes' => [
                            'type' => 'qrph'
                        ]
                    ]
                ]);

            if (!$methodResponse->successful()) {
                return response()->json(['success' => false, 'message' => 'Failed to create payment method.'], 400);
            }

            $paymentMethodId = $methodResponse->json()['data']['id'];

            // 4. Step C - Attach Payment Method to Payment Intent
            $attachResponse = Http::withBasicAuth($secret, '')
                ->post("https://api.paymongo.com/v1/payment_intents/{$paymentIntentId}/attach", [
                    'data' => [
                        'attributes' => [
                            'payment_method' => $paymentMethodId,
                            'client_key'     => $clientKey,
                        ]
                    ]
                ]);

            $attachData = $attachResponse->json()['data'];
            $qrImageUrl = $attachData['attributes']['next_action']['code']['image_url'] ?? null;

            // Update booking with payment_intent_id
            DB::table('bookings')
                ->where('id', $bookingId)
                ->update(['payment_source_id' => $paymentIntentId]);

            return response()->json([
                'success'           => true,
                'qr_image_url'      => $qrImageUrl,
                'payment_intent_id' => $paymentIntentId,
                'booking_id'        => $bookingId,
            ]);

        } catch (\Exception $e) {
            Log::error('QR Ph Generation Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Poll/Check if Payment Intent has succeeded
     */
    public function checkQrStatus($paymentIntentId)
    {
        $secret = config('services.paymongo.secret_key') ?: env('PAYMONGO_SECRET_KEY');

        try {
            $response = Http::withBasicAuth($secret, '')
                ->get("https://api.paymongo.com/v1/payment_intents/{$paymentIntentId}");

            if ($response->successful()) {
                $status = $response->json()['data']['attributes']['status'] ?? 'pending';

                if ($status === 'succeeded') {
                    DB::table('bookings')
                        ->where('payment_source_id', $paymentIntentId)
                        ->update([
                            'status'         => 'confirmed',
                            'payment_status' => 'paid',
                            'updated_at'     => now(),
                        ]);
                }

                return response()->json([
                    'success' => true,
                    'status'  => $status,
                    'is_paid' => ($status === 'succeeded'),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Check QR Status Error: ' . $e->getMessage());
        }

        return response()->json(['success' => false], 500);
    }
}