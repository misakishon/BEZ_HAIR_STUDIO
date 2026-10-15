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
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('barber_id')->nullable()->constrained('barbers')->onDelete('cascade');
            $table->foreignId('hairstyle_id')->nullable()->constrained('hairstyles')->onDelete('cascade');
            $table->timestamps();

            // Set up our composite multi-key tracking constraint
            $table->unique(['user_id', 'barber_id', 'hairstyle_id'], 'unique_favorite');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
