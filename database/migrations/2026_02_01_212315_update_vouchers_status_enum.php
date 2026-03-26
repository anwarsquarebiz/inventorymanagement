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
        // Step 1: Temporarily change column to VARCHAR to allow any values
        DB::statement("ALTER TABLE vouchers MODIFY COLUMN status VARCHAR(255) DEFAULT 'pending_verification'");
        
        // Step 2: Map old status values to new ones
        DB::table('vouchers')
            ->where('status', 'pending')
            ->update(['status' => 'pending_verification']);
            
        DB::table('vouchers')
            ->where('status', 'approved')
            ->update(['status' => 'under_review']);
            
        DB::table('vouchers')
            ->where('status', 'received')
            ->update(['status' => 'in_use']);
            
        DB::table('vouchers')
            ->where('status', 'returned')
            ->update(['status' => 'completed']);
        
        // Step 3: Change column back to ENUM with only new values
        DB::statement("ALTER TABLE vouchers MODIFY COLUMN status ENUM('pending_verification', 'in_transit', 'under_review', 'in_use', 'rejected', 'completed') DEFAULT 'pending_verification'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Temporarily change column to VARCHAR
        DB::statement("ALTER TABLE vouchers MODIFY COLUMN status VARCHAR(255) DEFAULT 'pending'");
        
        // Step 2: Map new status values back to old ones
        DB::table('vouchers')
            ->where('status', 'pending_verification')
            ->update(['status' => 'pending']);
            
        DB::table('vouchers')
            ->where('status', 'under_review')
            ->update(['status' => 'approved']);
            
        DB::table('vouchers')
            ->where('status', 'in_use')
            ->update(['status' => 'received']);
            
        DB::table('vouchers')
            ->where('status', 'completed')
            ->update(['status' => 'returned']);
        
        // Step 3: Revert enum column to old values
        DB::statement("ALTER TABLE vouchers MODIFY COLUMN status ENUM('pending', 'approved', 'in_transit', 'received', 'returned') DEFAULT 'pending'");
    }
};
