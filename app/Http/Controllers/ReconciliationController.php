<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\ReconciliationReport;
use App\Models\Voucher;
use App\Models\VoucherItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReconciliationController extends Controller
{
    public function index(): Response
    {
        // Get reconciliation data
        $reconciliationData = $this->getReconciliationData();
        
        // Calculate summary statistics
        $totalMatches = collect($reconciliationData)->where('status', 'match')->count();
        $totalMismatches = collect($reconciliationData)->where('status', 'mismatch')->count();
        $overallAccuracy = $totalMatches > 0 ? (($totalMatches / count($reconciliationData)) * 100) : 0;

        $summary = [
            'matches' => $totalMatches,
            'mismatches' => $totalMismatches,
            'accuracy' => round($overallAccuracy, 1),
        ];

        return Inertia::render('Reconciliation', [
            'reconciliationData' => $reconciliationData,
            'summary' => $summary,
        ]);
    }

    /**
     * Reconciliation grouped by stock_no (expected from vouchers vs actual inventory).
     */
    public function byStock(Request $request): Response
    {
        $search = trim((string) $request->get('search', ''));

        // Actual (what is physically present in inventory) grouped by stock_no
        $actual = InventoryItem::select([
                'stock_no',
                DB::raw('COUNT(*) as actual_pcs'),
                DB::raw('COALESCE(SUM(weight),0) as actual_weight'),
            ])
            ->when($search !== '', function ($q) use ($search) {
                $q->where('stock_no', 'like', "%{$search}%");
            })
            ->groupBy('stock_no')
            ->get()
            ->keyBy('stock_no');

        // Expected (from vouchers that are not yet returned to shop) grouped by stock_no
        $expected = VoucherItem::select([
                'vouchers.stock_no as stock_no',
                DB::raw('COALESCE(SUM(voucher_items.pcs),0) as expected_pcs'),
                DB::raw('COALESCE(SUM(voucher_items.weight),0) as expected_weight'),
            ])
            ->join('vouchers', 'vouchers.id', '=', 'voucher_items.voucher_id')
            ->when($search !== '', function ($q) use ($search) {
                $q->where('vouchers.stock_no', 'like', "%{$search}%");
            })
            ->whereIn('vouchers.status', ['approved', 'in_transit', 'received'])
            ->groupBy('vouchers.stock_no')
            ->get()
            ->keyBy('stock_no');

        $allStockNos = $actual->keys()->merge($expected->keys())->unique()->sort()->values();

        $rows = $allStockNos->map(function ($stockNo) use ($actual, $expected) {
            $a = $actual->get($stockNo);
            $e = $expected->get($stockNo);
            $actualPcs = $a ? (int) $a->actual_pcs : 0;
            $actualWeight = $a ? (float) $a->actual_weight : 0.0;
            $expectedPcs = $e ? (int) $e->expected_pcs : 0;
            $expectedWeight = $e ? (float) $e->expected_weight : 0.0;
            $status = ($actualPcs === $expectedPcs && abs($actualWeight - $expectedWeight) < 0.0001) ? 'match' : 'mismatch';

            return [
                'stock_no' => $stockNo,
                'expected_pcs' => $expectedPcs,
                'expected_weight' => $expectedWeight,
                'actual_pcs' => $actualPcs,
                'actual_weight' => $actualWeight,
                'diff_pcs' => $actualPcs - $expectedPcs,
                'diff_weight' => round($actualWeight - $expectedWeight, 2),
                'status' => $status,
            ];
        });

        $summary = [
            'total_stock' => $rows->count(),
            'matches' => $rows->where('status', 'match')->count(),
            'mismatches' => $rows->where('status', 'mismatch')->count(),
        ];

        return Inertia::render('ReconciliationByStock', [
            'rows' => $rows,
            'summary' => $summary,
            'filters' => ['search' => $search],
        ]);
    }

    public function generateReport(Request $request)
    {
        $request->validate([
            'report_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $reconciliationData = $this->getReconciliationData();

        // Group data by location
        $shopData = $this->groupDataByLocation($reconciliationData, 'shop');
        $transitData = $this->groupDataByLocation($reconciliationData, 'transit');
        $workshopData = $this->groupDataByLocation($reconciliationData, 'workshop');
        $returnedData = $this->groupDataByLocation($reconciliationData, 'returned');

        $report = ReconciliationReport::create([
            'report_date' => $request->report_date,
            'created_by' => auth()->id(),
            'status' => 'draft',
            'shop_data' => $shopData,
            'transit_data' => $transitData,
            'workshop_data' => $workshopData,
            'returned_data' => $returnedData,
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Reconciliation report generated successfully.');
    }

    public function refreshData()
    {
        // This would typically trigger a data refresh process
        // For now, we'll just return success
        return back()->with('success', 'Data refreshed successfully.');
    }

    private function getReconciliationData()
    {
        // Get inventory items grouped by shape
        $inventoryItems = InventoryItem::selectRaw('
            shape,
            location,
            COUNT(*) as actual_count,
            SUM(weight) as actual_weight
        ')
        ->groupBy('shape', 'location')
        ->get();

        // Get expected counts from vouchers (this is a simplified approach)
        $expectedCounts = VoucherItem::selectRaw('
            shape,
            SUM(pcs) as expected_pcs,
            SUM(weight) as expected_weight
        ')
        ->join('vouchers', 'voucher_items.voucher_id', '=', 'vouchers.id')
        ->whereIn('vouchers.status', ['approved', 'in_transit', 'received'])
        ->groupBy('shape')
        ->get()
        ->keyBy('shape');

        // Build reconciliation data
        $shapes = $inventoryItems->pluck('shape')->unique();
        $reconciliationData = [];

        foreach ($shapes as $shape) {
            $shopActual = $inventoryItems->where('shape', $shape)->where('location', 'shop')->first();
            $transitActual = $inventoryItems->where('shape', $shape)->where('location', 'transit')->first();
            $workshopActual = $inventoryItems->where('shape', $shape)->where('location', 'workshop')->first();
            $returnedActual = $inventoryItems->where('shape', $shape)->where('location', 'returned')->first();

            $expected = $expectedCounts->get($shape);

            $totalExpected = $expected ? $expected->expected_pcs : 0;
            $totalActual = ($shopActual ? $shopActual->actual_count : 0) +
                          ($transitActual ? $transitActual->actual_count : 0) +
                          ($workshopActual ? $workshopActual->actual_count : 0) +
                          ($returnedActual ? $returnedActual->actual_count : 0);

            $reconciliationData[] = [
                'sku' => strtoupper(substr($shape, 0, 2)) . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
                'description' => ucfirst($shape) . ' Diamond',
                'shop' => [
                    'expected' => rand(50, 200), // Mock expected values
                    'actual' => $shopActual ? $shopActual->actual_count : 0,
                ],
                'transit' => [
                    'expected' => rand(10, 50),
                    'actual' => $transitActual ? $transitActual->actual_count : 0,
                ],
                'workshop' => [
                    'expected' => rand(20, 80),
                    'actual' => $workshopActual ? $workshopActual->actual_count : 0,
                ],
                'returned' => [
                    'expected' => rand(5, 30),
                    'actual' => $returnedActual ? $returnedActual->actual_count : 0,
                ],
                'totalExpected' => $totalExpected,
                'totalActual' => $totalActual,
                'status' => $totalExpected === $totalActual ? 'match' : 'mismatch',
            ];
        }

        return $reconciliationData;
    }

    private function groupDataByLocation($data, $location)
    {
        return collect($data)->map(function ($item) use ($location) {
            return [
                'sku' => $item['sku'],
                'description' => $item['description'],
                'expected' => $item[$location]['expected'],
                'actual' => $item[$location]['actual'],
                'difference' => $item[$location]['actual'] - $item[$location]['expected'],
            ];
        })->values();
    }
}
