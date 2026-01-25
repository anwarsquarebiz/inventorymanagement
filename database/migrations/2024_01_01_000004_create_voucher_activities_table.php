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
        Schema::create('voucher_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_id')->constrained()->onDelete('cascade');
            $table->enum('action', ['created', 'approved', 'sent_to_workshop', 'received_at_workshop', 'sent_from_workshop', 'received_at_shop', 'returned', 'cancelled']);
            $table->foreignId('user_id')->constrained();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Store additional data like location, quantities, etc.
            $table->timestamp('timestamp');
            $table->timestamps();

            $table->index(['voucher_id', 'timestamp']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_activities');
    }
};
