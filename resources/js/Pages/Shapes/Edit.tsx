import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
declare const route: any

interface Product {
    id: number
    name: string
}

interface Shape {
    id: number
    name: string
    product_id: number | null
}

interface EditShapeProps {
    shape: Shape
    products: Product[]
}

export default function Edit({ shape, products }: EditShapeProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: shape.name,
        product_id: shape.product_id?.toString() || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('shapes.update', shape.id));
    };

    return (
        <AppLayout title="Edit Shape">
            <Head title="Edit Shape" />
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('shapes.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Shapes
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Shape</h1>
                        <p className="text-gray-600">Update shape information</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shape Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Emerald"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="product_id">Product</Label>
                                <select
                                    id="product_id"
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select a product (optional)</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>}
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('shapes.index')}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Shape'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}


