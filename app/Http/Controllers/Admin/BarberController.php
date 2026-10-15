<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BarberController extends Controller
{
    public function index()
    {
        $barber = DB::table('barbers')
            ->orderBy('id', 'asc')
            ->first();
        
        if ($barber) {
            // Explicitly cast to integer to bypass driver inconsistencies
            $barber->is_available = (int)$barber->is_available;
        }
        
        return Inertia::render('admin/Barbers', [
            'barber' => $barber
        ]);
    }
    
    public function store(Request $request)
    {
        try {
            // Get action from request
            $action = $request->input('action');
            
            if ($action === 'add') {
                $profileImage = '';
                if ($request->hasFile('profile_image') && $request->file('profile_image')->isValid()) {
                    $file = $request->file('profile_image');
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $barberDirectory = public_path('uploads/barbers');
                    if (!is_dir($barberDirectory)) {
                        mkdir($barberDirectory, 0755, true);
                    }
                    
                    // Save directly to public/uploads/barbers/ (no storage symlink needed)
                    $file->move($barberDirectory, $filename);
                    $profileImage = '/uploads/barbers/' . $filename;
                }

                $gcashQrCode = null;
                if ($request->hasFile('gcash_qr_code') && $request->file('gcash_qr_code')->isValid()) {
                    $qrFile = $request->file('gcash_qr_code');
                    $qrDirectory = public_path('uploads/qrcode');
                    if (!is_dir($qrDirectory)) {
                        mkdir($qrDirectory, 0755, true);
                    }

                    $qrFilename = 'gcash-' . time() . '_' . uniqid() . '.' . $qrFile->getClientOriginalExtension();
                    $qrFile->move($qrDirectory, $qrFilename);
                    $gcashQrCode = '/uploads/qrcode/' . $qrFilename;
                }
                
                DB::table('barbers')->insert([
                    'full_name' => $request->input('full_name'),
                    'specialty' => $request->input('specialty'),
                    'experience_years' => (int)$request->input('experience_years', 0),
                    'bio' => $request->input('bio', ''),
                    'introduction' => $request->input('introduction', ''),
                    'certifications' => $request->input('certifications', ''),
                    'profile_image' => $profileImage,
                    'gcash_qr_code' => $gcashQrCode,
                    'is_available' => (int)$request->input('is_available', 0),
                    'rating' => 4.9,
                    'default_price' => $request->input('default_price') !== null && $request->input('default_price') !== '' ? (float)$request->input('default_price') : null,
                    'total_reviews' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                return redirect()->route('admin.barbers')->with('success', 'Done change');
            }
            
            if ($action === 'edit') {
                $id = (int)$request->input('id');
                $barber = DB::table('barbers')->where('id', $id)->first();
                
                if (!$barber) {
                    return redirect()->route('admin.barbers')->with('error', 'Barber not found');
                }
                
                $profileImage = $barber->profile_image ?? '';
                if ($request->hasFile('profile_image') && $request->file('profile_image')->isValid()) {
                    // Delete old image
                    if ($profileImage && file_exists(public_path($profileImage))) {
                        unlink(public_path($profileImage));
                    }
                    
                    $file = $request->file('profile_image');
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $barberDirectory = public_path('uploads/barbers');
                    if (!is_dir($barberDirectory)) {
                        mkdir($barberDirectory, 0755, true);
                    }
                    
                    // Save directly to public/uploads/barbers/
                    $file->move($barberDirectory, $filename);
                    $profileImage = '/uploads/barbers/' . $filename;
                }

                $gcashQrCode = $barber->gcash_qr_code ?? null;
                if ($request->hasFile('gcash_qr_code') && $request->file('gcash_qr_code')->isValid()) {
                    if ($gcashQrCode && file_exists(public_path($gcashQrCode))) {
                        unlink(public_path($gcashQrCode));
                    }

                    $qrFile = $request->file('gcash_qr_code');
                    $qrDirectory = public_path('uploads/qrcode');
                    if (!is_dir($qrDirectory)) {
                        mkdir($qrDirectory, 0755, true);
                    }

                    $qrFilename = 'gcash-' . time() . '_' . uniqid() . '.' . $qrFile->getClientOriginalExtension();
                    $qrFile->move($qrDirectory, $qrFilename);
                    $gcashQrCode = '/uploads/qrcode/' . $qrFilename;
                }
                
                DB::table('barbers')
                    ->where('id', $id)
                    ->update([
                        'full_name' => $request->input('full_name'),
                        'specialty' => $request->input('specialty'),
                        'experience_years' => (int)$request->input('experience_years', 0),
                        'bio' => $request->input('bio', ''),
                        'introduction' => $request->input('introduction', ''),
                        'certifications' => $request->input('certifications', ''),
                        'profile_image' => $profileImage,
                        'gcash_qr_code' => $gcashQrCode,
                        'default_price' => $request->input('default_price') !== null && $request->input('default_price') !== '' ? (float)$request->input('default_price') : null,
                        'is_available' => (int)$request->input('is_available', 0),
                        'updated_at' => now(),
                    ]);
                
                return redirect()->route('admin.barbers')->with('success', 'Done change');
            }
            
            if ($action === 'toggle_status') {
                $id = (int)$request->input('id');
                $currentStatus = (int)$request->input('current_status');
                $newStatus = $currentStatus ? 0 : 1;
                
                DB::table('barbers')
                    ->where('id', $id)
                    ->update([
                        'is_available' => $newStatus,
                        'updated_at' => now()
                    ]);
                
                return redirect()->route('admin.barbers')->with('success', 'Done change');
            }
            
            if ($action === 'delete') {
                $id = (int)$request->input('id');
                $barber = DB::table('barbers')->where('id', $id)->first();
                
                if ($barber && $barber->profile_image && file_exists(public_path($barber->profile_image))) {
                    unlink(public_path($barber->profile_image));
                }
                
                DB::table('barbers')->where('id', $id)->delete();
                
                return redirect()->route('admin.barbers')->with('success', 'Done change');
            }
            
            return redirect()->route('admin.barbers')->with('error', 'Invalid action');
            
        } catch (\Exception $e) {
            \Log::error('Barber store error: ' . $e->getMessage());
            return redirect()->route('admin.barbers')->with('error', $e->getMessage());
        }
    }
    
    public function toggleStatus($id)
    {
        try {
            $barber = DB::table('barbers')->where('id', $id)->first();
            
            if (!$barber) {
                return response()->json(['success' => false, 'message' => 'Barber not found'], 404);
            }
            
            $newStatus = $barber->is_available ? 0 : 1;
            
            DB::table('barbers')
                ->where('id', $id)
                ->update([
                    'is_available' => $newStatus,
                    'updated_at' => now()
                ]);
            
            return redirect()->route('admin.barbers')->with('success', 'Done change');
            
        } catch (\Exception $e) {
            \Log::error('Toggle status error: ' . $e->getMessage());
            return redirect()->route('admin.barbers')->with('error', $e->getMessage());
        }
    }
}