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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('barber_id')->nullable();
            $table->foreign('barber_id')->references('id')->on('barbers')->onDelete('set null');
            $table->foreignId('hairstyle_id')->constrained('hairstyles')->onDelete('cascade');
            
            // Booking details
            $table->date('booking_date');
            $table->time('booking_time');
            $table->decimal('total_price', 10, 2);
            $table->enum('payment_method', ['cash', 'gcash', 'card'])->default('cash');
            
            // Customer information
            $table->string('full_name', 255);
            $table->string('email', 255);
            $table->string('phone', 20);
            $table->text('notes')->nullable();
            
            // Status tracking
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'])->default('pending');
            
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('booking_date');
            $table->index('status');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
