<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'payment_source_id')) {
                $table->string('payment_source_id', 255)->nullable()->after('payment_method');
            }

            if (!Schema::hasColumn('bookings', 'receipt_image')) {
                $table->string('receipt_image')->nullable()->after('payment_source_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'receipt_image')) {
                $table->dropColumn('receipt_image');
            }

            if (Schema::hasColumn('bookings', 'payment_source_id')) {
                $table->dropColumn('payment_source_id');
            }
        });
    }
};
