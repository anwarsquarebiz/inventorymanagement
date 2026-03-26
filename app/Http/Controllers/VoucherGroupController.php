<?php

namespace App\Http\Controllers;

use App\Models\ProductCategorization;
use App\Models\Stock;
use App\Models\Voucher;
use App\Models\VoucherActivity;
use App\Models\AuditLog;
use App\Models\VoucherItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Dompdf\Dompdf;
use Dompdf\Options;

class VoucherGroupController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->get('search', ''));
        $category = trim((string) $request->get('category', ''));
        $stockPrefix = trim((string) $request->get('stock_prefix', ''));
        $status = trim((string) $request->get('status', ''));

        $allowedPrefixes = ['ST', 'D', 'R'];
        $stockPrefixValid = $stockPrefix !== '' && in_array($stockPrefix, $allowedPrefixes, true);

        $query = DB::table('vouchers')
            ->join('voucher_items', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('stocks', 'stocks.stock_no', '=', 'vouchers.stock_no')
            ->where('vouchers.deleted_at', null)
            ->when($search !== '', function ($q) use ($search) {
                $q->where('vouchers.stock_no', 'like', "%{$search}%");
            })
            ->when($category !== '', function ($q) use ($category) {
                $q->where('stocks.product_categorization', $category);
            })
            ->when($stockPrefixValid, function ($q) use ($stockPrefix) {
                $q->where('vouchers.stock_no', 'like', $stockPrefix . '%');
            })
            ->groupBy('vouchers.stock_no', 'stocks.thumbnail', 'stocks.metal', 'stocks.product_categorization')
            ->select([
                'vouchers.stock_no',
                'stocks.thumbnail',
                'stocks.metal',
                'stocks.product_categorization',
                DB::raw('COUNT(DISTINCT vouchers.id) as vouchers_count'),
                DB::raw('COUNT(voucher_items.id) as total_items'),
                DB::raw('COALESCE(SUM(voucher_items.pcs),0) as total_pcs'),
                DB::raw('COALESCE(SUM(voucher_items.weight),0) as total_weight'),
                DB::raw('MIN(vouchers.date_given) as first_date'),
                DB::raw('MAX(vouchers.date_delivery) as last_date'),
                DB::raw('(COUNT(DISTINCT CASE WHEN vouchers.status != \'' . Voucher::STATUS_COMPLETED . '\' THEN vouchers.id END) = 0) as all_completed'),
            ])
            ->when($status === 'completed', function ($q) {
                $q->havingRaw('(COUNT(DISTINCT CASE WHEN vouchers.status != ? THEN vouchers.id END) = 0)', [Voucher::STATUS_COMPLETED]);
            })
            ->when($status === 'in_progress', function ($q) {
                $q->havingRaw('(COUNT(DISTINCT CASE WHEN vouchers.status != ? THEN vouchers.id END) > 0)', [Voucher::STATUS_COMPLETED]);
            })
            ->orderBy('vouchers.stock_no');

        $groups = $query->paginate(20)->withQueryString();

        $categories = ProductCategorization::orderBy('name')->pluck('name');

        return Inertia::render('Vouchers/Groups/Index', [
            'groups' => $groups,
            'filters' => ['search' => $search, 'category' => $category, 'stock_prefix' => $stockPrefixValid ? $stockPrefix : '', 'status' => $status],
            'categories' => $categories,
        ]);
    }

    public function show(Request $request, string $stock_no): Response
    {
        $vouchers = DB::table('vouchers')
            ->where('stock_no', $stock_no)
            ->where('deleted_at', null)
            ->orderByDesc('date_given')
            ->select(['id', 'voucher_no', 'date_given', 'date_delivery', 'status', 'person_in_charge', 'created_at', 'updated_at'])
            ->get();

        $items = DB::table('voucher_items')
            ->join('vouchers', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('products', 'products.id', '=', 'voucher_items.product_id')
            ->where('deleted_at', null)
            ->where('vouchers.stock_no', $stock_no)
            ->orderByDesc('vouchers.date_given')
            ->select([
                'voucher_items.id',
                'vouchers.id as voucher_id',
                'vouchers.voucher_no',
                'vouchers.date_given',
                'vouchers.date_delivery',
                'vouchers.status',
                'products.name as product_name',
                'voucher_items.shape',
                'voucher_items.pcs',
                'voucher_items.pcs_used',
                'voucher_items.pcs_returned',
                'voucher_items.weight',
                'voucher_items.weight_used',
                'voucher_items.weight_returned',
                'voucher_items.code',
                'voucher_items.remarks',
                'voucher_items.temporary_return',
                'voucher_items.reviewed',
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

        $allCompleted = $vouchers->count() > 0
            ? $vouchers->every(function ($voucher) {
                return $voucher->status === Voucher::STATUS_COMPLETED;
            })
            : false;

        $backPage = $request->integer('page', 1);
        $backSearch = trim((string) $request->get('search', ''));
        $backCategory = trim((string) $request->get('category', ''));
        $backStockPrefix = trim((string) $request->get('stock_prefix', ''));
        $backStatus = trim((string) $request->get('status', ''));

        return Inertia::render('Vouchers/Groups/Show', [
            'stockNo' => $stock_no,
            'stock' => $stock,
            'summary' => $summary,
            'vouchers' => $vouchers,
            'items' => $items,
            'allCompleted' => $allCompleted,
            'backPage' => $backPage > 1 ? $backPage : null,
            'backSearch' => $backSearch !== '' ? $backSearch : null,
            'backCategory' => $backCategory !== '' ? $backCategory : null,
            'backStockPrefix' => $backStockPrefix !== '' ? $backStockPrefix : null,
            'backStatus' => $backStatus !== '' ? $backStatus : null,
        ]);
    }

    /**
     * Update stock number for this group (stocks table + all related vouchers).
     */
    public function updateStockNo(Request $request, string $stock_no)
    {
        $validated = $request->validate([
            'new_stock_no' => ['required', 'string', 'max:255'],
        ]);

        $newStockNo = trim($validated['new_stock_no']);

        if ($newStockNo === '') {
            return redirect()->back()->withErrors(['new_stock_no' => 'Stock number cannot be empty.']);
        }

        if ($newStockNo === $stock_no) {
            return redirect()->back();
        }

        if (Stock::where('stock_no', $newStockNo)->exists()) {
            return redirect()->back()->withErrors(['new_stock_no' => 'A stock with this number already exists.']);
        }

        DB::transaction(function () use ($stock_no, $newStockNo) {
            Voucher::where('stock_no', $stock_no)->update(['stock_no' => $newStockNo]);
            Stock::where('stock_no', $stock_no)->update(['stock_no' => $newStockNo]);
        });

        $backPage = $request->integer('page', 1);
        $backSearch = trim((string) $request->get('search', ''));
        $backCategory = trim((string) $request->get('category', ''));
        $backStockPrefix = trim((string) $request->get('stock_prefix', ''));
        $backStatus = trim((string) $request->get('status', ''));

        $query = array_filter([
            'page' => $backPage > 1 ? $backPage : null,
            'search' => $backSearch !== '' ? $backSearch : null,
            'category' => $backCategory !== '' ? $backCategory : null,
            'stock_prefix' => $backStockPrefix !== '' ? $backStockPrefix : null,
            'status' => $backStatus !== '' ? $backStatus : null,
        ]);

        return redirect()->route('vouchers-groups.show', ['stock_no' => $newStockNo] + $query);
    }

    public function exportPdf(string $stock_no)
    {
        // Reuse the same data as the show method
        $vouchers = DB::table('vouchers')
            ->where('stock_no', $stock_no)
            ->where('deleted_at', null)
            ->orderByDesc('date_given')
            ->select(['id', 'voucher_no', 'date_given', 'date_delivery', 'status', 'person_in_charge', 'notes', 'created_at', 'updated_at'])
            ->get();

        // $items = DB::table('voucher_items')
        //     ->join('vouchers', 'voucher_items.voucher_id', '=', 'vouchers.id')
        //     ->leftJoin('products', 'products.id', '=', 'voucher_items.product_id')
        //     ->where('vouchers.stock_no', $stock_no)
        //     ->orderByDesc('vouchers.date_given')
        //     ->select([
        //         'voucher_items.id',
        //         'vouchers.id as voucher_id',
        //         'vouchers.voucher_no',
        //         'vouchers.created_at',
        //         'vouchers.date_given',
        //         'vouchers.date_delivery',
        //         'vouchers.status',
        //         'products.name as product_name',
        //         'voucher_items.shape',
        //         'voucher_items.pcs',
        //         'voucher_items.pcs_used',
        //         'voucher_items.pcs_returned',
        //         'voucher_items.weight',
        //         'voucher_items.weight_used',
        //         'voucher_items.weight_returned',
        //         'voucher_items.code',
        //         'voucher_items.remarks',
        //         'voucher_items.temporary_return',
        //     ])
        //     ->get();

        $items = DB::table('voucher_items')
            ->join('vouchers', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('products', 'products.id', '=', 'voucher_items.product_id')
            ->where('vouchers.stock_no', $stock_no)
            ->groupBy([
                'voucher_items.code',
                'products.name',
                'voucher_items.shape'
            ])
            ->select([
                DB::raw('MIN(vouchers.voucher_no) as voucher_no'),
                DB::raw('MIN(vouchers.date_given) as date_given'),
                'products.name as product_name',
                'voucher_items.shape',
                DB::raw('SUM(voucher_items.pcs_used) as pcs_used'),
                DB::raw('SUM(voucher_items.weight_used) as weight_used'),
                'voucher_items.code',
                DB::raw('COUNT(*) as item_count'),
            ])
            ->orderBy('products.name')
            ->orderBy('voucher_items.shape')
            ->orderBy('voucher_items.code')
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

        $allCompleted = $vouchers->count() > 0
            ? $vouchers->every(function ($voucher) {
                return $voucher->status === Voucher::STATUS_COMPLETED;
            })
            : false;

        // Configure Dompdf
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'Arial');

        $dompdf = new Dompdf($options);

        // Generate HTML for PDF
        $html = view('vouchers.groups.pdf', [
            'stockNo' => $stock_no,
            'stock' => $stock,
            'summary' => $summary,
            'vouchers' => $vouchers,
            'items' => $items,
            'allCompleted' => $allCompleted,
        ])->render();

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // return response($html);

        return response()->streamDownload(function () use ($dompdf) {
            echo $dompdf->output();
        }, "stock-{$stock_no}-vouchers.pdf", [
            'Content-Type' => 'application/pdf',
        ]);
    }

    public function export(Request $request)
    {
        $search = trim((string) $request->get('search', ''));
        $category = trim((string) $request->get('category', ''));
        $stockPrefix = trim((string) $request->get('stock_prefix', ''));
        $allowedPrefixes = ['ST', 'D', 'R'];
        $stockPrefixValid = $stockPrefix !== '' && in_array($stockPrefix, $allowedPrefixes, true);

        $rows = DB::table('voucher_items')
            ->join('vouchers', 'voucher_items.voucher_id', '=', 'vouchers.id')
            ->leftJoin('products', 'products.id', '=', 'voucher_items.product_id')
            ->leftJoin('stocks', 'stocks.stock_no', '=', 'vouchers.stock_no')
            ->when($search !== '', function ($q) use ($search) {
                $q->where('vouchers.stock_no', 'like', "%{$search}%");
            })
            ->when($category !== '', function ($q) use ($category) {
                $q->where('stocks.product_categorization', $category);
            })
            ->when($stockPrefixValid, function ($q) use ($stockPrefix) {
                $q->where('vouchers.stock_no', 'like', $stockPrefix . '%');
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
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
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
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
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

    public function updateItemUsage(Request $request, VoucherItem $item)
    {
        $data = $request->validate([
            'pcs_used' => ['nullable', 'integer', 'min:0'],
            'pcs_returned' => ['nullable', 'integer', 'min:0'],
            'weight_used' => ['nullable', 'numeric', 'min:0'],
            'weight_returned' => ['nullable', 'numeric', 'min:0'],
            'reviewed' => ['nullable', 'boolean'],
        ]);

        $item->update($data);

        return back()->with('success', 'Voucher item usage updated.');
    }

    public function complete(string $stock_no)
    {
        try {
            // Check if user is authenticated
            $userId = Auth::id();
            if (!$userId) {
                Log::error('VoucherGroupController::complete - User not authenticated', [
                    'stock_no' => $stock_no,
                ]);
                return redirect()
                    ->route('vouchers-groups.show', $stock_no)
                    ->with('error', 'You must be logged in to complete vouchers.');
            }

            Log::info('VoucherGroupController::complete - Starting', [
                'stock_no' => $stock_no,
                'user_id' => $userId,
            ]);

            $processedCount = 0;
            $skippedCount = 0;
            $errorCount = 0;
            $errors = [];

            DB::transaction(function () use ($stock_no, $userId, &$processedCount, &$skippedCount, &$errorCount, &$errors) {
                // Get all vouchers (excluding soft-deleted for debugging)
                $allVouchers = Voucher::where('stock_no', $stock_no)->where('deleted_at', null)->get();
                $vouchers = Voucher::where('stock_no', $stock_no)->where('deleted_at', null)->get();

                // Log all vouchers for debugging
                Log::info('VoucherGroupController::complete - All vouchers (including deleted)', [
                    'stock_no' => $stock_no,
                    'total_count' => $allVouchers->count(),
                    'active_count' => $vouchers->count(),
                    'vouchers' => $allVouchers->map(function ($v) {
                        return [
                            'id' => $v->id,
                            'voucher_no' => $v->voucher_no,
                            'status' => $v->status,
                            'deleted_at' => $v->deleted_at ? $v->deleted_at->toDateTimeString() : null,
                        ];
                    })->toArray(),
                ]);

                Log::info('VoucherGroupController::complete - Active vouchers found', [
                    'stock_no' => $stock_no,
                    'count' => $vouchers->count(),
                    'vouchers' => $vouchers->map(function ($v) {
                        return [
                            'id' => $v->id,
                            'voucher_no' => $v->voucher_no,
                            'status' => $v->status,
                        ];
                    })->toArray(),
                ]);

                if ($vouchers->isEmpty()) {
                    Log::warning('VoucherGroupController::complete - No active vouchers found', [
                        'stock_no' => $stock_no,
                        'total_with_deleted' => $allVouchers->count(),
                    ]);
                    return;
                }

                foreach ($vouchers as $voucher) {
                    try {
                        // Skip if already completed
                        if ($voucher->status === Voucher::STATUS_COMPLETED) {
                            $skippedCount++;
                            Log::debug('VoucherGroupController::complete - Skipping already completed voucher', [
                                'voucher_id' => $voucher->id,
                                'voucher_no' => $voucher->voucher_no,
                                'status' => $voucher->status,
                            ]);
                            continue;
                        }

                        $oldStatus = $voucher->status;

                        Log::debug('VoucherGroupController::complete - Processing voucher', [
                            'voucher_id' => $voucher->id,
                            'voucher_no' => $voucher->voucher_no,
                            'old_status' => $oldStatus,
                        ]);

                        // Update voucher status
                        $voucher->update(['status' => Voucher::STATUS_COMPLETED]);

                        Log::debug('VoucherGroupController::complete - Voucher status updated', [
                            'voucher_id' => $voucher->id,
                            'new_status' => $voucher->status,
                        ]);

                        // Create activity log
                        try {
                            VoucherActivity::create([
                                'voucher_id' => $voucher->id,
                                'action' => 'completed',
                                'user_id' => $userId,
                                'description' => 'Voucher completed via stock group',
                                'timestamp' => now(),
                            ]);
                            Log::debug('VoucherGroupController::complete - Activity created', [
                                'voucher_id' => $voucher->id,
                            ]);
                        } catch (\Exception $e) {
                            Log::error('VoucherGroupController::complete - Failed to create activity', [
                                'voucher_id' => $voucher->id,
                                'error' => $e->getMessage(),
                                'trace' => $e->getTraceAsString(),
                            ]);
                            // Continue even if activity creation fails
                        }

                        // Create audit log
                        try {
                            AuditLog::log(
                                $voucher,
                                'COMPLETE',
                                $userId,
                                ['status' => $oldStatus],
                                ['status' => Voucher::STATUS_COMPLETED]
                            );
                            Log::debug('VoucherGroupController::complete - Audit log created', [
                                'voucher_id' => $voucher->id,
                            ]);
                        } catch (\Exception $e) {
                            Log::error('VoucherGroupController::complete - Failed to create audit log', [
                                'voucher_id' => $voucher->id,
                                'error' => $e->getMessage(),
                                'trace' => $e->getTraceAsString(),
                            ]);
                            // Continue even if audit log creation fails
                        }

                        $processedCount++;
                    } catch (\Exception $e) {
                        $errorCount++;
                        $errorMessage = "Failed to complete voucher {$voucher->voucher_no}: " . $e->getMessage();
                        $errors[] = $errorMessage;

                        Log::error('VoucherGroupController::complete - Error processing voucher', [
                            'voucher_id' => $voucher->id,
                            'voucher_no' => $voucher->voucher_no,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);

                        // Continue processing other vouchers
                    }
                }
            });

            Log::info('VoucherGroupController::complete - Completed', [
                'stock_no' => $stock_no,
                'processed' => $processedCount,
                'skipped' => $skippedCount,
                'errors' => $errorCount,
            ]);

            // Build success message
            $message = "Successfully completed {$processedCount} voucher(s)";
            if ($skippedCount > 0) {
                $message .= ", {$skippedCount} already completed";
            }
            if ($errorCount > 0) {
                $message .= ", {$errorCount} failed";
            }
            $message .= ".";

            $redirect = redirect()
                ->route('vouchers-groups.show', $stock_no);

            if ($errorCount > 0) {
                return $redirect
                    ->with('warning', $message)
                    ->with('errors', $errors);
            }

            return $redirect->with('success', $message);
        } catch (\Exception $e) {
            Log::error('VoucherGroupController::complete - Fatal error', [
                'stock_no' => $stock_no,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->route('vouchers-groups.show', $stock_no)
                ->with('error', 'An error occurred while completing vouchers: ' . $e->getMessage());
        }
    }
}
