<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds new action types to support the new voucher statuses:
     * - verified: For pending verification status
     * - under_review: For under review status
     * - in_transit: For in transit status
     * - in_use: For in use status
     * - rejected: For rejected status
     * - completed: For completed status
     */
    public function up(): void
    {
        // Step 1: Temporarily change column to VARCHAR to allow any values
        DB::statement("ALTER TABLE voucher_activities MODIFY COLUMN action VARCHAR(255)");
        
        // Step 2: Change column back to ENUM with all new actions added
        // New actions: 'verified', 'under_review', 'in_transit', 'in_use', 'rejected', 'completed'
        DB::statement("ALTER TABLE voucher_activities MODIFY COLUMN action ENUM('created', 'approved', 'verified', 'under_review', 'in_transit', 'sent_to_workshop', 'received_at_workshop', 'in_use', 'sent_from_workshop', 'received_at_shop', 'returned', 'rejected', 'completed', 'cancelled')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Temporarily change column to VARCHAR
        DB::statement("ALTER TABLE voucher_activities MODIFY COLUMN action VARCHAR(255)");
        
        // Step 2: Optionally map new actions back to old ones before reverting
        // (Uncomment if you want to preserve data by mapping to existing actions)
        // DB::table('voucher_activities')
        //     ->where('action', 'verified')
        //     ->update(['action' => 'approved']);
        // DB::table('voucher_activities')
        //     ->where('action', 'completed')
        //     ->update(['action' => 'returned']);
        // etc.
        
        // Step 3: Change column back to original ENUM values
        DB::statement("ALTER TABLE voucher_activities MODIFY COLUMN action ENUM('created', 'approved', 'sent_to_workshop', 'received_at_workshop', 'sent_from_workshop', 'received_at_shop', 'returned', 'cancelled')");
    }
};
