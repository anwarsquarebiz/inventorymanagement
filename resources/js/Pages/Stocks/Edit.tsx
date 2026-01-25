import React from 'react'
import { Head, Link, useForm, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Upload } from 'lucide-react'
declare const route: any

interface Stock {
    stock_no: string
    thumbnail?: string | null
    metal?: string | null
    products_used?: string | null
    product_categorization?: string | null
}

interface ProductCategorization {
    id: number
    name: string
}

interface StockEditProps {
    stock: Stock
    productCategorizations: ProductCategorization[]
}

export default function Edit({ stock, productCategorizations }: StockEditProps) {
    // Ensure stock_no is always available
    const stockNo = stock?.stock_no || '';
    
    const { data, setData, put, processing, errors } = useForm({
        metal: stock?.metal || '',
        products_used: stock?.products_used || '',
        product_categorization: stock?.product_categorization || '',
        thumbnail: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockNo) return;
        
        // Create FormData manually to ensure all fields are included
        const formData = new FormData();
        formData.append('metal', data.metal || '');
        formData.append('products_used', data.products_used || '');
        formData.append('product_categorization', data.product_categorization || '');
        if (data.thumbnail) {
            formData.append('thumbnail', data.thumbnail);
        }
        formData.append('_method', 'PUT');
        
        // Use router directly to send FormData
        router.post(route('stocks.update', stockNo), formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('thumbnail', e.target.files[0]);
        }
    };

    if (!stockNo) {
        return (
            <AppLayout title="Error">
                <div className="p-6">
                    <p className="text-red-600">Stock number is required.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={`Edit Stock ${stockNo}`}>
            <Head title={`Edit Stock ${stockNo}`} />
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('vouchers-groups.show', stockNo)}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Stock
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Stock: {stockNo}</h1>
                        <p className="text-gray-600">Update stock information, thumbnail, and metal type</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="metal">Metal Type</Label>
                                {/* Select for metal type */}
                                
                                <select
                                    id="metal"
                                    name="metal"
                                    value={data.metal}
                                    onChange={(e) => setData('metal', e.target.value)}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.metal ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select metal type</option>
                                    <option value="White Gold (WG)">White Gold (WG)</option>
                                    <option value="Yellow Gold (YG)">Yellow Gold (YG)</option>
                                    <option value="Platinum">Platinum</option>
                                    <option value="9kt">9kt</option>
                                </select>
                                {errors.metal && <p className="text-red-500 text-sm mt-1">{errors.metal}</p>}
                            </div>

                            <div>
                                <Label htmlFor="products_used">Products Used</Label>
                                <Input
                                    id="products_used"
                                    type="text"
                                    value={data.products_used}
                                    onChange={(e) => setData('products_used', e.target.value)}
                                    placeholder="Enter products used"
                                    className={errors.products_used ? 'border-red-500' : ''}
                                />
                                {errors.products_used && <p className="text-red-500 text-sm mt-1">{errors.products_used}</p>}
                            </div>

                            <div>
                                <Label htmlFor="product_categorization">Product Categorization</Label>
                                <select
                                    id="product_categorization"
                                    name="product_categorization"
                                    value={data.product_categorization}
                                    onChange={(e) => setData('product_categorization', e.target.value)}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.product_categorization ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select product categorization</option>
                                    {productCategorizations.map((category) => (
                                        <option key={category.id} value={category.name}>
                                            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_categorization && <p className="text-red-500 text-sm mt-1">{errors.product_categorization}</p>}
                            </div>

                            <div>
                                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                                <div className="mt-2">
                                    {stock?.thumbnail && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600 mb-2">Current Thumbnail:</p>
                                            <img 
                                                src={`/storage/${stock.thumbnail}`} 
                                                alt={`Stock ${stockNo}`}
                                                className="max-w-md h-auto rounded-lg border border-gray-200 shadow-sm w-[150px]"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-4">
                                        <label
                                            htmlFor="thumbnail"
                                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            {data.thumbnail ? 'Change Image' : 'Upload Image'}
                                        </label>
                                        <input
                                            id="thumbnail"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {data.thumbnail && (
                                            <span className="text-sm text-gray-600">
                                                {data.thumbnail.name}
                                            </span>
                                        )}
                                    </div>
                                    {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}
                                    <p className="text-sm text-gray-500 mt-2">
                                        Accepted formats: JPEG, PNG, JPG, GIF, WEBP (Max: 2MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('vouchers-groups.show', stockNo)}>
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
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}

