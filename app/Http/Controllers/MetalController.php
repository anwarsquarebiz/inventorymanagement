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

class MetalController extends Controller
{
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
            ->map(function (MetalVoucherItem $item) {
                $v = $item->metalVoucher;
                return [
                    'date' => $v ? $v->date_given?->format('Y-m-d') : null,
                    'particulars' => $v ? "Metal Voucher {$v->voucher_no}" : 'Metal Voucher',
                    'credit' => (float) $item->weight,
                    'debit' => 0,
                    'type' => 'credit',
                ];
            })
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
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        AuditLog::log($metal, 'CREATE', auth()->id(), null, $metal->toArray());

        return redirect()->route('metals.index')
            ->with('success', 'Metal created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Metal $metal): Response
    {
        $metal->load(['creator', 'updater']);

        AuditLog::log($metal, 'VIEW', auth()->id());

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
            'updated_by' => auth()->id(),
        ]);

        AuditLog::log($metal, 'UPDATE', auth()->id(), $oldValues, $metal->toArray());

        return redirect()->route('metals.index')
            ->with('success', 'Metal updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Metal $metal)
    {
        AuditLog::log($metal, 'DELETE', auth()->id(), $metal->toArray());

        $metal->delete();

        return redirect()->route('metals.index')
            ->with('success', 'Metal deleted successfully.');
    }
}
