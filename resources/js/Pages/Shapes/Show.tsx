import React from 'react'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
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

interface ShowShapeProps {
    shape: Shape
}

export default function Show({ shape }: ShowShapeProps) {
    return (
        <AppLayout title="Shape Details">
            <Head title={`Shape: ${shape.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('shapes.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Shapes
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Shape Details</h1>
                            <p className="text-gray-600">View shape information</p>
                        </div>
                    </div>
                    <Link href={route('shapes.edit', shape.id)}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shape Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">ID</label>
                            <p className="mt-1 text-lg text-gray-900">#{shape.id}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Name</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{shape.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Product</label>
                            <p className="mt-1 text-lg text-gray-900">{shape.product ? shape.product.name : '—'}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}


