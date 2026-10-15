<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $roleFilter = $request->get('role', 'all');
        
        $query = DB::table('users')
            ->leftJoin('bookings', 'users.id', '=', 'bookings.user_id')
            ->select(
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'users.phone',
                'users.role',
                'users.created_at',
                DB::raw('COUNT(bookings.id) as total_bookings'),
                DB::raw('SUM(CASE WHEN bookings.status = "completed" THEN 1 ELSE 0 END) as completed_bookings')
            )
            ->groupBy(
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'users.phone',
                'users.role',
                'users.created_at'
            );
        
        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                  ->orWhere('last_name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }
        
        // Apply role filter
        if ($roleFilter !== 'all') {
            $query->where('users.role', $roleFilter);
        }
        
        $users = $query->orderBy('users.created_at', 'desc')
            ->paginate(10);
        
        // Get user stats
        $totalUsers = DB::table('users')->count();
        $totalBookings = DB::table('bookings')->count();
        $activeUsers = DB::table('users')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        
        return Inertia::render('admin/Users', [
            'users' => $users,
            'totalUsers' => $totalUsers,
            'totalBookings' => $totalBookings,
            'activeUsers' => $activeUsers,
            'search' => $search,
            'roleFilter' => $roleFilter,
        ]);
    }
    
    public function show($id)
    {
        $user = DB::table('users')
            ->where('id', $id)
            ->first();
        
        if (!$user) {
            return redirect()->route('admin.users')->with('error', 'User not found');
        }
        
        // Get user bookings
        $bookings = DB::table('bookings')
            ->leftJoin('barbers', 'bookings.barber_id', '=', 'barbers.id')
            ->leftJoin('hairstyles', 'bookings.hairstyle_id', '=', 'hairstyles.id')
            ->where('bookings.user_id', $id)
            ->select(
                'bookings.*',
                'barbers.full_name as barber_name',
                'hairstyles.name as hairstyle_name'
            )
            ->orderBy('bookings.created_at', 'desc')
            ->get();
        
        return Inertia::render('admin/UserDetails', [
            'user' => $user,
            'bookings' => $bookings,
        ]);
    }
    
    public function update(Request $request, $id)
    {
        $user = DB::table('users')->where('id', $id)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:user,admin',
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $updateData = [
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'updated_at' => now(),
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = bcrypt($validated['password']);
        }

        DB::table('users')
            ->where('id', $id)
            ->update($updateData);

        return response()->json(['success' => true, 'message' => 'User updated successfully']);
    }
    
    public function destroy($id)
    {
        $user = DB::table('users')->where('id', $id)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        if (($user->role ?? null) === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin accounts cannot be deleted from this page.'
            ], 403);
        }

        // Check if user has bookings
        $bookings = DB::table('bookings')->where('user_id', $id)->count();
        
        if ($bookings > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete user with existing bookings. Please delete their bookings first.'
            ], 400);
        }
        
        DB::table('users')->where('id', $id)->delete();
        
        return response()->json(['success' => true, 'message' => 'User deleted successfully']);
    }
}