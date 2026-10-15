<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('time_slots')) {
            Schema::create('time_slots', function (Blueprint $table) {
                $table->id();
                $table->foreignId('barber_id')->nullable()->constrained('barbers')->onDelete('cascade');
                $table->date('slot_date');
                $table->time('slot_time');
                $table->boolean('is_available')->default(true);
                $table->integer('max_bookings')->default(1);
                $table->integer('current_bookings')->default(0);
                $table->timestamps();

                $table->unique(['barber_id', 'slot_date', 'slot_time']);
                $table->index('slot_date');
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('time_slots')) {
            Schema::dropIfExists('time_slots');
        }
    }
};