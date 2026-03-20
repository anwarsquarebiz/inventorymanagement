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
        Schema::create('metal_voucher_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('metal_voucher_id')->constrained('metal_vouchers')->onDelete('cascade');
            $table->foreignId('metal_id')->constrained('metals');
            $table->decimal('weight', 8, 2);
            $table->decimal('weight_used', 8, 2)->nullable();
            $table->decimal('weight_returned', 8, 2)->nullable();
            $table->string('code')->nullable();
            $table->text('remarks')->nullable();
            $table->boolean('temporary_return')->default(false);
            $table->boolean('reviewed')->default(false);
            $table->timestamps();

            $table->index(['metal_voucher_id', 'metal_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metal_voucher_items');
    }
};
