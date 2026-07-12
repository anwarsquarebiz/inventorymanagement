<?php

namespace App\Http\Controllers;

use App\Models\Metal;
use App\Models\MetalMonthlySummary;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MetalMonthlySummaryController extends Controller
{
    /**
     * Matrix view: one row per metal for the selected month/year.
     */
    public function index(Request $request): Response
    {
        $now = Carbon::now();

        $month = (int) $request->get('month', $now->month);
        $year = (int) $request->get('year', $now->year);

        if ($month < 1 || $month > 12) {
            $month = $now->month;
        }
        if ($year < 2000 || $year > 2100) {
            $year = $now->year;
        }

        $summaries = MetalMonthlySummary::query()
            ->where('year', $year)
            ->where('month', $month)
            ->get()
            ->keyBy('metal_id');

        $rows = Metal::orderBy('name')->get()->map(function (Metal $metal) use ($summaries) {
            $summary = $summaries->get($metal->id);

            return [
                'id' => $summary?->id,
                'metal_id' => $metal->id,
                'metal_name' => $metal->name,
                'opening_balance' => $summary ? (float) $summary->opening_balance : null,
                'total_issue' => $summary ? (float) $summary->total_issue : null,
                'total_usage' => $summary ? (float) $summary->total_usage : null,
                'loss_adjustment' => $summary ? (float) $summary->loss_adjustment : null,
                'closing_balance' => $summary ? (float) $summary->closing_balance : null,
            ];
        })->values();

        return Inertia::render('MetalMonthlySummary/Index', [
            'rows' => $rows,
            'period' => [
                'month' => $month,
                'year' => $year,
            ],
        ]);
    }

    /**
     * Create or update the summary for a metal in a given month/year.
     */
    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);

        MetalMonthlySummary::updateOrCreate(
            [
                'metal_id' => $validated['metal_id'],
                'year' => $validated['year'],
                'month' => $validated['month'],
            ],
            [
                'opening_balance' => $validated['opening_balance'],
                'total_issue' => $validated['total_issue'],
                'total_usage' => $validated['total_usage'],
                'loss_adjustment' => $validated['loss_adjustment'],
                'closing_balance' => $validated['closing_balance'],
            ]
        );

        return redirect()
            ->route('metal-monthly-summaries.index', [
                'month' => $validated['month'],
                'year' => $validated['year'],
            ])
            ->with('success', 'Monthly summary saved successfully.');
    }

    /**
     * Update an existing summary row.
     */
    public function update(Request $request, MetalMonthlySummary $metalMonthlySummary)
    {
        $validated = $this->validatePayload($request);

        $metalMonthlySummary->update([
            'metal_id' => $validated['metal_id'],
            'year' => $validated['year'],
            'month' => $validated['month'],
            'opening_balance' => $validated['opening_balance'],
            'total_issue' => $validated['total_issue'],
            'total_usage' => $validated['total_usage'],
            'loss_adjustment' => $validated['loss_adjustment'],
            'closing_balance' => $validated['closing_balance'],
        ]);

        return redirect()
            ->route('metal-monthly-summaries.index', [
                'month' => $validated['month'],
                'year' => $validated['year'],
            ])
            ->with('success', 'Monthly summary updated successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'metal_id' => ['required', 'integer', 'exists:metals,id'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'opening_balance' => ['required', 'numeric'],
            'total_issue' => ['required', 'numeric'],
            'total_usage' => ['required', 'numeric'],
            'loss_adjustment' => ['required', 'numeric'],
            'closing_balance' => ['required', 'numeric'],
        ]);
    }
}
