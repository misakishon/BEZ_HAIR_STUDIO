<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Get current month and previous month for comparison
        $currentMonth = now()->month;
        $currentYear = now()->year;
        $previousMonth = now()->subMonth()->month;
        $previousYear = now()->subMonth()->year;

        // ========== TOTAL REVENUE (Only CONFIRMED appointments) ==========
        $totalRevenue = DB::table('bookings')
            ->where('status', 'confirmed')
            ->sum('total_price');

        // ========== CURRENT MONTH REVENUE (Only CONFIRMED) ==========
        $currentMonthRevenue = DB::table('bookings')
            ->where('status', 'confirmed')
            ->whereMonth('booking_date', $currentMonth)
            ->whereYear('booking_date', $currentYear)
            ->sum('total_price');

        // ========== PREVIOUS MONTH REVENUE (Only CONFIRMED) ==========
        $previousMonthRevenue = DB::table('bookings')
            ->where('status', 'confirmed')
            ->whereMonth('booking_date', $previousMonth)
            ->whereYear('booking_date', $previousYear)
            ->sum('total_price');

        // ========== TOTAL BOOKINGS (Only CONFIRMED) ==========
        $totalBookings = DB::table('bookings')
            ->where('status', 'confirmed')
            ->count();

        // ========== CURRENT MONTH BOOKINGS (Only CONFIRMED) ==========
        $currentMonthBookings = DB::table('bookings')
            ->where('status', 'confirmed')
            ->whereMonth('booking_date', $currentMonth)
            ->whereYear('booking_date', $currentYear)
            ->count();

        // ========== PREVIOUS MONTH BOOKINGS (Only CONFIRMED) ==========
        $previousMonthBookings = DB::table('bookings')
            ->where('status', 'confirmed')
            ->whereMonth('booking_date', $previousMonth)
            ->whereYear('booking_date', $previousYear)
            ->count();

        // ========== TOTAL CUSTOMERS (Unique customers with confirmed bookings) ==========
        $totalCustomers = DB::table('bookings')
            ->where('status', 'confirmed')
            ->distinct('email')
            ->count('email');

        // ========== AVG PER VISIT (Only CONFIRMED) ==========
        $avgPerVisit = $totalBookings > 0 
            ? $totalRevenue / $totalBookings 
            : 0;

        // ========== REVENUE BY CATEGORY (Only CONFIRMED) ==========
        $revenueByCategory = DB::table('bookings')
            ->join('hairstyles', 'bookings.hairstyle_id', '=', 'hairstyles.id')
            ->where('bookings.status', 'confirmed')
            ->select('hairstyles.category', DB::raw('SUM(bookings.total_price) as total'))
            ->groupBy('hairstyles.category')
            ->pluck('total', 'category')
            ->toArray();

        // ========== BOOKINGS BY DAY OF WEEK (Only CONFIRMED) ==========
        $bookingsByDay = array_fill(0, 7, 0);
        $confirmedBookings = DB::table('bookings')
            ->where('status', 'confirmed')
            ->select('booking_date')
            ->get();

        foreach ($confirmedBookings as $booking) {
            if (empty($booking->booking_date)) {
                continue;
            }

            $dayIndex = now()->parse($booking->booking_date)->dayOfWeekIso - 1;
            $bookingsByDay[$dayIndex] = ($bookingsByDay[$dayIndex] ?? 0) + 1;
        }

        // ========== MONTHLY DATA (Only CONFIRMED) ==========
        $monthlyData = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthlyData[$m] = [
                'bookings' => DB::table('bookings')
                    ->where('status', 'confirmed')
                    ->whereMonth('booking_date', $m)
                    ->whereYear('booking_date', $currentYear)
                    ->count(),
                'revenue' => DB::table('bookings')
                    ->where('status', 'confirmed')
                    ->whereMonth('booking_date', $m)
                    ->whereYear('booking_date', $currentYear)
                    ->sum('total_price') ?? 0,
            ];
        }

        // ========== CALCULATE CHANGES ==========
        $revenueChange = $previousMonthRevenue > 0 
            ? round((($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100, 1)
            : ($currentMonthRevenue > 0 ? 100 : 0);

        $bookingsChange = $previousMonthBookings > 0 
            ? round((($currentMonthBookings - $previousMonthBookings) / $previousMonthBookings) * 100, 1)
            : ($currentMonthBookings > 0 ? 100 : 0);

        $customersChange = 0; // Calculate if needed

        $avgChange = $previousMonthRevenue > 0 && $previousMonthBookings > 0
            ? round((($currentMonthRevenue / max($currentMonthBookings, 1)) - ($previousMonthRevenue / max($previousMonthBookings, 1))) / ($previousMonthRevenue / max($previousMonthBookings, 1)) * 100, 1)
            : 0;

        // ========== TOP BARBERS (Only CONFIRMED) ==========
        $topBarbers = DB::table('bookings')
            ->join('barbers', 'bookings.barber_id', '=', 'barbers.id')
            ->where('bookings.status', 'confirmed')
            ->select('barbers.full_name', DB::raw('COUNT(bookings.id) as appointment_count'))
            ->groupBy('barbers.full_name')
            ->orderBy('appointment_count', 'desc')
            ->limit(4)
            ->get()
            ->toArray();

        // ========== RECENT APPOINTMENTS (Only CONFIRMED) ==========
        $recentAppointments = DB::table('bookings')
            ->leftJoin('barbers', 'bookings.barber_id', '=', 'barbers.id')
            ->leftJoin('hairstyles', 'bookings.hairstyle_id', '=', 'hairstyles.id')
            ->where('bookings.status', 'confirmed')
            ->select(
                'bookings.id',
                'bookings.full_name as booking_full_name',
                'bookings.email as booking_email',
                'bookings.booking_date as appointment_date',
                'bookings.booking_time as appointment_time',
                'bookings.total_price',
                'bookings.status',
                'barbers.full_name as barber_name',
                'hairstyles.name as hairstyle_name'
            )
            ->orderBy('bookings.booking_date', 'desc')
            ->orderBy('bookings.booking_time', 'desc')
            ->limit(10)
            ->get()
            ->toArray();

        // ========== LIVE ACTIVITY (Only CONFIRMED) ==========
        $liveActivity = DB::table('bookings')
            ->where('status', 'confirmed')
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                $timeAgo = $booking->updated_at ? now()->diffForHumans($booking->updated_at) : 'Just now';
                $message = "Confirmed by {$booking->full_name}";
                $status = 'confirmed';
                $color = '#10b981'; // Green
                
                return [
                    'message' => $message,
                    'timeAgo' => $timeAgo,
                    'color' => $color,
                    'status' => $status,
                ];
            })
            ->toArray();

        // ========== TOTAL BARBERS ==========
        $totalBarbers = DB::table('barbers')
            ->where('is_available', 1)
            ->count();

        return Inertia::render('admin/dashboard', [
            'totalBookings' => $totalBookings,
            'totalRevenue' => $totalRevenue,
            'totalCustomers' => $totalCustomers,
            'totalBarbers' => $totalBarbers,
            'topBarbers' => $topBarbers,
            'recentAppointments' => $recentAppointments,
            'monthlyData' => $monthlyData,
            'revenueByCategory' => $revenueByCategory,
            'bookingsByDay' => $bookingsByDay,
            'revenueChange' => $revenueChange,
            'bookingsChange' => $bookingsChange,
            'customersChange' => $customersChange,
            'avgChange' => $avgChange,
            'currentMonthRevenue' => $currentMonthRevenue,
            'avgPerVisit' => $avgPerVisit,
            'liveActivity' => $liveActivity,
        ]);
    }
}