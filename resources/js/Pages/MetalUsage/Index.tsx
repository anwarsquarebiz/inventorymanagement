import React from 'react'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, BookOpen } from 'lucide-react'

declare const route: (name: string, params?: Record<string, number | string | undefined>) => string

interface MetalSummaryItem {
    id: number
    name: string
    total_credit: number
    total_debit: number
    balance: number
}

interface MetalUsageIndexProps {
    metals: MetalSummaryItem[]
}

function formatWeight(v: number): string {
    return Number(v).toFixed(2)
}

export default function Index({ metals }: MetalUsageIndexProps) {
    return (
        <AppLayout title="Metal Usage Summary">
            <Head title="Metal Usage Summary" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Metal Usage Summary</h1>
                        <p className="text-gray-600">Credits from metal vouchers, debits from stock usage. Click a metal to view its ledger.</p>
                    </div>
                    <Link href={route('metal-vouchers.index')}>
                        <Button variant="outline" className="border-gray-300 text-gray-700">
                            <Eye className="h-4 w-4 mr-2" />
                            Metal Vouchers
                        </Button>
                    </Link>
                </div>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left p-4 font-medium text-gray-900">Metal</th>
                                    <th className="text-right p-4 font-medium text-gray-900">Credit (g)</th>
                                    <th className="text-right p-4 font-medium text-gray-900">Debit (g)</th>
                                    <th className="text-right p-4 font-medium text-gray-900">Balance (g)</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No metal usage data. Create metal vouchers to see credits; add metal usage in stock to see debits.
                                        </td>
                                    </tr>
                                ) : (
                                    metals.map((metal) => (
                                        <tr key={metal.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{metal.name}</td>
                                            <td className="p-4 text-right text-gray-600 tabular-nums">{formatWeight(metal.total_credit)}</td>
                                            <td className="p-4 text-right text-gray-600 tabular-nums">{formatWeight(metal.total_debit)}</td>
                                            <td className="p-4 text-right font-medium tabular-nums">{formatWeight(metal.balance)}</td>
                                            <td className="p-4">
                                                <Link href={route('metal-usage.ledger', { metal: metal.id })}>
                                                    <Button size="sm" variant="outline">
                                                        <BookOpen className="h-3 w-3 mr-1" />
                                                        View Ledger
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
