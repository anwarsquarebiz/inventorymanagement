<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds COMPLETE action type to audit_logs enum.
     */
    public function up(): void
    {
        // Step 1: Temporarily change column to VARCHAR to allow any values
        DB::statement("ALTER TABLE audit_logs MODIFY COLUMN action VARCHAR(255)");
        
        // Step 2: Change column back to ENUM with COMPLETE added
        // Current actions: 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT', 'VERIFY', 'EXPORT_PDF'
        // Adding: 'COMPLETE'
        DB::statement("ALTER TABLE audit_logs MODIFY COLUMN action ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT', 'VERIFY', 'COMPLETE', 'EXPORT_PDF')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Temporarily change column to VARCHAR
        DB::statement("ALTER TABLE audit_logs MODIFY COLUMN action VARCHAR(255)");
        
        // Step 2: Optionally map COMPLETE back to UPDATE before reverting
        // (Uncomment if you want to preserve data)
        // DB::table('audit_logs')
        //     ->where('action', 'COMPLETE')
        //     ->update(['action' => 'UPDATE']);
        
        // Step 3: Change column back to ENUM without COMPLETE
        DB::statement("ALTER TABLE audit_logs MODIFY COLUMN action ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT', 'VERIFY', 'EXPORT_PDF')");
    }
};
