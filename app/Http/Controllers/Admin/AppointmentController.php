<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ServiceTicket;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $statusFilter = $request->get('status', 'all');
        $dateFilter = $request->get('date', 'today');
        
        $query = DB::table('bookings as b')
            ->leftJoin('users as u', 'b.user_id', '=', 'u.id')
            ->leftJoin('barbers as br', 'b.barber_id', '=', 'br.id')
            ->leftJoin('hairstyles as h', 'b.hairstyle_id', '=', 'h.id')
            ->select(
                'b.*',
                'b.booking_date as appointment_date',
                'b.booking_time as appointment_time',
                'b.receipt_image',
                'b.confirmation_number',
                'b.service_ticket_confirmation_number',
                'u.first_name',
                'u.last_name',
                'u.email as user_email',
                'b.full_name as booking_full_name',
                'b.email as booking_email',
                'br.full_name as barber_name',
                'h.name as hairstyle_name'
            );
        
        if ($statusFilter !== 'all') {
            $query->where('b.status', $statusFilter);
        }
        
        if ($dateFilter === 'today') {
            $query->whereDate('b.booking_date', now());
        } elseif ($dateFilter === 'upcoming') {
            $query->whereDate('b.booking_date', '>=', now());
        } elseif ($dateFilter === 'past') {
            $query->whereDate('b.booking_date', '<', now());
        }
        
        $appointments = $query->orderBy('b.booking_date', 'desc')
            ->orderBy('b.booking_time', 'desc')
            ->get();
        
        $appointments = $appointments->map(function ($appointment) {
            $clientName = $appointment->booking_full_name 
                ?? $appointment->full_name 
                ?? trim(($appointment->first_name ?? '') . ' ' . ($appointment->last_name ?? '')) 
                ?? 'N/A';
            
            $clientEmail = $appointment->booking_email 
                ?? $appointment->user_email 
                ?? $appointment->email 
                ?? 'N/A';
            
            // Use stored confirmation number or generate one
            $confirmationNumber = $appointment->confirmation_number;
            if (!$confirmationNumber) {
                // If no stored confirmation, generate one (for existing bookings)
                $confirmationNumber = 'BZ-' . strtoupper(Str::random(6));
            }
            
            return [
                'id' => $appointment->id,
                'client_name' => $clientName,
                'email' => $clientEmail,
                'barber_name' => $appointment->barber_name ?? 'N/A',
                'hairstyle_name' => $appointment->hairstyle_name ?? 'N/A',
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'status' => $appointment->status ?? 'pending',
                'payment_method' => $appointment->payment_method ?? 'cash',
                'payment_status' => $appointment->payment_status ?? 'pending',
                'payment_source_id' => $appointment->payment_source_id ?? null,
                'total_price' => $appointment->total_price ?? 0,
                'receipt_image' => $appointment->receipt_image,
                'full_name' => $appointment->full_name,
                'booking_full_name' => $appointment->booking_full_name,
                'notes' => $appointment->notes,
                'phone' => $appointment->phone,
                'created_at' => $appointment->created_at,
                'confirmation_number' => $confirmationNumber,
                'service_ticket_confirmation_number' => $appointment->service_ticket_confirmation_number,
            ];
        });
        
        return Inertia::render('admin/Appointments', [
            'appointments' => $appointments,
            'statusFilter' => $statusFilter,
            'dateFilter' => $dateFilter,
        ]);
    }
    
    public function confirmPayment(Request $request)
    {
        try {
            \Log::info('=== CONFIRM PAYMENT STARTED ===');
            
            $validated = $request->validate([
                'appointment_id' => 'required|integer|exists:bookings,id',
            ]);
            
            $bookingId = $validated['appointment_id'];
            
            // Get booking with all related data
            $bookingData = DB::table('bookings as b')
                ->leftJoin('barbers as br', 'b.barber_id', '=', 'br.id')
                ->leftJoin('hairstyles as h', 'b.hairstyle_id', '=', 'h.id')
                ->select(
                    'b.id',
                    'b.barber_id',
                    'b.hairstyle_id',
                    'b.booking_date',
                    'b.booking_time',
                    'b.full_name',
                    'b.email',
                    'b.phone',
                    'b.payment_method',
                    'b.total_price',
                    'b.status',
                    'b.notes',
                    'br.full_name as barber_name',
                    'br.specialty as barber_specialty',
                    'h.name as hairstyle_name'
                )
                ->where('b.id', $bookingId)
                ->first();
            
            if (!$bookingData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found'
                ], 404);
            }

            if (empty($bookingData->email)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No email address found for this booking'
                ], 400);
            }

            // Generate SEPARATE service ticket confirmation number (different from booking confirmation)
            $serviceTicketConfirmationNumber = 'ST-' . strtoupper(Str::random(6));

            // Update booking status and store service ticket confirmation number
            $updated = DB::table('bookings')
                ->where('id', $bookingId)
                ->update([
                    'status' => 'confirmed',
                    'payment_status' => 'paid',
                    'service_ticket_confirmation_number' => $serviceTicketConfirmationNumber,
                    'updated_at' => now(),
                ]);
            
            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update booking status'
                ], 400);
            }

            // Create objects for email
            $booking = (object) [
                'id' => $bookingData->id,
                'booking_date' => $bookingData->booking_date,
                'booking_time' => $bookingData->booking_time,
                'full_name' => $bookingData->full_name,
                'email' => $bookingData->email,
                'phone' => $bookingData->phone,
                'total_price' => $bookingData->total_price,
                'status' => 'confirmed',
                'notes' => $bookingData->notes ?? null,
                'service_ticket_confirmation_number' => $serviceTicketConfirmationNumber,
            ];

            $barber = (object) [
                'id' => $bookingData->barber_id,
                'full_name' => $bookingData->barber_name ?? 'BEZ Hair Studio Barber',
                'specialty' => $bookingData->barber_specialty ?? null,
            ];

            $hairstyle = (object) [
                'id' => $bookingData->hairstyle_id,
                'name' => $bookingData->hairstyle_name ?? 'Haircut Service',
            ];

            \Log::info('Sending service ticket with confirmation: ' . $serviceTicketConfirmationNumber);

            // Send the email
            Mail::to($booking->email)->send(new ServiceTicket($booking, $barber, $hairstyle));
            
            \Log::info('Service ticket sent successfully');

            return response()->json([
                'success' => true,
                'message' => 'Payment confirmed and service ticket sent to ' . $booking->email . '!',
                'service_ticket_confirmation_number' => $serviceTicketConfirmationNumber,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Payment confirmation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function changeAppointment(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'barber_id' => 'required|integer|exists:barbers,id',
                'booking_date' => 'required|date_format:Y-m-d',
                'booking_time' => 'required',
            ]);

            $booking = DB::table('bookings')->where('id', $id)->first();
            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found',
                ], 404);
            }

            $normalizedTime = substr($validated['booking_time'], 0, 5);
            $newDate = $validated['booking_date'];
            $newBarberId = $validated['barber_id'];

            $timeConflict = DB::table('bookings')
                ->where('booking_date', $newDate)
                ->where('booking_time', 'like', $normalizedTime . '%')
                ->where('barber_id', $newBarberId)
                ->where('status', '!=', 'cancelled')
                ->where('id', '!=', $id)
                ->exists();

            if ($timeConflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'That barber is already booked for the selected date and time.',
                ], 409);
            }

            $slotBlocked = DB::table('time_slots')
                ->where('slot_date', $newDate)
                ->where('slot_time', 'like', $normalizedTime . '%')
                ->where('barber_id', $newBarberId)
                ->where('is_available', 0)
                ->exists();

            if ($slotBlocked) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected time is blocked for that barber.',
                ], 409);
            }

            $updated = DB::table('bookings')
                ->where('id', $id)
                ->update([
                    'barber_id' => $newBarberId,
                    'booking_date' => $newDate,
                    'booking_time' => $normalizedTime,
                    'updated_at' => now(),
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Appointment updated successfully.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment',
            ], 400);
        } catch (\Exception $e) {
            \Log::error('Change appointment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function cancelAppointment(Request $request)
    {
        try {
            $validated = $request->validate([
                'appointment_id' => 'required|integer|exists:bookings,id',
            ]);

            $updated = DB::table('bookings')
                ->where('id', $validated['appointment_id'])
                ->update([
                    'status' => 'cancelled',
                    'updated_at' => now(),
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Appointment cancelled successfully',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel appointment',
            ], 400);
        } catch (\Exception $e) {
            \Log::error('Cancel appointment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }
}