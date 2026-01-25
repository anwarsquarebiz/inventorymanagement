<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('voucher_items', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['inventory_item_id']);
        });

        // Use raw SQL to modify the column to be nullable
        DB::statement('ALTER TABLE voucher_items MODIFY inventory_item_id BIGINT UNSIGNED NULL');

        Schema::table('voucher_items', function (Blueprint $table) {
            // Re-add the foreign key constraint with nullable support
            $table->foreign('inventory_item_id')->references('id')->on('inventory_items')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher_items', function (Blueprint $table) {
            // Drop the nullable foreign key
            $table->dropForeign(['inventory_item_id']);
        });

        // Use raw SQL to modify the column to be non-nullable again
        // First, set any NULL values to a default (we'll need to handle this case)
        DB::statement('UPDATE voucher_items SET inventory_item_id = 1 WHERE inventory_item_id IS NULL');
        DB::statement('ALTER TABLE voucher_items MODIFY inventory_item_id BIGINT UNSIGNED NOT NULL');

        Schema::table('voucher_items', function (Blueprint $table) {
            // Re-add the original foreign key constraint
            $table->foreign('inventory_item_id')->references('id')->on('inventory_items')->onDelete('cascade');
        });
    }
};
