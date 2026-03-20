import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react'

declare const route: (name: string, params?: Record<string, number | string | undefined>) => string

interface LedgerEntry {
    date: string | null
    particulars: string
    credit: number
    debit: number
    balance: number
    type: 'credit' | 'debit'
}

interface PaginationLink {
    url: string | null
    label: string
    active: boolean
}

interface MetalUsageLedgerProps {
    metal: { id: number; name: string }
    entries: LedgerEntry[]
    pagination: {
        current_page: number
        last_page: number
        per_page: number
        total: number
        from: number | null
        to: number | null
        links: PaginationLink[]
    }
    filters: {
        date_from?: string
        date_to?: string
        particulars?: string
    }
}

function formatWeight(v: number): string {
    return Number(v).toFixed(2)
}

function formatDate(d: string | null): string {
    if (!d) return '–'
    return d
}

export default function Ledger({ metal, entries, pagination, filters }: MetalUsageLedgerProps) {
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '')
    const [dateTo, setDateTo] = useState(filters.date_to ?? '')
    const [particulars, setParticulars] = useState(filters.particulars ?? '')

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault()
        router.get(route('metal-usage.ledger', { metal: metal.id }), {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            particulars: particulars.trim() || undefined,
        }, { preserveState: false })
    }

    const clearFilters = () => {
        setDateFrom('')
        setDateTo('')
        setParticulars('')
        router.get(route('metal-usage.ledger', { metal: metal.id }), {}, { preserveState: false })
    }

    const hasActiveFilters = dateFrom || dateTo || (particulars && particulars.trim())

    return (
        <AppLayout title={`Ledger: ${metal.name}`}>
            <Head title={`Ledger: ${metal.name}`} />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('metal-usage.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Summary
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Metal Ledger: {metal.name}</h1>
                            <p className="text-gray-600">Credit from metal vouchers, debit from stock usage.</p>
                        </div>
                    </div>
                </div>

                <Card className="p-4">
                    <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1 min-w-0">
                            <div>
                                <Label htmlFor="date_from">Date From</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="date_to">Date To</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="particulars">Particulars</Label>
                                <Input
                                    id="particulars"
                                    type="text"
                                    value={particulars}
                                    onChange={(e) => setParticulars(e.target.value)}
                                    placeholder="Search particulars..."
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" size="default">
                                <Search className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            {hasActiveFilters && (
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left p-3 font-medium text-gray-900">Date</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Particulars</th>
                                    <th className="text-right p-3 font-medium text-gray-900">Credit (g)</th>
                                    <th className="text-right p-3 font-medium text-gray-900">Debit (g)</th>
                                    <th className="text-right p-3 font-medium text-gray-900">Balance (g)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            {hasActiveFilters
                                                ? 'No ledger entries match the current filters.'
                                                : 'No ledger entries for this metal yet.'}
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 text-gray-600">{formatDate(row.date)}</td>
                                            <td className="p-3 text-gray-900">{row.particulars}</td>
                                            <td className="p-3 text-right tabular-nums text-gray-600">
                                                {row.credit > 0 ? formatWeight(row.credit) : '–'}
                                            </td>
                                            <td className="p-3 text-right tabular-nums text-gray-600">
                                                {row.debit > 0 ? formatWeight(row.debit) : '–'}
                                            </td>
                                            <td className="p-3 text-right tabular-nums font-medium">{formatWeight(row.balance)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-600">
                                Showing{' '}
                                {pagination.from != null && pagination.to != null ? (
                                    <>
                                        <span className="font-medium">{pagination.from}</span> to{' '}
                                        <span className="font-medium">{pagination.to}</span> of{' '}
                                    </>
                                ) : null}
                                <span className="font-medium">{pagination.total}</span> entries
                            </p>
                            <nav className="flex items-center gap-1">
                                {pagination.links.map((link, i) => (
                                    <span key={i}>
                                        {link.url === null ? (
                                            <span
                                                className={`inline-flex items-center justify-center min-w-[2.25rem] px-2 py-1.5 text-sm font-medium rounded border ${
                                                    link.active
                                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                                        : 'text-gray-400 border-gray-200 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <Link
                                                href={link.url}
                                                className={`inline-flex items-center justify-center min-w-[2.25rem] px-2 py-1.5 text-sm font-medium rounded border ${
                                                    link.active
                                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )}
                                    </span>
                                ))}
                            </nav>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    )
}
