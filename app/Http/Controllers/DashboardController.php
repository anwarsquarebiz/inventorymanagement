<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Voucher;
use App\Models\VoucherActivity;
use App\Models\ReconciliationReport;
use Illuminate\Http\Request;
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
            'pending' => Voucher::where('status', 'pending')->count(),
            'approved' => Voucher::where('status', 'approved')->count(),
            'in_transit' => Voucher::where('status', 'in_transit')->count(),
            'received' => Voucher::where('status', 'received')->count(),
            'returned' => Voucher::where('status', 'returned')->count(),
        ];

        // Get voucher item group by stock_no
        $stockNoStats = Voucher::select('stock_no')->get()->unique('stock_no')->count();

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

        // Calculate KPIs with trends (mock data for now - can be enhanced with historical data)
        $kpis = [
            // Voucher by stock_no
            [
                'title' => 'Total Stock Count',
                'value' => $stockNoStats,
                'change' => '0%',
                'trend' => 'neutral',
                'color' => 'text-blue-600 bg-blue-50',
                'link' => route('vouchers-groups.index'),
                'colspan' => 'col-span-2',
            ],
            [
                'title' => 'Total Vouchers',
                'value' => number_format($voucherStats['pending'] + $voucherStats['approved'] + $voucherStats['in_transit'] + $voucherStats['received'] + $voucherStats['returned']),
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
        ]);
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
