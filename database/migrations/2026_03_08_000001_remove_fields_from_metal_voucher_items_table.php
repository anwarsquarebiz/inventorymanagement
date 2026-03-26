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
        Schema::table('metal_voucher_items', function (Blueprint $table) {
            $table->dropColumn([
                'weight_used',
                'weight_returned',
                'code',
                'temporary_return',
                'reviewed',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('metal_voucher_items', function (Blueprint $table) {
            $table->decimal('weight_used', 8, 2)->nullable()->after('weight');
            $table->decimal('weight_returned', 8, 2)->nullable()->after('weight_used');
            $table->string('code')->nullable()->after('weight_returned');
            $table->boolean('temporary_return')->default(false)->after('remarks');
            $table->boolean('reviewed')->default(false)->after('temporary_return');
        });
    }
};
