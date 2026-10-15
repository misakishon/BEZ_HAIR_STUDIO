<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->nullable()->after('id');
            }
            if (!Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name')->nullable()->after('first_name');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->nullable()->after('password');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('users', 'profile_image')) {
                $table->string('profile_image', 500)->nullable()->after('address');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('user')->after('profile_image');
            }
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('role');
            }
        });

        if (Schema::hasTable('users')) {
            $adminEmail = 'bezcutsfades@gmail.com';
            $admin = DB::table('users')->where('email', $adminEmail)->first();
            if (! $admin) {
                $admin = DB::table('users')
                    ->where('role', 'admin')
                    ->where('email', '!=', $adminEmail)
                    ->first();
            }
            if ($admin) {
                $updates = [];
                if (empty($admin->first_name)) {
                    $updates['first_name'] = 'Admin';
                }
                if (empty($admin->last_name)) {
                    $updates['last_name'] = 'User';
                }
                if (empty($admin->role)) {
                    $updates['role'] = 'admin';
                }
                if ($admin->email !== $adminEmail) {
                    $updates['email'] = $adminEmail;
                }
                if (!empty($updates)) {
                    DB::table('users')->where('id', $admin->id)->update($updates);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'first_name')) {
                $table->dropColumn('first_name');
            }
            if (Schema::hasColumn('users', 'last_name')) {
                $table->dropColumn('last_name');
            }
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('users', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('users', 'profile_image')) {
                $table->dropColumn('profile_image');
            }
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
            if (Schema::hasColumn('users', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};
