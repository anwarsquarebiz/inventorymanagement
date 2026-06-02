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
        Schema::create('metal_monthly_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('metal_id')->constrained('metals')->cascadeOnDelete();
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->decimal('total_issue', 12, 2)->default(0);
            $table->decimal('total_usage', 12, 2)->default(0);
            $table->decimal('loss_adjustment', 12, 2)->default(0);
            $table->decimal('closing_balance', 12, 2)->default(0);
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->timestamps();

            $table->unique(['metal_id', 'year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metal_monthly_summaries');
    }
};
