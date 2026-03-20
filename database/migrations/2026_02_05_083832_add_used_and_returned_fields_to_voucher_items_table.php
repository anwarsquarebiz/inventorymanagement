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
        Schema::table('voucher_items', function (Blueprint $table) {
            $table->integer('pcs_used')->nullable()->after('pcs');
            $table->integer('pcs_returned')->nullable()->after('pcs_used');
            $table->decimal('weight_used', 8, 2)->nullable()->after('weight');
            $table->decimal('weight_returned', 8, 2)->nullable()->after('weight_used');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher_items', function (Blueprint $table) {
            $table->dropColumn(['pcs_used', 'pcs_returned', 'weight_used', 'weight_returned']);
        });
    }
};
