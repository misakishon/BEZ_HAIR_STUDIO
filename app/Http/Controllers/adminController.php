<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

// Admin Routes - Direct closure routes (no controller needed)
Route::prefix('admin')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard', [
            'totalBookings' => 0,
            'totalRevenue' => 0,
            'totalCustomers' => 0,
            'totalBarbers' => 0,
            'topBarbers' => [],
            'recentAppointments' => [],
            'monthlyData' => [],
            'revenueByCategory' => [],
            'bookingsByDay' => [],
            'revenueChange' => 0,
            'bookingsChange' => 0,
            'customersChange' => 0,
            'avgChange' => 0,
            'currentMonthRevenue' => 0,
            'avgPerVisit' => 0,
        ]);
    });
    
    // Appointments - IMPORTANT: This needs to match your component path
    Route::get('/appointments', function () {
        // Fetch appointments from database
        $appointments = DB::table('appointments as a')
            ->leftJoin('users as u', 'a.user_id', '=', 'u.id')
            ->leftJoin('barbers as b', 'a.barber_id', '=', 'b.id')
            ->leftJoin('hairstyles as h', 'a.hairstyle_id', '=', 'h.id')
            ->select(
                'a.*',
                'u.first_name',
                'u.last_name',
                'u.email',
                'b.full_name as barber_name',
                'h.name as hairstyle_name'
            )
            ->orderBy('a.appointment_date', 'desc')
            ->orderBy('a.appointment_time', 'desc')
            ->get();
        
        return Inertia::render('Admin/Appointments', [
            'appointments' => $appointments,
            'statusFilter' => 'all',
            'dateFilter' => 'all'
        ]);
    });
    
    // Users
    Route::get('/users', function () {
        return Inertia::render('Admin/Users', ['users' => []]);
    });
    
    // Barbers
    Route::get('/barbers', function () {
        return Inertia::render('Admin/Barbers', ['barbers' => []]);
    });
    
    // Hairstyles
    Route::get('/hairstyles', function () {
        return Inertia::render('Admin/Hairstyles', ['hairstyles' => []]);
    });

});

// Your existing booking routes
Route::get('/booking/step-1', function () {
    // Your existing code...
});

Route::get('/booking/step-2', function (Request $request) {
    // Your existing code...
});

Route::get('/booking/step-3', function (Request $request) {
    // Your existing code...
});

require __DIR__.'/auth.php';