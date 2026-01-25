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
        Schema::create('reconciliation_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_no')->unique();
            $table->date('report_date');
            $table->foreignId('created_by')->constrained('users');
            $table->enum('status', ['draft', 'in_progress', 'completed', 'approved'])->default('draft');
            $table->json('shop_data'); // Expected vs actual for shop
            $table->json('transit_data'); // Expected vs actual for transit
            $table->json('workshop_data'); // Expected vs actual for workshop
            $table->json('returned_data'); // Expected vs actual for returned items
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['report_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reconciliation_reports');
    }
};
