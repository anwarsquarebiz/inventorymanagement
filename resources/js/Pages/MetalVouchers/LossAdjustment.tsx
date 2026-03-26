import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';

declare const route: (name: string, params?: Record<string, number | string | undefined>) => string;

interface LossAdjustmentProps {
    metals: Array<{ id: number; name: string }>;
    default_date_from: string;
    default_date_to: string;
}

type AdjustmentMode = 'percentage' | 'repair';

interface RepairItem {
    stock_item_name: string;
    metal_id: string;
    grams_used: string;
}

export default function LossAdjustment({ metals, default_date_from, default_date_to }: LossAdjustmentProps) {
    const { data, setData, post, processing, errors } = useForm({
        mode: 'percentage' as AdjustmentMode,
        metal_id: '' as string,
        date_from: default_date_from,
        date_to: default_date_to,
        monthly_debit_base: '' as string,
        percentage: '' as string,
        adjustment_grams: '' as string,
        repair_items: [{ stock_item_name: '', metal_id: '', grams_used: '' }] as RepairItem[],
    });

    const [loadingDebit, setLoadingDebit] = useState(false);
    const [debitFetchError, setDebitFetchError] = useState<string | null>(null);

    const metalIdNum = data.metal_id ? Number(data.metal_id) : null;
    const isPercentageMode = data.mode === 'percentage';
    const isRepairMode = data.mode === 'repair';

    useEffect(() => {
        if (!isPercentageMode) {
            return;
        }
        if (!metalIdNum || !data.date_from || !data.date_to) {
            setData('monthly_debit_base', '');
            setData('adjustment_grams', '');
            setDebitFetchError(null);
            return;
        }

        const controller = new AbortController();
        setLoadingDebit(true);
        setDebitFetchError(null);
        setData('monthly_debit_base', '');
        setData('adjustment_grams', '');

        const url = `${route('metal-usage.monthly-debit', { metal: metalIdNum })}?date_from=${encodeURIComponent(data.date_from)}&date_to=${encodeURIComponent(data.date_to)}`;

        fetch(url, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            signal: controller.signal,
            credentials: 'same-origin',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Request failed');
                return res.json() as Promise<{ total_debit: number }>;
            })
            .then((json) =>
                setData('monthly_debit_base', Number(json.total_debit).toFixed(2))
            )
            .catch((e: Error) => {
                if (e.name === 'AbortError') return;
                setData('monthly_debit_base', '');
                setData('adjustment_grams', '');
                setDebitFetchError('Could not load monthly debit for this metal and date.');
            })
            .finally(() => setLoadingDebit(false));

        return () => controller.abort();
    }, [isPercentageMode, metalIdNum, data.date_from, data.date_to]);

    useEffect(() => {
        if (!isPercentageMode) {
            return;
        }
        const base = parseFloat(data.monthly_debit_base);
        const p = parseFloat(data.percentage);
        if (Number.isFinite(base) && base > 0 && Number.isFinite(p) && p >= 0.01 && p <= 100) {
            setData('adjustment_grams', round2((base * p) / 100).toFixed(2));
        }
    }, [isPercentageMode, data.monthly_debit_base, data.percentage]);

    const repairRows = data.repair_items;
    const repairItemsByMetal = useMemo(() => {
        const grouped: Record<string, number> = {};
        repairRows.forEach((row) => {
            const grams = parseFloat(row.grams_used);
            if (!row.metal_id || !Number.isFinite(grams) || grams <= 0) return;
            grouped[row.metal_id] = (grouped[row.metal_id] ?? 0) + grams;
        });
        return grouped;
    }, [repairRows]);

    const repairTotal = useMemo(
        () => Object.values(repairItemsByMetal).reduce((sum, grams) => sum + grams, 0),
        [repairItemsByMetal]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('metal-vouchers.loss-adjustment.store'));
    };

    const addRepairRow = () => {
        setData('repair_items', [...repairRows, { stock_item_name: '', metal_id: '', grams_used: '' }]);
    };

    const removeRepairRow = (index: number) => {
        if (repairRows.length === 1) return;
        setData(
            'repair_items',
            repairRows.filter((_, i) => i !== index)
        );
    };

    const setRepairRow = (index: number, patch: Partial<RepairItem>) => {
        setData(
            'repair_items',
            repairRows.map((row, i) => (i === index ? { ...row, ...patch } : row))
        );
    };

    return (
        <AppLayout title="Adjustment">
            <Head title="Adjustment" />
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('metal-vouchers.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Metal Vouchers
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Adjustment</h1>
                        <p className="text-gray-600">
                            Record a negative debit either by percentage or by repair line-item usage.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Adjustment</h3>
                        <div className="mb-6">
                            <Label htmlFor="mode">Mode</Label>
                            <div className="mt-2 inline-flex rounded-lg border border-gray-200 p-1">
                                <button
                                    type="button"
                                    onClick={() => setData('mode', 'percentage')}
                                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                                        isPercentageMode ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Percentage Adjustment
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('mode', 'repair')}
                                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                                        isRepairMode ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Repair Adjustment
                                </button>
                            </div>
                        </div>

                        {isPercentageMode ? (
                            <>
                                <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="metal_id">Metal</Label>
                                        <select
                                            id="metal_id"
                                            value={data.metal_id}
                                            onChange={(e) => setData('metal_id', e.target.value)}
                                            className={`mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                                                errors.metal_id ? 'border-red-500' : ''
                                            }`}
                                        >
                                            <option value="">Select metal</option>
                                            {metals.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.metal_id && <p className="mt-1 text-sm text-red-500">{errors.metal_id}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="date_from">From date</Label>
                                        <Input
                                            id="date_from"
                                            type="date"
                                            value={data.date_from}
                                            onChange={(e) => setData('date_from', e.target.value)}
                                            className={`mt-1 ${errors.date_from ? 'border-red-500' : ''}`}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Stock rows count if their updated date falls in this range (inclusive).
                                        </p>
                                        {errors.date_from && <p className="mt-1 text-sm text-red-500">{errors.date_from}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="date_to">To date</Label>
                                        <Input
                                            id="date_to"
                                            type="date"
                                            value={data.date_to}
                                            onChange={(e) => setData('date_to', e.target.value)}
                                            className={`mt-1 ${errors.date_to ? 'border-red-500' : ''}`}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Voucher date is set to this date when saved.
                                        </p>
                                        {errors.date_to && <p className="mt-1 text-sm text-red-500">{errors.date_to}</p>}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-sm font-medium text-gray-900">Stock usage (debit) for selected range</p>
                                    {loadingDebit ? (
                                        <p className="mt-2 text-sm text-gray-600">Loading…</p>
                                    ) : debitFetchError ? (
                                        <p className="mt-2 text-sm text-red-600">{debitFetchError}</p>
                                    ) : metalIdNum && data.date_from && data.date_to ? (
                                        <div className="mt-2 flex max-w-md items-baseline gap-2">
                                            <Input
                                                id="monthly_stock_debit"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                inputMode="decimal"
                                                value={data.monthly_debit_base}
                                                onChange={(e) => setData('monthly_debit_base', e.target.value)}
                                                placeholder="0.00"
                                                aria-label="Monthly stock usage in grams"
                                                className={`h-auto border-gray-300 bg-white py-2 text-2xl font-semibold tabular-nums text-gray-900 ${
                                                    errors.monthly_debit_base ? 'border-red-500' : ''
                                                }`}
                                            />
                                            <span className="text-2xl font-semibold tabular-nums text-gray-900">g</span>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-600">Select a metal and from/to dates to load usage total.</p>
                                    )}
                                    {errors.monthly_debit_base && (
                                        <p className="mt-2 text-sm text-red-600">{errors.monthly_debit_base}</p>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <Label htmlFor="percentage">Percentage of usage total</Label>
                                    <Input
                                        id="percentage"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max="100"
                                        value={data.percentage}
                                        onChange={(e) => setData('percentage', e.target.value)}
                                        placeholder="e.g. 2.5"
                                        className={`mt-1 max-w-xs ${errors.percentage ? 'border-red-500' : ''}`}
                                    />
                                    {errors.percentage && <p className="mt-1 text-sm text-red-500">{errors.percentage}</p>}
                                </div>

                                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-sm font-medium text-amber-900">Adjustment amount (recorded as negative debit)</p>
                                    <div className="mt-2 flex max-w-md items-baseline gap-2">
                                        <Input
                                            id="adjustment_grams"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            inputMode="decimal"
                                            value={data.adjustment_grams}
                                            onChange={(e) => setData('adjustment_grams', e.target.value)}
                                            placeholder="0.00"
                                            aria-label="Adjustment amount in grams"
                                            className={`h-auto border-amber-200/80 bg-white py-2 text-2xl font-semibold tabular-nums text-amber-950 ${
                                                errors.adjustment_grams ? 'border-red-500' : ''
                                            }`}
                                        />
                                        <span className="text-2xl font-semibold tabular-nums text-amber-950">g</span>
                                    </div>
                                    <p className="mt-2 text-xs text-amber-900/80">
                                        Prefilled from usage total × percentage; you may change it before saving. Stored on the metal
                                        voucher line as negative weight; ledger shows it in the Debit column as a negative value.
                                    </p>
                                    {errors.adjustment_grams && (
                                        <p className="mt-2 text-sm text-red-600">{errors.adjustment_grams}</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[760px]">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="p-2 text-left text-sm font-medium text-gray-900">Stock item name</th>
                                                <th className="p-2 text-left text-sm font-medium text-gray-900">Metal</th>
                                                <th className="p-2 text-left text-sm font-medium text-gray-900">Grams used</th>
                                                <th className="w-20 p-2 text-left text-sm font-medium text-gray-900">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {repairRows.map((row, index) => (
                                                <tr key={index} className="border-b border-gray-100">
                                                    <td className="p-2">
                                                        <Input
                                                            value={row.stock_item_name}
                                                            onChange={(e) => setRepairRow(index, { stock_item_name: e.target.value })}
                                                            placeholder="e.g. R-01"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            value={row.metal_id}
                                                            onChange={(e) => setRepairRow(index, { metal_id: e.target.value })}
                                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                                        >
                                                            <option value="">Select metal</option>
                                                            {metals.map((m) => (
                                                                <option key={m.id} value={m.id}>
                                                                    {m.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            value={row.grams_used}
                                                            onChange={(e) => setRepairRow(index, { grams_used: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeRepairRow(index)}
                                                            disabled={repairRows.length === 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {errors.repair_items && <p className="mt-2 text-sm text-red-500">{errors.repair_items}</p>}

                                <div className="mt-4">
                                    <Button type="button" variant="outline" onClick={addRepairRow}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Row
                                    </Button>
                                </div>

                                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-sm font-medium text-amber-900">Repair items adjustment (debit)</p>
                                    <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-950">
                                        {repairTotal.toFixed(2)} g
                                    </p>
                                    <p className="mt-2 text-xs text-amber-900/80">
                                        On save, entries are grouped by metal and recorded as negative voucher lines with particulars
                                        "Repair items adjustment" in ledger.
                                    </p>
                                </div>
                            </>
                        )}
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('metal-vouchers.index')}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving…' : 'Record adjustment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
