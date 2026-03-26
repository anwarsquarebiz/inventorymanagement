<?php

namespace App\Services;

use App\Models\Metal;
use App\Models\Stock;
use Carbon\Carbon;

class MetalMonthlyDebitCalculator
{
    /**
     * Sum stock-usage debits (grams) for a metal where stock updated_at falls on a day in [date_from, date_to] (inclusive).
     */
    public static function totalGramsForDateRange(Metal $metal, string $dateFromYmd, string $dateToYmd): float
    {
        $metalName = $metal->name;

        $total = 0.0;
        Stock::query()
            ->whereDate('updated_at', '>=', $dateFromYmd)
            ->whereDate('updated_at', '<=', $dateToYmd)
            ->orderBy('stock_no')
            ->get()
            ->each(function (Stock $stock) use ($metalName, &$total) {
                $data = $stock->metal_data;
                if (! is_array($data) || ! isset($data[$metalName]) || ! is_array($data[$metalName])) {
                    return;
                }
                $grams = isset($data[$metalName]['grams']) ? (float) $data[$metalName]['grams'] : 0;
                if ($grams > 0) {
                    $total += $grams;
                }
            });

        return round($total, 2);
    }

    /**
     * Sum stock-usage debits (grams) for a metal in the calendar month containing $dateYmd.
     */
    public static function totalGramsForMonth(Metal $metal, string $dateYmd): float
    {
        $anchor = Carbon::parse($dateYmd);
        $monthStartYmd = $anchor->copy()->startOfMonth()->format('Y-m-d');
        $monthEndYmd = $anchor->copy()->endOfMonth()->format('Y-m-d');

        return self::totalGramsForDateRange($metal, $monthStartYmd, $monthEndYmd);
    }
}
