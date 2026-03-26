<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds new action types to audit_logs:
     * - VERIFY: For voucher verification actions
     * - COMPLETE: For voucher completion actions
     * - EXPORT_PDF: For PDF export actions
     */
    public function up(): void
    {
        // Step 1: Temporarily change column to VARCHAR to allow any values
        DB::statement("ALTER TABLE audit_logs MODIFY COLUMN action VARCHAR(255)");
        
        // Step 2: Change column back to ENUM with new actions added
        // New actions: 'VERIFY', 'COMPLETE', 'EXPORT_PDF'
        DB::statement("ALTER TABLE audit_logs MODIFY COLUMN action ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT', 'VERIFY', 'COMPLETE', 'EXPORT_PDF')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Temporarily change column to VARCHAR
        DB::statement("ALTER TABLE audit_logs MODIFY COLUMN action VARCHAR(255)");
        
        // Step 2: Optionally map new actions back to old ones before reverting
        // (Uncomment if you want to preserve data by mapping to existing actions)
        // DB::table('audit_logs')
        //     ->where('action', 'VERIFY')
        //     ->update(['action' => 'APPROVE']);
        // DB::table('audit_logs')
        //     ->where('action', 'COMPLETE')
        //     ->update(['action' => 'UPDATE']);
        // DB::table('audit_logs')
        //     ->where('action', 'EXPORT_PDF')
        //     ->update(['action' => 'VIEW']);
        
        // Step 3: Change column back to original ENUM values
        DB::statement("ALTER TABLE audit_logs MODIFY COLUMN action ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT')");
    }
};
