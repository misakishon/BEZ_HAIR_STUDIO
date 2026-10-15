<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminEmail = 'bezcutsfades@gmail.com';
        $password = Hash::make('#cuts&fades2026');

        $admin = DB::table('users')->where('email', $adminEmail)->first();
        if (! $admin) {
            $admin = DB::table('users')
                ->where('role', 'admin')
                ->where('email', '!=', $adminEmail)
                ->first();
        }

        if ($admin) {
            $updates = [
                'name' => !empty($admin->name) ? $admin->name : 'Admin User',
                'email' => $adminEmail,
                'role' => 'admin',
                'password' => $password,
                'updated_at' => now(),
            ];

            DB::table('users')->where('id', $admin->id)->update($updates);

            return;
        }

        DB::table('users')->insert([
            'name' => 'Admin User',
            'email' => $adminEmail,
            'password' => $password,
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
