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
       Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barber_id')->constrained('barbers')->onDelete('cascade');
            $table->date('slot_date');
            $table->time('slot_time'); // Replaces raw string tracking constructors
            $table->boolean('is_available')->default(true);
            $table->integer('max_bookings')->default(1);
            $table->integer('current_bookings')->default(0);
            $table->timestamps();

            $table->unique(['barber_id', 'slot_date', 'slot_time'], 'unique_slot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_slots');
    }
};
