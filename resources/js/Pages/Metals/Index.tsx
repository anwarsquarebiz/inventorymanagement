import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Search,
    Plus,
    Eye,
    Edit,
    Trash2
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Metal {
    id: number
    name: string
    created_at: string
    updated_at: string
    creator?: {
        name: string
    }
    updater?: {
        name: string
    }
}

interface MetalsIndexProps {
    metals: {
        data: Metal[]
        links: any[]
        meta: any
    }
    filters: {
        search?: string
    }
}

export default function Index({ metals, filters }: MetalsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '')

    const handleSearch = () => {
        router.get(route('metals.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
            replace: true,
        })
    }

    const handleDelete = (metalId: number) => {
        if (confirm('Are you sure you want to delete this metal?')) {
            router.delete(route('metals.destroy', metalId), {}, {
                onSuccess: () => {},
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                }
            });
        }
    }

    return (
        <AppLayout title="Metals">
            <Head title="Metals" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Metals</h1>
                        <p className="text-gray-600">Manage metal types</p>
                    </div>
                    <Link href={route('metals.create')}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Metal
                        </Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search metals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10 focus:ring-2 focus:ring-emerald-500"
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
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left p-4 font-medium text-gray-900">ID</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Name</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Created By</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Updated By</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Created At</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Updated At</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metals.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            No metals found.
                                        </td>
                                    </tr>
                                ) : (
                                    metals.data.map((metal) => (
                                        <tr key={metal.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 text-gray-600">#{metal.id}</td>
                                            <td className="p-4 font-medium text-gray-900">{metal.name}</td>
                                            <td className="p-4 text-gray-600">
                                                {metal.creator?.name || 'N/A'}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {metal.updater?.name || 'N/A'}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {formatDate(metal.created_at)}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {formatDate(metal.updated_at)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    <Link href={route('metals.show', metal.id)}>
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('metals.edit', metal.id)}>
                                                        <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-800">
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={() => handleDelete(metal.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {metals.links && metals.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {metals.meta.from} to {metals.meta.to} of {metals.meta.total} metals
                                </div>
                                <div className="flex space-x-2">
                                    {metals.links.map((link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-lg ${
                                                link.active
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    )
}
