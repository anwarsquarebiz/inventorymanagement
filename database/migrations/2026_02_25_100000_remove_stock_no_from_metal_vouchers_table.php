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
        Schema::table('metal_vouchers', function (Blueprint $table) {
            $table->dropColumn('stock_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('metal_vouchers', function (Blueprint $table) {
            $table->string('stock_no')->nullable()->after('voucher_no');
        });
    }
};
