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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference', 20)->unique();
            
            // Relational foreign keys matching your structural cascade rules
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('barber_id')->constrained('barbers')->onDelete('cascade');
            $table->foreignId('hairstyle_id')->constrained('hairstyles')->onDelete('cascade');
            
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->integer('duration_minutes');
            $table->decimal('total_price', 10, 2);
            
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->enum('payment_method', ['cash', 'credit_card', 'debit_card', 'mobile_money'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index creation configurations for high-speed queries
            $table->index('appointment_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
