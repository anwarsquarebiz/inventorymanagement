<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\ReconciliationController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShapeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\VoucherGroupController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductCategorizationController;
use App\Http\Controllers\MetalController;
use App\Http\Controllers\MetalVoucherController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Vouchers
    Route::resource('vouchers', VoucherController::class);

    // Vouchers grouped by stock_no
    Route::get('/vouchers-groups', [VoucherGroupController::class, 'index'])->name('vouchers-groups.index');
    Route::get('/vouchers-groups/export', [VoucherGroupController::class, 'export'])->name('vouchers-groups.export');
    Route::get('/vouchers-groups/{stock_no}', [VoucherGroupController::class, 'show'])->name('vouchers-groups.show');
    Route::get('/vouchers-groups/{stock_no}/export-items', [VoucherGroupController::class, 'exportItems'])->name('vouchers-groups.export-items');
    Route::get('/vouchers-groups/{stock_no}/export-pdf', [VoucherGroupController::class, 'exportPdf'])->name('vouchers-groups.export-pdf');
    Route::post('/vouchers-groups/{stock_no}/complete', [VoucherGroupController::class, 'complete'])->name('vouchers-groups.complete');
    Route::put('/vouchers-groups/{stock_no}/update-stock-no', [VoucherGroupController::class, 'updateStockNo'])->name('vouchers-groups.update-stock-no');
    Route::post('/voucher-items/{item}/update-usage', [VoucherGroupController::class, 'updateItemUsage'])->name('voucher-items.update-usage');

    // Stocks
    Route::get('/stocks/{stock_no}/edit', [StockController::class, 'edit'])->name('stocks.edit');
    Route::match(['put', 'post'], '/stocks/{stock_no}', [StockController::class, 'update'])->name('stocks.update');

    Route::post('/vouchers/{voucher}/verify', [VoucherController::class, 'verify'])->name('vouchers.verify');
    Route::post('/vouchers/{voucher}/approve', [VoucherController::class, 'approve'])->name('vouchers.approve');
    Route::post('/vouchers/{voucher}/send-to-workshop', [VoucherController::class, 'sendToWorkshop'])->name('vouchers.send-to-workshop');
    Route::post('/vouchers/{voucher}/receive', [VoucherController::class, 'receive'])->name('vouchers.receive');
    Route::post('/vouchers/{voucher}/return', [VoucherController::class, 'return'])->name('vouchers.return');
    Route::post('/vouchers/{voucher}/reject', [VoucherController::class, 'reject'])->name('vouchers.reject');
    Route::post('/vouchers/{voucher}/complete', [VoucherController::class, 'complete'])->name('vouchers.complete');
    Route::get('/vouchers/{voucher}/print', [VoucherController::class, 'print'])->name('vouchers.print');
    Route::get('/vouchers/{voucher}/export-pdf', [VoucherController::class, 'exportPdf'])->name('vouchers.export-pdf');

    // Inventory
    Route::resource('inventory', InventoryController::class);
    Route::post('/inventory/bulk-update', [InventoryController::class, 'bulkUpdate'])->name('inventory.bulk-update');

    // Reconciliation
    Route::get('/reconciliation', [ReconciliationController::class, 'index'])->name('reconciliation.index');
    Route::post('/reconciliation/generate-report', [ReconciliationController::class, 'generateReport'])->name('reconciliation.generate-report');
    Route::post('/reconciliation/refresh-data', [ReconciliationController::class, 'refreshData'])->name('reconciliation.refresh-data');
    Route::get('/reconciliation/by-stock', [ReconciliationController::class, 'byStock'])->name('reconciliation.by-stock');

    // Users & Roles
    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);

    // Products
    Route::resource('products', ProductController::class);

    // Metals
    Route::resource('metals', MetalController::class);
    Route::get('/metal-usage', [MetalController::class, 'usage'])->name('metal-usage.index');
    Route::get('/metal-usage/{metal}', [MetalController::class, 'ledger'])->name('metal-usage.ledger');

    // Metal Vouchers
    Route::resource('metal-vouchers', MetalVoucherController::class);
    Route::post('/metal-vouchers/{metal_voucher}/verify', [MetalVoucherController::class, 'verify'])->name('metal-vouchers.verify');
    Route::post('/metal-vouchers/{metal_voucher}/approve', [MetalVoucherController::class, 'approve'])->name('metal-vouchers.approve');
    Route::post('/metal-vouchers/{metal_voucher}/receive', [MetalVoucherController::class, 'receive'])->name('metal-vouchers.receive');
    Route::post('/metal-vouchers/{metal_voucher}/reject', [MetalVoucherController::class, 'reject'])->name('metal-vouchers.reject');
    Route::post('/metal-vouchers/{metal_voucher}/complete', [MetalVoucherController::class, 'complete'])->name('metal-vouchers.complete');

    // Shapes
    Route::resource('shapes', ShapeController::class);

    // Product Categorizations
    Route::resource('product-categorizations', ProductCategorizationController::class);

    // Workshop Requests
    Route::resource('workshop-requests', \App\Http\Controllers\WorkshopRequestController::class);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
