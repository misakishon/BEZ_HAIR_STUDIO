<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TimeSlotController extends Controller
{
    private function isSlotExpired(string $slotDate, string $slotTime): bool
    {
        $timezone = config('app.timezone', 'Asia/Manila');
        $slotDateTime = \DateTimeImmutable::createFromFormat(
            'Y-m-d H:i',
            $slotDate . ' ' . $slotTime,
            new \DateTimeZone($timezone)
        );

        if (!$slotDateTime) {
            return false;
        }

        $now = new \DateTimeImmutable('now', new \DateTimeZone($timezone));

        return $slotDateTime < $now;
    }

    // In your TimeSlotController or a seeder
public function generateDefaultSlots($date, $barberId = null)
{
    $allSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00'
    ];
    
    if (is_null($barberId)) {
        $barberIds = DB::table('barbers')->pluck('id')->toArray();
        foreach ($barberIds as $bId) {
            foreach ($allSlots as $slot) {
                DB::table('time_slots')->insert([
                    'barber_id' => $bId,
                    'slot_date' => $date,
                    'slot_time' => $slot,
                    'is_available' => true,
                    'max_bookings' => 1,
                    'current_bookings' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    } else {
        foreach ($allSlots as $slot) {
            DB::table('time_slots')->insert([
                'barber_id' => $barberId,
                'slot_date' => $date,
                'slot_time' => $slot,
                'is_available' => true,
                'max_bookings' => 1,
                'current_bookings' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
    public function index(Request $request)
    {
        $date = $request->get('date');
        $barberId = $request->get('barber_id', 0);

        $query = DB::table('time_slots');

        if ($date) {
            $query->where('slot_date', $date);
        }

        if ($barberId && $barberId != 0) {
            $query->where('barber_id', $barberId);
        }

        $timeSlots = $query->orderBy('slot_time')->get()->map(function ($slot) {
            $slot->slot_time = substr($slot->slot_time, 0, 5);

            if ($slot->is_available && $this->isSlotExpired($slot->slot_date, $slot->slot_time)) {
                DB::table('time_slots')
                    ->where('id', $slot->id)
                    ->update([
                        'is_available' => false,
                        'updated_at' => now(),
                    ]);

                $slot->is_available = false;
            }

            return $slot;
        });

        // Also fetch booked times for the date so admin can see appointments
        $bookedTimes = [];
        if ($date) {
            $bookedQuery = DB::table('bookings')
                ->where('booking_date', $date)
                ->where('status', '!=', 'cancelled');

            if ($barberId && $barberId != 0) {
                $bookedQuery->where('barber_id', $barberId);
            }

            $bookedTimes = $bookedQuery->pluck('booking_time')
                ->map(function ($t) {
                    return is_string($t) ? substr($t, 0, 5) : null;
                })
                ->filter()
                ->unique()
                ->values()
                ->toArray();
        }

        return response()->json([
            'success'    => true,
            'time_slots' => $timeSlots,
            'booked_times' => $bookedTimes,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'date' => 'required|date_format:Y-m-d',
                'time' => 'required|date_format:H:i',
                'barber_id' => 'nullable|integer',
                'is_available' => 'nullable|boolean',
            ]);

            // If no barber_id provided, create a blocked slot for every barber
            if (is_null($request->barber_id)) {
                $barberIds = DB::table('barbers')->pluck('id')->toArray();
                $inserted = 0;
                DB::beginTransaction();
                try {
                    foreach ($barberIds as $bId) {
                        $exists = DB::table('time_slots')
                            ->where('slot_date', $request->date)
                            ->where('slot_time', $request->time)
                            ->where('barber_id', $bId)
                            ->exists();

                        if ($exists) {
                            continue;
                        }

                        DB::table('time_slots')->insert([
                            'barber_id' => $bId,
                            'slot_date' => $request->date,
                            'slot_time' => $request->time,
                            'is_available' => $request->has('is_available') ? (bool) $request->is_available : true,
                            'max_bookings' => 1,
                            'current_bookings' => 0,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $inserted++;
                    }
                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Blocked time created for ' . $inserted . ' barber(s).',
                    'inserted' => $inserted,
                ]);
            }

            // Single barber case
            $exists = DB::table('time_slots')
                ->where('slot_date', $request->date)
                ->where('slot_time', $request->time)
                ->where('barber_id', $request->barber_id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time slot already exists for this barber/date/time.',
                ], 409);
            }

            $id = DB::table('time_slots')->insertGetId([
                'barber_id' => $request->barber_id,
                'slot_date' => $request->date,
                'slot_time' => $request->time,
                'is_available' => $request->has('is_available') ? (bool) $request->is_available : true,
                'max_bookings' => 1,
                'current_bookings' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Time slot added successfully',
                'id' => $id,
            ]);
        } catch (\Exception $e) {
            Log::error('TimeSlot store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add time slot: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $slot = DB::table('time_slots')->where('id', $id)->first();

            if (!$slot) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time slot not found.',
                ], 404);
            }

            if ($this->isSlotExpired($slot->slot_date, substr($slot->slot_time, 0, 5))) {
                DB::table('time_slots')
                    ->where('id', $id)
                    ->update([
                        'is_available' => false,
                        'updated_at' => now(),
                    ]);

                return response()->json([
                    'success' => false,
                    'message' => 'This time slot has already expired and is locked.',
                ], 409);
            }

            $newStatus = $slot->is_available ? 0 : 1;

            DB::table('time_slots')
                ->where('id', $id)
                ->update([
                    'is_available' => $newStatus,
                    'updated_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Time slot status updated successfully',
                'new_status' => $newStatus,
            ]);
        } catch (\Exception $e) {
            Log::error('TimeSlot toggle error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update time slot: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $deleted = DB::table('time_slots')->where('id', $id)->delete();

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time slot not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Time slot deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('TimeSlot delete error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete time slot: ' . $e->getMessage(),
            ], 500);
        }
    }
}