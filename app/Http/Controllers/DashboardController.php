<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Metal;
use App\Models\MetalVoucher;
use App\Models\MetalVoucherItem;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Voucher;
use App\Models\VoucherActivity;
use App\Models\ReconciliationReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Get inventory counts by location
        $inventoryCounts = InventoryItem::getCountByLocation();
        $inventoryWeights = InventoryItem::getWeightByLocation();

        // Get voucher statistics
        $voucherStats = [
            'pending_verification' => Voucher::where('status', Voucher::STATUS_PENDING_VERIFICATION)->count(),
            'in_transit' => Voucher::where('status', Voucher::STATUS_IN_TRANSIT)->count(),
            'under_review' => Voucher::where('status', Voucher::STATUS_UNDER_REVIEW)->count(),
            'in_use' => Voucher::where('status', Voucher::STATUS_IN_USE)->count(),
            'rejected' => Voucher::where('status', Voucher::STATUS_REJECTED)->count(),
            'completed' => Voucher::where('status', Voucher::STATUS_COMPLETED)->count(),
        ];

        // Get recent activities
        $recentActivities = VoucherActivity::with(['voucher', 'user'])
            ->orderBy('timestamp', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'user' => $activity->user->name,
                    'time' => $activity->timestamp->diffForHumans(),
                    // get voucher no from voucher table if activity is voucher related
                    // 'voucher_no' => $activity->voucher->voucher_no,
                    'voucher_no' => $activity->voucher ? $activity->voucher->voucher_no : null,
                ];
            });

        // Get reconciliation status
        $reconciliationStatus = $this->getReconciliationStatus();

        // Metal ledger: credit from metal vouchers (in_use), debit from stocks.metal (grams)
        $metalLedger = $this->getMetalLedger();

        // Stock count breakdown: items completed vs in making, by category
        $stockBreakdown = $this->getStockBreakdown();

        // Workshop detail: item-level totals for vouchers in_use (stones from Product, metals from Metal)
        $workshopDetail = $this->getWorkshopDetail();

        // Stock delivery calendar: per stock, latest date_delivery from vouchers
        $deliveryCalendar = $this->getDeliveryCalendar();

        // Calculate KPIs with trends (mock data for now - can be enhanced with historical data)
        $kpis = [
            // Voucher by stock_no
            [
                'title' => 'Total Stock Count',
                'value' => $stockBreakdown['total_stock_count'],
                'change' => '0%',
                'trend' => 'neutral',
                'color' => 'text-blue-600 bg-blue-50',
                'link' => route('vouchers-groups.index'),
                'colspan' => 'col-span-2',
            ],
            [
                'title' => 'Total Vouchers',
                'value' => number_format($voucherStats['pending_verification'] + $voucherStats['under_review'] + $voucherStats['in_transit'] + $voucherStats['in_use'] + $voucherStats['rejected'] + $voucherStats['completed']),
                'change' => '0%',
                'trend' => 'neutral',
                'color' => 'text-gray-600 bg-gray-50',
                'link' => route('vouchers.index'),
                'colspan' => 'col-span-2',
            ],
            [
                'title' => 'Stones in Shop',
                'value' => number_format($inventoryCounts->get('shop', 0)),
                'change' => '+12%',
                'trend' => 'up',
                'color' => 'text-emerald-600 bg-emerald-50',
                'colspan' => 'col-span-1',
            ],
            [
                'title' => 'In Transit',
                'value' => number_format($inventoryCounts->get('transit', 0)),
                'change' => '+5%',
                'trend' => 'up',
                'color' => 'text-blue-600 bg-blue-50',
                'colspan' => 'col-span-1',
            ],
            [
                'title' => 'In Workshop',
                'value' => number_format($inventoryCounts->get('workshop', 0)),
                'change' => '-3%',
                'trend' => 'down',
                'color' => 'text-orange-600 bg-orange-50',
                'colspan' => 'col-span-1',
            ],
            [
                'title' => 'Returned',
                'value' => number_format($inventoryCounts->get('returned', 0)),
                'change' => '0%',
                'trend' => 'neutral',
                'color' => 'text-gray-600 bg-gray-50',
                'colspan' => 'col-span-1',
            ],
        ];

        return Inertia::render('Dashboard', [
            'kpis' => $kpis,
            'recentActivities' => $recentActivities,
            'reconciliationStatus' => $reconciliationStatus,
            'voucherStats' => $voucherStats,
            'metalLedger' => $metalLedger,
            'stockBreakdown' => $stockBreakdown,
            'workshopDetail' => $workshopDetail,
            'deliveryCalendar' => $deliveryCalendar,
        ]);
    }

    /**
     * Stock delivery calendar: group vouchers by stock_no, latest date_delivery per stock (with stock info).
     */
    private function getDeliveryCalendar(): array
    {
        $rows = DB::table('vouchers')
            ->leftJoin('stocks', 'stocks.stock_no', '=', 'vouchers.stock_no')
            ->whereNotNull('vouchers.stock_no')
            ->whereNull('vouchers.deleted_at')
            ->whereNotNull('vouchers.date_delivery')
            ->groupBy('vouchers.stock_no', 'stocks.thumbnail', 'stocks.product_categorization')
            ->select([
                'vouchers.stock_no',
                'stocks.thumbnail',
                'stocks.product_categorization',
                DB::raw('MAX(vouchers.date_delivery) as date_delivery'),
            ])
            ->orderBy('date_delivery')
            ->get();

        return $rows->map(function ($row) {
            return [
                'stock_no' => $row->stock_no,
                'date_delivery' => $row->date_delivery ? \Carbon\Carbon::parse($row->date_delivery)->format('Y-m-d') : null,
                'product_categorization' => $row->product_categorization,
                'thumbnail' => $row->thumbnail,
            ];
        })->values()->all();
    }

    /**
     * Workshop detail: item-level totals for vouchers currently in workshop (status = in_use).
     * Stones: from voucher_items (Product) – total weight/carats per product (Diamond, Emerald, etc.).
     * Metals: from Stock.metal (JSON) for stocks linked to vouchers in_use – sum grams by metal name.
     */
    private function getWorkshopDetail(): array
    {
        // Stones: voucher items for vouchers in_use, grouped by product name (all diamonds together, etc.)
        $stones = DB::table('voucher_items')
            ->join('vouchers', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('products', 'voucher_items.product_id', '=', 'products.id')
            ->where('vouchers.status', Voucher::STATUS_IN_USE)
            ->whereNull('vouchers.deleted_at')
            ->groupBy('products.id', 'products.name')
            ->select([
                'products.name',
                DB::raw('COALESCE(SUM(voucher_items.weight), 0) as total_carats'),
            ])
            ->get()
            ->filter(fn($row) => $row->name !== null)
            ->map(fn($row) => [
                'name' => $row->name,
                'total_carats' => round((float) $row->total_carats, 2),
            ])
            ->values()
            ->all();

        // Metals: from Voucher (in_use) join Stock – sum metal grams from stocks.metal JSON
        $stockNosInUse = Voucher::where('status', Voucher::STATUS_IN_USE)
            ->whereNull('deleted_at')
            ->distinct()
            ->pluck('stock_no')
            ->filter()
            ->values()
            ->all();

        $metalsByName = [];
        if (count($stockNosInUse) > 0) {
            $stocks = Stock::whereIn('stock_no', $stockNosInUse)->get();
            foreach ($stocks as $stock) {
                $data = $stock->metal_data;
                if (! is_array($data)) {
                    continue;
                }
                foreach ($data as $metalName => $info) {
                    if (! is_array($info)) {
                        continue;
                    }
                    $grams = isset($info['grams']) ? (float) $info['grams'] : 0;
                    $metalsByName[$metalName] = ($metalsByName[$metalName] ?? 0) + $grams;
                }
            }
        }

        $metals = collect($metalsByName)
            ->map(fn($totalWeight, $name) => [
                'name' => $name,
                'total_weight' => round($totalWeight, 2),
            ])
            ->values()
            ->sortBy('name')
            ->values()
            ->all();

        return [
            'stones' => $stones,
            'metals' => $metals,
        ];
    }

    /**
     * Stock count breakdown: total, items completed (by category), items in making (by category).
     * Uses same logic as VoucherGroupController: group by stock_no with voucher_items join;
     * "completed" = all vouchers for that stock are completed.
     */
    private function getStockBreakdown(): array
    {
        $rows = DB::table('vouchers')
            ->join('voucher_items', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('stocks', 'stocks.stock_no', '=', 'vouchers.stock_no')
            ->whereNull('vouchers.deleted_at')
            ->groupBy('vouchers.stock_no', 'stocks.product_categorization')
            ->select([
                'vouchers.stock_no',
                'stocks.product_categorization',
                DB::raw('(COUNT(DISTINCT CASE WHEN vouchers.status != \'' . Voucher::STATUS_COMPLETED . '\' THEN vouchers.id END) = 0) as all_completed'),
            ])
            ->get();

        $itemsCompletedByCategory = [];
        $itemsInMakingByCategory = [];
        $totalCompleted = 0;
        $totalInMaking = 0;

        foreach ($rows as $row) {
            $category = $row->product_categorization ?: 'Uncategorized';
            $completed = (bool) $row->all_completed;

            if ($completed) {
                $totalCompleted++;
                $itemsCompletedByCategory[$category] = ($itemsCompletedByCategory[$category] ?? 0) + 1;
            } else {
                $totalInMaking++;
                $itemsInMakingByCategory[$category] = ($itemsInMakingByCategory[$category] ?? 0) + 1;
            }
        }

        $totalStockCount = $totalCompleted + $totalInMaking;

        return [
            'total_stock_count' => $totalStockCount,
            'items_completed' => $totalCompleted,
            'items_completed_by_category' => $this->sortCategoriesByCount($itemsCompletedByCategory),
            'items_in_making' => $totalInMaking,
            'items_in_making_by_category' => $this->sortCategoriesByCount($itemsInMakingByCategory),
        ];
    }

    private function sortCategoriesByCount(array $byCategory): array
    {
        arsort($byCategory, SORT_NUMERIC);
        $out = [];
        foreach ($byCategory as $name => $count) {
            $out[] = ['category' => $name, 'count' => $count];
        }
        return $out;
    }

    /**
     * Build metal ledger: for each metal, total credit (from metal vouchers in_use), total debit (from stocks.metal grams), balance.
     */
    private function getMetalLedger(): array
    {
        // Credits: sum of weight from metal_voucher_items where metal_voucher.status = in_use, by metal_id
        $creditsByMetalId = MetalVoucherItem::query()
            ->join('metal_vouchers', 'metal_voucher_items.metal_voucher_id', '=', 'metal_vouchers.id')
            ->where('metal_vouchers.status', MetalVoucher::STATUS_IN_USE)
            ->selectRaw('metal_voucher_items.metal_id, COALESCE(SUM(metal_voucher_items.weight), 0) as total')
            ->groupBy('metal_voucher_items.metal_id')
            ->pluck('total', 'metal_id')
            ->map(fn($v) => (float) $v)
            ->all();

        // Debits: from stocks.metal JSON, sum grams by metal name (key in JSON)
        $debitsByMetalName = [];
        Stock::all()->each(function (Stock $stock) use (&$debitsByMetalName) {
            $data = $stock->metal_data;
            if (! is_array($data)) {
                return;
            }
            foreach ($data as $metalName => $info) {
                if (! is_array($info)) {
                    continue;
                }
                $grams = isset($info['grams']) ? (float) $info['grams'] : 0;
                $debitsByMetalName[$metalName] = ($debitsByMetalName[$metalName] ?? 0) + $grams;
            }
        });

        // Build ledger for all metals
        $metals = Metal::orderBy('name')->get();
        return $metals->map(function (Metal $metal) use ($creditsByMetalId, $debitsByMetalName) {
            $credit = (float) ($creditsByMetalId[$metal->id] ?? 0);
            $debit = (float) ($debitsByMetalName[$metal->name] ?? 0);
            return [
                'id' => $metal->id,
                'name' => $metal->name,
                'credit' => round($credit, 2),
                'debit' => round($debit, 2),
                'balance' => round($credit - $debit, 2),
            ];
        })->values()->all();
    }

    private function getReconciliationStatus()
    {
        // This would typically come from the latest reconciliation report
        // For now, we'll calculate expected vs actual from current data
        $locations = ['shop', 'transit', 'workshop', 'returned'];
        $status = [];

        foreach ($locations as $location) {
            $actual = InventoryItem::where('location', $location)->count();
            // In a real system, expected would come from reconciliation reports
            $expected = $actual + rand(-2, 2); // Mock expected value

            $status[] = [
                'location' => ucfirst($location),
                'expected' => $expected,
                'actual' => $actual,
                'status' => $expected === $actual ? 'match' : 'mismatch',
            ];
        }

        return $status;
    }
}
