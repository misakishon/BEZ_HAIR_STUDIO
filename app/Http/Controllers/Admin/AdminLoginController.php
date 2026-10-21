<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Services\OtpService;

class AdminLoginController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Auth/AdminLogin');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $currentAdminEmail = 'bezcutsfades@gmail.com';
        $currentAdminPassword = '#cuts&fades2026';
        $legacyAdminEmail = 'admin@barbershop.com';

        if (Str::lower(trim($request->input('email'))) === $legacyAdminEmail) {
            return back()->withErrors([
                'email' => 'The legacy admin login has been removed. Please use the current admin email.',
            ]);
        }

        $legacyAdmin = User::where('role', 'admin')
            ->where('email', $legacyAdminEmail)
            ->first();

        if ($legacyAdmin) {
            $legacyAdmin->email = $currentAdminEmail;
            $legacyAdmin->password = Hash::make($currentAdminPassword);
            $legacyAdmin->save();
        }

        $throttleKey = Str::lower($request->input('email')).'|'.$request->ip();
        $maxAttempts = 5;
        $decaySeconds = 300;

        if (RateLimiter::tooManyAttempts($throttleKey, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return back()->withErrors([
                'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        // Attempt to login
        if (Auth::attempt($credentials, $request->remember)) {
            RateLimiter::clear($throttleKey);

            $user = Auth::user();
            
            // Check if user is admin
            if ($user->role === 'admin') {
                $request->session()->regenerate();
                return redirect()->intended('/admin/dashboard');
            }
            
            // If not admin, logout and redirect back with error
            Auth::logout();
            return back()->withErrors([
                'email' => 'You do not have admin access.',
            ]);
        }

        RateLimiter::hit($throttleKey, $decaySeconds);

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/admin/login');
    }

    /**
     * Send OTP for Admin Password Reset
     */
    public function sendResetOtp(Request $request, OtpService $otpService)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = Str::lower(trim($request->input('email')));

        $admin = User::where('role', 'admin')
            ->where('email', $email)
            ->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'No registered admin account found with that email address.',
            ], 404);
        }

        $result = $otpService->sendOtp($admin->email, false, 'password_reset');

        return response()->json([
            'success' => $result['success'],
            'message' => $result['success']
                ? "A 6-digit verification code has been sent to {$admin->email}."
                : $result['message'],
        ], $result['status'] ?? 200);
    }

    /**
     * Verify OTP and Reset Admin Password
     */
    public function resetPasswordWithOtp(Request $request, OtpService $otpService)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'otp' => 'required|string|size:6',
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = Str::lower(trim($request->input('email')));

        $admin = User::where('role', 'admin')
            ->where('email', $email)
            ->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'No registered admin account found with that email address.',
            ], 404);
        }

        $verify = $otpService->verifyOtp($admin->email, $request->input('otp'));

        if (!$verify['success']) {
            return response()->json([
                'success' => false,
                'message' => $verify['message'],
            ], $verify['status'] ?? 400);
        }

        $admin->password = Hash::make($request->input('password'));
        $admin->setRememberToken(Str::random(60));
        $admin->save();

        Log::info("Admin password reset successfully via OTP for: {$admin->email}");

        return response()->json([
            'success' => true,
            'message' => 'Your password has been reset successfully! You can now log in with your new password.',
        ]);
    }
}