import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
    ArrowLeft,
    Save
} from 'lucide-react'

interface Product {
    id: number
    name: string
}

interface EditProductProps {
    product: Product
}

export default function Edit({ product }: EditProductProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('products.update', product.id));
    };

    return (
        <AppLayout title="Edit Product">
            <Head title="Edit Product" />
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('products.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Products
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
                        <p className="text-gray-600">Update product information</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Diamond, Emerald, Ruby"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Link href={route('products.index')}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}

