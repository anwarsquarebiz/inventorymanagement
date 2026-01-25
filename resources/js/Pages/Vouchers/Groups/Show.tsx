import React from 'react'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Edit as EditIcon, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
declare const route: any

interface VoucherRow {
    id: number
    voucher_no: string
    date_given: string
    date_delivery: string
    status: string
    person_in_charge: number
    created_at: string
}

interface ItemRow {
    voucher_id: number
    voucher_no: string
    date_given: string
    date_delivery: string
    status: string
    product_name?: string | null
    shape: string
    pcs: number
    weight: number
    code?: string | null
    remarks?: string | null
    temporary_return?: boolean
}

interface Summary {
    stock_no: string
    vouchers_count: number
    total_pcs: number
    total_weight: number
}

interface Props {
    stockNo: string
    stock?: {
        stock_no: string
        thumbnail?: string | null
        metal?: string | null
        products_used?: string | null
        product_categorization?: string | null
    } | null
    summary: Summary
    vouchers: VoucherRow[]
    items: ItemRow[]
}

export default function Show({ stockNo, stock, summary, vouchers, items }: Props) {
    return (
        <AppLayout title={`Stock ${stockNo}`}>
            <Head title={`Stock ${stockNo} - Vouchers`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('vouchers-groups.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Groups
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Stock: {stockNo}</h1>
                            <p className="text-gray-600">Vouchers and items for this stock number</p>
                        </div>
                    </div>
                    <Link href={route('stocks.edit', stockNo)}>
                        <Button variant="outline">
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit Stock Info
                        </Button>
                    </Link>
                </div>

                {/* Stock Information */}
                {(stock?.thumbnail || stock?.metal || stock?.products_used || stock?.product_categorization) && (
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stock?.thumbnail && (
                                <div>
                                    <Label>Thumbnail</Label>
                                    <div className="mt-2">
                                        <img 
                                            src={`/storage/${stock.thumbnail}`} 
                                            alt={`Stock ${stockNo}`}
                                            className="w-[150px] max-w-md h-auto rounded-lg border border-gray-200 shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}
                            {stock?.metal && (
                                <div>
                                    <Label>Metal</Label>
                                    <p className="mt-2 text-gray-900 font-medium text-lg">
                                        {stock.metal}
                                    </p>
                                </div>
                            )}
                            {stock?.products_used && (
                                <div>
                                    <Label>Products Used</Label>
                                    <p className="mt-2 text-gray-900 font-medium text-lg">
                                        {stock.products_used.charAt(0).toUpperCase() + stock.products_used.slice(1)}
                                    </p>
                                </div>
                            )}
                            {stock?.product_categorization && (
                                <div>
                                    <Label>Product Categorization</Label>
                                    <p className="mt-2 text-gray-900 font-medium text-lg capitalize">
                                        {stock.product_categorization.charAt(0).toUpperCase() + stock.product_categorization.slice(1)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Vouchers</p>
                            <p className="text-xl font-semibold text-gray-900">{summary.vouchers_count}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Total Pieces</p>
                            <p className="text-xl font-semibold text-gray-900">{summary.total_pcs}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Total Weight</p>
                            <p className="text-xl font-semibold text-gray-900">{summary.total_weight.toFixed(2)} ct</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vouchers</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left p-2 font-medium text-gray-900">Voucher No</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Date Given</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Date Delivery</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.map(v => (
                                    <tr key={v.id} className="border-b border-gray-100">
                                        <td className="p-2 text-emerald-700">
                                            <Link href={route('vouchers.show', v.id)} className="underline">
                                                {v.voucher_no}
                                            </Link>
                                        </td>
                                        <td className="p-2 text-gray-700">{formatDate(v.date_given)}</td>
                                        <td className="p-2 text-gray-700">{formatDate(v.date_delivery)}</td>
                                        <td className="p-2 text-gray-700 capitalize">{v.status.replace('_',' ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">All Items</h3>
                        <Link href={route('vouchers-groups.export-items', stockNo)}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Download className="h-4 w-4 mr-2" />
                                Download CSV
                            </Button>
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left p-2 font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">Voucher No</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Product</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Shape</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Pcs</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Weight (ct)</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Code</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Remarks</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Temporary Return</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((it, idx) => (
                                    <tr key={`${it.voucher_id}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-2 text-emerald-700 sticky left-0 bg-white z-10">
                                            <Link href={route('vouchers.show', it.voucher_id)} className="underline hover:text-emerald-800 font-medium">
                                                {it.voucher_no}
                                            </Link>
                                        </td>
                                        <td className="p-2 text-gray-700">{it.product_name || '-'}</td>
                                        <td className="p-2 text-gray-700">{it.shape}</td>
                                        <td className="p-2 text-gray-700">{it.pcs}</td>
                                        <td className="p-2 text-gray-700">{Number(it.weight).toFixed(2)}</td>
                                        <td className="p-2 text-gray-700">{it.code || '-'}</td>
                                        <td className="p-2 text-gray-700">{it.remarks || '-'}</td>
                                        <td className="p-2">
                                            {it.temporary_return ? (
                                                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800">
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">No</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}


