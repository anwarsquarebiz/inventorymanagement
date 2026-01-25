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
        Schema::table('shapes', function (Blueprint $table) {
            // Drop the unique constraint on name
            $table->dropUnique(['name']);
            
            // Add a unique constraint on the combination of name and product_id
            // This allows the same shape name for different products, but prevents duplicates for the same product
            $table->unique(['name', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shapes', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique(['name', 'product_id']);
            
            // Restore the unique constraint on name
            $table->unique('name');
        });
    }
};
