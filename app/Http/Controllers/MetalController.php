<?php

namespace App\Http\Controllers;

use App\Models\Metal;
use App\Models\MetalVoucherItem;
use App\Models\Stock;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;
use Dompdf\Dompdf;
use Dompdf\Options;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Services\MetalMonthlyDebitCalculator;

class MetalController extends Controller
{
    /**
     * Map a metal voucher line to a ledger row (negative weight → negative debit / loss adjustment).
     */
    private static function ledgerRowFromMetalVoucherItem(MetalVoucherItem $item): array
    {
        $v = $item->metalVoucher;
        $w = (float) $item->weight;
        if ($w < 0) {
            $isRepairAdjustment = strcasecmp((string) ($item->remarks ?? ''), 'Repair items adjustment') === 0;
            return [
                'date' => $v ? $v->date_given?->format('Y-m-d') : null,
                'particulars' => $isRepairAdjustment
                    ? 'Repair items adjustment'
                    : ($v ? "Loss adjustment — Metal Voucher {$v->voucher_no}" : 'Loss adjustment'),
                'credit' => 0,
                'debit' => $w,
                'type' => 'debit',
            ];
        }

        return [
            'date' => $v ? $v->date_given?->format('Y-m-d') : null,
            'particulars' => $v ? "Metal Voucher {$v->voucher_no}" : 'Metal Voucher',
            'credit' => $w,
            'debit' => 0,
            'type' => 'credit',
        ];
    }

    /**
     * Metal usage summary: for each metal, total credit (from metal vouchers), total debit (from stocks.metal), balance.
     */
    public function usage(Request $request): Response
    {
        // Credits: sum of weight from metal_voucher_items by metal_id
        $creditsByMetalId = MetalVoucherItem::query()
            ->selectRaw('metal_id, COALESCE(SUM(weight), 0) as total')
            ->groupBy('metal_id')
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

        $metals = Metal::orderBy('name')->get()->map(function (Metal $metal) use ($creditsByMetalId, $debitsByMetalName) {
            $credit = (float) ($creditsByMetalId[$metal->id] ?? 0);
            $debit = (float) ($debitsByMetalName[$metal->name] ?? 0);
            return [
                'id' => $metal->id,
                'name' => $metal->name,
                'total_credit' => round($credit, 2),
                'total_debit' => round($debit, 2),
                'balance' => round($credit - $debit, 2),
            ];
        });

        return Inertia::render('MetalUsage/Index', [
            'metals' => $metals,
        ]);
    }

    /**
     * Metal-wise ledger: credit entries from metal vouchers, debit entries from stocks.metal for this metal.
     */
    public function ledger(Request $request, Metal $metal): Response
    {
        $metalName = $metal->name;

        // Credit entries: each metal_voucher_item for this metal with voucher info
        $creditEntries = MetalVoucherItem::query()
            ->where('metal_id', $metal->id)
            ->with('metalVoucher:id,voucher_no,date_given')            
            ->orderBy('id')
            ->get()
            ->map(fn (MetalVoucherItem $item) => self::ledgerRowFromMetalVoucherItem($item))
            ->all();

        // Debit entries: from stocks where metal_data contains this metal name
        $debitEntries = [];
        Stock::all()->each(function (Stock $stock) use ($metalName, &$debitEntries) {
            $data = $stock->metal_data;
            if (! is_array($data) || ! isset($data[$metalName]) || ! is_array($data[$metalName])) {
                return;
            }
            $grams = isset($data[$metalName]['grams']) ? (float) $data[$metalName]['grams'] : 0;
            if ($grams <= 0) {
                return;
            }
            $debitEntries[] = [
                'date' => $stock->updated_at?->format('Y-m-d'),
                'particulars' => "Stock {$stock->stock_no}",
                'credit' => 0,
                'debit' => $grams,
                'type' => 'debit',
            ];
        });

        // Merge and sort by date, then by type (credit first for same date)
        // $allEntries = collect(array_merge($creditEntries, $debitEntries))
        //     ->sortBy([
        //         fn ($a) => $a['date'] ?? '',
        //         fn ($a) => $a['type'] === 'debit' ? 1 : 0,
        //     ])
        //     ->values();

        $allEntries = collect(array_merge($creditEntries, $debitEntries))
            ->sortBy([
                ['date', 'asc'],
                // ['type', 'asc'], // credit before debit
            ])
            ->values();

        // Running balance on full sorted list
        $running = 0;
        $allEntries = $allEntries->map(function ($row) use (&$running) {
            $running += $row['credit'] - $row['debit'];
            $row['balance'] = round($running, 2);
            return $row;
        });

        // Filters: date_from, date_to, particulars (search)
        $dateFrom = $request->filled('date_from') ? $request->get('date_from') : null;
        $dateTo = $request->filled('date_to') ? $request->get('date_to') : null;
        $particulars = $request->filled('particulars') ? trim($request->get('particulars')) : null;

        $filtered = $allEntries->filter(function ($row) use ($dateFrom, $dateTo, $particulars) {
            if ($dateFrom !== null && ($row['date'] ?? '') < $dateFrom) {
                return false;
            }
            if ($dateTo !== null && ($row['date'] ?? '') > $dateTo) {
                return false;
            }
            if ($particulars !== null && $particulars !== '') {
                if (stripos($row['particulars'] ?? '', $particulars) === false) {
                    return false;
                }
            }
            return true;
        })->values();

        $perPage = 15;
        $currentPage = (int) $request->get('page', 1);
        $slice = $filtered->slice(($currentPage - 1) * $perPage, $perPage)->values()->all();

        $paginator = new LengthAwarePaginator(
            $slice,
            $filtered->count(),
            $perPage,
            $currentPage,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('MetalUsage/Ledger', [
            'metal' => ['id' => $metal->id, 'name' => $metal->name],
            'entries' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'links' => $paginator->linkCollection()->toArray(),
            ],
            'filters' => $request->only(['date_from', 'date_to', 'particulars']),
        ]);
    }

    /**
     * JSON: total metal debit (grams from stock usage) for stocks with updated_at between date_from and date_to (inclusive).
     * Debit rows match the ledger: stocks.metal JSON keyed by metal name, dated by updated_at.
     */
    public function monthlyDebit(Request $request, Metal $metal)
    {
        $validated = $request->validate([
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);

        $dateFromYmd = Carbon::parse($validated['date_from'])->format('Y-m-d');
        $dateToYmd = Carbon::parse($validated['date_to'])->format('Y-m-d');
        $total = MetalMonthlyDebitCalculator::totalGramsForDateRange($metal, $dateFromYmd, $dateToYmd);

        return response()->json([
            'metal' => [
                'id' => $metal->id,
                'name' => $metal->name,
            ],
            'date_from' => $dateFromYmd,
            'date_to' => $dateToYmd,
            'total_debit' => round($total, 2),
        ]);
    }

    /**
     * Download a metal ledger statement grouped by month (opening/closing + all debits/credits).
     */
    public function exportStatementPdf(Request $request, Metal $metal)
    {
        $validated = $request->validate([
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);

        $dateFromYmd = Carbon::parse($validated['date_from'])->format('Y-m-d');
        $dateToYmd = Carbon::parse($validated['date_to'])->format('Y-m-d');

        // Latest month we need to consider for building transactions.
        $cursorMonth = Carbon::parse($dateFromYmd)->startOfMonth();
        $endMonth = Carbon::parse($dateToYmd)->startOfMonth();
        $lastMonthEndYmd = $endMonth->copy()->endOfMonth()->format('Y-m-d');

        $metalName = $metal->name;

        // Credit entries (metal vouchers) - only include dates up to lastMonthEnd.
        $creditEntries = MetalVoucherItem::query()
            ->where('metal_id', $metal->id)
            ->whereHas('metalVoucher', function ($q) use ($lastMonthEndYmd) {
                $q->whereDate('date_given', '<=', $lastMonthEndYmd);
            })
            ->with('metalVoucher:id,voucher_no,date_given')
            ->orderBy('id')
            ->get()
            ->map(fn (MetalVoucherItem $item) => self::ledgerRowFromMetalVoucherItem($item))
            ->all();

        // Debit entries (stock usage from stocks.metal JSON) - only include stocks up to lastMonthEnd.
        $debitEntries = [];
        Stock::query()
            ->whereDate('updated_at', '<=', $lastMonthEndYmd)
            // `stocks` may not have an `id` column (primary key can be `stock_no`),
            // so sort by a stable existing column.
            ->orderBy('stock_no')
            ->get()
            ->each(function (Stock $stock) use ($metalName, &$debitEntries) {
                $data = $stock->metal_data;
                if (! is_array($data) || ! isset($data[$metalName]) || ! is_array($data[$metalName])) {
                    return;
                }

                $grams = isset($data[$metalName]['grams']) ? (float) $data[$metalName]['grams'] : 0;
                if ($grams <= 0) {
                    return;
                }

                $debitEntries[] = [
                    'date' => $stock->updated_at?->format('Y-m-d'),
                    'particulars' => "Stock {$stock->stock_no}",
                    'credit' => 0.0,
                    'debit' => (float) $grams,
                    'type' => 'debit',
                ];
            });

        // Merge + sort exactly like the ledger page (by date only).
        $allEntries = collect(array_merge($creditEntries, $debitEntries))
            ->filter(function ($row) {
                return ! empty($row['date']);
            })
            ->sortBy([
                ['date', 'asc'],
            ])
            ->values()
            ->all();

        $entriesCount = count($allEntries);
        $entryIndex = 0;
        $runningBalance = 0.0;

        // Opening for the first segment needs all rows before the statement start date.
        while ($entryIndex < $entriesCount && ($allEntries[$entryIndex]['date'] ?? '') < $dateFromYmd) {
            $runningBalance += ((float) $allEntries[$entryIndex]['credit']) - ((float) $allEntries[$entryIndex]['debit']);
            $entryIndex++;
        }

        $months = [];
        while ($cursorMonth <= $endMonth) {
            $monthStartYmd = $cursorMonth->copy()->startOfMonth()->format('Y-m-d');
            $monthEndYmd = $cursorMonth->copy()->endOfMonth()->format('Y-m-d');

            // Segment start/end are the overlap of this month with the requested statement period.
            $segmentStartYmd = $monthStartYmd < $dateFromYmd ? $dateFromYmd : $monthStartYmd;
            $segmentEndYmd = $monthEndYmd > $dateToYmd ? $dateToYmd : $monthEndYmd;

            // Advance running balance up to (but excluding) segment start.
            while ($entryIndex < $entriesCount && ($allEntries[$entryIndex]['date'] ?? '') < $segmentStartYmd) {
                $runningBalance += ((float) $allEntries[$entryIndex]['credit']) - ((float) $allEntries[$entryIndex]['debit']);
                $entryIndex++;
            }

            $openingBalance = round($runningBalance, 2);
            $monthEntries = [];

            // Consume entries within this month segment.
            while ($entryIndex < $entriesCount && ($allEntries[$entryIndex]['date'] ?? '') <= $segmentEndYmd) {
                $row = $allEntries[$entryIndex];
                $runningBalance += ((float) $row['credit']) - ((float) $row['debit']);

                if (($row['date'] ?? '') >= $segmentStartYmd && ($row['date'] ?? '') <= $segmentEndYmd) {
                    $monthEntries[] = [
                        'date' => $row['date'],
                        'particulars' => $row['particulars'],
                        'credit' => round((float) $row['credit'], 2),
                        'debit' => round((float) $row['debit'], 2),
                        'balance' => round($runningBalance, 2),
                    ];
                }

                $entryIndex++;
            }

            $closingBalance = round($runningBalance, 2);

            $months[] = [
                'start' => $segmentStartYmd,
                'end' => $segmentEndYmd,
                'opening' => $openingBalance,
                'closing' => $closingBalance,
                'entries' => $monthEntries,
            ];

            $cursorMonth->addMonth();
        }

        // Totals for header display.
        $totalCredits = 0.0;
        $totalDebits = 0.0;
        foreach ($months as $m) {
            foreach ($m['entries'] as $e) {
                $totalCredits += (float) $e['credit'];
                $totalDebits += (float) $e['debit'];
            }
        }

        // Generate HTML for PDF
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'Arial');

        $dompdf = new Dompdf($options);

        $html = view('metal-usage.statement-pdf', [
            'metalName' => $metal->name,
            'dateFromYmd' => $dateFromYmd,
            'dateToYmd' => $dateToYmd,
            'months' => $months,
            'totalCredits' => round($totalCredits, 2),
            'totalDebits' => round($totalDebits, 2),
        ])->render();

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // Reuse existing enum value in audit_logs to avoid MySQL enum truncation.
        AuditLog::log($metal, 'EXPORT_PDF', Auth::id());

        $safeMetalName = preg_replace('/[^A-Za-z0-9_-]+/', '_', (string) $metal->name);
        $fileName = sprintf(
            'metal-%s-statement-%s-to-%s.pdf',
            $safeMetalName,
            $dateFromYmd,
            $dateToYmd
        );

        return response()->streamDownload(function () use ($dompdf) {
            echo $dompdf->output();
        }, $fileName, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Metal::with(['creator', 'updater']);

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $metals = $query->orderBy('name', 'asc')->paginate(15);

        return Inertia::render('Metals/Index', [
            'metals' => $metals,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Metals/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:metals,name',
        ]);

        $metal = Metal::create([
            'name' => $request->name,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        AuditLog::log($metal, 'CREATE', Auth::id(), null, $metal->toArray());

        return redirect()->route('metals.index')
            ->with('success', 'Metal created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Metal $metal): Response
    {
        $metal->load(['creator', 'updater']);

        AuditLog::log($metal, 'VIEW', Auth::id());

        return Inertia::render('Metals/Show', [
            'metal' => $metal,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Metal $metal): Response
    {
        return Inertia::render('Metals/Edit', [
            'metal' => $metal,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Metal $metal)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:metals,name,' . $metal->id,
        ]);

        $oldValues = $metal->toArray();

        $metal->update([
            'name' => $request->name,
            'updated_by' => Auth::id(),
        ]);

        AuditLog::log($metal, 'UPDATE', Auth::id(), $oldValues, $metal->toArray());

        return redirect()->route('metals.index')
            ->with('success', 'Metal updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Metal $metal)
    {
        AuditLog::log($metal, 'DELETE', Auth::id(), $metal->toArray());

        $metal->delete();

        return redirect()->route('metals.index')
            ->with('success', 'Metal deleted successfully.');
    }
}
