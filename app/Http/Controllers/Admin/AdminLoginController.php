<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

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
}