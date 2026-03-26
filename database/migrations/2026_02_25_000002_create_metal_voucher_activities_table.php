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
        Schema::create('metal_voucher_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('metal_voucher_id')->constrained('metal_vouchers')->onDelete('cascade');
            $table->string('action', 255);
            $table->foreignId('user_id')->constrained();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('timestamp');
            $table->timestamps();

            $table->index(['metal_voucher_id', 'timestamp']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metal_voucher_activities');
    }
};
