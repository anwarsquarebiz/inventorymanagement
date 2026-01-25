<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VoucherGroupController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->get('search', ''));

        $query = DB::table('vouchers')
            ->join('voucher_items', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('stocks', 'stocks.stock_no', '=', 'vouchers.stock_no')
            ->when($search !== '', function ($q) use ($search) {
                $q->where('vouchers.stock_no', 'like', "%{$search}%");
            })
            ->groupBy('vouchers.stock_no', 'stocks.thumbnail', 'stocks.metal')
            ->select([
                'vouchers.stock_no',
                'stocks.thumbnail',
                'stocks.metal',
                DB::raw('COUNT(DISTINCT vouchers.id) as vouchers_count'),
                DB::raw('COALESCE(SUM(voucher_items.pcs),0) as total_pcs'),
                DB::raw('COALESCE(SUM(voucher_items.weight),0) as total_weight'),
                DB::raw('MIN(vouchers.date_given) as first_date'),
                DB::raw('MAX(vouchers.date_delivery) as last_date'),
            ])
            ->orderBy('vouchers.stock_no');

        $groups = $query->paginate(20)->withQueryString();

        return Inertia::render('Vouchers/Groups/Index', [
            'groups' => $groups,
            'filters' => ['search' => $search],
        ]);
    }
    
    public function show(string $stock_no): Response
    {
        $vouchers = DB::table('vouchers')
            ->where('stock_no', $stock_no)
            ->orderByDesc('date_given')
            ->select(['id', 'voucher_no', 'date_given', 'date_delivery', 'status', 'person_in_charge', 'created_at'])
            ->get();

        $items = DB::table('voucher_items')
            ->join('vouchers', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('products', 'products.id', '=', 'voucher_items.product_id')
            ->where('vouchers.stock_no', $stock_no)
            ->orderByDesc('vouchers.date_given')
            ->select([
                'vouchers.id as voucher_id',
                'vouchers.voucher_no',
                'vouchers.date_given',
                'vouchers.date_delivery',
                'vouchers.status',
                'products.name as product_name',
                'voucher_items.shape',
                'voucher_items.pcs',
                'voucher_items.weight',
                'voucher_items.code',
                'voucher_items.remarks',
                'voucher_items.temporary_return',
            ])
            ->get();

        $stock = DB::table('stocks')
            ->where('stock_no', $stock_no)
            ->select(['stock_no', 'thumbnail', 'metal', 'products_used', 'product_categorization'])
            ->first();

        $summary = [
            'stock_no' => $stock_no,
            'vouchers_count' => $vouchers->count(),
            'total_pcs' => (int) $items->sum('pcs'),
            'total_weight' => (float) $items->sum('weight'),
        ];

        return Inertia::render('Vouchers/Groups/Show', [
            'stockNo' => $stock_no,
            'stock' => $stock,
            'summary' => $summary,
            'vouchers' => $vouchers,
            'items' => $items,
        ]);
    }

    public function export(Request $request)
    {
        $search = trim((string) $request->get('search', ''));

        $rows = DB::table('voucher_items')
            ->join('vouchers', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('products', 'products.id', '=', 'voucher_items.product_id')
            ->leftJoin('stocks', 'stocks.stock_no', '=', 'vouchers.stock_no')
            ->when($search !== '', function ($q) use ($search) {
                $q->where('vouchers.stock_no', 'like', "%{$search}%");
            })
            ->select([
                'vouchers.stock_no',
                'vouchers.voucher_no',
                'products.name as product_name',
                'voucher_items.shape',
                'voucher_items.pcs',
                'voucher_items.weight',
                'voucher_items.code',
                'voucher_items.remarks',
                'voucher_items.temporary_return',
                'stocks.thumbnail',
                'stocks.metal',
            ])
            ->orderBy('vouchers.stock_no')
            ->orderBy('vouchers.voucher_no')
            ->orderBy('voucher_items.id')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="voucher_items.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, ['Stock', 'Voucher No', 'Product', 'Shape', 'Pcs', 'Weight (ct)', 'Code', 'Remarks', 'Temporary Return', 'Thumbnail', 'Metal']);
            foreach ($rows as $r) {
                fputcsv($handle, [
                    $r->stock_no,
                    $r->voucher_no,
                    $r->product_name ?? '-',
                    $r->shape,
                    $r->pcs,
                    number_format((float)$r->weight, 2, '.', ''),
                    $r->code ?? '-',
                    $r->remarks ?? '-',
                    $r->temporary_return ? 'Yes' : 'No',
                    $r->thumbnail ? ('/storage/' . $r->thumbnail) : '-',
                    $r->metal ?? '-',
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportItems(string $stock_no)
    {
        $items = DB::table('voucher_items')
            ->join('vouchers', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('products', 'products.id', '=', 'voucher_items.product_id')
            ->where('vouchers.stock_no', $stock_no)
            ->orderByDesc('vouchers.date_given')
            ->orderBy('voucher_items.id')
            ->select([
                'vouchers.voucher_no',
                'vouchers.date_given',
                'vouchers.date_delivery',
                'vouchers.status',
                'products.name as product_name',
                'voucher_items.shape',
                'voucher_items.pcs',
                'voucher_items.weight',
                'voucher_items.code',
                'voucher_items.remarks',
                'voucher_items.temporary_return',
            ])
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="stock_' . $stock_no . '_items.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($items) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, ['Voucher No', 'Date Given', 'Date Delivery', 'Status', 'Product', 'Shape', 'Pcs', 'Weight (ct)', 'Code', 'Remarks', 'Temporary Return']);
            foreach ($items as $item) {
                fputcsv($handle, [
                    $item->voucher_no,
                    $item->date_given,
                    $item->date_delivery,
                    ucfirst(str_replace('_', ' ', $item->status)),
                    $item->product_name ?? '-',
                    $item->shape,
                    $item->pcs,
                    number_format((float)$item->weight, 2, '.', ''),
                    $item->code ?? '-',
                    $item->remarks ?? '-',
                    $item->temporary_return ? 'Yes' : 'No',
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
