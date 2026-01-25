import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
declare const route: any

interface Product {
    id: number
    name: string
}

interface Shape {
    id: number
    name: string
    product_id: number | null
    product: Product | null
    created_at: string
    updated_at: string
}

interface ShapesIndexProps {
    shapes: {
        data: Shape[]
        links: Array<{
            url: string | null
            label: string
            active: boolean
        }>
        current_page: number
        last_page: number
        from: number
        to: number
        total: number
    }
    filters: {
        search?: string
    }
}

export default function Index({ shapes, filters }: ShapesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '')

    const handleSearch = () => {
        router.get(route('shapes.index'), { search: searchTerm }, { preserveState: true, replace: true })
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this shape?')) {
            router.delete(route('shapes.destroy', id))
        }
    }

    return (
        <AppLayout title="Shapes">
            <Head title="Shapes" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Shapes</h1>
                        <p className="text-gray-600">Manage shape master</p>
                    </div>
                    <Link href={route('shapes.create')}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Shape
                        </Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search shapes..."
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
                                    <th className="text-left p-4 font-medium text-gray-900">Product</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shapes.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">No shapes found.</td>
                                    </tr>
                                ) : shapes.data.map((shape) => (
                                    <tr key={shape.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 text-gray-600">#{shape.id}</td>
                                        <td className="p-4 font-medium text-gray-900">{shape.name}</td>
                                        <td className="p-4 text-gray-600">{shape.product ? shape.product.name : '—'}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Link href={route('shapes.edit', shape.id)}>
                                                    <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-800">
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={() => handleDelete(shape.id)}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {shapes.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Showing {shapes.from} to {shapes.to} of {shapes.total} results
                            </div>
                            <div className="flex items-center space-x-2">
                                {shapes.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-md ${
                                            link.active
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    )
}


