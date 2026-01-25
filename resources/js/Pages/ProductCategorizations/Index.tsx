import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table'
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Eye,
    Tag
} from 'lucide-react'

interface ProductCategorization {
    id: number
    name: string
    created_at: string
    updated_at: string
}

interface ProductCategorizationsIndexProps {
    productCategorizations: ProductCategorization[]
}

export default function Index({ productCategorizations }: ProductCategorizationsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCategorizations = productCategorizations.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product categorization?')) {
            router.delete(`/product-categorizations/${id}`)
        }
    }

    return (
        <AppLayout title="Product Categorizations">
            <Head title="Product Categorizations" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Tag className="h-8 w-8 text-emerald-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Categorizations</h1>
                            <p className="text-gray-600">Manage product categorization types</p>
                        </div>
                    </div>
                    <Link href="/product-categorizations/create">
                        <Button className="flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>Add Category</span>
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search categorizations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategorizations.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">
                                        <div className="font-medium text-gray-900 capitalize">{cat.name}</div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{cat.created_at}</TableCell>
                                    <TableCell className="text-gray-600">{cat.updated_at}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link href={`/product-categorizations/${cat.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/product-categorizations/${cat.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(cat.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredCategorizations.length === 0 && (
                        <div className="text-center py-12">
                            <Tag className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No categorizations found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new categorization.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}

