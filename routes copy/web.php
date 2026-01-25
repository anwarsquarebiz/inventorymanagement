<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\ReconciliationController;
use App\Http\Controllers\InventoryController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Vouchers
    Route::resource('vouchers', VoucherController::class);
    Route::post('/vouchers/{voucher}/approve', [VoucherController::class, 'approve'])->name('vouchers.approve');
    Route::post('/vouchers/{voucher}/send-to-workshop', [VoucherController::class, 'sendToWorkshop'])->name('vouchers.send-to-workshop');
    Route::post('/vouchers/{voucher}/receive', [VoucherController::class, 'receive'])->name('vouchers.receive');
    Route::post('/vouchers/{voucher}/return', [VoucherController::class, 'return'])->name('vouchers.return');

    // Inventory
    Route::resource('inventory', InventoryController::class);
    Route::post('/inventory/bulk-update', [InventoryController::class, 'bulkUpdate'])->name('inventory.bulk-update');

    // Reconciliation
    Route::get('/reconciliation', [ReconciliationController::class, 'index'])->name('reconciliation.index');
    Route::post('/reconciliation/generate-report', [ReconciliationController::class, 'generateReport'])->name('reconciliation.generate-report');
    Route::post('/reconciliation/refresh-data', [ReconciliationController::class, 'refreshData'])->name('reconciliation.refresh-data');
});

require __DIR__.'/auth.php';
