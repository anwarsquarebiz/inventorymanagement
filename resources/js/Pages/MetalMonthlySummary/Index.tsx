import React, { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, X } from 'lucide-react'

declare const route: (name: string, params?: Record<string, number | string | undefined>) => string

interface SummaryRow {
    id: number | null
    metal_id: number
    metal_name: string
    opening_balance: number | null
    total_issue: number | null
    total_usage: number | null
    loss_adjustment: number | null
    closing_balance: number | null
}

interface Period {
    month: number
    year: number
}

interface Props {
    rows: SummaryRow[]
    period: Period
}

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatNumber(v: number | null): string {
    if (v === null || v === undefined) return '–'
    return Number(v).toFixed(2)
}

function periodLabel(period: Period): string {
    return `${MONTH_NAMES[period.month - 1]}-${String(period.year).slice(-2)}`
}

function toMonthInput(period: Period): string {
    return `${period.year}-${String(period.month).padStart(2, '0')}`
}

type FormState = {
    id: number | null
    metal_id: string
    metal_name: string
    month: number
    year: number
    opening_balance: string
    total_issue: string
    total_usage: string
    loss_adjustment: string
    closing_balance: string
}

const numOrZero = (v: number | null): string => (v === null || v === undefined ? '' : String(v))

export default function Index({ rows, period }: Props) {
    const [modalOpen, setModalOpen] = useState(false)

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<FormState>({
        id: null,
        metal_id: '',
        metal_name: '',
        month: period.month,
        year: period.year,
        opening_balance: '',
        total_issue: '',
        total_usage: '',
        loss_adjustment: '',
        closing_balance: '',
    })

    const changePeriod = (value: string) => {
        if (!value) return
        const [year, month] = value.split('-').map((n) => parseInt(n, 10))
        router.get(route('metal-monthly-summaries.index'), { month, year }, { preserveState: false })
    }

    const openModal = (row: SummaryRow) => {
        clearErrors()
        setData({
            id: row.id,
            metal_id: String(row.metal_id),
            metal_name: row.metal_name,
            month: period.month,
            year: period.year,
            opening_balance: numOrZero(row.opening_balance),
            total_issue: numOrZero(row.total_issue),
            total_usage: numOrZero(row.total_usage),
            loss_adjustment: numOrZero(row.loss_adjustment),
            closing_balance: numOrZero(row.closing_balance),
        })
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        clearErrors()
        reset()
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const options = { onSuccess: () => closeModal() }
        if (data.id) {
            put(route('metal-monthly-summaries.update', { metalMonthlySummary: data.id }), options)
        } else {
            post(route('metal-monthly-summaries.store'), options)
        }
    }

    const isEdit = data.id !== null

    return (
        <AppLayout title="Metal Monthly Summary">
            <Head title="Metal Monthly Summary" />
            <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Metal Monthly Summary</h1>
                        <p className="text-gray-600">Opening, issue, usage, loss adjustment and closing balances per metal.</p>
                    </div>
                    <div className="flex items-end gap-3">
                        <div>
                            <Label htmlFor="period">Month</Label>
                            <Input
                                id="period"
                                type="month"
                                value={toMonthInput(period)}
                                onChange={(e) => changePeriod(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">{periodLabel(period)}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left p-3 font-medium text-gray-900">Metal</th>
                                    <th className="text-right p-3 font-medium text-gray-900">Opening Balance</th>
                                    <th className="text-right p-3 font-medium text-gray-900">Total Issue</th>
                                    <th className="text-right p-3 font-medium text-gray-900">Total Usage</th>
                                    <th className="text-right p-3 font-medium text-gray-900">Loss Adjustment</th>
                                    <th className="text-right p-3 font-medium text-gray-900">Closing Balance</th>
                                    <th className="text-right p-3 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            No metals found. Add metals first to record monthly summaries.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.metal_id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-900">{row.metal_name}</td>
                                            <td className="p-3 text-right tabular-nums text-gray-700">{formatNumber(row.opening_balance)}</td>
                                            <td className="p-3 text-right tabular-nums text-gray-700">{formatNumber(row.total_issue)}</td>
                                            <td className="p-3 text-right tabular-nums text-gray-700">{formatNumber(row.total_usage)}</td>
                                            <td className="p-3 text-right tabular-nums text-gray-700">{formatNumber(row.loss_adjustment)}</td>
                                            <td className="p-3 text-right tabular-nums font-medium text-gray-900">{formatNumber(row.closing_balance)}</td>
                                            <td className="p-3 text-right">
                                                <Button size="sm" variant="outline" onClick={() => openModal(row)}>
                                                    {row.id ? (
                                                        <>
                                                            <Pencil className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Add
                                                        </>
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
                    <div
                        className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6"
                        onClick={(ev) => ev.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {isEdit ? 'Update' : 'Add'} Monthly Summary
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {data.metal_name} — {periodLabel(period)}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="rounded-md p-2 hover:bg-gray-100"
                                onClick={closeModal}
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="opening_balance">Opening Balance</Label>
                                    <Input
                                        id="opening_balance"
                                        type="number"
                                        step="0.01"
                                        value={data.opening_balance}
                                        onChange={(e) => setData('opening_balance', e.target.value)}
                                        className={`mt-1 ${errors.opening_balance ? 'border-red-500' : ''}`}
                                    />
                                    {errors.opening_balance && (
                                        <p className="text-red-500 text-sm mt-1">{errors.opening_balance}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="total_issue">Total Issue</Label>
                                    <Input
                                        id="total_issue"
                                        type="number"
                                        step="0.01"
                                        value={data.total_issue}
                                        onChange={(e) => setData('total_issue', e.target.value)}
                                        className={`mt-1 ${errors.total_issue ? 'border-red-500' : ''}`}
                                    />
                                    {errors.total_issue && (
                                        <p className="text-red-500 text-sm mt-1">{errors.total_issue}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="total_usage">Total Usage</Label>
                                    <Input
                                        id="total_usage"
                                        type="number"
                                        step="0.01"
                                        value={data.total_usage}
                                        onChange={(e) => setData('total_usage', e.target.value)}
                                        className={`mt-1 ${errors.total_usage ? 'border-red-500' : ''}`}
                                    />
                                    {errors.total_usage && (
                                        <p className="text-red-500 text-sm mt-1">{errors.total_usage}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="loss_adjustment">Loss Adjustment</Label>
                                    <Input
                                        id="loss_adjustment"
                                        type="number"
                                        step="0.01"
                                        value={data.loss_adjustment}
                                        onChange={(e) => setData('loss_adjustment', e.target.value)}
                                        className={`mt-1 ${errors.loss_adjustment ? 'border-red-500' : ''}`}
                                    />
                                    {errors.loss_adjustment && (
                                        <p className="text-red-500 text-sm mt-1">{errors.loss_adjustment}</p>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="closing_balance">Closing Balance</Label>
                                    <Input
                                        id="closing_balance"
                                        type="number"
                                        step="0.01"
                                        value={data.closing_balance}
                                        onChange={(e) => setData('closing_balance', e.target.value)}
                                        className={`mt-1 ${errors.closing_balance ? 'border-red-500' : ''}`}
                                    />
                                    {errors.closing_balance && (
                                        <p className="text-red-500 text-sm mt-1">{errors.closing_balance}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {processing ? 'Saving...' : isEdit ? 'Update' : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    )
}
