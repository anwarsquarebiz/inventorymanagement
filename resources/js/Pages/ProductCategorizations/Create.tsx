import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Tag } from 'lucide-react'
import { Link } from '@inertiajs/react'

interface ProductCategorizationsCreateProps {
}

export default function ProductCategorizationsCreate({}: ProductCategorizationsCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/product-categorizations')
    }

    return (
        <AppLayout title="Create Product Categorization">
            <Head title="Create Product Categorization" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/product-categorizations">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Categorizations
                        </Button>
                    </Link>
                    <div className="flex items-center space-x-3">
                        <Tag className="h-8 w-8 text-emerald-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Product Categorization</h1>
                            <p className="text-gray-600">Add a new product categorization</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Information</CardTitle>
                        <CardDescription>
                            Enter the name of the product categorization. Use lowercase letters (e.g., "bracelet", "ring").
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value.toLowerCase())}
                                    className={errors.name ? 'border-red-500' : ''}
                                    placeholder="Enter category name (e.g., bracelet, ring)"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Use lowercase letters. Examples: "bracelet", "ring", "necklace"
                                </p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                <Link href="/product-categorizations">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}

