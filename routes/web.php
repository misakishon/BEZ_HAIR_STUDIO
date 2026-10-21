<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PayMongoController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Admin\AppointmentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\BarberController;
use App\Http\Controllers\Admin\HairstyleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\TimeSlotController;
use App\Http\Controllers\Admin\AdminLoginController;
use App\Http\Middleware\EnsureUserIsAdmin;


// Public pages and APIs
Route::controller(HomeController::class)->group(function () {
    Route::get('/', 'index');
    Route::get('/api/barbers', 'getBarbers');
    Route::get('/api/testimonials', 'getTestimonials');
    Route::post('/api/barbers/{id}/rate', 'rateBarber');
});

Route::post('/contact', [ContactController::class, 'send'])->name('contact.send');

// Booking pages and booking APIs
Route::controller(BookingController::class)->group(function () {
    Route::get('/booking/step-1', 'step1')->name('booking.step1');
    Route::get('/booking/step-2', 'step2')->name('booking.step2');
    Route::match(['get', 'post'], '/booking/step-3', 'step3')->name('booking.step3');
    Route::match(['get', 'post'], '/booking/step-4', 'step4')->name('booking.step4');
    Route::get('/booking/success', 'success')->name('booking.success');
    Route::get('/booking/get-slots', 'getSlots')->name('booking.get-slots');
    Route::post('/booking/payment/gcash', 'initiateQrPhPayment')->name('booking.payment.gcash');
    Route::get('/booking/payment/gcash/status', 'checkQrPhStatus');
    Route::post('/booking/send-otp', 'sendOtp')->name('booking.send-otp')->middleware('throttle:5,1');
    Route::post('/booking/verify-otp', 'verifyOtp')->name('booking.verify-otp')->middleware('throttle:10,1');
});

// Admin entry point
Route::get('/admin', function () {
    if (Auth::check() && (Auth::user()->role ?? null) === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    return redirect()->route('admin.login');
});

// Admin authentication
Route::get('/admin/login', [AdminLoginController::class, 'showLoginForm'])->name('admin.login');
Route::post('/admin/login', [AdminLoginController::class, 'login'])->name('admin.login.post');
Route::post('/admin/logout', [AdminLoginController::class, 'logout'])->name('admin.logout');
Route::post('/admin/forgot-password/send-otp', [AdminLoginController::class, 'sendResetOtp'])
    ->name('admin.forgot-password.send-otp')
    ->middleware('throttle:3,1');
Route::post('/admin/forgot-password/reset', [AdminLoginController::class, 'resetPasswordWithOtp'])
    ->name('admin.forgot-password.reset')
    ->middleware('throttle:5,1');

// Protected admin pages and APIs
Route::middleware(['auth', EnsureUserIsAdmin::class])->prefix('admin')->group(function () {
    Route::controller(TimeSlotController::class)->prefix('time-slots')->name('admin.time-slots.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::post('/{id}/toggle', 'toggleStatus')->name('toggle');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    Route::controller(AppointmentController::class)->prefix('appointments')->group(function () {
        Route::get('/', 'index')->name('admin.appointments');
        Route::post('/confirm-payment', 'confirmPayment')->name('admin.appointments.confirm-payment');
        Route::post('/cancel', 'cancelAppointment')->name('admin.appointments.cancel');
        Route::post('/{id}/change', 'changeAppointment')->name('admin.appointments.change');
    });

    Route::controller(UserController::class)->prefix('users')->group(function () {
        Route::get('/', 'index')->name('admin.users');
        Route::get('/{id}', 'show')->name('admin.users.show');
        Route::put('/{id}', 'update')->name('admin.users.update');
        Route::delete('/{id}', 'destroy')->name('admin.users.destroy');
    });

    Route::controller(BarberController::class)->prefix('barbers')->group(function () {
        Route::get('/', 'index')->name('admin.barbers');
        Route::post('/', 'store')->name('admin.barbers.store');
        Route::post('/{id}', 'store')->name('admin.barbers.update');
        Route::post('/{id}/toggle-status', 'toggleStatus')->name('admin.barbers.toggle-status');
    });

    Route::controller(HairstyleController::class)->prefix('hairstyles')->group(function () {
        Route::get('/', 'index')->name('admin.hairstyles');
        Route::post('/', 'store')->name('admin.hairstyles.store');
    });
});

Route::get('/test-service-ticket', function () {
    try {
        // Create test data
        $booking = (object) [
            'id' => 999,
            'booking_date' => now()->format('Y-m-d'),
            'booking_time' => '14:30:00',
            'full_name' => 'Test Customer',
            'email' => 'agtangseanpatrick52@gmail.com', // CHANGE THIS TO YOUR EMAIL
            'phone' => '09123456789',
            'total_price' => 250.00,
            'status' => 'confirmed',
        ];
        
        $barber = (object) [
            'id' => 1,
            'full_name' => 'Test Barber',
            'specialty' => 'Expert Hair Stylist',
        ];
        
        $hairstyle = (object) [
            'id' => 1,
            'name' => 'Classic Haircut',
        ];
        
        // Send email
        Mail::to($booking->email)->send(new \App\Mail\ServiceTicket($booking, $barber, $hairstyle));
        
        return "Test email sent to " . $booking->email . "! Check your inbox/spam folder.";
        
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage() . "<br><br>Trace: " . $e->getTraceAsString();
    }
});

require __DIR__.'/auth.php';