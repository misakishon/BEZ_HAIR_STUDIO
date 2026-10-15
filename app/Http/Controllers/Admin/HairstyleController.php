<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HairstyleController extends Controller
{
    public function index()
    {
        $hairstyles = DB::table('hairstyles')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('admin/Hairstyles', [
            'hairstyles' => $hairstyles
        ]);
    }
    
    public function store(Request $request)
    {
        try {
            $action = $request->input('action');
            
            if ($action === 'add') {
                $imagePath = '';

                // If there are already 5 or more active hairstyles, treat this new
                // hairstyle as the 'default price' setter: keep it inactive so it
                // doesn't appear in the popular section and apply its price to
                // barber.default_price for display purposes.
                $activeCount = DB::table('hairstyles')->where('is_active', 1)->count();
                $makeInactiveAndApplyDefault = $activeCount >= 5;
                if ($request->hasFile('image') && $request->file('image')->isValid()) {
                    $file = $request->file('image');
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $destination = public_path('uploads/hairstyle');
                    if (!file_exists($destination)) {
                        mkdir($destination, 0755, true);
                    }
                    $file->move($destination, $filename);
                    $imagePath = '/uploads/hairstyle/' . $filename;
                }
                
                $priceValue = (float)$request->input('price');

                $newId = DB::table('hairstyles')->insertGetId([
                    'name' => $request->input('name'),
                    'category' => $request->input('category'),
                    'description' => $request->input('description', ''),
                    'price' => $priceValue,
                    'duration_minutes' => (int)$request->input('duration_minutes'),
                    'image_path' => $imagePath,
                    'is_active' => $makeInactiveAndApplyDefault ? 0 : 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // If we marked the new hairstyle inactive because there are already
                // 5 active items, apply its price as the barber display default.
                if ($makeInactiveAndApplyDefault) {
                    DB::table('barbers')
                        ->where('is_available', 1)
                        ->update(['default_price' => $priceValue]);
                }
                
                return redirect()->route('admin.hairstyles')->with('success', 'Done change');
            }
            
            if ($action === 'edit') {
                $id = (int)$request->input('id');
                $hairstyle = DB::table('hairstyles')->where('id', $id)->first();
                
                if (!$hairstyle) {
                    return redirect()->route('admin.hairstyles')->with('error', 'Hairstyle not found');
                }
                
                $imagePath = $hairstyle->image_path ?? '';
                if ($request->hasFile('image') && $request->file('image')->isValid()) {
                    // Delete old image
                    if ($imagePath) {
                        $oldPath = public_path($imagePath);
                        if (file_exists($oldPath)) {
                            unlink($oldPath);
                        }
                    }
                    
                    $file = $request->file('image');
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $destination = public_path('uploads/hairstyle');
                    if (!file_exists($destination)) {
                        mkdir($destination, 0755, true);
                    }
                    $file->move($destination, $filename);
                    $imagePath = '/uploads/hairstyle/' . $filename;
                }
                
                $newPrice = (float)$request->input('price');

                DB::table('hairstyles')
                    ->where('id', $id)
                    ->update([
                        'name' => $request->input('name'),
                        'category' => $request->input('category'),
                        'description' => $request->input('description', ''),
                        'price' => $newPrice,
                        'duration_minutes' => (int)$request->input('duration_minutes'),
                        'image_path' => $imagePath,
                        'updated_at' => now(),
                    ]);

                $defaultSetter = DB::table('hairstyles')
                    ->where('is_active', 0)
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($defaultSetter) {
                    DB::table('barbers')
                        ->where('is_available', 1)
                        ->update(['default_price' => (float)$defaultSetter->price]);
                }
                
                return redirect()->route('admin.hairstyles')->with('success', 'Done change');
            }
            
            if ($action === 'delete') {
                $id = (int)$request->input('id');
                $hairstyle = DB::table('hairstyles')->where('id', $id)->first();
                
                if ($hairstyle && $hairstyle->image_path) {
                    $oldPath = public_path($hairstyle->image_path);
                    if (file_exists($oldPath)) {
                        unlink($oldPath);
                    }
                }
                
                DB::table('hairstyles')->where('id', $id)->delete();
                
                return redirect()->route('admin.hairstyles')->with('success', 'Done change');
            }
            
            return redirect()->route('admin.hairstyles')->with('error', 'Invalid action');
            
        } catch (\Exception $e) {
            \Log::error('Hairstyle store error: ' . $e->getMessage());
            return redirect()->route('admin.hairstyles')->with('error', $e->getMessage());
        }
    }
}