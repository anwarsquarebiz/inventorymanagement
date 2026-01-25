import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
    ArrowLeft,
    Edit,
    Trash2
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Product {
    id: number
    name: string
    created_at: string
    updated_at: string
    creator?: {
        id: number
        name: string
    }
    updater?: {
        id: number
        name: string
    }
}

interface ShowProductProps {
    product: Product
}

export default function Show({ product }: ShowProductProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(route('products.destroy', product.id));
        }
    }

    return (
        <AppLayout title="Product Details">
            <Head title={`Product: ${product.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('products.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Products
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Product Details</h1>
                            <p className="text-gray-600">View product information</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={route('products.edit', product.id)}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-800 border-red-300"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Product ID</label>
                            <p className="mt-1 text-lg text-gray-900">#{product.id}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Product Name</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{product.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Created By</label>
                            <p className="mt-1 text-gray-900">
                                {product.creator?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Updated By</label>
                            <p className="mt-1 text-gray-900">
                                {product.updater?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Created At</label>
                            <p className="mt-1 text-gray-900">{formatDate(product.created_at)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Updated At</label>
                            <p className="mt-1 text-gray-900">{formatDate(product.updated_at)}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}

