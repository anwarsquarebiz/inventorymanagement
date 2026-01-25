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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('stock_no')->unique();
            $table->string('shape');
            $table->string('description');
            $table->decimal('weight', 8, 2)->nullable(); // in carats
            $table->string('color')->nullable();
            $table->string('clarity')->nullable();
            $table->string('cut')->nullable();
            $table->string('code')->nullable();
            $table->text('remarks')->nullable();
            $table->enum('status', ['available', 'reserved', 'in_transit', 'in_workshop', 'returned', 'sold'])->default('available');
            $table->enum('location', ['shop', 'transit', 'workshop', 'returned'])->default('shop');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['status', 'location']);
            $table->index('shape');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
