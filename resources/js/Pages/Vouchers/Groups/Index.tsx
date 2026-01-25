import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, FileDown, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
declare const route: any

interface GroupRow {
    stock_no: string
    vouchers_count: number
    total_pcs: number
    total_weight: number
    first_date: string | null
    last_date: string | null
}

interface GroupsIndexProps {
    groups: {
        data: GroupRow[]
        links: any[]
        meta: any
    }
    filters: {
        search?: string
    }
}

export default function Index({ groups, filters }: GroupsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '')

    const handleSearch = () => {
        router.get(route('vouchers-groups.index'), { search: searchTerm }, { preserveState: true, replace: true })
    }

    const handleExport = () => {
        const url = route('vouchers-groups.export', { search: searchTerm || undefined }) as string
        window.location.href = url
    }

    return (
        <AppLayout title="Vouchers by Stock No">
            <Head title="Vouchers by Stock No" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Vouchers by Stock No</h1>
                        <p className="text-gray-600">Grouped summary of vouchers and items by stock number</p>
                    </div>
                    <Button onClick={handleExport} variant="outline" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Search by stock no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                            />
                        </div>
                        <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Search
                        </Button>
                    </div>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-5 0">
                                    <th className="text-left p-4 font-medium text-gray-900">Stock No</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Vouchers</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Total Pcs</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Total Weight (ct)</th>
                                    <th className="text-left p-4 font-medium text-gray-900">First Given</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Last Delivery</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups?.data?.length ? groups.data.map((g) => (
                                    <tr key={g.stock_no} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{g.stock_no}</td>
                                        <td className="p-4 text-gray-600">{g.vouchers_count}</td>
                                        <td className="p-4 text-gray-600">{g.total_pcs}</td>
                                        <td className="p-4 text-gray-600">{Number(g.total_weight).toFixed(2)}</td>
                                        <td className="p-4 text-gray-600">{g.first_date ? formatDate(g.first_date) : '-'}</td>
                                        <td className="p-4 text-gray-600">{g.last_date ? formatDate(g.last_date) : '-'}</td>
                                        <td className="p-4">
                                            <Link href={route('vouchers-groups.show', g.stock_no)}>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="p-8 text-center text-gray-500" colSpan={7}>No groups found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {groups?.links && groups.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                            {groups.links.map((link: any, idx: number) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 text-sm rounded-lg ${link.active ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    )
}
