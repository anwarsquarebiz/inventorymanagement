import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
    ArrowLeft,
    Edit,
    Trash2,
    Tag,
    Calendar
} from 'lucide-react'

interface ProductCategorization {
    id: number
    name: string
    created_at: string
    updated_at: string
}

interface ProductCategorizationsShowProps {
    productCategorization: ProductCategorization
}

export default function Show({ productCategorization }: ProductCategorizationsShowProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this product categorization?')) {
            router.delete(`/product-categorizations/${productCategorization.id}`)
        }
    }

    return (
        <AppLayout title="Product Categorization Details">
            <Head title={`Product Categorization: ${productCategorization.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/product-categorizations">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Categorizations
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <Tag className="h-8 w-8 text-emerald-600" />
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Product Categorization Details</h1>
                                <p className="text-gray-600">View category information</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/product-categorizations/${productCategorization.id}/edit`}>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Tag className="h-4 w-4" />
                                <span>Category ID</span>
                            </label>
                            <p className="mt-1 text-lg text-gray-900">#{productCategorization.id}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Tag className="h-4 w-4" />
                                <span>Category Name</span>
                            </label>
                            <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">{productCategorization.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Created At</span>
                            </label>
                            <p className="mt-1 text-gray-900">{productCategorization.created_at}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Updated At</span>
                            </label>
                            <p className="mt-1 text-gray-900">{productCategorization.updated_at}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}

